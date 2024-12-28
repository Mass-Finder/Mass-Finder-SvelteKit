import { AminoModel } from '../model/AminoModel';


/// 유사도 체크
export function calculateSimilarity(a: number, b: number): number {
    const difference = Math.abs(a - b);
    let similarity = 100 - ((difference / a) * 100);
    similarity = parseFloat(similarity.toFixed(2));
    return similarity < 0 ? 0 : similarity;
}

// 기준 크기로 정렬
export function sortAmino(list: AminoModel[], compareValue: number): AminoModel[] {
    return list.sort((a, b) => {
        const diffA = Math.abs((a.weight ?? 0) - compareValue);
        const diffB = Math.abs((b.weight ?? 0) - compareValue);
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