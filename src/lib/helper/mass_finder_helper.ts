import { AminoModel } from '../model/AminoModel';

import type { IonType, FormyType } from '../../type/Types';

import {calculateSimilarity, sortAmino, removeDuplicates, removeSingleFSequences } from './mass_util';
import { getIonWeight } from './amino_mapper';

// 사용가능한 아미노산의 리스트
let dataMap: { [key: string]: number } = {};
// 시뮬레이티드 어닐링 반복 횟수
const saIterations = 100;
// 초기 온도
const initialTemperature = 10000.0;
// 냉각률
const coolingRate = 0.99;
// 최소 온도
const absoluteTemperature = 0.00001;
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
    static topSolutionsCount: number = 20;

    static formyType: FormyType = 'unknown';
    static ionType: IonType = 'unknown';

    // 이온 타입이 적용된 이후 생긴 함수
    // [targetMass] : 목표 무게
    // [initAminos] : 필수로 들어가는 아미노산의 string 입력값
    // [fomyType] : 포밀레이스가 들어가는지에 대한 값, 포밀레이스는 항상 결과물의 제일 앞에 붙음
    // [ionType] : 이온이 들어가는지에 대한 값
    // [aminoMap] : 계산에 사용되는 아미노산의 모음
    // 최종적으로 AminoModel의 리스트를 리턴함
    static calcByIonType(targetMass: number, initAminos: string, fomyType: FormyType, ionType: IonType, aminoMap: { [key: string]: number }): AminoModel[] {
        this.ionType = ionType;
        let bestSolutions: AminoModel[] = [];
        switch (this.ionType) {
            case 'unknown':
                for (const i of ['H', 'Na', 'K'] as IonType[]) {
                    bestSolutions = bestSolutions.concat(this.calc(targetMass - getIonWeight(i), initAminos, fomyType, i, aminoMap));
                }
                bestSolutions = bestSolutions.map(e => new AminoModel({ ...e, weight: (e.weight ?? 0) + getIonWeight(e.ionType ?? 'unknown') }));
                bestSolutions = sortAmino(bestSolutions, targetMass).slice(0, MassFinderHelper.topSolutionsCount);
                break;
            default:
                bestSolutions = this.calc(targetMass - getIonWeight(this.ionType), initAminos, fomyType, ionType, aminoMap);
                bestSolutions = bestSolutions.map(e => new AminoModel({ ...e, weight: (e.weight ?? 0) + getIonWeight(e.ionType ?? 'unknown') }));
        }
        bestSolutions = bestSolutions.map(e => new AminoModel({ ...e, similarity: calculateSimilarity(targetMass, e.weight ?? 0) }));
        return bestSolutions;
    }

    /// calcByIonType 함수에서 이온값에따라 알아서 구분되어 호출되는 함수
    static calc(targetMass: number, initAminos: string, fomyType: FormyType, ionType: IonType, aminoMap: { [key: string]: number }): AminoModel[] {
        this.formyType = fomyType;
        dataMap = { ...aminoMap };
        let bestSolutions: AminoModel[] = [];
        const initAminoWeight = this.getInitAminoWeight(initAminos);
        targetMass -= initAminoWeight;

        const [minRange, maxRange] = this.getMinMaxRange(this.formyType, targetMass);
        for (let i = minRange; i < maxRange; i++) {
            const addWeight = this.getWaterWeight(i);
            let solutions = this.calcByFType(this.formyType, targetMass + addWeight);
            solutions = removeDuplicates(solutions);
            solutions = removeSingleFSequences(solutions);
            bestSolutions = bestSolutions.concat(solutions);
        }

        bestSolutions = sortAmino(bestSolutions, targetMass).slice(0, MassFinderHelper.topSolutionsCount);
        bestSolutions = this.setInitAminoToResult(bestSolutions, initAminos, initAminoWeight);
        bestSolutions = this.setMetaData(bestSolutions, this.formyType, ionType, initAminos);

        bestSolutions.forEach(solution => {
            console.log(`combins : ${solution.code}, result : ${solution.weight}`);
        });

        return bestSolutions;
    }

    // calc 함수에서 호출되는 함수
    // FormyType 값에 따라 솔루션을 각각 구해와서 전달하는 역할을 한다.
    static calcByFType(fType: FormyType, targetMass: number): AminoModel[] {
        const bestSolutions: AminoModel[] = [];
        for (let i = 0; i < saIterations; i++) {
            switch (fType) {
                case 'no': // 포밀레이스 없으면 무게 안빼고 계산해도됨
                    const solutionNo = this.simulatedAnnealing(targetMass);
                    bestSolutions.push(new AminoModel({ code: Object.keys(solutionNo)[0], weight: this.getWeightSum(Object.keys(solutionNo)[0]) }));
                    break;
                case 'yes': // 포밀레이스 있으면 무게를 빼고 계산후 가장 앞에 'f' 붙여줌
                    const solutionYes = this.simulatedAnnealing(targetMass - fWeight);
                    bestSolutions.push(new AminoModel({ code: `f${Object.keys(solutionYes)[0]}`, weight: this.getWeightSum(`f${Object.keys(solutionYes)[0]}`) }));
                    break;
                case 'unknown': // 포밀레이스 있는지 없는지 몰라서 둘다 계산해야함
                    const solutionUnknown1 = this.simulatedAnnealing(targetMass);
                    const solutionUnknown2 = this.simulatedAnnealing(targetMass - fWeight);
                    bestSolutions.push(new AminoModel({ code: Object.keys(solutionUnknown1)[0], weight: this.getWeightSum(Object.keys(solutionUnknown1)[0]) }));
                    bestSolutions.push(new AminoModel({ code: `f${Object.keys(solutionUnknown2)[0]}`, weight: this.getWeightSum(`f${Object.keys(solutionUnknown2)[0]}`) }));
                    break;
            }
        }
        return bestSolutions;
    }

    /// 핵심로직으로 랜덤한 값과 그 랜던값에서 조금 바꾼 다른 값을 계속 비교해 나가면서 최적의 해를 찾음
    static simulatedAnnealing(targetMass: number): { [key: string]: number } {
        let temperature = initialTemperature;
        // 1차 비교군을 위한 조합 추출해서 목표값과의 차이 저장
        let currentSolution = this.randomSolution(targetMass);
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

    // 초기에 사용될 기준이 되는 조합을 랜덤으로 만드는 함수
    static randomSolution(targetMass: number): string[] {
        const solution: string[] = [];
        let mass = 0;
        while (mass < targetMass) {
            const aminoAcid = Object.keys(dataMap)[Math.floor(Math.random() * Object.keys(dataMap).length)];
            const aminoAcidMass = dataMap[aminoAcid];
            if (mass + aminoAcidMass > targetMass) break;
            solution.push(aminoAcid);
            mass += aminoAcidMass;
        }
        return solution;
    }

    // 기존 선택된 조합에서 아미노산을 새걸로 갈아치워서 새로운 조합 생성
    static neighborSolution(currentSolution: string[], targetMass: number): string[] {
        const newSolution = [...currentSolution];
        if (newSolution.length > 0) {
            const index = Math.floor(Math.random() * newSolution.length);
            const newAminoAcid = Object.keys(dataMap)[Math.floor(Math.random() * Object.keys(dataMap).length)];
            newSolution[index] = newAminoAcid;

            while (this.evaluate(newSolution, targetMass) > targetMass) {
                newSolution.splice(Math.floor(Math.random() * newSolution.length), 1);
            }
        }
        return newSolution;
    }

    // 도출된 솔루션의 전체 질량과 목표값의 차이 도출
    static evaluate(solution: string[], targetMass: number): number {
        const mass = solution.reduce((sum, gene) => sum + (dataMap[gene] ?? 0), 0);
        return Math.abs(targetMass - mass);
    }

    // newEnergy < currentEnergy 이면 합격
    // currentEnergy 가 작아도 exp 함수에 따라 자연로그 e의 currentEnergy - newEnergy 승을 현재 온도로 나눠서 합격할수도 있음
    static acceptanceProbability(currentEnergy: number, newEnergy: number, temperature: number): number {
        return newEnergy < currentEnergy ? 1.0 : Math.exp((currentEnergy - newEnergy) / temperature);
    }

    // 넘어온 code로 무게를 계산하고 포멜레이스 포함이면 그 무게까지 더해줌
    static getWeightSum(solutionCombine: string): number {
        let result = solutionCombine.split('').reduce((sum, e) => sum + (dataMap[e] ?? 0), 0);
        if (solutionCombine.startsWith('f')) {
            result -= this.getWaterWeight(solutionCombine.length - 1);
            result += fWeight;
        } else {
            result -= this.getWaterWeight(solutionCombine.length);
        }
        return result;
    }

    static getWaterWeight(aminoLength: number): number {
        if (aminoLength === 0) return 0;
        return 18.01 * (aminoLength - 1);
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
    static getInitAminoWeight(initAmino: string): number {
        // 초기 입력값의 물 증발량, 근데 init 의 물 증발량 구할떄는 길이에 -1 해주면 안됨 나중에 또 -1 해줄거라서
        const initAminoWaterWeight = this.getWaterWeight(initAmino.length + 1);
        let initAminoWeight = 0;
        if (initAmino) {
            for (const i of initAmino.split('')) {
                initAminoWeight += dataMap[i] ?? 0;
            }
        }
        return initAminoWeight - initAminoWaterWeight;
    }

    /// 기존 베스트 솔루션 에서 init 값을 앞에 붙여주는 로직
    static setInitAminoToResult(bestSolutions: AminoModel[], initAmino: string, initAminoWeight: number): AminoModel[] {
        if (!initAmino) return bestSolutions;
        return bestSolutions.map(item => {
            if (!item.code) {
                return new AminoModel({ ...item, code: initAmino, weight: (item.weight ?? 0) + initAminoWeight });
            } else {
                const firstString = item.code[0];
                if (firstString === 'f') {
                    return new AminoModel({ ...item, code: `f${initAmino}${item.code.slice(1)}`, weight: (item.weight ?? 0) + initAminoWeight });
                } else {
                    return new AminoModel({ ...item, code: `${initAmino}${item.code}`, weight: (item.weight ?? 0) + initAminoWeight });
                }
            }
        });
    }

    /// FormyType, IonType, essential seq 붙여주는 부분
    static setMetaData(bestSolutions: AminoModel[], formyType: FormyType, ionType: IonType, essentialSeq: string): AminoModel[] {
        return bestSolutions.map(e => new AminoModel({ ...e, formyType, ionType, essentialSeq }));
    }
}