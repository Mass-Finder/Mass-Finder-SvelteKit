// SMILES strings for canonical amino acids
export const aminoSMILES: { [key: string]: string } = {
  G: 'NCC(=O)O',                           // Glycine
  A: 'CC(N)C(=O)O',                        // Alanine
  V: 'CC(C)C(N)C(=O)O',                    // Valine
  L: 'CC(C)CC(N)C(=O)O',                   // Leucine
  I: 'CCC(C)C(N)C(=O)O',                   // Isoleucine
  M: 'CSCCC(N)C(=O)O',                     // Methionine
  F: 'c1ccc(CC(N)C(=O)O)cc1',             // Phenylalanine
  W: 'c1ccc2c(c1)c(CC(N)C(=O)O)cn2',      // Tryptophan
  P: 'C1CC(NC1)C(=O)O',                    // Proline
  S: 'OCC(N)C(=O)O',                       // Serine
  T: 'CC(O)C(N)C(=O)O',                    // Threonine
  C: 'SCC(N)C(=O)O',                       // Cysteine
  Y: 'Oc1ccc(CC(N)C(=O)O)cc1',            // Tyrosine
  N: 'NC(=O)CC(N)C(=O)O',                  // Asparagine
  Q: 'NC(=O)CCC(N)C(=O)O',                 // Glutamine
  D: 'OC(=O)CC(N)C(=O)O',                  // Aspartic acid
  E: 'OC(=O)CCC(N)C(=O)O',                 // Glutamic acid
  K: 'NCCCCC(N)C(=O)O',                    // Lysine
  R: 'NC(=N)NCCCC(N)C(=O)O',               // Arginine
  H: 'c1c(CC(N)C(=O)O)ncn1'                // Histidine
};
