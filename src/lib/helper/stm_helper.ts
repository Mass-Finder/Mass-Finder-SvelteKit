import { codonTableRtoS, molecularWeightMap } from './amino_mapper';
import { MassFinderHelper } from './mass_finder_helper';
import type { IonType } from '../../type/Types';

export class StmHelper {
    static calc(
        inputSeq: string,
        ncAAMap: { [key: string]: any },
        codonTitle: { [key: string]: string },
        aminoMap: { [key: string]: number },
        ionType: IonType,
        useFormylation: boolean
    ): Possibility[] {
        const memo = new Map<string, PossibilityLetter[][]>();

        function generatePossibilities(index: number): PossibilityLetter[][] {
            if (index >= inputSeq.length) return [[]];

            const key = `${index}`;
            if (memo.has(key)) return memo.get(key)!;

            const results: PossibilityLetter[][] = [];
            const currentAmino = inputSeq[index];
            const possibilitiesForCurrent: PossibilityLetter[] = [];

            // (1) 자연 아미노산이 존재하는 경우
            if (aminoMap[currentAmino] !== undefined) {
                possibilitiesForCurrent.push({ letter: currentAmino, natural: true });
            }

            // (2) ncAA 대체 가능성 확인
            let candidateFound = false;
            for (const [key, candidate] of Object.entries(ncAAMap)) {
                const rna = codonTitle[key];
                if (rna && codonTableRtoS[rna] === currentAmino) {
                    candidateFound = true;

                    // (A) ncAA로 대체 (full incorporation)
                    possibilitiesForCurrent.push({
                        letter: candidate.title,
                        natural: false,
                        candidate: candidate
                    });

                    // (B) truncated 현상
                    possibilitiesForCurrent.push({
                        letter: "",
                        natural: false,
                        candidate: candidate,
                        truncated: true
                    });

                    // (C) skipping 현상
                    possibilitiesForCurrent.push({
                        letter: "",
                        natural: false,
                        skipped: true
                    });
                }
            }

            // (3) 자연 아미노산도 없고 ncAA도 대체 불가능한 경우 skipping
            if (!candidateFound && aminoMap[currentAmino] === undefined) {
                possibilitiesForCurrent.push({
                    letter: "",
                    natural: false,
                    skipped: true
                });
            }

            const nextPossibilities = generatePossibilities(index + 1);
            for (const option of possibilitiesForCurrent) {
                for (const next of nextPossibilities) {
                    results.push([option, ...next]);
                }
            }

            memo.set(key, results);
            return results;
        }

        let basePossibilities = generatePossibilities(0);

        // **Skipping 및 Truncated가 적용된 결과 필터링**
        basePossibilities = basePossibilities.filter(seq => seq.filter(x => x.letter !== "").length > 0);

        const possibilities: Possibility[] = [];
        for (const seqArr of basePossibilities) {
            const letters = seqArr.filter(x => x.letter !== "").map(x => x.letter).join("");
            const sequenceString = useFormylation ? "f" + letters : letters;

            let weight = 0;
            let molWeight = 0;
            let count = 0;

            for (const item of seqArr) {
                if (item.letter === "") continue;
                count++;
                if (item.natural) {
                    weight += aminoMap[item.letter];
                    molWeight += molecularWeightMap[item.letter];
                } else if (item.candidate) {
                    weight += parseFloat(item.candidate.monoisotopicWeight);
                    molWeight += parseFloat(item.candidate.molecularWeight);
                }
            }
            
            // 물 손실량 적용
            weight -= MassFinderHelper.getWaterWeight(count);
            molWeight -= MassFinderHelper.getWaterWeight(count);

            // 사유(reason) 수집
            const reasonsSet = new Set<string>();
            for (const item of seqArr) {
                if (!item.natural) {
                    if (item.candidate && !item.truncated && !item.skipped) {
                        reasonsSet.add("ncAA incorporated");
                    }
                    if (item.truncated) {
                        reasonsSet.add("Truncated");
                    }
                    if (item.skipped) {
                        reasonsSet.add("Skipped");
                    }
                }
            }
            if (reasonsSet.size === 0) {
                reasonsSet.add("Only natural AA");
            }
            const reasons = Array.from(reasonsSet);

            possibilities.push({
                sequence: seqArr,
                sequenceString: sequenceString,
                reasons: reasons,
                weight: weight,
                molecularWeight: molWeight,
                adduct: ionType
            });
        }

        // **Disulfide 처리 (S가 2개 이상일 경우)**
        const finalPossibilities: Possibility[] = [];
        const uniqueSequences = new Set<string>();

        for (const poss of possibilities) {
            const sIndices: number[] = [];
            poss.sequence.forEach((item, idx) => {
                if (item.letter === "S") sIndices.push(idx);
            });

            let allDisulfidePossibilities: Array<Array<[number, number]>> = [[]];
            if (sIndices.length >= 2) {
                allDisulfidePossibilities = getAllValidDisulfideCombinations(sIndices);
            }

            for (const pairing of allDisulfidePossibilities) {
                const newPoss = { ...poss, disulfide: pairing, reasons: [...poss.reasons] };
                if (pairing.length > 0) newPoss.reasons.push("Disulfide");

                // 시퀀스 전체에 다이서파이드 적용된 인덱스를 순서대로 정렬
                const flattenedPairing: number[] = pairing.reduce((acc: number[], curr: [number, number]) => {
                    return acc.concat(curr);
                }, []);
                flattenedPairing.sort((a, b) => a - b);

                // 중복 방지를 위해 Disulfide 개수와 시퀀스 문자열을 기준으로 유니크한 값만 저장
                const uniqueKey = `${newPoss.sequenceString}-D${flattenedPairing.join(",")}`;
                if (!uniqueSequences.has(uniqueKey)) {
                    uniqueSequences.add(uniqueKey);
                    finalPossibilities.push(newPoss);
                }
            }
        }

        return finalPossibilities;
    }
}

//
// **Disulfide 페어링 조합 생성**
//
function getAllValidDisulfideCombinations(indices: number[]): Array<Array<[number, number]>> {
    const results: Array<Array<[number, number]>> = [[]];

    function generatePairs(remaining: number[], currentPairs: Array<[number, number]>) {
        if (currentPairs.length > 0) {
            results.push([...currentPairs]);
        }

        for (let i = 0; i < remaining.length; i++) {
            for (let j = i + 1; j < remaining.length; j++) {
                const newPair: [number, number] = [remaining[i], remaining[j]];
                generatePairs(remaining.filter((_, idx) => idx !== i && idx !== j), [...currentPairs, newPair]);
            }
        }
    }

    generatePairs(indices, []);
    return results;
}
//
// **타입 정의**
//
interface Possibility {
    sequence: PossibilityLetter[];
    sequenceString: string;
    reasons: string[];
    weight: number;
    molecularWeight: number;
    adduct: IonType;
    disulfide?: Array<[number, number]>;
}

interface PossibilityLetter {
    letter: string;
    natural: boolean;
    candidate?: any;
    truncated?: boolean;
    skipped?: boolean;
}

