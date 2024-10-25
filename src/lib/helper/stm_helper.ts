
// Sequence to Mass 페이지에서 사용되는 핵심로직
export class StmHelper {

    // [inputSeq] 사용자가 입력한 아미노산 seq
    static calc(inputSeq: string, ncAAMap: { [key: string]: string }, aminoMap: { [key: string]: number } ) {
        console.log(inputSeq);
        console.table(ncAAMap);
        console.table(aminoMap);
    }
}

// 사용자가 seq 를 입력함
// 사용할 아미노산들을 선택함
// ncaa에 커스텀 아미노산 적용함


