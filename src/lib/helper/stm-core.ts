import { codonTableRtoS, aminoMap, molecularWeightMap, getIonWeight } from './amino_mapper';
import { MassFinderHelper } from './mass_finder_helper';
import type { IonType, PotentialModification, NcAAMap, NcAA, SingleSitePotentialModification, CrosslinkingPotentialModification } from '../../type/Types';
import { applySideChainModifications } from './stm-side-chain';
import { applyCrosslinkingModifications } from './stm-crosslinking';
import { removeDuplicateSequences, type Possibility, type PossibilityLetter } from './stm-utils';

/**
 * Minimum sequence length for results (sequences with fewer amino acids are filtered out)
 */
const MIN_SEQUENCE_LENGTH = 1;

/**
 * Generate power set (all subsets) of an array
 * Example: [A, B] => [[], [A], [B], [A, B]]
 * 0개, 1개, 2개, ... 모든 조합 생성
 */
export function generatePowerSet<T>(array: T[]): T[][] {
    const result: T[][] = [[]];  // 빈 조합부터 시작
    for (const item of array) {
        const length = result.length;
        for (let i = 0; i < length; i++) {
            result.push([...result[i], item]);
        }
    }
    return result;
}

/**
 * Generate possibilities for amino acid sequences from RNA codons
 * @param index - Starting codon index
 * @param effectiveCodons - Array of codons to process
 * @param ncAAMap - Map of non-canonical amino acids
 * @param codonTitles - Map of codons to ncAA titles
 * @param aminoMapParam - Map of amino acids to monoisotopic weights
 * @param memo - Memoization cache
 */
function generatePossibilities(
    index: number,
    effectiveCodons: string[],
    ncAAMap: NcAAMap,
    codonTitles: { [key: string]: string[] },
    memo: Map<string, PossibilityLetter[][]>
): PossibilityLetter[][] {
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

            // (B) skipping 현상
            possibilitiesForCurrent.push({
                letter: "",
                natural: false,
                skipping: true
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
            skipping: true
        });
    }

    const nextPossibilities = generatePossibilities(index + 1, effectiveCodons, ncAAMap, codonTitles, memo);
    for (const option of possibilitiesForCurrent) {
        for (const next of nextPossibilities) {
            results.push([option, ...next]);
        }
    }

    memo.set(key, results);
    return results;
}

/**
 * Generate possibilities for a specific range of codons
 * Used for truncation scenarios (reinitiation and premature termination)
 * Only generates full incorporation (no skipping)
 *
 * @param startIndex - Starting codon index
 * @param endIndex - Ending codon index (exclusive)
 * @param effectiveCodons - Array of codons to process
 * @param ncAAMap - Map of non-canonical amino acids
 * @param codonTitles - Map of codons to ncAA titles
 */
function generatePossibilitiesRange(
    startIndex: number,
    endIndex: number,
    effectiveCodons: string[],
    ncAAMap: NcAAMap,
    codonTitles: { [key: string]: string[] }
): PossibilityLetter[][] {
    if (startIndex >= endIndex || startIndex >= effectiveCodons.length) return [[]];

    const results: PossibilityLetter[][] = [];
    const currentCodon = effectiveCodons[startIndex];
    const possibilitiesForCurrent: PossibilityLetter[] = [];

    // 자연 아미노산으로 변환 가능한 경우
    const naturalAmino = codonTableRtoS[currentCodon];
    if (naturalAmino && naturalAmino !== '[Stop]' && aminoMap[naturalAmino] !== undefined) {
        possibilitiesForCurrent.push({ letter: naturalAmino, natural: true });
    }

    // ncAA 대체 가능성 확인
    for (const [key, candidate] of Object.entries(ncAAMap)) {
        const assignedCodons = codonTitles[key] || [];
        if (assignedCodons.includes(currentCodon)) {
            // ncAA로 대체 (full incorporation만)
            possibilitiesForCurrent.push({
                letter: candidate.title,
                natural: false,
                candidate: candidate
            });
        }
    }

    // 다음 범위의 가능성들
    const nextPossibilities = startIndex + 1 < endIndex ?
        generatePossibilitiesRange(startIndex + 1, endIndex, effectiveCodons, ncAAMap, codonTitles) : [[]];

    for (const option of possibilitiesForCurrent) {
        for (const next of nextPossibilities) {
            results.push([option, ...next]);
        }
    }

    return results;
}

/**
 * Check if sequence has internal initiation (reinitiation) at start
 */
function hasInternalInitiationAtStart(seqArr: PossibilityLetter[]): boolean {
    return seqArr.length > 0 && seqArr[0].internalInitiation === true;
}

/**
 * Check if sequence has premature termination at end
 */
function hasPrematureTerminationAtEnd(seqArr: PossibilityLetter[]): boolean {
    return seqArr.length > 0 && seqArr[seqArr.length - 1].prematureTermination === true;
}

/**
 * Core STM (Sequence to Mass) calculation class
 * Converts RNA sequences to amino acid sequences with comprehensive mass calculations
 */
export class StmCore {
    /**
     * Calculate all possible amino acid sequences and their masses from RNA sequence
     *
     * @param rnaSeq - RNA sequence string
     * @param ncAAMap - Map of non-canonical amino acids
     * @param codonTitles - Map of codons assigned to each ncAA
     * @param aminoMapParam - Map of amino acids to monoisotopic weights
     * @param ionTypes - Array of ion adduct types
     * @param potentialModifications - Array of potential modifications to apply
     * @returns Array of all possible sequence possibilities with calculated masses
     */
    static calc(
        rnaSeq: string,
        ncAAMap: NcAAMap,
        codonTitles: { [key: string]: string[] },
        aminoMapParam: { [key: string]: number },
        ionTypes: IonType[],
        potentialModifications: PotentialModification[] = []
    ): Possibility[] {
        const memo = new Map<string, PossibilityLetter[][]>();

        // Potential Modifications를 타입별로 분류
        const singleSiteModifications = potentialModifications.filter(
            (mod): mod is SingleSitePotentialModification => mod.type === 'Single-site'
        );
        const crosslinkingModifications = potentialModifications.filter(
            (mod): mod is CrosslinkingPotentialModification => mod.type === 'Crosslinking'
        );

        // Single-site를 condition별로 다시 분류
        const nTerminusMods = singleSiteModifications.filter(mod => mod.condition === 'N-terminus');
        const cTerminusMods = singleSiteModifications.filter(mod => mod.condition === 'C-terminus');
        const sideChainMods = singleSiteModifications.filter(mod => mod.condition === 'Side Chain');

        // RNA 시퀀스를 3개씩 나누어 코돈 배열로 변환
        const codons = rnaSeq.match(/.{1,3}/g) || [];

        // Stop 코돈을 찾아서 그 이전까지만 처리
        let effectiveCodons: string[] = [];
        for (let i = 0; i < codons.length; i++) {
            const codon = codons[i];
            const naturalAmino = codonTableRtoS[codon];
            if (naturalAmino === '[Stop]') {
                break; // Stop 코돈을 만나면 여기서 중단
            }
            effectiveCodons.push(codon);
        }

        let basePossibilities = generatePossibilities(0, effectiveCodons, ncAAMap, codonTitles, memo);

        // **Skipping 및 Truncated가 적용된 결과 필터링**
        basePossibilities = basePossibilities.filter(seq => seq.filter(x => x.letter !== "").length > 0);

        // **절단 가능성 추가 - reinitiation 및 Premature termination**
        const truncationPossibilities: PossibilityLetter[][] = [];

        // ncAA가 사용된 위치들을 찾아서 절단 가능성 생성
        for (let truncationIndex = 0; truncationIndex < effectiveCodons.length; truncationIndex++) {
            const codon = effectiveCodons[truncationIndex];
            let hasNcAAAtPosition = false;

            // 해당 위치에 ncAA가 할당되었는지 확인
            for (const [key] of Object.entries(ncAAMap)) {
                const assignedCodons = codonTitles[key] || [];
                if (assignedCodons.includes(codon)) {
                    hasNcAAAtPosition = true;
                    break;
                }
            }

            if (hasNcAAAtPosition) {
                // reinitiation: truncationIndex부터 시작하는 시퀀스
                if (truncationIndex > 0) {
                    const internalInitSeqs = generatePossibilities(truncationIndex, effectiveCodons, ncAAMap, codonTitles, memo);
                    for (const seq of internalInitSeqs) {
                        const seqLength = seq.filter(x => x.letter !== "").length;
                        // 빈 시퀀스 또는 MIN_SEQUENCE_LENGTH 이하인 경우 제외
                        if (seqLength > 0 && seqLength <= MIN_SEQUENCE_LENGTH) continue;
                        if (seq.length > 0 && seqLength > 0) {
                            // 첫 번째 요소에 reinitiation 마킹
                            const markedSeq = [...seq];
                            if (markedSeq.length > 0) {
                                markedSeq[0] = {
                                    ...markedSeq[0],
                                    internalInitiation: true,
                                    letter: markedSeq[0].letter
                                };
                            }
                            truncationPossibilities.push(markedSeq);
                        }
                    }
                }

                // Premature termination: 0부터 truncationIndex까지의 시퀀스 (ncAA 위치에서 중단)
                if (truncationIndex < effectiveCodons.length - 1) {
                    const prematureSeqs = generatePossibilitiesRange(0, truncationIndex + 1, effectiveCodons, ncAAMap, codonTitles);
                    for (const seq of prematureSeqs) {
                        const seqLength = seq.filter(x => x.letter !== "").length;
                        // 빈 시퀀스 또는 MIN_SEQUENCE_LENGTH 이하인 경우 제외
                        if (seqLength > 0 && seqLength <= MIN_SEQUENCE_LENGTH) continue;
                        if (seq.length > 0 && seqLength > 0) {
                            // 마지막 요소에 premature termination 마킹
                            const markedSeq = [...seq];
                            if (markedSeq.length > 0) {
                                markedSeq[markedSeq.length - 1] = {
                                    ...markedSeq[markedSeq.length - 1],
                                    prematureTermination: true,
                                    letter: markedSeq[markedSeq.length - 1].letter
                                };
                            }
                            truncationPossibilities.push(markedSeq);
                        }
                    }
                }
            }
        }

        // 기존 가능성과 절단 가능성 합치기
        basePossibilities = [...basePossibilities, ...truncationPossibilities];

        const possibilities: Possibility[] = [];
        for (const seqArr of basePossibilities) {
            // 원래 시퀀스의 실제 아미노산 문자들로 구성된 문자열
            const originalLetters = seqArr.filter(x => x.letter !== "").map(x => x.letter).join("");
            // 시퀀스 길이가 MIN_SEQUENCE_LENGTH 이하인 경우 Possibility 목록에 추가하지 않음
            if (originalLetters.length <= MIN_SEQUENCE_LENGTH) continue;

            // 기존 아미노산 시퀀스들만으로 분자량과 물 손실량 계산
            let baseWeight = 0;
            let baseMolWeight = 0;
            let baseCount = 0;
            seqArr.forEach(item => {
                if (item.letter === "") return;
                baseCount++;
                if (item.natural) {
                    baseWeight += aminoMapParam[item.letter];
                    baseMolWeight += molecularWeightMap[item.letter];
                } else if (item.candidate) {
                    baseWeight += parseFloat(item.candidate.monoisotopicWeight);
                    baseMolWeight += parseFloat(item.candidate.molecularWeight);
                }
            });
            // 물 손실량은 기존 아미노산에 대해서만 적용
            baseWeight -= MassFinderHelper.getWaterWeight(baseCount);
            baseMolWeight -= MassFinderHelper.getWaterWeight(baseCount);

            // Generate power sets for N-terminus and C-terminus modifications
            // This creates all possible combinations (0개, 1개, 2개, 3개, 4개 적용)
            const nTerminusSubsets = generatePowerSet(nTerminusMods);
            const cTerminusSubsets = generatePowerSet(cTerminusMods);

            // For each combination of N-terminus and C-terminus modifications
            for (const nSubset of nTerminusSubsets) {
                for (const cSubset of cTerminusSubsets) {
                    let updatedSeqArr = seqArr.map(item => ({ ...item }));
                    let finalWeight = baseWeight;
                    let finalMolWeight = baseMolWeight;

                    // Apply Single-site Potential Modifications (N-terminus and C-terminus only)
                    // Note: Side Chain modifications are handled separately after ionType generation
                    const appliedModifications: Array<{mod: SingleSitePotentialModification, position: number}> = [];

                    // Apply selected N-terminus modifications from current subset
                    for (const mod of nSubset) {
                        const modWeight = parseFloat(mod.monoisotopicWeight);
                        const modMolWeight = parseFloat(mod.molecularWeight);

                        // N-terminus: 맨 앞 아미노산 체크
                        if (!hasInternalInitiationAtStart(seqArr)) {
                            const firstAAIndex = seqArr.findIndex(item => item.letter !== "");
                            if (firstAAIndex !== -1) {
                                const firstAA = seqArr[firstAAIndex];
                                if (firstAA && (mod.target === 'ALL' || firstAA.letter === mod.target)) {
                                    appliedModifications.push({mod, position: firstAAIndex});

                                    // N-terminus: 추가 개념 - 단순히 modification 질량을 더함
                                    finalWeight = finalWeight + modWeight;
                                    finalMolWeight = finalMolWeight + modMolWeight;
                                }
                            }
                        }
                    }

                    // Apply selected C-terminus modifications from current subset
                    for (const mod of cSubset) {
                        const modWeight = parseFloat(mod.monoisotopicWeight);
                        const modMolWeight = parseFloat(mod.molecularWeight);

                        // C-terminus: 맨 뒤 아미노산 체크
                        if (!hasPrematureTerminationAtEnd(seqArr)) {
                            // 뒤에서부터 찾기
                            let lastAAIndex = -1;
                            for (let i = seqArr.length - 1; i >= 0; i--) {
                                if (seqArr[i].letter !== "") {
                                    lastAAIndex = i;
                                    break;
                                }
                            }
                            if (lastAAIndex !== -1) {
                                const lastAA = seqArr[lastAAIndex];
                                if (lastAA && (mod.target === 'ALL' || lastAA.letter === mod.target)) {
                                    appliedModifications.push({mod, position: lastAAIndex});

                                    // C-terminus: 추가 개념 - 단순히 modification 질량을 더함
                                    finalWeight = finalWeight + modWeight;
                                    finalMolWeight = finalMolWeight + modMolWeight;
                                }
                            }
                        }
                    }

                    // Update updatedSeqArr with Single-site modifications
                    for (const {mod, position} of appliedModifications) {
                        if (position >= 0 && position < updatedSeqArr.length) {
                            updatedSeqArr[position] = {
                                ...updatedSeqArr[position],
                                singleSiteModified: true,
                                singleSiteModification: mod.structureName,
                                singleSiteCondition: mod.condition  // 'N-terminus' or 'C-terminus'
                            };
                        }
                    }

                    // sequenceString 생성 시 Single-site modification도 고려
                    // N-terminus: modification + letter (fM)
                    // C-terminus: letter + modification (Mn)
                    // Note: Side Chain modification은 나중에 별도로 처리됨
                    const sequenceString = updatedSeqArr.filter(x => x.letter !== "").map(x => {
                        if (x.singleSiteModified && x.singleSiteModification) {
                            if (x.singleSiteCondition === 'N-terminus') {
                                return x.singleSiteModification + x.letter;  // fM
                            } else if (x.singleSiteCondition === 'C-terminus') {
                                return x.letter + x.singleSiteModification;  // Mn
                            }
                        }
                        return x.letter;
                    }).join("");

                    // 사유(reason) 수집 - 동일한 reason이 여러 번 발생하면 모두 기록
                    const reasons: string[] = [];

                    // 시퀀스 레벨 절단 확인 (reinitiation, Premature termination)
                    const hasInternalInitiation = hasInternalInitiationAtStart(seqArr);
                    const hasPrematureTermination = hasPrematureTerminationAtEnd(seqArr);

                    if (hasInternalInitiation) {
                        reasons.push("reinitiation");
                    }
                    if (hasPrematureTermination) {
                        reasons.push("Premature termination");
                    }

                    // 개별 아미노산 레벨 reason 수집
                    updatedSeqArr.forEach((item) => {
                        if (!item.natural) {
                            if (item.skipping) {
                                reasons.push("Ribosome skipping");
                            }
                        }
                    });

                    // Single-site Potential Modifications를 reason에 추가
                    appliedModifications.forEach(({mod}) => {
                        reasons.push(`${mod.name}`);
                    });

                    // Only natural AA는 아무런 변화가 없는 경우에만 적용
                    // if (reasons.length === 0) {
                    //     reasons.push("Only natural AA");
                    // }

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
            }
        }

        // **Side Chain modifications 처리 - 개수별 생성**
        const possibilitiesWithSideChain = applySideChainModifications(possibilities, sideChainMods);

        // **Crosslinking modifications 처리 - 모든 조합 생성**
        const possibilitiesWithCrosslinking = applyCrosslinkingModifications(possibilitiesWithSideChain, crosslinkingModifications);

        // **중복 제거 - sequenceString이 동일한 경우 첫 번째만 유지**
        const finalPossibilities = removeDuplicateSequences(possibilitiesWithCrosslinking);

        return finalPossibilities;
    }
}
