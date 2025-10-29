import { codonTableRtoS, molecularWeightMap, getIonWeight } from './amino_mapper';
import { MassFinderHelper } from './mass_finder_helper';
import type { IonType, PotentialModification, SingleSiteCondition, CrosslinkingCondition } from '../../type/Types';

// 포밀레이스의 분자량
const fWeight = 27.99;

export class StmHelper {
    static calc(
        rnaSeq: string,
        ncAAMap: { [key: string]: any },
        codonTitles: { [key: string]: string[] },
        aminoMap: { [key: string]: number },
        ionTypes: IonType[],
        useFormylation: boolean,
        potentialModifications: PotentialModification[] = []
    ): Possibility[] {
        const memo = new Map<string, PossibilityLetter[][]>();

        // Potential Modifications를 타입별로 분류
        const singleSiteModifications = potentialModifications.filter(mod => mod.type === 'Single-site') as any[];
        const crosslinkingModifications = potentialModifications.filter(mod => mod.type === 'Crosslinking') as any[];

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

        // Internal initiation 확인 함수
        function hasInternalInitiationAtStart(seqArr: PossibilityLetter[]): boolean {
            return seqArr.length > 0 && seqArr[0].internalInitiation === true;
        }

        // Premature termination 확인 함수
        function hasPrematureTerminationAtEnd(seqArr: PossibilityLetter[]): boolean {
            return seqArr.length > 0 && seqArr[seqArr.length - 1].prematureTermination === true;
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

        // **절단 가능성 추가 - Internal initiation 및 Premature termination**
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
                // Internal initiation: truncationIndex부터 시작하는 시퀀스
                if (truncationIndex > 0) {
                    const internalInitSeqs = generatePossibilities(truncationIndex);
                    for (const seq of internalInitSeqs) {
                        if (seq.length > 0 && seq.filter(x => x.letter !== "").length > 0) {
                            // 첫 번째 요소에 internal initiation 마킹
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
            
            // Formylation 조건 확인: useFormylation이 true이고 첫 번째 아미노산이 M이거나 AUG에 할당된 ncAA인 경우
            // 그리고 Internal initiation이 없는 경우에만 적용
            const firstLetter = seqArr.length > 0 && seqArr[0].letter !== "" ? seqArr[0] : null;
            const shouldFormylate = useFormylation && firstLetter &&
                                   !hasInternalInitiationAtStart(seqArr) &&
                                   shouldApplyFormylationWithSequence(effectiveCodons[0], firstLetter, ncAAMap, codonTitles);

            let updatedSeqArr = shouldFormylate ? [{ letter: "f", natural: true }, ...seqArr] : seqArr;

            let finalWeight = baseWeight;
            let finalMolWeight = baseMolWeight;
            if (shouldFormylate) {
                finalWeight += fWeight;
                finalMolWeight += fWeight;
            }

            // Apply Single-site Potential Modifications
            const appliedModifications: Array<{mod: any, position: number}> = [];

            for (const mod of singleSiteModifications) {
                const modWeight = parseFloat(mod.monoisotopicWeight);
                const modMolWeight = parseFloat(mod.molecularWeight);

                if (mod.condition === 'N-terminus') {
                    // N-terminus: 맨 앞 아미노산 체크
                    if (!hasInternalInitiationAtStart(seqArr)) {
                        const firstAA = seqArr.find(item => item.letter !== "");
                        if (firstAA && (mod.target === 'ALL' || firstAA.letter === mod.target)) {
                            appliedModifications.push({mod, position: -1}); // -1 = N-terminus
                            finalWeight += modWeight;
                            finalMolWeight += modMolWeight;
                        }
                    }
                } else if (mod.condition === 'C-terminus') {
                    // C-terminus: 맨 뒤 아미노산 체크
                    if (!hasPrematureTerminationAtEnd(seqArr)) {
                        const lastAA = [...seqArr].reverse().find(item => item.letter !== "");
                        if (lastAA && (mod.target === 'ALL' || lastAA.letter === mod.target)) {
                            appliedModifications.push({mod, position: -2}); // -2 = C-terminus
                            finalWeight += modWeight;
                            finalMolWeight += modMolWeight;
                        }
                    }
                } else if (mod.condition === 'Internal site') {
                    // Internal site: 맨 앞과 맨 뒤가 아닌 위치의 특정 아미노산
                    const nonEmptyIndices: number[] = [];
                    seqArr.forEach((item, idx) => {
                        if (item.letter !== "") nonEmptyIndices.push(idx);
                    });

                    // 내부 위치만 선택 (첫 번째와 마지막 제외)
                    for (let i = 1; i < nonEmptyIndices.length - 1; i++) {
                        const idx = nonEmptyIndices[i];
                        if (seqArr[idx].letter === mod.target) {
                            appliedModifications.push({mod, position: idx});
                            finalWeight += modWeight;
                            finalMolWeight += modMolWeight;
                        }
                    }
                }
            }

            const sequenceString = updatedSeqArr.filter(x => x.letter !== "").map(x => x.letter).join("");

            // 사유(reason) 수집 - 동일한 reason이 여러 번 발생하면 모두 기록
            const reasons: string[] = [];

            // 시퀀스 레벨 절단 확인 (Internal initiation, Premature termination)
            const hasInternalInitiation = hasInternalInitiationAtStart(seqArr);
            const hasPrematureTermination = hasPrematureTerminationAtEnd(seqArr);

            if (hasInternalInitiation) {
                reasons.push("Internal initiation");
            }
            if (hasPrematureTermination) {
                reasons.push("Premature termination");
            }

            // 개별 아미노산 레벨 reason 수집
            updatedSeqArr.forEach((item, index) => {
                if (shouldFormylate && index === 0) return; // f는 reason에 포함하지 않음
                if (!item.natural) {
                    if (item.candidate && !item.skipped) {
                        reasons.push("ncAA incorporated");
                    }
                    if (item.skipped) {
                        reasons.push("Skipped");
                    }
                }
            });

            // Single-site Potential Modifications를 reason에 추가
            appliedModifications.forEach(({mod}) => {
                reasons.push(`${mod.name}`);
            });

            // Only natural AA는 아무런 변화가 없는 경우에만 적용
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

        // **Crosslinking modifications 처리 - 모든 조합 생성**
        const finalPossibilities = StmHelper.applyCrosslinkingModifications(possibilities, crosslinkingModifications);

        return finalPossibilities;
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
                // 질량 업데이트
                const modWeight = parseFloat(modification.monoisotopicWeight);
                const modMolWeight = parseFloat(modification.molecularWeight);
                newPoss.weight += modWeight * combo.length;
                newPoss.molecularWeight += modMolWeight * combo.length;

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

                if (modification.condition === 'Everywhere') {
                    isValid = true;
                } else if (modification.condition === 'Adjacent') {
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

        // sequenceString 재생성
        possibility.sequenceString = possibility.sequence
            .filter(item => item.letter !== "")
            .map(item => {
                if (item.crosslinked && item.crosslinkModification) {
                    return item.crosslinkModification + item.letter;
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
    skipped?: boolean;
    crosslinked?: boolean;
    crosslinkModification?: string;
}
