// src/types.d.ts
export type FormyType = 'yes' | 'no' | 'unknown';
export type IonType = 'H' | 'Na' | 'K' | 'NH₄' | '-H' | '-Na' | '-K' | '-NH₄' | 'none' | 'unknown';

// Potential Modification Types
export type ModificationType = 'Single-site' | 'Crosslinking';

// Single-site Condition
export enum SingleSiteCondition {
  N_TERMINUS = 'N-terminus',
  C_TERMINUS = 'C-terminus',
  EVERYWHERE = 'Everywhere',
  INTERNAL_SITE = 'Internal site',
  EDGE_SITE = 'Edge site'
}

// Crosslinking Condition
export enum CrosslinkingCondition {
  EVERYWHERE = 'Everywhere',
  ADJACENT = 'Adjacent',
  ADJACENT_1_TO_2 = 'Adjacent(Target 1->2)',
  ADJACENT_2_TO_1 = 'Adjacent(Target 2->1)',
  DISTANCE = 'Distance'
}

// Distance Operator
export type DistanceOperator = '>' | '=' | '<';
