import { AminoModel } from '../model/AminoModel';


/// 질량 유사도 체크
export function calculateSimilarity(a: number, b: number): number {
    const difference = Math.abs(a - b);
    let similarity = 100 - ((difference / a) * 100);
    similarity = parseFloat(similarity.toFixed(2));
    return similarity < 0 ? 0 : similarity;
}

/// 시퀀스 유사도 계산 함수 (단순한 포함도 기반)
export function calculateSequenceSimilarity(resultSequence: string, referenceSequence: string): number {
    if (!resultSequence || !referenceSequence) return 0;
    
    // 포밀화 제거
    const cleanResult = resultSequence.replace(/^f/, '');
    const cleanReference = referenceSequence.replace(/^f/, '');
    
    if (!cleanResult || !cleanReference) return 0;
    
    // 참조 시퀀스의 각 아미노산이 결과 시퀀스에 포함되어 있는지 확인
    let matchedCount = 0;
    
    for (const amino of cleanReference) {
        if (cleanResult.includes(amino)) {
            matchedCount++;
        }
    }
    
    // 참조 시퀀스 기준으로 퍼센트 계산
    const similarity = (matchedCount / cleanReference.length) * 100;
    
    return Math.round(similarity * 10) / 10; // 소수점 1자리로 반올림
}



// 기준 크기로 정렬 (시퀀스 유사도 고려)
export function sortAmino(list: AminoModel[], compareValue: number, referenceSequence?: string): AminoModel[] {
    return list.sort((a, b) => {
        const diffA = Math.abs((a.weight ?? 0) - compareValue);
        const diffB = Math.abs((b.weight ?? 0) - compareValue);
        
        // 참조 시퀀스가 있는 경우 시퀀스 유사도도 고려
        if (referenceSequence) {
            const seqSimilarityA = calculateSequenceSimilarity(a.code ?? '', referenceSequence);
            const seqSimilarityB = calculateSequenceSimilarity(b.code ?? '', referenceSequence);
            
            // 분자량 차이를 정규화 (0-1 범위)
            const maxMassDiff = Math.max(diffA, diffB);
            const normalizedDiffA = maxMassDiff > 0 ? diffA / maxMassDiff : 0;
            const normalizedDiffB = maxMassDiff > 0 ? diffB / maxMassDiff : 0;
            
            // 시퀀스 유사도를 역수로 변환 (높을수록 좋음 -> 낮을수록 좋음)
            const normalizedSeqA = (100 - seqSimilarityA) / 100;
            const normalizedSeqB = (100 - seqSimilarityB) / 100;
            
            // 복합 점수 계산 (분자량 정확도 70%, 시퀀스 유사도 30%)
            const scoreA = normalizedDiffA * 0.7 + normalizedSeqA * 0.3;
            const scoreB = normalizedDiffB * 0.7 + normalizedSeqB * 0.3;
            
            return scoreA - scoreB;
        }
        
        // 참조 시퀀스가 없는 경우 기존 방식대로 분자량 차이만 고려
        return diffA - diffB;
    });
}

// 리스트 중복제거 (강화된 버전)
export function removeDuplicates(inputList: AminoModel[]): AminoModel[] {
    const uniqueMap: { [key: string]: AminoModel } = {};
    
    inputList.forEach(aminoModel => {
        const key = aminoModel.code ?? '';
        
        if (!uniqueMap[key]) {
            // 새로운 시퀀스인 경우 추가
            uniqueMap[key] = aminoModel;
        } else {
            // 동일한 시퀀스가 이미 존재하는 경우
            const existing = uniqueMap[key];
            const current = aminoModel;
            
            // 더 나은 조건의 것을 선택 (분자량 정확도 우선, 그 다음 시퀀스 유사도)
            const existingSimilarity = existing.similarity ?? 0;
            const currentSimilarity = current.similarity ?? 0;
            
            const existingSeqSimilarity = existing.sequenceSimilarity ?? 0;
            const currentSeqSimilarity = current.sequenceSimilarity ?? 0;
            
            // 분자량 유사도가 더 높거나, 같다면 시퀀스 유사도가 더 높은 것을 선택
            if (currentSimilarity > existingSimilarity || 
                (currentSimilarity === existingSimilarity && currentSeqSimilarity > existingSeqSimilarity)) {
                uniqueMap[key] = current;
            }
        }
    });
    
    return Object.values(uniqueMap);
}

// AminoModel 리스트를 입력받고 각 모델에서 seq 값이 f 하나만 존재하는 경우를 제거하는 함수, 이런경우는 없다고 해서 예외처리
export function removeSingleFSequences(inputList: AminoModel[]): AminoModel[] {
    return inputList.filter(aminoModel => {
        const seq = aminoModel.code ?? '';
        return seq !== 'f';
    });
}

// Known Sequence와 RNA 변환 시퀀스 간의 중복 처리 함수
export function processKnownSequenceOverlap(knownSequence: string, rnaConvertedSequence: string): {
    finalKnownSequence: string,
    remainingRnaSequence: string,
    overlapInfo: {
        hasOverlap: boolean,
        overlapLength: number,
        overlapPosition: number
    }
} {
    if (!knownSequence || !rnaConvertedSequence) {
        return {
            finalKnownSequence: knownSequence,
            remainingRnaSequence: rnaConvertedSequence,
            overlapInfo: {
                hasOverlap: false,
                overlapLength: 0,
                overlapPosition: -1
            }
        };
    }

    // Known Sequence가 RNA 변환 시퀀스에 포함되어 있는지 확인
    const overlapPosition = rnaConvertedSequence.indexOf(knownSequence);
    
    if (overlapPosition !== -1) {
        // 중복이 있는 경우: Known Sequence를 제거하고 나머지 RNA 시퀀스 반환
        const beforeKnown = rnaConvertedSequence.substring(0, overlapPosition);
        const afterKnown = rnaConvertedSequence.substring(overlapPosition + knownSequence.length);
        const remainingRnaSequence = beforeKnown + afterKnown;
        
        return {
            finalKnownSequence: knownSequence,
            remainingRnaSequence: remainingRnaSequence,
            overlapInfo: {
                hasOverlap: true,
                overlapLength: knownSequence.length,
                overlapPosition: overlapPosition
            }
        };
    }

    // RNA 변환 시퀀스가 Known Sequence에 포함되어 있는지 확인
    const rnaInKnownPosition = knownSequence.indexOf(rnaConvertedSequence);
    
    if (rnaInKnownPosition !== -1) {
        // RNA 시퀀스가 Known Sequence에 포함된 경우: Known Sequence만 사용
        return {
            finalKnownSequence: knownSequence,
            remainingRnaSequence: '',
            overlapInfo: {
                hasOverlap: true,
                overlapLength: rnaConvertedSequence.length,
                overlapPosition: rnaInKnownPosition
            }
        };
    }

    // 부분 중복 확인 (Known Sequence의 끝과 RNA 시퀀스의 시작이 겹치는 경우)
    for (let i = 1; i <= Math.min(knownSequence.length, rnaConvertedSequence.length); i++) {
        const knownSuffix = knownSequence.substring(knownSequence.length - i);
        const rnaPrefix = rnaConvertedSequence.substring(0, i);
        
        if (knownSuffix === rnaPrefix) {
            // 부분 중복 발견: 중복 부분 제거
            const remainingRnaSequence = rnaConvertedSequence.substring(i);
            
            return {
                finalKnownSequence: knownSequence,
                remainingRnaSequence: remainingRnaSequence,
                overlapInfo: {
                    hasOverlap: true,
                    overlapLength: i,
                    overlapPosition: knownSequence.length - i
                }
            };
        }
    }

    // RNA 시퀀스의 끝과 Known Sequence의 시작이 겹치는 경우
    for (let i = 1; i <= Math.min(knownSequence.length, rnaConvertedSequence.length); i++) {
        const rnaSuffix = rnaConvertedSequence.substring(rnaConvertedSequence.length - i);
        const knownPrefix = knownSequence.substring(0, i);
        
        if (rnaSuffix === knownPrefix) {
            // 부분 중복 발견: 중복 부분 제거
            const remainingRnaSequence = rnaConvertedSequence.substring(0, rnaConvertedSequence.length - i);
            
            return {
                finalKnownSequence: knownSequence,
                remainingRnaSequence: remainingRnaSequence,
                overlapInfo: {
                    hasOverlap: true,
                    overlapLength: i,
                    overlapPosition: 0
                }
            };
        }
    }

    // 중복이 없는 경우: 둘 다 그대로 사용
    return {
        finalKnownSequence: knownSequence,
        remainingRnaSequence: rnaConvertedSequence,
        overlapInfo: {
            hasOverlap: false,
            overlapLength: 0,
            overlapPosition: -1
        }
    };
}