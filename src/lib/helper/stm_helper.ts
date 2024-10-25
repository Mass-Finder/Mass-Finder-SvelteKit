import { codonTableRtoS } from './amino_mapper';

export class StmHelper {
    // 입력받은 데이터를 기반으로 경우의 수를 계산하는 메서드
    static calc(
        inputSeq: string,
        ncAAMap: { [key: string]: any },
        codonTitle: { [key: string]: string },
        aminoMap: { [key: string]: number }
    ) {
        // 경우의 수를 저장할 배열
        let possibilities: Array<{ sequence: (string | string[])[], reason?: string, weight?: number }> = [];
        const baseSeq = Array.from(inputSeq).map(char => [char]); // 각 아미노산을 배열로 저장하여 기본 시퀀스로 만듦

        // Recursive function to generate all possibilities
        const generatePossibilities = (currentSeq: (string | string[])[], index: number) => {
            if (index === inputSeq.length) {
                // 무게 합산 및 결과 저장
                const weight = this.calculateWeight(currentSeq, aminoMap, ncAAMap);
                possibilities.push({ sequence: currentSeq, weight });
                return;
            }

            // 현재 위치의 아미노산
            const aminoAcid = inputSeq[index];
            let hasTruncated = false;

            // 기본 아미노산으로 진행
            generatePossibilities([...currentSeq, [aminoAcid]], index + 1);

            // truncated 발생 가능한지 확인하고 처리
            for (const key in codonTitle) {
                const rna = codonTitle[key];
                const translatedAmino = this.translateRNAtoAmino(rna);

                if (aminoAcid === translatedAmino) {
                    hasTruncated = true;
                    const truncatedSeq = [...currentSeq, [ncAAMap[key].title]];
                    generatePossibilities(truncatedSeq, index + 1);
                }
            }
        };

        // 가능한 시퀀스 생성 시작
        generatePossibilities([], 0);

        // 결과 출력
        console.log("Generated Possibilities with Weights:");
        console.table(possibilities);
        return possibilities;
    }

    // RNA 시퀀스를 아미노산 문자로 번역하는 메서드
    static translateRNAtoAmino(rna: string): string | undefined {
        return codonTableRtoS[rna];
    }

    // 각 시퀀스의 무게를 계산하는 메서드
    static calculateWeight(sequence: (string | string[])[], aminoMap: { [key: string]: number }, ncAAMap: { [key: string]: any }): number {
        let totalWeight = 0;
        sequence.forEach(item => {
            const aminoAcid = item[0];
            if (aminoMap[aminoAcid]) {
                totalWeight += aminoMap[aminoAcid];
            } else {
                for (const key in ncAAMap) {
                    if (ncAAMap[key].title === aminoAcid) {
                        totalWeight += parseFloat(ncAAMap[key].monoisotopicWeight);
                        break;
                    }
                }
            }
        });
        return totalWeight;
    }
}


