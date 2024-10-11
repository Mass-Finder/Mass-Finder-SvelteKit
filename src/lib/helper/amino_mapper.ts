

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
    UAA: 'Stop', UAG: 'Stop', UGA: 'Stop',
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
    TAA: 'Stop', TAG: 'Stop', TGA: 'Stop',
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
  