/**
 * STM Helper - Backward Compatibility Wrapper
 *
 * This file provides backward compatibility for existing code that imports StmHelper.
 * All functionality has been refactored into separate modules:
 *
 * - stm-core.ts: Core sequence generation logic
 * - stm-side-chain.ts: Side-chain modification logic
 * - stm-crosslinking.ts: Crosslinking modification logic
 * - stm-utils.ts: Utility functions and type definitions
 *
 * @deprecated Use StmCore from './stm-core' instead
 */

import { StmCore } from './stm-core';
import type { Possibility, PossibilityLetter } from './stm-utils';

/**
 * @deprecated Use StmCore from './stm-core' instead
 */
export const StmHelper = StmCore;

// Re-export types for backward compatibility
export type { Possibility, PossibilityLetter };
