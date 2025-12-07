import { codonTableRtoS, aminoMap, molecularWeightMap, getIonWeight } from './amino_mapper';
import { MassFinderHelper } from './mass_finder_helper';
import type { IonType, PotentialModification, SingleSiteCondition, CrosslinkingCondition } from '../../type/Types';

export class StmHelper {
    static calc(
        rnaSeq: string,
        ncAAMap: { [key: string]: any },
        codonTitles: { [key: string]: string[] },
        aminoMap: { [key: string]: number },
        ionTypes: IonType[],
        potentialModifications: PotentialModification[] = []
    ): Possibility[] {
        const memo = new Map<string, PossibilityLetter[][]>();

        // Potential Modifications를 타입별로 분류
        const singleSiteModifications = potentialModifications.filter(mod => mod.type === 'Single-site') as any[];
        const crosslinkingModifications = potentialModifications.filter(mod => mod.type === 'Crosslinking') as any[];

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

            const nextPossibilities = generatePossibilities(index + 1);
            for (const option of possibilitiesForCurrent) {
                for (const next of nextPossibilities) {
                    results.push([option, ...next]);
                }
            }

            memo.set(key, results);
            return results;
        }

        // 특정 범위의 가능성 생성 함수
        function generatePossibilitiesRange(startIndex: number, endIndex: number): PossibilityLetter[][] {
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
                generatePossibilitiesRange(startIndex + 1, endIndex) : [[]];
            
            for (const option of possibilitiesForCurrent) {
                for (const next of nextPossibilities) {
                    results.push([option, ...next]);
                }
            }

            return results;
        }

        // reinitiation 확인 함수
        function hasInternalInitiationAtStart(seqArr: PossibilityLetter[]): boolean {
            return seqArr.length > 0 && seqArr[0].internalInitiation === true;
        }

        // Premature termination 확인 함수
        function hasPrematureTerminationAtEnd(seqArr: PossibilityLetter[]): boolean {
            return seqArr.length > 0 && seqArr[seqArr.length - 1].prematureTermination === true;
        }

        let basePossibilities = generatePossibilities(0);

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
                    const internalInitSeqs = generatePossibilities(truncationIndex);
                    for (const seq of internalInitSeqs) {
                        if (seq.length > 0 && seq.filter(x => x.letter !== "").length > 0) {
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
                    const prematureSeqs = generatePossibilitiesRange(0, truncationIndex + 1);
                    for (const seq of prematureSeqs) {
                        if (seq.length > 0 && seq.filter(x => x.letter !== "").length > 0) {
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

            // Generate power sets for N-terminus and C-terminus modifications
            // This creates all possible combinations (0개, 1개, 2개, 3개, 4개 적용)
            const nTerminusSubsets = StmHelper.generatePowerSet(nTerminusMods);
            const cTerminusSubsets = StmHelper.generatePowerSet(cTerminusMods);

            // For each combination of N-terminus and C-terminus modifications
            for (const nSubset of nTerminusSubsets) {
                for (const cSubset of cTerminusSubsets) {
                    let updatedSeqArr = seqArr.map(item => ({ ...item }));
                    let finalWeight = baseWeight;
                    let finalMolWeight = baseMolWeight;

                    // Apply Single-site Potential Modifications (N-terminus and C-terminus only)
                    // Note: Side Chain modifications are handled separately after ionType generation
                    const appliedModifications: Array<{mod: any, position: number}> = [];

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
                    updatedSeqArr.forEach((item, index) => {
                        if (!item.natural) {
                            // if (item.candidate && !item.skipping) {
                            //     reasons.push("ncAA incorporated");
                            // }
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
        const possibilitiesWithSideChain = StmHelper.applySideChainModifications(possibilities, sideChainMods);

        // **Crosslinking modifications 처리 - 모든 조합 생성**
        const possibilitiesWithCrosslinking = StmHelper.applyCrosslinkingModifications(possibilitiesWithSideChain, crosslinkingModifications);

        // **중복 제거 - sequenceString이 동일한 경우 첫 번째만 유지**
        const finalPossibilities = StmHelper.removeDuplicateSequences(possibilitiesWithCrosslinking);

        return finalPossibilities;
    }

    /**
     * Generate power set (all subsets) of an array
     * Example: [A, B] => [[], [A], [B], [A, B]]
     * 0개, 1개, 2개, ... 모든 조합 생성
     */
    private static generatePowerSet<T>(array: T[]): T[][] {
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
     * Side Chain modifications를 개수별로 적용
     * 0개, 1개, 2개, ... N개 변화 각각 생성
     */
    private static applySideChainModifications(
        basePossibilities: Possibility[],
        sideChainModifications: any[]
    ): Possibility[] {
        if (sideChainModifications.length === 0) {
            return basePossibilities;
        }

        const allResults: Possibility[] = [];

        for (const basePoss of basePossibilities) {
            // 각 Side Chain modification에 대해 재귀적으로 적용
            const possWithAllMods = this.applySideChainRecursive(
                basePoss,
                sideChainModifications,
                0
            );
            allResults.push(...possWithAllMods);
        }

        return allResults;
    }

    /**
     * Side Chain modifications를 재귀적으로 적용
     */
    private static applySideChainRecursive(
        basePoss: Possibility,
        modifications: any[],
        modIndex: number
    ): Possibility[] {
        if (modIndex >= modifications.length) {
            return [basePoss];
        }

        const currentMod = modifications[modIndex];

        // 현재 modification의 모든 개수 변화 생성 (0개, 1개, 2개, ...)
        const variants = this.generateSideChainVariants(basePoss, currentMod);

        // 다음 modification도 적용
        const results: Possibility[] = [];
        for (const variant of variants) {
            const nextResults = this.applySideChainRecursive(variant, modifications, modIndex + 1);
            results.push(...nextResults);
        }

        return results;
    }

    /**
     * 한 가지 Side Chain modification에 대한 개수별 변화 생성
     */
    private static generateSideChainVariants(
        basePossibility: Possibility,
        modification: any
    ): Possibility[] {
        // 1. 전체 시퀀스에서 target 아미노산 위치 찾기 (맨 앞과 맨 뒤 포함)
        const targetIndices: number[] = [];

        for (let i = 0; i < basePossibility.sequence.length; i++) {
            const item = basePossibility.sequence[i];
            if (item.letter === modification.target) {
                targetIndices.push(i);
            }
        }

        const count = targetIndices.length;

        // 2. 0개부터 count개까지 각각 생성
        const results: Possibility[] = [];

        for (let applyCount = 0; applyCount <= count; applyCount++) {
            const newPoss = this.deepClonePossibility(basePossibility);

            // sequence 배열을 명시적으로 deep clone (각 item도 복사)
            newPoss.sequence = newPoss.sequence.map(item => ({ ...item }));

            if (applyCount > 0) {
                const modWeight = parseFloat(modification.monoisotopicWeight);
                const modMolWeight = parseFloat(modification.molecularWeight);

                // Get target amino acid weight
                const targetAA = modification.target;
                const targetMonoisotopicWeight = aminoMap[targetAA] || 0;
                const targetMolecularWeight = molecularWeightMap[targetAA] || 0;

                // 왼쪽부터 applyCount개 적용
                for (let i = 0; i < applyCount; i++) {
                    const idx = targetIndices[i];

                    // 시퀀스 마킹
                    newPoss.sequence[idx] = {
                        ...newPoss.sequence[idx],
                        sideChainModified: true,
                        sideChainModification: modification.structureName
                    };
                }

                // 질량 업데이트 (REPLACE: 기존 타겟 질량을 빼고 새 질량을 더함)
                // Side Chain은 absolute value로 저장되므로 target weight를 빼고 mod weight를 더해야 함
                newPoss.weight = newPoss.weight - (targetMonoisotopicWeight * applyCount) + (modWeight * applyCount);
                newPoss.molecularWeight = newPoss.molecularWeight - (targetMolecularWeight * applyCount) + (modMolWeight * applyCount);

                // sequenceString 재생성
                newPoss.sequenceString = newPoss.sequence
                    .filter(item => item.letter !== "")
                    .map(item => {
                        // Side Chain: 대체 (modification만 표시)
                        if (item.sideChainModified && item.sideChainModification) {
                            return item.sideChainModification;
                        }
                        // N-terminus: 추가 (modification + letter)
                        if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'N-terminus') {
                            return item.singleSiteModification + item.letter;
                        }
                        // C-terminus: 추가 (letter + modification)
                        if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'C-terminus') {
                            return item.letter + item.singleSiteModification;
                        }
                        // Crosslinking: 대체 (modification만 표시)
                        if (item.crosslinked && item.crosslinkModification) {
                            return item.crosslinkModification;
                        }
                        return item.letter;
                    })
                    .join("");

                // Reasons 업데이트
                newPoss.reasons.push(`${modification.name} (x${applyCount})`);
                newPoss.reasons = newPoss.reasons.filter(r => r !== "Only natural AA");
            }

            results.push(newPoss);
        }

        return results;
    }

    /**
     * Crosslinking modifications를 모든 조합으로 적용
     */
    private static applyCrosslinkingModifications(
        basePossibilities: Possibility[],
        crosslinkingModifications: any[]
    ): Possibility[] {
        if (crosslinkingModifications.length === 0) {
            return basePossibilities;
        }

        // 각 base possibility에 대해 처리
        const allResults: Possibility[] = [];

        for (const basePoss of basePossibilities) {
            // 이 possibility에 대해 모든 crosslinking modifications를 재귀적으로 적용
            const possWithAllMods = this.applyCrosslinkingRecursive(
                basePoss,
                crosslinkingModifications,
                0
            );
            allResults.push(...possWithAllMods);
        }

        // 중복 제거
        const uniqueSequences = new Set<string>();
        const dedupedResults: Possibility[] = [];

        for (const poss of allResults) {
            const crosslinkingKey = (poss.crosslinking || [])
                .map(c => `${c.modification}-${c.pair.join(',')}`)
                .sort()
                .join('|');
            const uniqueKey = `${poss.sequenceString}-C${crosslinkingKey}-${poss.adduct}`;

            if (!uniqueSequences.has(uniqueKey)) {
                uniqueSequences.add(uniqueKey);
                dedupedResults.push(poss);
            }
        }

        return dedupedResults;
    }

    /**
     * Crosslinking modifications를 재귀적으로 적용
     * 여러 modification이 있을 때 모든 조합을 생성
     */
    private static applyCrosslinkingRecursive(
        basePoss: Possibility,
        modifications: any[],
        modIndex: number
    ): Possibility[] {
        // 모든 modification을 처리했으면 현재 possibility 반환
        if (modIndex >= modifications.length) {
            return [basePoss];
        }

        const currentMod = modifications[modIndex];

        // 현재 modification의 모든 조합 생성
        const combinations = this.generateCrosslinkingCombinations(basePoss, currentMod);

        // 다음 modification도 적용
        const results: Possibility[] = [];
        for (const combo of combinations) {
            const nextResults = this.applyCrosslinkingRecursive(combo, modifications, modIndex + 1);
            results.push(...nextResults);
        }

        return results;
    }

    /**
     * 한 가지 crosslinking modification에 대한 모든 조합 생성
     */
    private static generateCrosslinkingCombinations(
        basePossibility: Possibility,
        modification: any
    ): Possibility[] {
        // 1. Valid pairs 찾기
        const validPairs = this.findValidCrosslinkingPairs(basePossibility, modification);

        // 2. Non-overlapping combinations 생성
        const combinations = this.generateNonOverlappingCombinations(validPairs);

        // 3. 각 조합마다 새로운 Possibility 생성
        const results: Possibility[] = [];
        for (const combo of combinations) {
            const newPoss: Possibility = this.deepClonePossibility(basePossibility);

            if (combo.length > 0) {
                // 질량 업데이트: 각 페어마다 원래 두 아미노산을 빼고 새 구조를 더함
                const modWeight = parseFloat(modification.monoisotopicWeight);
                const modMolWeight = parseFloat(modification.molecularWeight);

                // 각 페어에서 대체되는 원래 아미노산들의 질량 계산
                let originalMonoWeight = 0;
                let originalMolWeight = 0;

                for (const [idx1, idx2] of combo) {
                    const aa1 = newPoss.sequence[idx1];
                    const aa2 = newPoss.sequence[idx2];

                    // 첫 번째 아미노산 질량
                    if (aa1.natural) {
                        originalMonoWeight += aminoMap[aa1.letter] || 0;
                        originalMolWeight += molecularWeightMap[aa1.letter] || 0;
                    } else if (aa1.candidate) {
                        originalMonoWeight += parseFloat(aa1.candidate.monoisotopicWeight);
                        originalMolWeight += parseFloat(aa1.candidate.molecularWeight);
                    }

                    // 두 번째 아미노산 질량
                    if (aa2.natural) {
                        originalMonoWeight += aminoMap[aa2.letter] || 0;
                        originalMolWeight += molecularWeightMap[aa2.letter] || 0;
                    } else if (aa2.candidate) {
                        originalMonoWeight += parseFloat(aa2.candidate.monoisotopicWeight);
                        originalMolWeight += parseFloat(aa2.candidate.molecularWeight);
                    }
                }

                // 질량 변화 = (새 구조 × 페어 개수) - 원래 아미노산들
                newPoss.weight = newPoss.weight - originalMonoWeight + (modWeight * combo.length);
                newPoss.molecularWeight = newPoss.molecularWeight - originalMolWeight + (modMolWeight * combo.length);

                // 시퀀스 업데이트 (structure name 사용)
                this.updateSequenceWithCrosslinking(newPoss, combo, modification.structureName);

                // Reasons 업데이트 (modification name 사용)
                newPoss.reasons.push(`${modification.name} (x${combo.length})`);

                // "Only natural AA" 제거
                newPoss.reasons = newPoss.reasons.filter(r => r !== "Only natural AA");

                // Crosslinking 정보 저장
                newPoss.crosslinking = (newPoss.crosslinking || []).concat(
                    combo.map(pair => ({
                        modification: modification.name,
                        pair: pair
                    }))
                );
            }

            results.push(newPoss);
        }

        return results;
    }

    /**
     * Valid crosslinking pairs 찾기
     */
    private static findValidCrosslinkingPairs(
        possibility: Possibility,
        modification: any
    ): Array<[number, number]> {
        const target1Indices: number[] = [];
        const target2Indices: number[] = [];

        // Crosslinked 아미노산도 포함 - 원래 letter 기준으로 찾기
        possibility.sequence.forEach((item, idx) => {
            if (item.letter === modification.target1) target1Indices.push(idx);
            if (item.letter === modification.target2) target2Indices.push(idx);
        });
        const validPairs: Array<[number, number]> = [];

        for (const idx1 of target1Indices) {
            for (const idx2 of target2Indices) {
                if (idx1 === idx2) continue; // 같은 위치는 제외

                const distance = Math.abs(idx2 - idx1) - 1;

                let isValid = false;

                if (modification.condition === 'Adjacent') {
                    isValid = distance === 0;
                } else if (modification.condition === 'Adjacent (Target 1→2)' || modification.condition === 'Adjacent(Target 1->2)') {
                    isValid = (idx2 === idx1 + 1);
                } else if (modification.condition === 'Adjacent (Target 2→1)' || modification.condition === 'Adjacent(Target 2->1)') {
                    isValid = (idx1 === idx2 + 1);
                } else if (modification.condition === 'Distance') {
                    const operator = modification.distanceOperator;
                    const value = modification.distanceValue || 0;

                    if (operator === '=') {
                        isValid = distance === value;
                    } else if (operator === '<') {
                        isValid = distance < value;
                    } else if (operator === '>') {
                        isValid = distance > value;
                    }
                }

                if (isValid) {
                    const pair: [number, number] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
                    const pairKey = `${pair[0]}-${pair[1]}`;
                    if (!validPairs.some(p => `${p[0]}-${p[1]}` === pairKey)) {
                        validPairs.push(pair);
                    }
                }
            }
        }

        return validPairs;
    }

    /**
     * Non-overlapping combinations 생성 (Backtracking)
     * maxSize: 최대 조합 크기 제한 (성능 최적화)
     */
    private static generateNonOverlappingCombinations(
        pairs: Array<[number, number]>,
        maxSize: number = 5  // 기본값: 최대 5개 페어까지
    ): Array<Array<[number, number]>> {
        const results: Array<Array<[number, number]>> = [[]]; // 빈 조합 (0개 적용)

        const backtrack = (
            startIndex: number,
            currentCombo: Array<[number, number]>,
            usedIndices: Set<number>
        ) => {
            // currentCombo를 결과에 추가 (1개 이상인 경우)
            if (currentCombo.length > 0) {
                results.push([...currentCombo]);
                // 너무 많은 로그 방지 - 처음 50개만 출력
                if (results.length <= 50) {
                    console.log(`[Combination Debug] Added combination of size ${currentCombo.length}:`, currentCombo);
                }
            }

            // 최대 크기 제한 체크 - 성능 최적화
            if (currentCombo.length >= maxSize) {
                return; // 더 이상 깊이 들어가지 않음
            }

            // 다음 페어 선택
            for (let i = startIndex; i < pairs.length; i++) {
                const [idx1, idx2] = pairs[i];

                // 이미 사용된 인덱스는 건너뛰기
                if (usedIndices.has(idx1) || usedIndices.has(idx2)) continue;

                // 현재 페어 추가
                currentCombo.push(pairs[i]);
                usedIndices.add(idx1);
                usedIndices.add(idx2);

                // 재귀 호출
                backtrack(i + 1, currentCombo, usedIndices);

                // Backtrack
                currentCombo.pop();
                usedIndices.delete(idx1);
                usedIndices.delete(idx2);
            }
        };

        backtrack(0, [], new Set<number>());

        // 조합 개수 요약
        const summary = new Map<number, number>();
        results.forEach(combo => {
            const count = summary.get(combo.length) || 0;
            summary.set(combo.length, count + 1);
        });
        console.log(`[Combination Debug] Max size limit: ${maxSize}`);
        console.log('[Combination Debug] Summary by combination size:');
        summary.forEach((count, size) => {
            console.log(`  - Size ${size}: ${count} combinations`);
        });
        console.log(`[Combination Debug] Total combinations: ${results.length}`);

        return results;
    }

    /**
     * Crosslinking이 적용된 시퀀스 업데이트
     */
    private static updateSequenceWithCrosslinking(
        possibility: Possibility,
        pairs: Array<[number, number]>,
        modificationName: string
    ): void {
        // pairs에 포함된 인덱스들을 Set으로 변환
        const affectedIndices = new Set<number>();
        pairs.forEach(([idx1, idx2]) => {
            affectedIndices.add(idx1);
            affectedIndices.add(idx2);
        });

        // sequence array 업데이트
        possibility.sequence = possibility.sequence.map((item, idx) => {
            if (affectedIndices.has(idx) && item.letter !== "") {
                return {
                    ...item,
                    crosslinked: true,
                    crosslinkModification: modificationName
                };
            }
            return item;
        });

        // sequenceString 재생성 (모든 modification 타입 고려)
        possibility.sequenceString = possibility.sequence
            .filter(item => item.letter !== "")
            .map(item => {
                // 우선순위: Crosslinking > Side Chain > Single-site > 기본 letter
                // Crosslinking과 Side Chain: 대체 (modification만 표시)
                if (item.crosslinked && item.crosslinkModification) {
                    return item.crosslinkModification;
                }
                if (item.sideChainModified && item.sideChainModification) {
                    return item.sideChainModification;
                }
                // N-terminus: 추가 (modification + letter)
                if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'N-terminus') {
                    return item.singleSiteModification + item.letter;
                }
                // C-terminus: 추가 (letter + modification)
                if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'C-terminus') {
                    return item.letter + item.singleSiteModification;
                }
                return item.letter;
            })
            .join("");
    }

    /**
     * Possibility deep clone
     */
    private static deepClonePossibility(poss: Possibility): Possibility {
        return {
            sequence: poss.sequence.map(item => ({ ...item })),
            sequenceString: poss.sequenceString,
            reasons: [...poss.reasons],
            weight: poss.weight,
            molecularWeight: poss.molecularWeight,
            adduct: poss.adduct,
            crosslinking: poss.crosslinking ? poss.crosslinking.map(c => ({ ...c, pair: [...c.pair] })) : []
        };
    }

    /**
     * 중복 제거: sequenceString, adduct, weight, molecularWeight가 모두 동일한 경우
     * Note(reasons)는 달라도 되지만 나머지가 같으면 중복으로 판단
     * 첫 번째로 발견된 것만 유지
     */
    private static removeDuplicateSequences(possibilities: Possibility[]): Possibility[] {
        const seenKeys = new Set<string>();
        const uniquePossibilities: Possibility[] = [];

        for (const poss of possibilities) {
            // 중복 판단 키: sequenceString + adduct + weight + molecularWeight
            const key = `${poss.sequenceString}|${poss.adduct}|${poss.weight.toFixed(5)}|${poss.molecularWeight.toFixed(5)}`;

            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniquePossibilities.push(poss);
            }
        }

        return uniquePossibilities;
    }
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
    crosslinking?: Array<{modification: string, pair: [number, number]}>;
}

interface PossibilityLetter {
    letter: string;
    natural: boolean;
    candidate?: any;
    internalInitiation?: boolean;
    prematureTermination?: boolean;
    skipping?: boolean;
    crosslinked?: boolean;
    crosslinkModification?: string;
    singleSiteModified?: boolean;
    singleSiteModification?: string;
    singleSiteCondition?: string;  // 'N-terminus' or 'C-terminus'
    sideChainModified?: boolean;
    sideChainModification?: string;
}
