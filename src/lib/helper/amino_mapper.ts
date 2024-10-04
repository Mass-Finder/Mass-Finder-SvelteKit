

/// 아미노선 1글자와 3글자 이름 매핑
export function shortToLong(key:string): string {
    return shortToLongMapper[key];
}

/// Adduct 는 선택할떄와 출력힐때 이름을 다르게 해야함
export function adductPrintName(key:string): string {
    return AdductMapper[key];
}

const shortToLongMapper = {
    G: "Gly",
    A: "Ala",
    S: "Ser",
    T: "Thr",
    C: "Cys",
    V: "Val",
    L: "Leu",
    I: "Ile",
    M: "Met",
    P: "Pro",
    F: "Phe",
    Y: "Tyr",
    W: "Trp",
    D: "Asp",
    E: "Glu",
    N: "Asn",
    Q: "Gln",
    H: "His",
    K: "Lys",
    R: "Arg"
  };
  

  const AdductMapper = {
    "H" : "[M+H]⁺",
    "Na" : "[M+Na]⁺",
    "K" : "[M+K]⁺",
    "NH₄" : "[M+NH₄]⁺",
    "-H" : "[M-H]⁺",
    "-Na" : "[M-2H+Na]⁺",
    "-K" : "[M-2H+K]⁺",
    "-NH₄" : "[M-2H+NH₄]⁺",
}