import { AminoModel } from '../model/AminoModel';

import type { IonType, FormyType } from '../../type/Types';

import {calculateSimilarity, calculateSequenceSimilarity, calculateSequenceSimilarityWithCounts, sortAmino, removeDuplicates, removeSingleFSequences, processKnownSequenceOverlap } from './mass_util';
import { getIonWeight, codonTableRtoS } from './amino_mapper';

// 사용가능한 아미노산의 리스트 모노이소토픽 무게
let dataMap: { [key: string]: number } = {};

// Molecular Weight 전용 Map
let moleMap: { [key: string]: number } = {};

// 참조 시퀀스 (시퀀스 유사도 계산용)
let referenceSequence: string = '';

// 냉각률
const coolingRate = 0.99;
// 포밀레이스의 분자량
const fWeight = 27.99;

/**
 * 매스 파인더 핵심로직
 * 시뮬레이티드 어닐링 알고리즘을 사용해 입력된 mass에 사용된 아미노산을 추측해 결과를 도출한다.
 * [FormyType] 과 [IonType] 값에 따라 분기가 나뉘며 unknown 이면 계산할 범위가 커져 가능하면 지정하는것을 추천함
 * 
 */
export class MassFinderHelper {
    // 몇개의 결과를 도출할건지에 대한 값
    static topSolutionsCount: number = 100;

    static formyType: FormyType = 'unknown';
    static ionType: IonType = 'unknown';

    // 이온 타입이 적용된 이후 생긴 함수
    // [targetMass] : 목표 무게
    // [initAminos] : 필수로 들어가는 아미노산의 string 입력값
    // [fomyType] : 포밀레이스가 들어가는지에 대한 값, 포밀레이스는 항상 결과물의 제일 앞에 붙음
    // [ionType] : 이온이 들어가는지에 대한 값
    // [aminoMap] : 계산에 사용되는 아미노산의 모음
    // [proteinSequence] : 초기 솔루션으로 사용할 단백질/RNA 시퀀스 (선택사항)
    // [initialTemperature] : 시뮬레이티드 어닐링 초기 온도 (기본값: 10000)
    // [absoluteTemperature] : 시뮬레이티드 어닐링 최소 온도 (기본값: 0.00001)
    // [saIterations] : 시뮬레이티드 어닐링 반복 횟수 (기본값: 100)
    // 최종적으로 AminoModel의 리스트를 리턴함
    static calcByIonType(targetMass: number, initAminos: string, fomyType: FormyType, ionType: IonType, aminoMap: { [key: string]: number }, molecularMap: { [key: string]: number }, proteinSequence?: string, initialTemperature: number = 10000, absoluteTemperature: number = 0.00001, saIterations: number = 100): AminoModel[] {
        this.ionType = ionType;
        let bestSolutions: AminoModel[] = [];
        bestSolutions = this.calc(targetMass - getIonWeight(this.ionType), initAminos, fomyType, ionType, aminoMap, molecularMap, proteinSequence, initialTemperature, absoluteTemperature, saIterations)
            .map(e => new AminoModel({ 
                ...e, 
                weight: (e.weight ?? 0) + getIonWeight(this.ionType),
                molecularWeight: (e.molecularWeight ?? 0) + getIonWeight(this.ionType),
                similarity: calculateSimilarity(targetMass, (e.weight ?? 0) + getIonWeight(this.ionType))
            }));
        return bestSolutions;
    }

    /// calcByIonType 함수에서 이온값에따라 알아서 구분되어 호출되는 함수
    static calc(targetMass: number, initAminos: string, fomyType: FormyType, ionType: IonType, aminoMap: { [key: string]: number }, molecularMap: { [key: string]: number }, proteinSequence?: string, initialTemperature: number = 10000, absoluteTemperature: number = 0.00001, saIterations: number = 100): AminoModel[] {
        this.formyType = fomyType;
        dataMap = { ...aminoMap };
        moleMap = { ...molecularMap };
        
        // 참조 시퀀스 설정 및 Known Sequence와의 중복 처리
        let processedInitAminos = initAminos;
        if (proteinSequence) {
            const isRnaSequence = /^[AUGC]+$/.test(proteinSequence) && proteinSequence.length % 3 === 0;
            const rnaConvertedSequence = isRnaSequence ? this.convertRnaToAminoAcids(proteinSequence) : proteinSequence;
            
            // Known Sequence와 RNA 변환 시퀀스 간의 중복 처리
            const overlapResult = processKnownSequenceOverlap(initAminos, rnaConvertedSequence);
            
            // 처리된 Known Sequence 사용
            processedInitAminos = overlapResult.finalKnownSequence;
            
            // 참조 시퀀스는 중복 제거된 나머지 RNA 시퀀스와 Known Sequence 결합
            if (overlapResult.remainingRnaSequence) {
                referenceSequence = processedInitAminos + overlapResult.remainingRnaSequence;
            } else {
                referenceSequence = rnaConvertedSequence; // 원본 RNA 변환 시퀀스 사용
            }
        } else {
            referenceSequence = '';
        }
        
        let bestSolutions: AminoModel[] = [];
        const initAminoWeight = this.getInitAminoWeight(processedInitAminos);
        targetMass -= initAminoWeight.monoisotopicWeight;

        const [minRange, maxRange] = this.getMinMaxRange(this.formyType, targetMass);
        for (let i = minRange; i < maxRange; i++) {
            const addWeight = this.getWaterWeight(i);
            let solutions = this.calcByFType(this.formyType, targetMass + addWeight, i, proteinSequence, initialTemperature, absoluteTemperature, saIterations);
            solutions = removeDuplicates(solutions);
            solutions = removeSingleFSequences(solutions);
            bestSolutions = bestSolutions.concat(solutions);
        }

        // 전체 결과에 대해 다시 한 번 중복 제거 (강화된 중복 제거)
        bestSolutions = removeDuplicates(bestSolutions);
        bestSolutions = sortAmino(bestSolutions, targetMass, referenceSequence).slice(0, MassFinderHelper.topSolutionsCount);
        bestSolutions = this.setInitAminoToResult(bestSolutions, processedInitAminos, initAminoWeight);
        bestSolutions = this.setMetaData(bestSolutions, this.formyType, ionType, processedInitAminos);
        bestSolutions = this.setSequenceSimilarity(bestSolutions);

        bestSolutions.forEach(solution => {
            console.log(`combins : ${solution.code}, result : ${solution.weight}`);
        });

        return bestSolutions;
    }

    // calc 함수에서 호출되는 함수
    // FormyType 값에 따라 솔루션을 각각 구해와서 전달하는 역할을 한다.
    static calcByFType(fType: FormyType, targetMass: number, seqLength: number, proteinSequence?: string, initialTemperature: number = 10000, absoluteTemperature: number = 0.00001, saIterations: number = 100): AminoModel[] {
        const bestSolutions: AminoModel[] = [];
        for (let i = 0; i < saIterations; i++) {
            switch (fType) {
                case 'no': // 포밀레이스 없으면 무게 안빼고 계산해도됨
                    const solutionNo = this.simulatedAnnealing(targetMass, seqLength, proteinSequence, initialTemperature, absoluteTemperature);
                    const seqsN = Object.keys(solutionNo)[0];
                    const weightN = this.getMonoisotopicWeightSum(seqsN);
                    const molecularWeightN = this.getMolecularWeightSum(seqsN);
                    bestSolutions.push(new AminoModel({ code: Object.keys(solutionNo)[0], weight: weightN, molecularWeight: molecularWeightN }));
                    break;
                case 'yes': // 포밀레이스 있으면 무게를 빼고 계산후 가장 앞에 'f' 붙여줌
                    const solutionYes = this.simulatedAnnealing(targetMass - fWeight, seqLength, proteinSequence, initialTemperature, absoluteTemperature);
                    const seqsY = `f${Object.keys(solutionYes)[0]}`;
                    const weightY = this.getMonoisotopicWeightSum(seqsY);
                    const molecularWeightY = this.getMolecularWeightSum(seqsY);
                    bestSolutions.push(new AminoModel({ code: `f${Object.keys(solutionYes)[0]}`, weight: weightY, molecularWeight: molecularWeightY }));
                    break;
                case 'unknown': // 포밀레이스 있는지 없는지 몰라서 둘다 계산해야함
                    const solutionUnknown1 = this.simulatedAnnealing(targetMass, seqLength, proteinSequence, initialTemperature, absoluteTemperature);
                    const solutionUnknown2 = this.simulatedAnnealing(targetMass - fWeight, seqLength, proteinSequence, initialTemperature, absoluteTemperature);
                    const seqsU1 = Object.keys(solutionUnknown1)[0];
                    const seqsU2 = `f${Object.keys(solutionUnknown2)[0]}`;
                    const weightU1 = this.getMonoisotopicWeightSum(seqsU1);
                    const weightU2 = this.getMonoisotopicWeightSum(seqsU2);
                    const molecularWeightU1 = this.getMolecularWeightSum(seqsU1);
                    const molecularWeightU2 = this.getMolecularWeightSum(seqsU2);
                    bestSolutions.push(new AminoModel({ code: Object.keys(solutionUnknown1)[0], weight: weightU1, molecularWeight: molecularWeightU1 }));
                    bestSolutions.push(new AminoModel({ code: `f${Object.keys(solutionUnknown2)[0]}`, weight: weightU2, molecularWeight: molecularWeightU2 }));
                    break;
            }
        }
        return bestSolutions;
    }

    /// 핵심로직으로 랜덤한 값과 그 랜던값에서 조금 바꾼 다른 값을 계속 비교해 나가면서 최적의 해를 찾음
    static simulatedAnnealing(targetMass: number, seqLength: number, proteinSequence?: string, initialTemperature: number = 10000, absoluteTemperature: number = 0.00001): { [key: string]: number } {
        let temperature = initialTemperature;
        // 1차 비교군을 위한 조합 추출해서 목표값과의 차이 저장
        let currentSolution = proteinSequence ? this.proteinBasedSolution(proteinSequence, seqLength) : this.randomSolution(seqLength);
        let currentEnergy = this.evaluate(currentSolution, targetMass);
        // 1차 비교군을 베스트로지정해놓음
        let bestSolution = [...currentSolution];
        let bestEnergy = currentEnergy;

        // 초기온도에 계속해서 0.99를 곱해서 최소온도가 될때까지 반복해서 최적의 해를 구함
        while (temperature > absoluteTemperature) {
            // 기존 조합을 기준으로 새로운 조합 추출
            const newSolution = this.neighborSolution(currentSolution, targetMass);
            const newEnergy = this.evaluate(newSolution, targetMass);

            // 새 조합이 합격되는지 체크
            if (this.acceptanceProbability(currentEnergy, newEnergy, temperature) > Math.random()) {
                currentSolution = newSolution;
                currentEnergy = newEnergy;
            }

            // 새 조합이 목표값과의 차이가 더 적으면 새로운 베스트로 셋팅
            if (currentEnergy < bestEnergy) {
                bestSolution = [...currentSolution];
                bestSolution.sort();
                bestEnergy = currentEnergy;
            }

            temperature *= coolingRate;
        }

        return { [bestSolution.join('')]: bestEnergy };
    }

    // 초기에 사용될 기준이 되는 조합을 랜덤으로 만드는 함수 (다양성 개선, 선택된 아미노산만 사용)
    static randomSolution(seqLength: number): string[] {
        const solution: string[] = [];
        const aminoKeys = Object.keys(dataMap);
        
        // 선택된 아미노산이 없으면 빈 배열 반환
        if (aminoKeys.length === 0) return solution;
        
        while (solution.length < seqLength) {
            // 가중치 기반 선택으로 다양성 증대 (선택된 아미노산 중에서만)
            let aminoAcid: string;
            // 사용 가능한 아미노산들 중 랜덤으로 선택
            aminoAcid = aminoKeys[Math.floor(Math.random() * aminoKeys.length)];
            solution.push(aminoAcid);
        }
        return solution;
    }

    // RNA 시퀀스를 아미노산으로 변환하는 함수
    static convertRnaToAminoAcids(rnaSequence: string): string {
        if (!rnaSequence) return '';
        
        // RNA 시퀀스를 3개씩 나누어 코돈으로 변환
        const codons = rnaSequence.match(/.{1,3}/g) || [];
        let aminoSequence = '';
        
        for (const codon of codons) {
            if (codon.length === 3) {
                const amino = codonTableRtoS[codon];
                if (amino && amino !== '[Stop]') {
                    aminoSequence += amino;
                } else if (amino === '[Stop]') {
                    break; // Stop 코돈을 만나면 중단
                }
            }
        }
        
        return aminoSequence;
    }

    // 단백질/RNA 시퀀스를 기반으로 초기 솔루션을 생성하는 함수
    static proteinBasedSolution(inputSequence: string, seqLength: number): string[] {
        // RNA 시퀀스인지 확인 (A, U, G, C로만 구성되고 3의 배수 길이)
        const isRnaSequence = /^[AUGC]+$/.test(inputSequence) && inputSequence.length % 3 === 0;
        
        // RNA 시퀀스면 아미노산으로 변환
        const aminoSequence = isRnaSequence ? this.convertRnaToAminoAcids(inputSequence) : inputSequence;
        
        // 선택된 아미노산만 사용하도록 필터링
        const availableAminos = Object.keys(dataMap);
        const solution: string[] = [];
        
        // 초기 아미노산 시퀀스에서 사용 가능한 아미노산만 추가
        const validAminosFromSequence: string[] = [];
        for (const amino of aminoSequence.split('')) {
            if (dataMap[amino]) {
                solution.push(amino);
                validAminosFromSequence.push(amino);
            }
        }
        
        // seqLength에 맞춰 시퀀스 조정
        if (solution.length < seqLength) {
            // aminoSequence 길이가 seqLength보다 짧으면 aminoSequence에서 랜덤으로 추가
            while (solution.length < seqLength && validAminosFromSequence.length > 0) {
                const randomAmino = validAminosFromSequence[Math.floor(Math.random() * validAminosFromSequence.length)];
                solution.push(randomAmino);
            }
            // 만약 validAminosFromSequence가 비어있으면 availableAminos에서 선택 (폴백)
            while (solution.length < seqLength) {
                const randomAmino = availableAminos[Math.floor(Math.random() * availableAminos.length)];
                solution.push(randomAmino);
            }
        } else if (solution.length > seqLength) {
            // aminoSequence 길이가 seqLength보다 길면 랜덤으로 제거
            while (solution.length > seqLength) {
                const randomIndex = Math.floor(Math.random() * solution.length);
                solution.splice(randomIndex, 1);
            }
        }
        // solution.length === seqLength인 경우는 그대로 유지
        
        return solution;
    }

    // 기존 선택된 조합에서 아미노산을 새걸로 갈아치워서 새로운 조합 생성 (참조 시퀀스 고려, 다양성 개선)
    static neighborSolution(currentSolution: string[], targetMass: number): string[] {
        const newSolution = [...currentSolution];
        const availableAminos = Object.keys(dataMap);
            
            const index = Math.floor(Math.random() * newSolution.length);
            let newAminoAcid: string;
            
            // 참조 시퀀스가 있는 경우 참조 시퀀스의 아미노산을 우선적으로 선택
            if (referenceSequence) {
                // 60% 확률로 참조 시퀀스에서 아미노산 선택, 40% 확률로 랜덤 선택
                if (Math.random() < 0.9 && referenceSequence.length > 0) {
                    // 참조 시퀀스에서 무작위로 아미노산 선택
                    const refIndex = Math.floor(Math.random() * referenceSequence.length);
                    const candidateAmino = referenceSequence[refIndex];
                    
                    // 선택된 아미노산이 사용 가능한 아미노산 목록에 있는지 확인
                    if (dataMap[candidateAmino]) {
                        newAminoAcid = candidateAmino;
                    } else {
                        // 사용 불가능하면 선택된 아미노산 중에서 랜덤 선택
                        newAminoAcid = availableAminos[Math.floor(Math.random() * availableAminos.length)];
                    }
                } else {
                    // 선택된 아미노산 중에서 랜덤 선택
                    newAminoAcid = availableAminos[Math.floor(Math.random() * availableAminos.length)];
                }
            } else {
                // 참조 시퀀스가 없는 경우 선택된 아미노산 중에서 랜덤 선택
                newAminoAcid = availableAminos[Math.floor(Math.random() * availableAminos.length)];
            }
            
            newSolution[index] = newAminoAcid;

            // 질량이 목표값을 초과하는 경우 아미노산 제거
            let currentMass = newSolution.reduce((sum, amino) => sum + (dataMap[amino] ?? 0), 0);
            while (currentMass > targetMass && newSolution.length > 0) {
                newSolution.splice(Math.floor(Math.random() * newSolution.length), 1);
            }
        return newSolution;
    }

    // static neighborSolution(currentSolution: string[], targetMass: number): string[] {
    //     const newSolution = [...currentSolution];
    //     if (newSolution.length > 0) {
    //         const index = Math.floor(Math.random() * newSolution.length);
    //         const newAminoAcid = Object.keys(dataMap)[Math.floor(Math.random() * Object.keys(dataMap).length)];
    //         newSolution[index] = newAminoAcid;

    //         while (this.evaluate(newSolution, targetMass) > targetMass) {
    //             newSolution.splice(Math.floor(Math.random() * newSolution.length), 1);
    //         }
    //     }
    //     return newSolution;
    // }

    // 도출된 솔루션의 전체 질량과 목표값의 차이 도출 (시퀀스 유사도 고려)
    static evaluate(solution: string[], targetMass: number): number {
        const mass = solution.reduce((sum, gene) => sum + (dataMap[gene] ?? 0), 0);
        const massDifference = Math.abs(targetMass - mass);
        
        // 참조 시퀀스가 있는 경우 시퀀스 유사도도 고려
        if (referenceSequence) {
            const currentSequence = solution.join('');
            const sequenceSimilarity = calculateSequenceSimilarity(currentSequence, referenceSequence);
            
            // 시퀀스 유사도를 역수로 변환 (높을수록 좋음 -> 낮을수록 좋음)
            const sequenceDifference = (100 - sequenceSimilarity) / 100;
            
            // 분자량 차이를 정규화 (큰 값을 방지하기 위해)
            const normalizedMassDiff = massDifference / targetMass;
            
            // 복합 평가 점수 계산 (분자량 95%, 시퀀스 유사도 5%) - difference 값 우선시
            return normalizedMassDiff * 0.95 + sequenceDifference * 0.05;
        }
        
        // 참조 시퀀스가 없는 경우 기존 방식대로 분자량 차이만 고려
        return massDifference;
    }

    // newEnergy < currentEnergy 이면 합격
    // currentEnergy 가 작아도 exp 함수에 따라 자연로그 e의 currentEnergy - newEnergy 승을 현재 온도로 나눠서 합격할수도 있음
    static acceptanceProbability(currentEnergy: number, newEnergy: number, temperature: number): number {
        return newEnergy < currentEnergy ? 1.0 : Math.exp((currentEnergy - newEnergy) / temperature);
    }

    // 넘어온 code로 무게를 계산하고 포멜레이스 포함이면 그 무게까지 더해줌
    static getMonoisotopicWeightSum(solutionCombine: string): number {
        if (solutionCombine.startsWith('f')) {
            // 포밀레이션이 있는 경우: f를 제외한 아미노산들만 계산
            const aminoSequence = solutionCombine.slice(1);
            let result = aminoSequence.split('').reduce((sum, e) => sum + (dataMap[e] ?? 0), 0);
            // 아미노산들만의 물 증발량 계산 (포밀레이션은 물 증발량에 포함되지 않음)
            result -= this.getWaterWeight(aminoSequence.length);
            // 포밀레이션 무게 추가
            result += fWeight;
            return result;
        } else {
            // 포밀레이션이 없는 경우: 모든 아미노산 계산
            let result = solutionCombine.split('').reduce((sum, e) => sum + (dataMap[e] ?? 0), 0);
            result -= this.getWaterWeight(solutionCombine.length);
            return result;
        }
    }

    static getMolecularWeightSum(solutionCombine: string): number {
        if (solutionCombine.startsWith('f')) {
            // 포밀레이션이 있는 경우: f를 제외한 아미노산들만 계산
            const aminoSequence = solutionCombine.slice(1);
            let result = aminoSequence.split('').reduce((sum, e) => sum + (moleMap[e] ?? 0), 0);
            // 아미노산들만의 물 증발량 계산 (포밀레이션은 물 증발량에 포함되지 않음)
            result -= this.getWaterWeight(aminoSequence.length);
            // 포밀레이션 무게 추가
            result += fWeight;
            return result;
        } else {
            // 포밀레이션이 없는 경우: 모든 아미노산 계산
            let result = solutionCombine.split('').reduce((sum, e) => sum + (moleMap[e] ?? 0), 0);
            result -= this.getWaterWeight(solutionCombine.length);
            return result;
        }
    }

    static getWaterWeight(aminoLength: number): number {
        if (aminoLength === 0) return 0;
        return 18.01056 * (aminoLength - 1);
    }

    // 물 증발량 계산을위해 가능한 아미노산의 갯수 범위를 산정힘
    static getMinMaxRange(type: FormyType, targetMass: number): [number, number] {
        // 사용 가능한 아미노산의 종류들의 최대 최소 값
        const minValue = Math.min(...Object.values(dataMap));
        const maxValue = Math.max(...Object.values(dataMap));
        // 포밀레이스가 들어갈수도 있다면 [fWeight] 값이 제일 작은값
        const max = type === 'yes' || type === 'unknown' ? Math.ceil(targetMass / fWeight) : Math.ceil(targetMass / minValue);
        const min = Math.floor(targetMass / maxValue);
        return [min, max];
    }

    // 초기 입력된 아미노산의 총 무게에서 물 증발량을 제거한 값
    static getInitAminoWeight(initAmino: string): { monoisotopicWeight: number, molecularWeight: number } {
        // 초기 입력값의 물 증발량, 근데 init 의 물 증발량 구할떄는 길이에 -1 해주면 안됨 나중에 또 -1 해줄거라서
        const initAminoWaterWeight = this.getWaterWeight(initAmino.length + 1);
        let initAminoMonoisotopicWeight = 0;
        let initAminoMolecularWeight = 0;
        if (initAmino) {
            for (const i of initAmino.split('')) {
                initAminoMonoisotopicWeight += dataMap[i] ?? 0;
                initAminoMolecularWeight += moleMap[i] ?? 0;
            }
        }
        return {
            monoisotopicWeight: initAminoMonoisotopicWeight - initAminoWaterWeight,
            molecularWeight: initAminoMolecularWeight - initAminoWaterWeight
        };
    }

    /// 기존 베스트 솔루션 에서 init 값을 앞에 붙여주는 로직
    static setInitAminoToResult(bestSolutions: AminoModel[], initAmino: string, initAminoWeight: { monoisotopicWeight: number, molecularWeight: number }): AminoModel[] {
        if (!initAmino) return bestSolutions;
        return bestSolutions.map(item => {
            const weight = (item.weight ?? 0) + initAminoWeight.monoisotopicWeight;
            const molecularWeight = (item.molecularWeight ?? 0) + initAminoWeight.molecularWeight;
            if (!item.code) {
                return new AminoModel({ ...item, code: initAmino, weight: weight, molecularWeight: molecularWeight });
            } else {
                const firstString = item.code[0];
                if (firstString === 'f') {
                    return new AminoModel({ ...item, code: `f${initAmino}${item.code.slice(1)}`, weight: weight, molecularWeight: molecularWeight });
                } else {
                    return new AminoModel({ ...item, code: `${initAmino}${item.code}`, weight: weight, molecularWeight: molecularWeight });
                }
            }
        });
    }

    /// FormyType, IonType, essential seq 붙여주는 부분
    static setMetaData(bestSolutions: AminoModel[], formyType: FormyType, ionType: IonType, essentialSeq: string): AminoModel[] {
        return bestSolutions.map(e => new AminoModel({ ...e, formyType, ionType, essentialSeq }));
    }

    /// 참조 시퀀스가 있는 경우 시퀀스 유사도 계산하여 추가
    static setSequenceSimilarity(bestSolutions: AminoModel[]): AminoModel[] {
        if (!referenceSequence) {
            // 참조 시퀀스가 없는 경우 그대로 반환
            return bestSolutions;
        }

        return bestSolutions.map(solution => {
            const similarityData = calculateSequenceSimilarityWithCounts(solution.code ?? '', referenceSequence);
            return new AminoModel({ 
                ...solution, 
                sequenceSimilarity: Math.round(similarityData.similarity * 100) / 100, // 소수점 2자리로 반올림
                matchedCount: similarityData.matchedCount,
                totalCount: similarityData.totalCount
            });
        });
    }
}