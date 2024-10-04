

/// 유사도 체크
export function shortToLong(key:string): string {
    return shortToLongMapper[key];
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
  