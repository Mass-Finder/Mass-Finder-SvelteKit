/**
 * STM Utility Functions and Type Definitions
 *
 * Shared utilities and type definitions for the STM (Sequence-to-Mass) module
 */

import type { IonType } from '../../type/Types';

/**
 * Possibility represents a single sequence possibility
 * with all associated metadata and calculated masses
 */
export interface Possibility {
    sequence: PossibilityLetter[];
    sequenceString: string;
    reasons: string[];
    weight: number;
    molecularWeight: number;
    adduct: IonType;
    crosslinking?: Array<{modification: string, pair: [number, number]}>;
}

/**
 * PossibilityLetter represents a single amino acid in a sequence
 * with all modification flags and metadata
 */
export interface PossibilityLetter {
    letter: string;
    natural: boolean;
    candidate?: any;
    internalInitiation?: boolean;
    prematureTermination?: boolean;
    skipping?: boolean;
    crosslinked?: boolean;
    crosslinkModification?: string;
    singleSiteModified?: boolean;
    singleSiteModification?: string;
    singleSiteCondition?: string;  // 'N-terminus' or 'C-terminus'
    sideChainModified?: boolean;
    sideChainModification?: string;
}

/**
 * Deep clone a Possibility object
 * Ensures all nested arrays and objects are copied
 */
export function deepClonePossibility(poss: Possibility): Possibility {
    return {
        sequence: poss.sequence.map(item => ({ ...item })),
        sequenceString: poss.sequenceString,
        reasons: [...poss.reasons],
        weight: poss.weight,
        molecularWeight: poss.molecularWeight,
        adduct: poss.adduct,
        crosslinking: poss.crosslinking ? poss.crosslinking.map(c => ({ ...c, pair: [...c.pair] as [number, number] })) : []
    };
}

/**
 * Remove duplicate sequences from possibilities
 *
 * Duplicates are identified by:
 * - sequenceString
 * - adduct
 * - weight
 * - molecularWeight
 *
 * Note: reasons may differ, but if the above match, it's considered a duplicate
 * Only the first occurrence is kept
 */
export function removeDuplicateSequences(possibilities: Possibility[]): Possibility[] {
    const seenKeys = new Set<string>();
    const uniquePossibilities: Possibility[] = [];

    for (const poss of possibilities) {
        // Duplicate detection key: sequenceString + adduct + weight + molecularWeight
        const key = `${poss.sequenceString}|${poss.adduct}|${poss.weight.toFixed(5)}|${poss.molecularWeight.toFixed(5)}`;

        if (!seenKeys.has(key)) {
            seenKeys.add(key);
            uniquePossibilities.push(poss);
        }
    }

    return uniquePossibilities;
}
