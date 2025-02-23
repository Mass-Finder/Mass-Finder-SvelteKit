import type { IonType } from '../../type/Types';


/// 아미노선 1글자와 3글자 이름 매핑
export function shortToLong(key:string): string {
    return shortToLongMapper[key];
}

/// Adduct 는 선택할떄와 출력힐때 이름을 다르게 해야함
export function adductPrintName(key:string): string {
    return AdductMapper[key];
}

export const shortToLongMapper = {
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
  
  // 기초 아미노산 리스트 Monoisotopic Weight 전용
  export const aminoMap = {
    G: 75.03203,
    A: 89.04768,
    S: 105.04259,
    T: 119.05824,
    C: 121.01975,
    V: 117.07898,
    L: 131.09463,
    I: 131.09463,
    M: 149.05105,
    P: 115.06333,
    F: 165.07898,
    Y: 181.07389,
    W: 204.08988,
    D: 133.03751,
    E: 147.05316,
    N: 132.05349,
    Q: 146.06914,
    H: 155.06948,
    K: 146.10553,
    R: 174.11168
  };

  // 기초 아미노산 리스트 Molecular Weight 전용
  export const molecularWeightMap = {
    G: 75.06700,  // Glycine
    A: 89.09400,  // Alanine
    S: 105.09300, // Serine
    T: 119.12000, // Threonine
    C: 121.15400, // Cysteine
    V: 117.14800, // Valine
    L: 131.17500, // Leucine
    I: 131.17500, // Isoleucine
    M: 149.20800, // Methionine
    P: 115.13200, // Proline
    F: 165.19200, // Phenylalanine
    Y: 181.19100, // Tyrosine
    W: 204.22900, // Tryptophan
    D: 133.10300, // Aspartic Acid
    E: 147.13000, // Glutamic Acid
    N: 132.11900, // Asparagine
    Q: 146.1600, // Glutamine
    H: 155.15700, // Histidine
    K: 146.19000, // Lysine
    R: 174.20400  // Arginine
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


// RNA to Seq
export const codonTableRtoS = {
    // Phenylalanine (F)
    UUU: 'F', UUC: 'F',
    // Leucine (L)
    UUA: 'L', UUG: 'L', CUU: 'L', CUC: 'L', CUA: 'L', CUG: 'L',
    // Isoleucine (I)
    AUU: 'I', AUC: 'I', AUA: 'I',
    // Methionine (M) - Start codon
    AUG: 'M',
    // Valine (V)
    GUU: 'V', GUC: 'V', GUA: 'V', GUG: 'V',
    // Serine (S)
    UCU: 'S', UCC: 'S', UCA: 'S', UCG: 'S', AGU: 'S', AGC: 'S',
    // Proline (P)
    CCU: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
    // Threonine (T)
    ACU: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
    // Alanine (A)
    GCU: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
    // Tyrosine (Y)
    UAU: 'Y', UAC: 'Y',
    // Stop codons
    UAA: '[Stop]', UAG: '[Stop]', UGA: '[Stop]',
    // Histidine (H)
    CAU: 'H', CAC: 'H',
    // Glutamine (Q)
    CAA: 'Q', CAG: 'Q',
    // Asparagine (N)
    AAU: 'N', AAC: 'N',
    // Lysine (K)
    AAA: 'K', AAG: 'K',
    // Aspartic acid (D)
    GAU: 'D', GAC: 'D',
    // Glutamic acid (E)
    GAA: 'E', GAG: 'E',
    // Cysteine (C)
    UGU: 'C', UGC: 'C',
    // Tryptophan (W)
    UGG: 'W',
    // Arginine (R)
    CGU: 'R', CGC: 'R', CGA: 'R', CGG: 'R', AGA: 'R', AGG: 'R',
    // Glycine (G)
    GGU: 'G', GGC: 'G', GGA: 'G', GGG: 'G'
  };
  

  /// DNA to Seq
  export const codonTableDtoS = {
    // Phenylalanine (F)
    TTT: 'F', TTC: 'F',
    // Leucine (L)
    TTA: 'L', TTG: 'L', CTT: 'L', CTC: 'L', CTA: 'L', CTG: 'L',
    // Isoleucine (I)
    ATT: 'I', ATC: 'I', ATA: 'I',
    // Methionine (M) - Start codon
    ATG: 'M',
    // Valine (V)
    GTT: 'V', GTC: 'V', GTA: 'V', GTG: 'V',
    // Serine (S)
    TCT: 'S', TCC: 'S', TCA: 'S', TCG: 'S', AGT: 'S', AGC: 'S',
    // Proline (P)
    CCT: 'P', CCC: 'P', CCA: 'P', CCG: 'P',
    // Threonine (T)
    ACT: 'T', ACC: 'T', ACA: 'T', ACG: 'T',
    // Alanine (A)
    GCT: 'A', GCC: 'A', GCA: 'A', GCG: 'A',
    // Tyrosine (Y)
    TAT: 'Y', TAC: 'Y',
    // Stop codons
    TAA: '[Stop]', TAG: '[Stop]', TGA: '[Stop]',
    // Histidine (H)
    CAT: 'H', CAC: 'H',
    // Glutamine (Q)
    CAA: 'Q', CAG: 'Q',
    // Asparagine (N)
    AAT: 'N', AAC: 'N',
    // Lysine (K)
    AAA: 'K', AAG: 'K',
    // Aspartic acid (D)
    GAT: 'D', GAC: 'D',
    // Glutamic acid (E)
    GAA: 'E', GAG: 'E',
    // Cysteine (C)
    TGT: 'C', TGC: 'C',
    // Tryptophan (W)
    TGG: 'W',
    // Arginine (R)
    CGT: 'R', CGC: 'R', CGA: 'R', CGG: 'R', AGA: 'R', AGG: 'R',
    // Glycine (G)
    GGT: 'G', GGC: 'G', GGA: 'G', GGG: 'G'
  };

  export function getIonWeight(ionType: IonType): number {
    switch (ionType) {
        case 'H': return 1.0073;
        case 'Na': return 22.9892;
        case 'K': return 38.9632;
        case 'NH₄': return 18.03382;
        case '-H': return -1.0073;
        case '-Na': return -22.9892;
        case '-K': return -38.9632;
        case '-NH₄': return -18.03382;
        case 'unknown': return 0;
        default: return 0;
    }
}
  