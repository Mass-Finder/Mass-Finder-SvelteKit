import { AminoModel } from '../model/AminoModel';


/// 질량 유사도 체크
export function calculateSimilarity(a: number, b: number): number {
    const difference = Math.abs(a - b);
    let similarity = 100 - ((difference / a) * 100);
    similarity = parseFloat(similarity.toFixed(2));
    return similarity < 0 ? 0 : similarity;
}

/// 시퀀스 유사도 계산 함수
export function calculateSequenceSimilarity(sequence1: string, sequence2: string): number {
    if (!sequence1 || !sequence2) return 0;
    
    // 아미노산 조성 비교 (각 아미노산의 빈도)
    const composition1 = getAminoAcidComposition(sequence1);
    const composition2 = getAminoAcidComposition(sequence2);
    
    // 조성 유사도 계산 (0-100%)
    const compositionSimilarity = calculateCompositionSimilarity(composition1, composition2);
    
    // 공통 부분 서열 유사도 계산 (0-100%)
    const subsequenceSimilarity = calculateSubsequenceSimilarity(sequence1, sequence2);
    
    // 길이 유사도 계산 (0-100%)
    const lengthSimilarity = calculateLengthSimilarity(sequence1.length, sequence2.length);
    
    // 가중 평균으로 전체 유사도 계산
    // 조성 40%, 부분서열 40%, 길이 20%
    const overallSimilarity = (
        compositionSimilarity * 0.4 +
        subsequenceSimilarity * 0.4 +
        lengthSimilarity * 0.2
    );
    
    return Math.max(0, Math.min(100, overallSimilarity));
}

// 아미노산 조성 분석
function getAminoAcidComposition(sequence: string): { [key: string]: number } {
    const composition: { [key: string]: number } = {};
    const cleanSeq = sequence.replace(/^f/, ''); // 포밀화 제거
    
    for (const amino of cleanSeq) {
        composition[amino] = (composition[amino] || 0) + 1;
    }
    
    return composition;
}

// 조성 유사도 계산
function calculateCompositionSimilarity(comp1: { [key: string]: number }, comp2: { [key: string]: number }): number {
    const allAminos = new Set([...Object.keys(comp1), ...Object.keys(comp2)]);
    let totalDistance = 0;
    let maxPossibleDistance = 0;
    
    for (const amino of allAminos) {
        const count1 = comp1[amino] || 0;
        const count2 = comp2[amino] || 0;
        totalDistance += Math.abs(count1 - count2);
        maxPossibleDistance += Math.max(count1, count2);
    }
    
    if (maxPossibleDistance === 0) return 100;
    return (1 - totalDistance / maxPossibleDistance) * 100;
}

// 부분 서열 유사도 계산 (LCS 기반)
function calculateSubsequenceSimilarity(seq1: string, seq2: string): number {
    const cleanSeq1 = seq1.replace(/^f/, '');
    const cleanSeq2 = seq2.replace(/^f/, '');
    
    if (cleanSeq1.length === 0 || cleanSeq2.length === 0) return 0;
    
    const lcsLength = longestCommonSubsequence(cleanSeq1, cleanSeq2);
    const maxLength = Math.max(cleanSeq1.length, cleanSeq2.length);
    
    return (lcsLength / maxLength) * 100;
}

// 최장 공통 부분 서열 길이 계산
function longestCommonSubsequence(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;
    const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

// 길이 유사도 계산
function calculateLengthSimilarity(length1: number, length2: number): number {
    if (length1 === 0 && length2 === 0) return 100;
    if (length1 === 0 || length2 === 0) return 0;
    
    const ratio = Math.min(length1, length2) / Math.max(length1, length2);
    return ratio * 100;
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

// 리스트 중복제거
export function removeDuplicates(inputList: AminoModel[]): AminoModel[] {
    const uniqueMap: { [key: string]: AminoModel } = {};
    inputList.forEach(aminoModel => {
        uniqueMap[aminoModel.code ?? ''] = aminoModel;
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