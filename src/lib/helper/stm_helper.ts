import { codonTableRtoS, molecularWeightMap, getIonWeight } from './amino_mapper';
import { MassFinderHelper } from './mass_finder_helper';
import type { IonType } from '../../type/Types';

// 포밀레이스의 분자량
const fWeight = 27.99;

export class StmHelper {
    static calc(
        rnaSeq: string,
        ncAAMap: { [key: string]: any },
        codonTitles: { [key: string]: string[] },
        aminoMap: { [key: string]: number },
        ionTypes: IonType[],
        useFormylation: boolean
    ): Possibility[] {
        const memo = new Map<string, PossibilityLetter[][]>();

        // RNA 시퀀스를 3개씩 나누어 코돈 배열로 변환
        const codons = rnaSeq.match(/.{1,3}/g) || [];

        // Stop 코돈을 찾아서 그 이전까지만 처리
        let effectiveCodons = [];
        for (let i = 0; i < codons.length; i++) {
            const codon = codons[i];
            const naturalAmino = codonTableRtoS[codon];
            if (naturalAmino === '[Stop]') {
                break; // Stop 코돈을 만나면 여기서 중단
            }
            effectiveCodons.push(codon);
        }

        function generatePossibilities(index: number): PossibilityLetter[][] {
            if (index >= effectiveCodons.length) return [[]];

            const key = `${index}`;
            if (memo.has(key)) return memo.get(key)!;

            const results: PossibilityLetter[][] = [];
            const currentCodon = effectiveCodons[index];
            const possibilitiesForCurrent: PossibilityLetter[] = [];

            // (1) 자연 아미노산으로 변환 가능한 경우
            const naturalAmino = codonTableRtoS[currentCodon];
            if (naturalAmino && naturalAmino !== '[Stop]' && aminoMap[naturalAmino] !== undefined) {
                possibilitiesForCurrent.push({ letter: naturalAmino, natural: true });
            }

            // (2) ncAA 대체 가능성 확인
            let candidateFound = false;
            for (const [key, candidate] of Object.entries(ncAAMap)) {
                const assignedCodons = codonTitles[key] || [];
                if (assignedCodons.includes(currentCodon)) {
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

            // (3) skipping 조건들
            // - 자연 아미노산이 없는 경우
            // - 자연 아미노산이 Stop 코돈인 경우  
            // - 자연 아미노산이 있지만 aminoMap에서 제외된 경우
            // - ncAA 대체도 불가능한 경우
            const naturalAminoAvailable = naturalAmino && naturalAmino !== '[Stop]' && aminoMap[naturalAmino] !== undefined;
            if (!candidateFound && !naturalAminoAvailable) {
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

        // Formylation 적용 조건 확인 함수 - 실제 번역된 시퀀스를 기반으로 확인
        function shouldApplyFormylationWithSequence(firstCodon: string, firstLetter: PossibilityLetter, ncAAMap: any, codonTitles: any): boolean {
            // 첫 번째 코돈이 AUG가 아니면 formylation 불가
            if (firstCodon !== 'AUG') return false;
            
            // 자연 아미노산 M이 실제로 번역된 경우
            if (firstLetter.natural && firstLetter.letter === 'M') {
                return true;
            }
            
            // ncAA가 AUG에 할당되어 실제로 번역된 경우
            if (!firstLetter.natural && firstLetter.candidate) {
                for (const [key] of Object.entries(ncAAMap)) {
                    const assignedCodons = codonTitles[key] || [];
                    if (assignedCodons.includes('AUG') && firstLetter.candidate.title === ncAAMap[key].title) {
                        return true;
                    }
                }
            }
            
            return false;
        }

        let basePossibilities = generatePossibilities(0);

        // **Skipping 및 Truncated가 적용된 결과 필터링**
        basePossibilities = basePossibilities.filter(seq => seq.filter(x => x.letter !== "").length > 0);

        const possibilities: Possibility[] = [];
        for (const seqArr of basePossibilities) {
            // 원래 시퀀스의 실제 아미노산 문자들로 구성된 문자열
            const originalLetters = seqArr.filter(x => x.letter !== "").map(x => x.letter).join("");
            // 시퀀스 길이가 3 이하인 경우 Possibility 목록에 추가하지 않음
            if (originalLetters.length <= 3) continue;
            
            // 기존 아미노산 시퀀스들만으로 분자량과 물 손실량 계산
            let baseWeight = 0;
            let baseMolWeight = 0;
            let baseCount = 0;
            seqArr.forEach(item => {
                if (item.letter === "") return;
                baseCount++;
                if (item.natural) {
                    baseWeight += aminoMap[item.letter];
                    baseMolWeight += molecularWeightMap[item.letter];
                } else if (item.candidate) {
                    baseWeight += parseFloat(item.candidate.monoisotopicWeight);
                    baseMolWeight += parseFloat(item.candidate.molecularWeight);
                }
            });
            // 물 손실량은 기존 아미노산에 대해서만 적용
            baseWeight -= MassFinderHelper.getWaterWeight(baseCount);
            baseMolWeight -= MassFinderHelper.getWaterWeight(baseCount);
            
            // Formylation 조건 확인: useFormylation이 true이고 첫 번째 아미노산이 M이거나 AUG에 할당된 ncAA인 경우
            const firstLetter = seqArr.length > 0 && seqArr[0].letter !== "" ? seqArr[0] : null;
            const shouldFormylate = useFormylation && firstLetter && 
                                   shouldApplyFormylationWithSequence(effectiveCodons[0], firstLetter, ncAAMap, codonTitles);
            const updatedSeqArr = shouldFormylate ? [{ letter: "f", natural: true }, ...seqArr] : seqArr;
            let finalWeight = baseWeight;
            let finalMolWeight = baseMolWeight;
            if (shouldFormylate) {
                finalWeight += fWeight;
                finalMolWeight += fWeight;
            }
            const sequenceString = updatedSeqArr.filter(x => x.letter !== "").map(x => x.letter).join("");

            // 사유(reason) 수집 - 동일한 reason이 여러 번 발생하면 모두 기록
            const reasons: string[] = [];
            updatedSeqArr.forEach((item, index) => {
                if (shouldFormylate && index === 0) return;
                if (!item.natural) {
                    if (item.candidate && !item.truncated && !item.skipped) {
                        reasons.push("ncAA incorporated");
                    }
                    if (item.truncated) {
                        reasons.push("Truncated");
                    }
                    if (item.skipped) {
                        reasons.push("Skipped");
                    }
                }
            });
            if (reasons.length === 0) {
                reasons.push("Only natural AA");
            }

            // 각 ionType에 대해 별도의 possibility 생성
            for (const ionType of ionTypes) {
                const adductWeight = ionType === 'none' ? 0 : getIonWeight(ionType);
                possibilities.push({
                    sequence: updatedSeqArr,
                    sequenceString: sequenceString,
                    reasons: reasons,
                    weight: finalWeight + adductWeight,
                    molecularWeight: finalMolWeight + adductWeight,
                    adduct: ionType
                });
            }
        }

        // **Disulfide 처리 (C가 2개 이상일 경우)**
        const finalPossibilities: Possibility[] = [];
        const uniqueSequences = new Set<string>();

        for (const poss of possibilities) {
            const sIndices: number[] = [];
            poss.sequence.forEach((item, idx) => {
                if (item.letter === "C") sIndices.push(idx);
            });

            let allDisulfidePossibilities: Array<Array<[number, number]>> = [[]];
            if (sIndices.length >= 2) {
                allDisulfidePossibilities = getAllValidDisulfideCombinations(sIndices);
            }

            for (const pairing of allDisulfidePossibilities) {
                // 새로운 possibility를 생성하여 disulfide 적용에 따른 질량 변경 및 reason 추가
                // disulfide가 적용되면 "Only natural AA" 이유는 제거됨
                const newPoss: Possibility = {
                    ...poss,
                    disulfide: pairing,
                    reasons: poss.reasons.filter(reason => reason !== "Only natural AA"),
                    weight: poss.weight,
                    molecularWeight: poss.molecularWeight
                };

                // 한 쌍의 disulfide마다 질량에서 -2.02씩 감소하고, reason에 "Disulfide"를 반복적으로 추가
                for (let i = 0; i < pairing.length; i++) {
                    newPoss.weight -= 2.02;
                    newPoss.molecularWeight -= 2.02;
                    newPoss.reasons.push("Disulfide");
                }

                // 시퀀스 전체에 다이서파이드 적용된 인덱스를 순서대로 정렬
                const flattenedPairing: number[] = pairing.reduce((acc: number[], curr: [number, number]) => {
                    return acc.concat(curr);
                }, []);
                flattenedPairing.sort((a, b) => a - b);

                // 중복 방지를 위해 Disulfide 개수와 시퀀스 문자열, adduct를 기준으로 유니크한 값만 저장
                const uniqueKey = `${newPoss.sequenceString}-D${flattenedPairing.join(",")}-${newPoss.adduct}`;
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
