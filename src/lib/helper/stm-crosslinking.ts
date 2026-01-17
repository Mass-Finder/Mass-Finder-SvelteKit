/**
 * STM Crosslinking Module
 *
 * Handles crosslinking modifications for the STM (Sequence-to-Mass) calculation engine.
 * Crosslinking modifications connect two amino acids within a sequence based on various
 * conditions (adjacency, distance, etc.), replacing the original amino acids with a new
 * crosslinked structure.
 *
 * Key features:
 * - Recursive application of multiple crosslinking modifications
 * - Support for various crosslinking conditions: Adjacent, Distance-based
 * - Non-overlapping combination generation using backtracking
 * - Mass recalculation accounting for replaced amino acid structures
 * - Sequence string updates reflecting crosslinked residues
 *
 * @module stm-crosslinking
 */

import { aminoMap, molecularWeightMap } from './amino_mapper';
import { logger } from '../utils/logger';
import { deepClonePossibility } from './stm-utils';
import type { Possibility } from './stm-utils';
import type { CrosslinkingPotentialModification } from '../../type/Types';
import { CrosslinkingCondition } from '../../type/Types';

/**
 * Applies crosslinking modifications to base possibilities
 *
 * For each base possibility, all crosslinking modifications are recursively applied
 * to generate all valid combinations. Results are deduplicated based on sequence,
 * crosslinking pattern, and adduct type.
 *
 * @param basePossibilities - The initial set of possibilities to modify
 * @param crosslinkingModifications - Array of crosslinking modification definitions
 * @returns Array of possibilities with crosslinking modifications applied
 */
export function applyCrosslinkingModifications(
    basePossibilities: Possibility[],
    crosslinkingModifications: CrosslinkingPotentialModification[]
): Possibility[] {
    if (crosslinkingModifications.length === 0) {
        return basePossibilities;
    }

    // Process each base possibility
    const allResults: Possibility[] = [];

    for (const basePoss of basePossibilities) {
        // Recursively apply all crosslinking modifications to this possibility
        const possWithAllMods = applyCrosslinkingRecursive(
            basePoss,
            crosslinkingModifications,
            0
        );
        allResults.push(...possWithAllMods);
    }

    // Remove duplicates
    const uniqueSequences = new Set<string>();
    const dedupedResults: Possibility[] = [];

    for (const poss of allResults) {
        const crosslinkingKey = (poss.crosslinking || [])
            .map(c => `${c.modification}-${c.pair.join(',')}`)
            .sort()
            .join('|');
        const uniqueKey = `${poss.sequenceString}-C${crosslinkingKey}-${poss.adduct}`;

        if (!uniqueSequences.has(uniqueKey)) {
            uniqueSequences.add(uniqueKey);
            dedupedResults.push(poss);
        }
    }

    return dedupedResults;
}

/**
 * Recursively applies crosslinking modifications
 *
 * Generates all combinations when multiple modifications are present
 *
 * @param basePoss - The base possibility to modify
 * @param modifications - Array of crosslinking modification definitions
 * @param modIndex - Current modification index being processed
 * @returns Array of possibilities with modifications applied
 */
function applyCrosslinkingRecursive(
    basePoss: Possibility,
    modifications: CrosslinkingPotentialModification[],
    modIndex: number
): Possibility[] {
    // Base case: all modifications processed
    if (modIndex >= modifications.length) {
        return [basePoss];
    }

    const currentMod = modifications[modIndex];

    // Generate all combinations for current modification
    const combinations = generateCrosslinkingCombinations(basePoss, currentMod);

    // Apply next modification to each combination
    const results: Possibility[] = [];
    for (const combo of combinations) {
        const nextResults = applyCrosslinkingRecursive(combo, modifications, modIndex + 1);
        results.push(...nextResults);
    }

    return results;
}

/**
 * Generates all combinations for a single crosslinking modification
 *
 * @param basePossibility - The possibility to modify
 * @param modification - The crosslinking modification definition
 * @returns Array of possibilities representing all valid crosslinking combinations
 */
function generateCrosslinkingCombinations(
    basePossibility: Possibility,
    modification: CrosslinkingPotentialModification
): Possibility[] {
    // 1. Find valid pairs
    const validPairs = findValidCrosslinkingPairs(basePossibility, modification);

    // 2. Generate non-overlapping combinations
    const combinations = generateNonOverlappingCombinations(validPairs);

    // 3. Create new Possibility for each combination
    const results: Possibility[] = [];
    for (const combo of combinations) {
        const newPoss: Possibility = deepClonePossibility(basePossibility);

        if (combo.length > 0) {
            // Update mass: subtract original amino acids, add new structures
            const modWeight = parseFloat(modification.monoisotopicWeight);
            const modMolWeight = parseFloat(modification.molecularWeight);

            // Calculate mass of original amino acids being replaced
            let originalMonoWeight = 0;
            let originalMolWeight = 0;

            for (const [idx1, idx2] of combo) {
                const aa1 = newPoss.sequence[idx1];
                const aa2 = newPoss.sequence[idx2];

                // First amino acid mass
                if (aa1.natural) {
                    originalMonoWeight += aminoMap[aa1.letter] || 0;
                    originalMolWeight += molecularWeightMap[aa1.letter] || 0;
                } else if (aa1.candidate) {
                    originalMonoWeight += parseFloat(aa1.candidate.monoisotopicWeight);
                    originalMolWeight += parseFloat(aa1.candidate.molecularWeight);
                }

                // Second amino acid mass
                if (aa2.natural) {
                    originalMonoWeight += aminoMap[aa2.letter] || 0;
                    originalMolWeight += molecularWeightMap[aa2.letter] || 0;
                } else if (aa2.candidate) {
                    originalMonoWeight += parseFloat(aa2.candidate.monoisotopicWeight);
                    originalMolWeight += parseFloat(aa2.candidate.molecularWeight);
                }
            }

            // Mass change = (new structure × pair count × 2) - original amino acids
            // Each pair creates 2 crosslinked structures (e.g., Dm-W becomes AsuAsu)
            newPoss.weight = newPoss.weight - originalMonoWeight + (modWeight * combo.length * 2);
            newPoss.molecularWeight = newPoss.molecularWeight - originalMolWeight + (modMolWeight * combo.length * 2);

            // Update sequence (using structure name)
            updateSequenceWithCrosslinking(newPoss, combo, modification.structureName);

            // Update reasons (using modification name)
            newPoss.reasons.push(`${modification.name} (x${combo.length})`);

            // Remove "Only natural AA"
            newPoss.reasons = newPoss.reasons.filter(r => r !== "Only natural AA");

            // Store crosslinking information
            newPoss.crosslinking = (newPoss.crosslinking || []).concat(
                combo.map(pair => ({
                    modification: modification.name,
                    pair: pair
                }))
            );
        }

        results.push(newPoss);
    }

    return results;
}

/**
 * Finds valid crosslinking pairs based on modification conditions
 *
 * @param possibility - The possibility to search for valid pairs
 * @param modification - The crosslinking modification definition with targets and conditions
 * @returns Array of valid amino acid index pairs
 */
function findValidCrosslinkingPairs(
    possibility: Possibility,
    modification: CrosslinkingPotentialModification
): Array<[number, number]> {
    const target1Indices: number[] = [];
    const target2Indices: number[] = [];

    // Include crosslinked amino acids - find by original letter
    possibility.sequence.forEach((item, idx) => {
        if (item.letter === modification.target1) target1Indices.push(idx);
        if (item.letter === modification.target2) target2Indices.push(idx);
    });
    const validPairs: Array<[number, number]> = [];

    for (const idx1 of target1Indices) {
        for (const idx2 of target2Indices) {
            if (idx1 === idx2) continue; // Skip same position

            const distance = Math.abs(idx2 - idx1) - 1;

            let isValid = false;

            // Support both enum values and legacy string values for backward compatibility
            const condition = modification.condition;

            if (condition === CrosslinkingCondition.ADJACENT) {
                isValid = distance === 0;
            } else if (condition === CrosslinkingCondition.DISTANCE) {
                const operator = modification.distanceOperator;
                const value = modification.distanceValue || 0;

                if (operator === '=') {
                    isValid = distance === value;
                } else if (operator === '<') {
                    isValid = distance < value;
                } else if (operator === '>') {
                    isValid = distance > value;
                }
            }

            if (isValid) {
                const pair: [number, number] = idx1 < idx2 ? [idx1, idx2] : [idx2, idx1];
                const pairKey = `${pair[0]}-${pair[1]}`;
                if (!validPairs.some(p => `${p[0]}-${p[1]}` === pairKey)) {
                    validPairs.push(pair);
                }
            }
        }
    }

    return validPairs;
}

/**
 * Generates non-overlapping combinations using backtracking
 *
 * Creates all possible combinations of amino acid pairs where no amino acid
 * appears in more than one pair. Includes empty combination (0 pairs).
 *
 * @param pairs - Array of valid amino acid index pairs
 * @param maxSize - Maximum combination size limit (for performance optimization)
 * @returns Array of non-overlapping pair combinations
 */
function generateNonOverlappingCombinations(
    pairs: Array<[number, number]>,
    maxSize: number = 5  // Default: up to 5 pairs max
): Array<Array<[number, number]>> {
    const results: Array<Array<[number, number]>> = [[]]; // Empty combination (0 pairs applied)

    const backtrack = (
        startIndex: number,
        currentCombo: Array<[number, number]>,
        usedIndices: Set<number>
    ) => {
        // Add currentCombo to results (if 1+ pairs)
        if (currentCombo.length > 0) {
            results.push([...currentCombo]);
            // Prevent excessive logging - only first 50
            if (results.length <= 50) {
                logger.debug(`Crosslinking: Added combination of size ${currentCombo.length}`, currentCombo);
            }
        }

        // Max size limit check - performance optimization
        if (currentCombo.length >= maxSize) {
            return; // Don't go deeper
        }

        // Select next pair
        for (let i = startIndex; i < pairs.length; i++) {
            const [idx1, idx2] = pairs[i];

            // Skip if indices already used
            if (usedIndices.has(idx1) || usedIndices.has(idx2)) continue;

            // Add current pair
            currentCombo.push(pairs[i]);
            usedIndices.add(idx1);
            usedIndices.add(idx2);

            // Recursive call
            backtrack(i + 1, currentCombo, usedIndices);

            // Backtrack
            currentCombo.pop();
            usedIndices.delete(idx1);
            usedIndices.delete(idx2);
        }
    };

    backtrack(0, [], new Set<number>());

    // Summary by combination count
    const summary = new Map<number, number>();
    results.forEach(combo => {
        const count = summary.get(combo.length) || 0;
        summary.set(combo.length, count + 1);
    });
    logger.debug(`Crosslinking: Max size limit=${maxSize}`);
    logger.debug('Crosslinking: Summary by combination size:');
    summary.forEach((count, size) => {
        logger.debug(`  - Size ${size}: ${count} combinations`);
    });
    logger.debug(`Crosslinking: Total combinations=${results.length}`);

    return results;
}

/**
 * Updates sequence with crosslinking information
 *
 * Marks affected amino acids as crosslinked and regenerates the sequence string
 * to reflect all modifications (crosslinking, side chain, single-site)
 *
 * @param possibility - The possibility to update
 * @param pairs - Array of amino acid index pairs that are crosslinked
 * @param modificationName - Name of the crosslinking modification
 */
function updateSequenceWithCrosslinking(
    possibility: Possibility,
    pairs: Array<[number, number]>,
    modificationName: string
): void {
    // For crosslinking, we replace TWO amino acids with TWO new structures (both shown as modification)
    // Strategy: Mark both idx1 and idx2 as crosslinked structures
    const crosslinkedIndices = new Set<number>();  // Indices that become the crosslinked structure

    pairs.forEach(([idx1, idx2]) => {
        crosslinkedIndices.add(idx1);
        crosslinkedIndices.add(idx2);
    });

    // Update sequence array
    possibility.sequence = possibility.sequence.map((item, idx) => {
        // Both amino acids of crosslinked pair: mark as crosslinked structure
        if (crosslinkedIndices.has(idx) && item.letter !== "") {
            return {
                ...item,
                natural: false,  // Crosslinked amino acids are not natural (display in red)
                crosslinked: true,
                crosslinkModification: modificationName
            };
        }
        return item;
    });

    // Regenerate sequenceString (considering all modification types)
    possibility.sequenceString = possibility.sequence
        .filter(item => item.letter !== "")
        .map(item => {
            // Priority: Crosslinking > Side Chain > Single-site > base letter
            // Crosslinking and Side Chain: replacement (show modification only)
            if (item.crosslinked && item.crosslinkModification) {
                // Check if this crosslinked amino acid also has N-terminus formylation
                if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'N-terminus') {
                    return item.singleSiteModification + item.crosslinkModification;
                }
                // Check if this crosslinked amino acid also has C-terminus modification
                if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'C-terminus') {
                    return item.crosslinkModification + item.singleSiteModification;
                }
                return item.crosslinkModification;
            }
            if (item.sideChainModified && item.sideChainModification) {
                // Check if this side chain modified amino acid also has N-terminus formylation
                if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'N-terminus') {
                    return item.singleSiteModification + item.sideChainModification;
                }
                // Check if this side chain modified amino acid also has C-terminus modification
                if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'C-terminus') {
                    return item.sideChainModification + item.singleSiteModification;
                }
                return item.sideChainModification;
            }
            // N-terminus: addition (modification + letter)
            if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'N-terminus') {
                return item.singleSiteModification + item.letter;
            }
            // C-terminus: addition (letter + modification)
            if (item.singleSiteModified && item.singleSiteModification && item.singleSiteCondition === 'C-terminus') {
                return item.letter + item.singleSiteModification;
            }
            return item.letter;
        })
        .join("");
}
