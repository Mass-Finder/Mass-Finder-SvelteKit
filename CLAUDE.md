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

## Wiki Maintenance (MANDATORY)

이 프로젝트는 `.omc/wiki/` 에 **기능별 분기 케이스 위키**를 유지합니다. 코드 변경 시 위키도 함께 갱신해야 합니다. 위키는 `.md` 문서(MTS.md, STM.md, DRAW.md, POTENTIAL_MODIFICATION_SPEC.md)와 별도로, **실제 코드 기준**의 진실 공급원(SSOT) 역할을 합니다.

### 위키 저장소 구조

- `.omc/wiki/*.md` — 페이지들 (24개+)
- `.omc/wiki/index.md` — 자동 유지 카탈로그
- `.omc/wiki/log.md` — append-only 운영 기록
- 페이지는 git-ignored (프로젝트 로컬). 단 컨벤션은 [[wiki-conventions]] 참고.

### 코드 변경 시 위키 갱신 규칙

코드를 수정하면 **다음 페이지들 중 영향받는 것을 반드시 함께 갱신**할 것:

| 변경 영역 | 갱신 대상 위키 페이지 |
|-----------|----------------------|
| `src/lib/helper/mass_finder_helper.ts` (SA, calc, template) | `mts-decision-flow-all-branches`, `mts-sa-algorithm-internals-branch-cases`, `mts-template-gap-cases-peptide-sequence-map`, `mts-mass-formula-cases` |
| `src/lib/helper/stm_helper.ts` / `stm-core.ts` / `stm-utils.ts` / `stm-side-chain.ts` / `stm-crosslinking.ts` | `stm-input-validation-cases`, `stm-ncaa-variant-type-cases`, `stm-reason-classification-cases`, `stm-modification-system-single-site-crosslinking-side-chain-case`, `stm-mass-formula-cases` |
| `src/lib/helper/amino_mapper.ts` (질량/이온/코돈 상수) | `amino-mapper-reference` (+ 의존 페이지 검토) |
| `src/lib/helper/mass_util.ts` (점수/정렬/dedup) | `mass-util-helpers`, `mts-mass-formula-cases` (sort 가중치) |
| `src/lib/workers/mass_finder.worker.ts` | `web-worker-pattern`, `mts-decision-flow-all-branches` (라우팅 분기) |
| `src/routes/mts/+page.svelte`, `PeptideSequenceSelector.svelte` | `mts-decision-flow-all-branches`, `mts-template-gap-cases-peptide-sequence-map` |
| `src/routes/stm/+page.svelte`, ncAA/Adduct/Modification Selector | `stm-input-validation-cases`, `stm-modification-system-...` |
| `src/routes/draw/+page.svelte`, `ChemDoodleCanvas.svelte` | `draw-page-validation-and-storage-cases` |
| `src/routes/potential/+page.svelte`, `PotentialModificationDialog.svelte` | `potential-modification-types-and-conditions-deep-branch-analysis`, `potential-modification-save-format-cases-delta-vs-absolute` |
| `src/routes/benchmark/+page.svelte` | `benchmark-page-deep-cases`, `benchmark-ux` |
| 새 SA 모드 / 새 분기 / 새 modification 타입 추가 | 해당 기능 페이지 + `documentation-vs-code-discrepancies` 갱신 |

### 위키 운영 워크플로

코드 변경을 완료하면 다음을 수행:

1. **영향 분석** — 어떤 분기/케이스/공식이 변경되었는지 파악
2. **위키 페이지 갱신** — 위 매트릭스에 따라 영향받는 페이지를 `wiki_ingest` (병합) 또는 `wiki_add` (신규)로 갱신
   - 분기 조건, 케이스 매트릭스, 코드 라인 참조 (`file.ts:line`), 변경 커밋 해시(`커밋 abc1234`)를 포함
3. **Cross-link 유지** — 관련 페이지에 `[[페이지-슬러그]]` 링크 추가/확인
4. **Lint 실행** — `wiki_lint` 로 broken refs / orphan / contradiction 확인. ERROR 0건 상태 유지
5. **`.md` 문서와 실제 코드가 어긋나는 발견 시** — `documentation-vs-code-discrepancies` 페이지에 추가

### 위키 페이지 작성 원칙

- **실제 코드 기준** — `.md` 문서가 코드와 다르면 코드를 신뢰
- **분기 명시** — if/else, switch, 삼항 모두 표/매트릭스 형태로 케이스화
- **변수와 그 영향** — 분기 키 변수의 가능한 값과 결과를 명확히
- **라인 번호 인용** — `mass_finder_helper.ts:213` 형식
- **커밋 해시** — 변경 이력 추적 (예: `0a4589d`)
- **Cross-link liberal** — `[[다른-페이지]]` 적극 사용

### 위키 MCP 도구

| 동작 | 도구 |
|------|------|
| 새 페이지 추가 | `wiki_add({ title, content, tags, category })` |
| 페이지 갱신 (merge) | `wiki_ingest({ title, content, tags, category })` — 같은 title이면 append |
| 검색 | `wiki_query({ query, tags?, category? })` |
| 페이지 읽기 | `wiki_read({ page })` |
| 건강 점검 | `wiki_lint()` |
| 전체 목록 | `wiki_list()` |

### 카테고리

`architecture`, `pattern`, `reference`, `decision`, `debugging`, `environment`, `session-log`, `convention`

**위키 갱신을 빠뜨리면 `documentation-vs-code-discrepancies` 가 빠르게 부풀어 오릅니다. 코드 PR과 위키 갱신은 한 묶음으로 처리할 것.**