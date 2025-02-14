import { codonTableRtoS } from './amino_mapper';
import { MassFinderHelper } from './mass_finder_helper';
import { getIonWeight } from './amino_mapper';
import type { IonType } from '../../type/Types';
import { molecularWeightMap } from './amino_mapper';

export class StmHelper {
    static calc(
        inputSeq: string,
        ncAAMap: { [key: string]: any },
        codonTitle: { [key: string]: string },
        aminoMap: { [key: string]: number },
        ionType: IonType,
    ) {
        let possibilities: Array<{ 
            sequence: (string | string[])[], 
            reason?: string[],
            weight?: number, 
            molecularWeight?: number,
            adduct?: IonType 
        }> = [];

        // RNA 코돈을 아미노산으로 변환하는 맵 생성
        const rnaToAminoMap = new Map<string, string>();
        for (const [key, rna] of Object.entries(codonTitle)) {
            const amino = codonTableRtoS[rna];
            if (amino) {
                rnaToAminoMap.set(key, amino);
            }
        }

        // 재귀적으로 모든 가능한 시퀀스를 생성
        const generateSequences = (
            currentIndex: number,
            currentSeq: (string | string[])[],
            reasons: string[],
            hasModification: boolean
        ) => {
            // 시퀀스 생성이 완료된 경우
            if (currentIndex >= inputSeq.length) {
                if (currentSeq.length > 0) {
                    const weight = calculateMonoisotopicWeight(currentSeq, aminoMap, ncAAMap);
                    const molecularWeight = calculateMolecularWeight(currentSeq, aminoMap, ncAAMap);
                    let finalReasons = [...reasons];
                    if (!hasModification) {
                        finalReasons = ['Only natural AA'];
                    }
                    // 시퀀스 3개 이하는 제외
                    if(currentSeq.length <= 3) return;
                    possibilities.push({
                        sequence: currentSeq,
                        reason: finalReasons,
                        weight,
                        molecularWeight,
                        adduct: ionType
                    });
                }
                return;
            }

            const currentAmino = inputSeq[currentIndex];
            
            // Case 1: 일반 아미노산 사용
            if (currentAmino in aminoMap) {
                generateSequences(
                    currentIndex + 1,
                    [...currentSeq, [currentAmino]],
                    reasons,
                    hasModification
                );
            }

            // Case 2: ncAA로 대체
            for (const [ncaaKey, ncaa] of Object.entries(ncAAMap)) {
                const rna = codonTitle[ncaaKey];
                if (rna && codonTableRtoS[rna] === currentAmino) {
                    // 대체
                    generateSequences(
                        currentIndex + 1,
                        [...currentSeq, [ncaa.title]],
                        [...reasons, "ncAA incorporated"],
                        true
                    );

                    // Truncated case
                    if (currentIndex > 0) {
                        // 앞부분만 사용
                        generateSequences(
                            inputSeq.length, // 나머지 시퀀스 스킵
                            currentSeq,
                            [...reasons, "Truncated"],
                            true
                        );
                    }
                    if (currentIndex < inputSeq.length - 1) {
                        // 뒷부분으로 진행
                        generateSequences(
                            currentIndex + 1,
                            currentSeq,
                            [...reasons, "Truncated"],
                            true
                        );
                    }

                    // Skipping case
                    generateSequences(
                        currentIndex + 1,
                        currentSeq,
                        [...reasons, "Skipped"],
                        true
                    );
                }
            }

            // Case 3: Skipping (아미노산을 사용할 수 없는 경우)
            if (!(currentAmino in aminoMap) && 
                !Array.from(rnaToAminoMap.values()).includes(currentAmino)) {
                generateSequences(
                    currentIndex + 1,
                    currentSeq,
                    [...reasons, "Skipped"],
                    true
                );
            }
        };

        // 시퀀스 생성 시작
        generateSequences(0, [], [], false);

        // 중복 제거 및 정렬
        possibilities = removeDuplicates(possibilities);

        return possibilities;
    }
}

// 무게 계산 헬퍼 함수
function calculateMonoisotopicWeight(
    sequence: (string | string[])[],
    aminoMap: { [key: string]: number },
    ncAAMap: { [key: string]: any }
): number {
    let totalWeight = 0;
    sequence.forEach(item => {
        const amino = item[0];
        if (amino in aminoMap) {
            totalWeight += aminoMap[amino];
        } else {
            for (const [key, ncaa] of Object.entries(ncAAMap)) {
                if (ncaa.title === amino) {
                    totalWeight += parseFloat(ncaa.monoisotopicWeight);
                    break;
                }
            }
        }
    });
    return totalWeight - MassFinderHelper.getWaterWeight(sequence.length);
}

function calculateMolecularWeight(
    sequence: (string | string[])[],
    aminoMap: { [key: string]: number },
    ncAAMap: { [key: string]: any }
): number {
    let totalWeight = 0;
    sequence.forEach(item => {
        const amino = item[0];
        if (amino in aminoMap) {
            totalWeight += molecularWeightMap[amino];
        } else {
            for (const [key, ncaa] of Object.entries(ncAAMap)) {
                if (ncaa.title === amino) {
                    totalWeight += parseFloat(ncaa.molecularWeight);
                    break;
                }
            }
        }
    });
    return totalWeight - MassFinderHelper.getWaterWeight(sequence.length);
}


// 중복 제거 함수
function removeDuplicates(possibilities: Array<{ 
    sequence: (string | string[])[], 
    reason?: string[],
    weight?: number, 
    adduct?: IonType 
}>): Array<{ 
    sequence: (string | string[])[], 
    reason?: string[],
    weight?: number, 
    adduct?: IonType 
}> {
    const seen = new Set<string>();
    return possibilities.filter(item => {
        const key = JSON.stringify(item.sequence) + JSON.stringify(item.reason);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
