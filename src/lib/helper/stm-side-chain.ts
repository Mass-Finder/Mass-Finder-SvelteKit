/**
 * STM Side-Chain Modification Module
 *
 * Handles all Side Chain modification variants (0, 1, 2, ... N applications)
 * Side Chain modifications replace the target amino acid completely
 */

import { aminoMap, molecularWeightMap } from './amino_mapper';
import { deepClonePossibility } from './stm-utils';
import type { Possibility } from './stm-utils';
import type { SingleSitePotentialModification } from '../../type/Types';

/**
 * Apply Side Chain modifications to base possibilities
 *
 * For each modification, generates all possible counts (0, 1, 2, ... N)
 * where N is the number of target amino acids in the sequence
 */
export function applySideChainModifications(
    basePossibilities: Possibility[],
    sideChainModifications: SingleSitePotentialModification[]
): Possibility[] {
    if (sideChainModifications.length === 0) {
        return basePossibilities;
    }

    const allResults: Possibility[] = [];

    for (const basePoss of basePossibilities) {
        // Apply each Side Chain modification recursively
        const possWithAllMods = applySideChainRecursive(
            basePoss,
            sideChainModifications,
            0
        );
        allResults.push(...possWithAllMods);
    }

    return allResults;
}

/**
 * Recursively apply Side Chain modifications
 *
 * Processes each modification in sequence, generating all count variants
 * for the current modification before moving to the next
 */
function applySideChainRecursive(
    basePoss: Possibility,
    modifications: SingleSitePotentialModification[],
    modIndex: number
): Possibility[] {
    if (modIndex >= modifications.length) {
        return [basePoss];
    }

    const currentMod = modifications[modIndex];

    // Generate all count variants for current modification (0, 1, 2, ...)
    const variants = generateSideChainVariants(basePoss, currentMod);

    // Apply next modification to each variant
    const results: Possibility[] = [];
    for (const variant of variants) {
        const nextResults = applySideChainRecursive(variant, modifications, modIndex + 1);
        results.push(...nextResults);
    }

    return results;
}

/**
 * Generate count-based variants for a single Side Chain modification
 *
 * For a modification targeting amino acid X:
 * - If sequence has 3 X's, generates: 0X modified, 1X modified, 2X modified, 3X modified
 * - Modifications are applied from left to right
 * - Each variant has updated mass, sequence string, and reasons
 */
function generateSideChainVariants(
    basePossibility: Possibility,
    modification: SingleSitePotentialModification
): Possibility[] {
    // 1. Find all positions of the target amino acid in the sequence (including first and last)
    const targetIndices: number[] = [];

    for (let i = 0; i < basePossibility.sequence.length; i++) {
        const item = basePossibility.sequence[i];
        if (item.letter === modification.target) {
            targetIndices.push(i);
        }
    }

    const count = targetIndices.length;

    // 2. Generate variants from 0 to count modifications
    const results: Possibility[] = [];

    for (let applyCount = 0; applyCount <= count; applyCount++) {
        const newPoss = deepClonePossibility(basePossibility);

        // Explicitly deep clone sequence array (each item is also copied)
        newPoss.sequence = newPoss.sequence.map(item => ({ ...item }));

        if (applyCount > 0) {
            const modWeight = parseFloat(modification.monoisotopicWeight);
            const modMolWeight = parseFloat(modification.molecularWeight);

            // Get target amino acid weight
            const targetAA = modification.target;
            const targetMonoisotopicWeight = aminoMap[targetAA] || 0;
            const targetMolecularWeight = molecularWeightMap[targetAA] || 0;

            // Apply modification to applyCount amino acids from left to right
            for (let i = 0; i < applyCount; i++) {
                const idx = targetIndices[i];

                // Mark sequence
                newPoss.sequence[idx] = {
                    ...newPoss.sequence[idx],
                    sideChainModified: true,
                    sideChainModification: modification.structureName
                };
            }

            // Update mass (REPLACE: subtract target mass and add mod mass)
            // Side Chain modifications are stored as absolute values,
            // so we subtract target weight and add mod weight
            newPoss.weight = newPoss.weight - (targetMonoisotopicWeight * applyCount) + (modWeight * applyCount);
            newPoss.molecularWeight = newPoss.molecularWeight - (targetMolecularWeight * applyCount) + (modMolWeight * applyCount);

            // Regenerate sequenceString
            newPoss.sequenceString = newPoss.sequence
                .filter(item => item.letter !== "")
                .map(item => {
                    // Side Chain: replace (show modification only)
                    if (item.sideChainModified && item.sideChainModification) {
                        return item.sideChainModification;
                    }
                    // N-terminus: add (modification + letter)
                    if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'N-terminus') {
                        return item.singleSiteModification + item.letter;
                    }
                    // C-terminus: add (letter + modification)
                    if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'C-terminus') {
                        return item.letter + item.singleSiteModification;
                    }
                    // Crosslinking: replace (show modification only)
                    if (item.crosslinked && item.crosslinkModification) {
                        return item.crosslinkModification;
                    }
                    return item.letter;
                })
                .join("");

            // Update reasons
            newPoss.reasons.push(`${modification.name} (x${applyCount})`);
            newPoss.reasons = newPoss.reasons.filter(r => r !== "Only natural AA");
        }

        results.push(newPoss);
    }

    return results;
}
