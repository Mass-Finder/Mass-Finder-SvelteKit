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
        let hasTruncated = false;

        // 기본 시퀀스 추가
        const baseSeq = Array.from(inputSeq).map(char => [char]);  // 각 아미노산을 배열 형태로 저장
        possibilities.push({ sequence: baseSeq });

        // inputSeq의 각 문자에 대해 순회
        for (let i = 0; i < inputSeq.length; i++) {
            const aminoAcid = inputSeq[i];

            // codonTitle을 순회하여 해당 아미노산의 truncated 여부를 체크
            for (const key in codonTitle) {
                const rna = codonTitle[key];
                const translatedAmino = this.translateRNAtoAmino(rna); // RNA를 아미노산으로 번역

                if (aminoAcid === translatedAmino) {
                    hasTruncated = true;

                    // 새로운 시퀀스를 복사하고, 해당 위치에 아미노산 배열을 대체
                    const newSeq = baseSeq.map((item, index) =>
                        index === i ? [ncAAMap[key].title] : item
                    );

                    possibilities.push({
                        sequence: newSeq,
                        reason: "truncated"
                    });
                }
            }
        }

        // 각 경우의 수에 대한 무게 합산 계산
        possibilities = possibilities.map(possibility => {
            let totalWeight = 0;

            // 각 아미노산을 순회하며 무게 계산
            possibility.sequence.forEach(item => {
                const aminoAcid = item[0];

                // aminoMap에 있는 아미노산의 경우 그 무게를 사용
                if (aminoMap[aminoAcid]) {
                    totalWeight += aminoMap[aminoAcid];
                }
                // truncated된 아미노산의 경우 ncAAMap의 monoisotopicWeight 사용
                else {
                    for (const key in ncAAMap) {
                        if (ncAAMap[key].title === aminoAcid) {
                            totalWeight += parseFloat(ncAAMap[key].monoisotopicWeight);
                            break;
                        }
                    }
                }
            });

            // 무게를 possibility 객체에 추가
            return { ...possibility, weight: totalWeight };
        });

        // 결과 출력
        console.log("Generated Possibilities with Weights:");
        console.table(possibilities);
        return possibilities;
    }

    // RNA 시퀀스를 아미노산 문자로 번역하는 메서드
    static translateRNAtoAmino(rna: string): string | undefined {
        return codonTableRtoS[rna];
    }
}
