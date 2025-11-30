# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

X-MAS is a specialized biochemical analysis web application for molecular weight and amino acid sequence interconversion. It serves biochemical researchers with high-performance calculations using simulated annealing algorithms and web workers.

## Core Features & Routes

- **MTS (Mass to Sequence)** (`/mts`): Predicts amino acid sequences from detected molecular masses using simulated annealing
- **STM (Sequence to Mass)** (`/stm`): Converts RNA sequences to amino acid sequences with mass calculations
- **Chemical Drawing** (`/draw`): ChemDoodle-based chemical structure drawing and mass calculation
- **Manual** (`/manual`): Usage guide documentation

## Development Commands

```bash
npm run dev        # Development server (runs on port 8080)
npm run build      # Production build for static deployment
npm run preview    # Preview production build
```

## Technology Stack & Architecture

- **Frontend**: SvelteKit with TypeScript, Bootstrap 5, Vite build system
- **Chemistry**: ChemDoodle Web Components for molecular visualization
- **Algorithms**: Simulated annealing optimization, recursive sequence generation with memoization
- **Performance**: Web Workers for non-blocking calculations
- **Deployment**: Static site generation with SPA fallback

## Key Architecture Components

### Core Business Logic (`src/lib/helper/`)

**mass_finder_helper.ts** - MTS calculation engine:
- Simulated annealing algorithm (temp: 10,000, cooling: 0.99, 100 iterations)
- Fitness function: 80% mass accuracy + 20% sequence similarity
- Multiple solution strategies: random, protein-based, neighbor generation
- Ion type adjustments and overlap processing

**stm_helper.ts** - STM conversion engine:
- Recursive sequence generation with memoization
- Biological phenomena modeling: ncAA incorporation, truncation, codon skipping
- Disulfide bond formation (C-C pairing with -2.02 mass reduction)
- Comprehensive codon table mapping (64 codons)

**amino_mapper.ts** - Biochemical data repository:
- Monoisotopic weights for 20 standard amino acids
- 9 ion adduct types with mass calculations
- RNA/DNA codon lookup tables
- Centralized molecular weight constants

**mass_util.ts** - Calculation utilities:
- Mass accuracy and sequence similarity scoring
- Multi-criteria sorting algorithms
- Complex overlap resolution for RNA/protein sequences
- Deduplication with quality-based selection

### Web Worker Integration (`src/lib/workers/`)

**mass_finder.worker.ts**: Handles CPU-intensive simulated annealing calculations in background threads to maintain UI responsiveness.

### Component Architecture (`src/lib/components/`)

- **Selectors**: AdductSelector, NcAASelector, FormylationSelector for biochemical parameter input
- **Results**: ResultTable, MolecularItem for calculation output display  
- **STM Components**: Specialized components in `stm/` subdirectory for sequence-to-mass workflows
- **Modal**: Reusable modal component for dialogs

## Development Patterns

### State Management
- Svelte stores in `src/stores/` for global state
- Local component state for UI-specific data
- Web worker communication for async calculations

### Type Safety
- Comprehensive TypeScript definitions in `src/type/`
- ChemDoodle integration types
- Biochemical data model types

### Algorithm Configuration
- Externalized parameters for simulated annealing tuning
- Configurable scoring weights and thresholds
- Extensible ion types and amino acid definitions

## Key Files for Modifications

- `src/lib/helper/mass_finder_helper.ts:simulatedAnnealing()` - Core MTS algorithm
- `src/lib/helper/stm_helper.ts:generatePossibilities()` - STM recursive generation
- `src/lib/helper/amino_mapper.ts` - Add new amino acids or ion types
- `src/routes/*/+page.svelte` - Page-specific UI components
- `src/lib/workers/mass_finder.worker.ts` - Background calculation logic

## Performance Considerations

- Web workers prevent UI blocking during intensive calculations
- Memoization in recursive algorithms reduces computation overhead
- Efficient data structures for large sequence space exploration
- Configurable algorithm parameters for speed/accuracy tradeoffs

## ChemDoodle Integration

ChemDoodle Web Components are included via `/static/chem_doodle/` with:
- Molecular structure drawing and editing
- Chemical file format support (MOL, SDF, etc.)
- 3D visualization capabilities
- Mass calculation from drawn structures

## Biochemical Domain Knowledge

The application handles:
- Standard 20 amino acids with monoisotopic masses
- Non-canonical amino acids (ncAA) incorporation
- Post-translational modifications (disulfide bonds)
- Ion adduct formation (9 types: H+, Na+, K+, etc.)
- RNA/DNA codon translation with biological accuracy
- Mass spectrometry ion types and their mass shifts