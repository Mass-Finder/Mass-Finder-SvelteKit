// src/types.d.ts
export type FormyType = 'yes' | 'no' | 'unknown';
export type IonType = 'H' | 'Na' | 'K' | 'NH₄' | '-H' | '-Na' | '-K' | '-NH₄' | 'none' | 'unknown';

// Potential Modification Types
export type ModificationType = 'Single-site' | 'Crosslinking';

// Single-site Condition
export enum SingleSiteCondition {
  N_TERMINUS = 'N-terminus',
  C_TERMINUS = 'C-terminus',
  INTERNAL_SITE = 'Internal site',
}

// Crosslinking Condition
export enum CrosslinkingCondition {
  ADJACENT = 'Adjacent',
  ADJACENT_1_TO_2 = 'Adjacent(Target 1->2)',
  ADJACENT_2_TO_1 = 'Adjacent(Target 2->1)',
  DISTANCE = 'Distance'
}

// Distance Operator
export type DistanceOperator = '>' | '=' | '<';

// Base Potential Modification Interface
interface BasePotentialModification {
  name: string;
  structureName: string;
  moleculeJson: any;
  molecularFormula: string;
  monoisotopicWeight: string;
  molecularWeight: string;
}

// Single-site Potential Modification
export interface SingleSitePotentialModification extends BasePotentialModification {
  type: 'Single-site';
  target: string; // Amino acid code or 'ALL'
  condition: SingleSiteCondition;
}

// Crosslinking Potential Modification
export interface CrosslinkingPotentialModification extends BasePotentialModification {
  type: 'Crosslinking';
  target1: string; // Amino acid code
  target2: string; // Amino acid code
  condition: CrosslinkingCondition;
  distanceOperator?: DistanceOperator; // Only for Distance condition
  distanceValue?: number; // Only for Distance condition
}

// Union type for all Potential Modifications
export type PotentialModification = SingleSitePotentialModification | CrosslinkingPotentialModification;
