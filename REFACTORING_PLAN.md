# X-MAS 프로젝트 리팩토링 플랜

> 실행 가능한 단계별 개선 계획
>
> 작성일: 2025-12-07
> 예상 완료: 2025-12-31

---

## 목차

1. [개요](#1-개요)
2. [우선순위 매트릭스](#2-우선순위-매트릭스)
3. [Phase 1: 긴급 수정](#phase-1-긴급-수정)
4. [Phase 2: 구조 개선](#phase-2-구조-개선)
5. [Phase 3: 품질 향상](#phase-3-품질-향상)
6. [실행 체크리스트](#실행-체크리스트)

---

## 1. 개요

### 현재 상태
- **코드 라인**: 9,910 LOC
- **컴포넌트**: 33개
- **테스트 커버리지**: 0%
- **종합 점수**: 2.4 / 5.0

### 목표
- **타입 안전성**: 100% (any 타입 제거)
- **테스트 커버리지**: 70%+
- **평균 파일 크기**: < 200 LOC
- **종합 점수**: 4.5+ / 5.0

### 예상 시간
- **Phase 1**: 38시간 (1-2주)
- **Phase 2**: 25시간 (2-3주)
- **Phase 3**: 70시간 (3-5주)
- **총**: 133시간

---

## 2. 우선순위 매트릭스

### Impact vs Effort

```
High Impact, Low Effort (Quick Wins)
├─ [1] 프로덕션 로그 제거 (2h)
├─ [2] 주석 코드 제거 (1h)
├─ [3] 매직 넘버 추출 (4h)
└─ [4] localStorage 래퍼 생성 (3h)

High Impact, High Effort (Strategic)
├─ [5] stm_helper 분리 (16h)
├─ [6] 타입 안전성 개선 (8h)
├─ [7] 정적 상태 제거 (4h)
└─ [8] 테스트 인프라 구축 (12h)

Low Impact, Low Effort (Fill-ins)
├─ [9] 네이밍 통일 (2h)
├─ [10] JSDoc 추가 (6h)
└─ [11] 에러 메시지 개선 (3h)

Low Impact, High Effort (Avoid)
├─ [ ] 전체 UI 재설계 (80h+)
└─ [ ] 프레임워크 마이그레이션 (120h+)
```

---

## Phase 1: 긴급 수정

> 목표: Critical 이슈 해결로 즉각적인 안정성 향상
>
> 기간: 1-2주 (38시간)

### Task 1.1: 프로덕션 로그 제거 ⚡ Quick Win

**우선순위**: 🔴 Critical
**예상 시간**: 2시간
**영향도**: High

#### 작업 내용
- [ ] Logger 유틸리티 생성
- [ ] 환경별 로그 레벨 설정
- [ ] 모든 console.log → logger.debug 변경
- [ ] 프로덕션 빌드 검증

#### 파일 변경
```
src/lib/utils/logger.ts (신규)
src/lib/helper/mass_finder_helper.ts (수정)
src/lib/helper/stm_helper.ts (수정)
```

#### 성공 기준
- [ ] 프로덕션에서 console.log 0개
- [ ] 개발 환경에서만 디버그 로그 출력
- [ ] 에러는 항상 로깅

---

### Task 1.2: 주석 코드 제거 ⚡ Quick Win

**우선순위**: 🟡 High
**예상 시간**: 1시간
**영향도**: Medium

#### 작업 내용
- [ ] 주석 처리된 코드 275줄 제거
- [ ] Git history로 이동
- [ ] 필요 시 commit message에 참조 추가

#### 파일 변경
```
src/lib/helper/mass_finder_helper.ts (수정)
src/lib/helper/stm_helper.ts (수정)
src/lib/components/ResultTable.svelte (수정)
```

#### 성공 기준
- [ ] 주석 처리된 코드 0줄
- [ ] Git history에 모든 변경 기록 보존

---

### Task 1.3: 매직 넘버 추출 ⚡ Quick Win

**우선순위**: 🟡 High
**예상 시간**: 4시간
**영향도**: High

#### 작업 내용
- [ ] 설정 파일 생성
- [ ] 알고리즘 파라미터 추출
- [ ] 점수 가중치 통일
- [ ] 문서화 추가

#### 파일 변경
```
src/lib/config/algorithm.config.ts (신규)
src/lib/config/scoring.config.ts (신규)
src/lib/helper/mass_finder_helper.ts (수정)
src/lib/helper/stm_helper.ts (수정)
src/lib/helper/mass_util.ts (수정)
```

#### 설정 파일 구조
```typescript
// algorithm.config.ts
export const SA_CONFIG = {
  INITIAL_TEMP: 10_000,
  COOLING_RATE: 0.99,
  ITERATIONS: 100,
  // ...
} as const;

// scoring.config.ts
export const SCORING_WEIGHTS = {
  MASS_ACCURACY: 0.8,
  SEQUENCE_SIMILARITY: 0.2,
} as const;
```

#### 성공 기준
- [ ] 하드코딩된 숫자 0개
- [ ] 모든 파라미터 설정 파일에 존재
- [ ] 주석으로 의미 설명

---

### Task 1.4: Logger 유틸리티 생성

**우선순위**: 🔴 Critical
**예상 시간**: 2시간
**영향도**: High

#### 구현 상세

```typescript
// src/lib/utils/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  level: LogLevel;
  enableTimestamp: boolean;
  enableColors: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor(config?: Partial<LoggerConfig>) {
    const isDev = import.meta.env.MODE === 'development';
    this.config = {
      level: isDev ? 'debug' : 'error',
      enableTimestamp: true,
      enableColors: isDev,
      ...config,
    };
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.format('DEBUG', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.info(this.format('INFO', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.format('WARN', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.format('ERROR', message), ...args);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.config.level);
  }

  private format(level: string, message: string): string {
    const timestamp = this.config.enableTimestamp
      ? `[${new Date().toISOString()}]`
      : '';
    return `${timestamp} [${level}] ${message}`;
  }
}

export const logger = new Logger();
```

---

### Task 1.5: stm_helper.ts 분리 🎯 Strategic

**우선순위**: 🔴 Critical
**예상 시간**: 16시간
**영향도**: Very High

#### 목표 구조
```
src/lib/services/stm/
├── sequence-generator.ts       (generatePossibilities)
├── modification-applier.ts     (apply*Modifications)
├── crosslinking-engine.ts      (crosslinking 로직)
├── sequence-deduplicator.ts    (중복 제거)
├── sequence-utils.ts           (유틸리티)
└── index.ts                    (통합 export)
```

#### Step 1: 인터페이스 정의 (2h)

```typescript
// src/lib/services/stm/types.ts
export interface SequenceGeneratorInput {
  rnaSeq: string;
  ncAAMap: NcAAMapping;
  codonTitles: CodonTitles;
  selectedAminos: Set<string>;
}

export interface ModificationInput {
  possibilities: Possibility[];
  modifications: PotentialModification[];
  // ...
}

// 각 모듈의 책임 명확히 정의
```

#### Step 2: sequence-generator.ts 추출 (4h)

```typescript
// src/lib/services/stm/sequence-generator.ts
export class SequenceGenerator {
  private memo = new Map<string, PossibilityLetter[][]>();

  generate(input: SequenceGeneratorInput): Possibility[] {
    // generatePossibilities 로직 이동
  }

  private generateRecursive(...): PossibilityLetter[][] {
    // 재귀 로직
  }

  clearCache(): void {
    this.memo.clear();
  }
}
```

#### Step 3: modification-applier.ts 추출 (4h)

```typescript
// src/lib/services/stm/modification-applier.ts
export class ModificationApplier {
  applySingleSite(input: ModificationInput): Possibility[] {
    // applySingleSiteModifications 이동
  }

  applySideChain(input: ModificationInput): Possibility[] {
    // applySideChainModifications 이동
  }

  applyNTerminus(input: ModificationInput): Possibility[] {
    // applyNTerminusModifications 이동
  }

  applyCTerminus(input: ModificationInput): Possibility[] {
    // applyCTerminusModifications 이동
  }
}
```

#### Step 4: crosslinking-engine.ts 추출 (3h)

```typescript
// src/lib/services/stm/crosslinking-engine.ts
export class CrosslinkingEngine {
  generateCombinations(
    pairs: CrosslinkPair[],
    maxSize: number = 5
  ): CrosslinkCombination[] {
    // generateNonOverlappingCombinations 이동
  }

  private findNonOverlapping(...): void {
    // 백트래킹 로직
  }
}
```

#### Step 5: sequence-deduplicator.ts 추출 (2h)

```typescript
// src/lib/services/stm/sequence-deduplicator.ts
export class SequenceDeduplicator {
  deduplicate(possibilities: Possibility[]): Possibility[] {
    // removeDuplicateSequences 이동
  }

  private createKey(poss: Possibility): string {
    // 중복 판별 로직
  }
}
```

#### Step 6: 통합 및 테스트 (1h)

```typescript
// src/lib/services/stm/index.ts
export { SequenceGenerator } from './sequence-generator';
export { ModificationApplier } from './modification-applier';
export { CrosslinkingEngine } from './crosslinking-engine';
export { SequenceDeduplicator } from './sequence-deduplicator';

// 기존 API 유지를 위한 래퍼
export class StmCalculator {
  private generator = new SequenceGenerator();
  private applier = new ModificationApplier();
  private crosslinker = new CrosslinkingEngine();
  private deduplicator = new SequenceDeduplicator();

  calc(...args): Possibility[] {
    // 기존 StmHelper.calc()와 동일한 인터페이스
    const possibilities = this.generator.generate(...);
    // ... 나머지 로직
  }
}
```

#### 성공 기준
- [ ] 각 파일 < 300 LOC
- [ ] 단일 책임 원칙 준수
- [ ] 기존 API 호환성 유지
- [ ] 모든 기존 테스트 통과 (작성 필요)

---

### Task 1.6: 타입 안전성 개선 🎯 Strategic

**우선순위**: 🔴 Critical
**예상 시간**: 8시간
**영향도**: Very High

#### Step 1: 타입 정의 생성 (3h)

```typescript
// src/lib/types/modification.types.ts
export interface NcAAMapping {
  aminoAcid: string;
  structure: string;
  weight: number;
  codons: string[];
  structureTitle: string;
}

export interface CodonTitles {
  [codon: string]: string[];
}

export interface SideChainModification {
  type: 'sidechain';
  name: string;
  targetAminoAcid: string;
  deltaWeight: number;
  structure: string;
}

export interface SingleSiteModification {
  type: 'single-site';
  name: string;
  targetAminoAcids: string[];
  deltaWeight: number;
  distance: number;
}

export interface CrosslinkingModification {
  type: 'crosslinking';
  name: string;
  targetAminoAcid1: string;
  targetAminoAcid2: string;
  deltaWeight: number;
  distance: number;
}

export type PotentialModification =
  | SingleSiteModification
  | CrosslinkingModification;

// Type Guards
export function isSingleSite(
  mod: PotentialModification
): mod is SingleSiteModification {
  return mod.type === 'single-site';
}

export function isCrosslinking(
  mod: PotentialModification
): mod is CrosslinkingModification {
  return mod.type === 'crosslinking';
}
```

#### Step 2: Helper 파일 타입 적용 (3h)

```typescript
// src/lib/helper/stm_helper.ts (또는 새로운 서비스 파일)
static calc(
  rnaSeq: string,
  ncAAMap: Record<string, NcAAMapping>,  // ✅ any 제거
  codonTitles: CodonTitles,              // ✅ 명확한 타입
  selectedAminos: Set<string>,
  ionTypes: IonType[],
  sideChainModifications: SideChainModification[],  // ✅ any 제거
  potentialModifications: PotentialModification[],  // ✅ any 제거
  admidation: boolean,
  nTerminusModification: SingleSiteModification | null,
  cTerminusModification: SingleSiteModification | null
): Possibility[] {
  // 타입 안전한 구현
}
```

#### Step 3: Svelte 컴포넌트 타입 적용 (2h)

```svelte
<!-- src/lib/components/AminoMapSelector.svelte -->
<script lang="ts">
  import type { AminoAcid } from '$lib/types/amino.types';

  export let selectedAminos: Set<string>;

  function handleCheckboxChange(key: string, value: boolean): void {
    if (value) {
      selectedAminos.add(key);
    } else {
      selectedAminos.delete(key);
    }
    selectedAminos = selectedAminos;
  }
</script>
```

#### 성공 기준
- [ ] `any` 타입 0개
- [ ] 모든 public 함수 타입 시그니처 명확
- [ ] Type guards 구현
- [ ] TypeScript strict mode 통과

---

### Task 1.7: 정적 상태 제거

**우선순위**: 🔴 Critical
**예상 시간**: 4시간
**영향도**: High

#### 현재 문제

```typescript
// ❌ mass_finder_helper.ts
export class MassFinderHelper {
  static formyType: FormyType = 'unknown';
  static ionType: IonType = 'unknown';
  static topSolutionsCount: number = 100;

  // 동시 실행 시 상태 충돌 위험
}
```

#### 해결 방안

```typescript
// ✅ src/lib/services/mass-finder/mass-finder.service.ts
export interface MassFinderConfig {
  formyType: FormyType;
  ionType: IonType;
  topSolutionsCount: number;
  initialTemperature: number;
  coolingRate: number;
  iterations: number;
}

export class MassFinderService {
  constructor(private config: MassFinderConfig) {}

  calculate(
    detectedMass: number,
    selectedAminos: Set<string>,
    knownSequence?: string
  ): AminoModel[] {
    // this.config 사용 (인스턴스 상태)
  }

  private simulatedAnnealing(...): AminoModel {
    // this.config.formyType 사용
  }
}

// 사용
const service = new MassFinderService({
  formyType: 'on',
  ionType: 'H+',
  topSolutionsCount: 100,
  // ...
});

const results = service.calculate(1500.5, selectedAminos);
```

#### 마이그레이션

```svelte
<!-- src/routes/mts/+page.svelte -->
<script lang="ts">
  import { MassFinderService } from '$lib/services/mass-finder';

  let formyType: FormyType = 'unknown';
  let ionType: IonType = 'H+';

  function handleCalculate() {
    const service = new MassFinderService({
      formyType,
      ionType,
      topSolutionsCount: 100,
      // ... 나머지 설정
    });

    const results = service.calculate(detectedMass, selectedAminos);
  }
</script>
```

#### 성공 기준
- [ ] static mutable state 0개
- [ ] 인스턴스 메서드로 변경
- [ ] 불변 설정 객체 사용
- [ ] 동시 실행 안전성 확보

---

### Task 1.8: localStorage 래퍼 생성 ⚡ Quick Win

**우선순위**: 🟡 High
**예상 시간**: 3시간
**영향도**: Medium

#### 구현

```typescript
// src/lib/services/storage.service.ts
export interface StorageOptions {
  maxSizeMB?: number;
  validator?: (data: any) => boolean;
}

export class StorageService {
  private readonly isAvailable: boolean;

  constructor() {
    this.isAvailable =
      typeof window !== 'undefined' &&
      typeof window.localStorage !== 'undefined';
  }

  save<T>(
    key: string,
    data: T,
    options?: StorageOptions
  ): boolean {
    if (!this.isAvailable) {
      console.warn('localStorage not available');
      return false;
    }

    try {
      const serialized = JSON.stringify(data);
      const sizeInMB = new Blob([serialized]).size / 1024 / 1024;
      const maxSize = options?.maxSizeMB ?? 5;

      if (sizeInMB > maxSize) {
        console.error(
          `Data too large: ${sizeInMB.toFixed(2)}MB (max: ${maxSize}MB)`
        );
        return false;
      }

      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('Storage quota exceeded');
      } else {
        console.error('Failed to save to storage:', error);
      }
      return false;
    }
  }

  load<T>(
    key: string,
    options?: StorageOptions
  ): T | null {
    if (!this.isAvailable) {
      return null;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item) as T;

      if (options?.validator && !options.validator(parsed)) {
        console.warn(`Invalid data format for key: ${key}`);
        return null;
      }

      return parsed;
    } catch (error) {
      console.error(`Failed to load from storage (${key}):`, error);
      return null;
    }
  }

  remove(key: string): void {
    if (this.isAvailable) {
      localStorage.removeItem(key);
    }
  }

  clear(): void {
    if (this.isAvailable) {
      localStorage.clear();
    }
  }

  has(key: string): boolean {
    return this.isAvailable && localStorage.getItem(key) !== null;
  }

  keys(): string[] {
    if (!this.isAvailable) return [];
    return Object.keys(localStorage);
  }
}

export const storage = new StorageService();
```

#### 사용 예시

```typescript
// 저장
const success = storage.save('moleculeData', molecules, {
  maxSizeMB: 4,
  validator: (data) =>
    Array.isArray(data) && data.every((item) => 'structure' in item),
});

// 불러오기
const molecules = storage.load<MoleculeData[]>('moleculeData', {
  validator: (data) => Array.isArray(data),
});
```

#### 기존 코드 마이그레이션

```typescript
// ❌ Before
localStorage.setItem('moleculeData', JSON.stringify(storedData));
const saved = localStorage.getItem('moleculeData');
const data = saved ? JSON.parse(saved) : [];

// ✅ After
storage.save('moleculeData', storedData);
const data = storage.load<MoleculeData[]>('moleculeData') ?? [];
```

---

### Task 1.9: 조합 폭발 방지

**우선순위**: 🔴 Critical
**예상 시간**: 6시간
**영향도**: Very High

#### 문제

```typescript
// stm_helper.ts - 최악의 경우 메모리 부족
generateNonOverlappingCombinations(pairs, maxSize = 5)
// C(50, 5) = 2,118,760 조합 가능
```

#### 해결책 1: 조합 수 제한

```typescript
// src/lib/services/stm/crosslinking-engine.ts
const MAX_COMBINATIONS = 10_000;
const MAX_PAIRS_FOR_FULL_SEARCH = 20;

export class CrosslinkingEngine {
  generateCombinations(
    pairs: CrosslinkPair[],
    maxSize: number = 5
  ): CrosslinkCombination[] {
    // 사전 검사
    const estimatedCount = this.estimateCombinations(pairs.length, maxSize);

    if (estimatedCount > MAX_COMBINATIONS) {
      if (pairs.length > MAX_PAIRS_FOR_FULL_SEARCH) {
        // 샘플링 전략 사용
        return this.generateSampled(pairs, maxSize);
      } else {
        throw new Error(
          `Too many combinations: ${estimatedCount}. ` +
          `Please reduce modification sites.`
        );
      }
    }

    return this.generateFull(pairs, maxSize);
  }

  private estimateCombinations(n: number, k: number): number {
    // C(n,1) + C(n,2) + ... + C(n,k) 계산
    let total = 0;
    for (let i = 1; i <= Math.min(k, n); i++) {
      total += this.binomialCoefficient(n, i);
    }
    return total;
  }

  private binomialCoefficient(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;

    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= (n - i + 1) / i;
    }
    return Math.round(result);
  }
}
```

#### 해결책 2: Generator 패턴 (메모리 효율)

```typescript
// Generator로 한 번에 하나씩 생성
function* generateCombinationsLazy(
  pairs: CrosslinkPair[],
  maxSize: number
): Generator<CrosslinkCombination> {
  for (let size = 1; size <= maxSize; size++) {
    yield* this.generateCombinationsOfSize(pairs, size);
  }
}

// 사용
const generator = generateCombinationsLazy(pairs, 5);
for (const combination of generator) {
  // 필요한 만큼만 소비
  if (results.length >= 1000) break;
  results.push(combination);
}
```

#### 성공 기준
- [ ] 조합 수 사전 검증
- [ ] 최대 조합 수 제한
- [ ] 초과 시 명확한 오류 메시지
- [ ] 대용량 데이터 처리 가능

---

## Phase 2: 구조 개선

> 목표: 코드 중복 제거 및 아키텍처 개선
>
> 기간: 2-3주 (25시간)

### Task 2.1: 베이스 컴포넌트 생성

**예상 시간**: 6시간

#### 파일 구조

```
src/lib/components/base/
├── BaseSelector.svelte
├── BaseCheckboxGroup.svelte
├── BaseRadioGroup.svelte
└── BaseModal.svelte
```

#### BaseSelector.svelte

```svelte
<script lang="ts" generics="T">
  import { createEventDispatcher } from 'svelte';

  export let items: T[];
  export let value: T | T[];
  export let multiple = false;
  export let label = '';
  export let getLabel: (item: T) => string = (item) => String(item);
  export let getValue: (item: T) => any = (item) => item;

  const dispatch = createEventDispatcher<{ change: T | T[] }>();

  function handleChange(newValue: T | T[]) {
    value = newValue;
    dispatch('change', newValue);
  }
</script>

<div class="base-selector">
  {#if label}
    <label class="form-label">{label}</label>
  {/if}

  {#if multiple}
    <div class="checkbox-group">
      {#each items as item}
        <label class="form-check">
          <input
            type="checkbox"
            class="form-check-input"
            value={getValue(item)}
            checked={Array.isArray(value) && value.includes(getValue(item))}
            on:change={() => {
              if (Array.isArray(value)) {
                const val = getValue(item);
                const newValue = value.includes(val)
                  ? value.filter(v => v !== val)
                  : [...value, val];
                handleChange(newValue);
              }
            }}
          />
          <span class="form-check-label">{getLabel(item)}</span>
        </label>
      {/each}
    </div>
  {:else}
    <select
      class="form-select"
      value={getValue(value)}
      on:change={(e) => {
        const selectedValue = items.find(
          item => getValue(item) === e.currentTarget.value
        );
        if (selectedValue) handleChange(selectedValue);
      }}
    >
      {#each items as item}
        <option value={getValue(item)}>
          {getLabel(item)}
        </option>
      {/each}
    </select>
  {/if}
</div>
```

#### 사용 예시

```svelte
<!-- AdductSelector.svelte - 리팩토링 후 -->
<script lang="ts">
  import BaseSelector from '$lib/components/base/BaseSelector.svelte';
  import { getIonTypes } from '$lib/data/ions';

  export let ionType: string;

  const ionTypes = getIonTypes();
</script>

<BaseSelector
  items={ionTypes}
  bind:value={ionType}
  label="Ion Type"
  getLabel={(ion) => ion.displayName}
  getValue={(ion) => ion.value}
  on:change
/>
```

---

### Task 2.2: 중복 코드 통합

**예상 시간**: 6시간

#### weight_calculator.ts 생성

```typescript
// src/lib/utils/weight-calculator.ts
import type { PossibilityLetter } from '$lib/type/Types';
import { aminoAcids } from '$lib/helper/amino_mapper';

export class WeightCalculator {
  /**
   * 서열의 monoisotopic weight 계산
   */
  static calculateMonoisotopic(
    sequence: string | PossibilityLetter[]
  ): number {
    if (typeof sequence === 'string') {
      return this.calculateFromString(sequence);
    } else {
      return this.calculateFromLetters(sequence);
    }
  }

  private static calculateFromString(sequence: string): number {
    let weight = 0;
    for (const char of sequence) {
      const amino = aminoAcids.find((a) => a.oneLetterCode === char);
      weight += amino?.monoisotopicWeight ?? 0;
    }
    return weight;
  }

  private static calculateFromLetters(
    sequence: PossibilityLetter[]
  ): number {
    return sequence.reduce((sum, letter) => {
      const amino = aminoAcids.find(
        (a) => a.oneLetterCode === letter.originalAminoAcid
      );
      return sum + (amino?.monoisotopicWeight ?? 0);
    }, 0);
  }

  /**
   * Molecular weight 계산 (평균 질량)
   */
  static calculateMolecular(
    sequence: string | PossibilityLetter[]
  ): number {
    // 구현
  }

  /**
   * 물 분자 무게 추가
   */
  static addWater(weight: number): number {
    const WATER_WEIGHT = 18.01056;
    return weight + WATER_WEIGHT;
  }

  /**
   * Ion adduct 적용
   */
  static applyAdduct(weight: number, ionType: string): number {
    const ionWeight = getIonWeight(ionType);
    return ionType === 'none' ? weight : weight + ionWeight;
  }
}
```

#### 기존 코드 변경

```typescript
// ❌ Before: mass_finder_helper.ts
static getMonoisotopicWeightSum(sequence: string): number {
  let weight = 0;
  for (const char of sequence) {
    const amino = aminoAcids.find(a => a.oneLetterCode === char);
    weight += amino ? amino.monoisotopicWeight : 0;
  }
  return weight;
}

// ✅ After
import { WeightCalculator } from '$lib/utils/weight-calculator';

static getMonoisotopicWeightSum(sequence: string): number {
  return WeightCalculator.calculateMonoisotopic(sequence);
}
```

---

### Task 2.3: amino_mapper 분리

**예상 시간**: 4시간

#### 목표 구조

```
src/lib/data/
├── amino-acids.ts        (아미노산 데이터)
├── codons.ts             (코돈 테이블)
├── ions.ts               (이온 타입)
└── index.ts              (통합 export)
```

#### amino-acids.ts

```typescript
// src/lib/data/amino-acids.ts
export interface AminoAcid {
  oneLetterCode: string;
  threeLetterCode: string;
  name: string;
  monoisotopicWeight: number;
  molecularWeight: number;
}

export const AMINO_ACIDS: readonly AminoAcid[] = [
  {
    oneLetterCode: 'G',
    threeLetterCode: 'Gly',
    name: 'Glycine',
    monoisotopicWeight: 57.02146,
    molecularWeight: 57.05,
  },
  // ... 나머지 19개
] as const;

export function getAminoAcid(code: string): AminoAcid | undefined {
  return AMINO_ACIDS.find(
    (aa) => aa.oneLetterCode === code || aa.threeLetterCode === code
  );
}

export function shortToLong(short: string): string {
  return getAminoAcid(short)?.threeLetterCode ?? short;
}
```

#### codons.ts

```typescript
// src/lib/data/codons.ts
export interface CodonTable {
  [codon: string]: string;
}

export const RNA_CODON_TABLE: Readonly<CodonTable> = {
  UUU: 'F', UUC: 'F',
  // ... 전체 64개 코돈
} as const;

export const DNA_CODON_TABLE: Readonly<CodonTable> = {
  TTT: 'F', TTC: 'F',
  // ... 전체 64개 코돈
} as const;

export function translateCodon(
  codon: string,
  type: 'RNA' | 'DNA' = 'RNA'
): string | undefined {
  const table = type === 'RNA' ? RNA_CODON_TABLE : DNA_CODON_TABLE;
  return table[codon.toUpperCase()];
}
```

#### ions.ts

```typescript
// src/lib/data/ions.ts
export interface IonType {
  value: string;
  displayName: string;
  weight: number;
  charge: number;
}

export const ION_TYPES: readonly IonType[] = [
  { value: 'none', displayName: 'None', weight: 0, charge: 0 },
  { value: 'H+', displayName: 'H⁺', weight: 1.00728, charge: 1 },
  { value: 'Na+', displayName: 'Na⁺', weight: 22.98977, charge: 1 },
  // ... 나머지
] as const;

export function getIonWeight(ionType: string): number {
  return ION_TYPES.find((ion) => ion.value === ionType)?.weight ?? 0;
}

export function getIonTypes(): readonly IonType[] {
  return ION_TYPES;
}
```

---

### Task 2.4: 성능 최적화

**예상 시간**: 6시간

#### 루프 최적화

```typescript
// ❌ Before: 루프 내부에서 반복 계산
for (const ionType of ionTypes) {
  for (const nTerm of nTermMods) {
    for (const cTerm of cTermMods) {
      const adductWeight = getIonWeight(ionType);  // 매번 계산!
    }
  }
}

// ✅ After: 사전 계산
const ionWeights = new Map(
  ionTypes.map(type => [type, getIonWeight(type)])
);

for (const ionType of ionTypes) {
  const adductWeight = ionWeights.get(ionType)!;  // O(1) 조회
  for (const nTerm of nTermMods) {
    for (const cTerm of cTermMods) {
      // adductWeight 사용
    }
  }
}
```

#### Svelte 반응성 최적화

```svelte
<!-- ❌ Before: 키 입력마다 정렬 -->
<script>
  $: filteredData = data
    .filter(item => item.name.includes(searchTerm))
    .sort((a, b) => a.weight - b.weight);
</script>

<input bind:value={searchTerm} />

<!-- ✅ After: Debounce 적용 -->
<script>
  import { debounce } from '$lib/utils/debounce';

  let searchTerm = '';
  let debouncedTerm = '';

  const updateSearch = debounce((value: string) => {
    debouncedTerm = value;
  }, 300);

  $: updateSearch(searchTerm);

  $: filteredData = data
    .filter(item => item.name.includes(debouncedTerm))
    .sort((a, b) => a.weight - b.weight);
</script>
```

#### 메모이제이션

```typescript
// src/lib/utils/memoize.ts
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options?: { maxSize?: number }
): T {
  const cache = new Map<string, ReturnType<T>>();
  const maxSize = options?.maxSize ?? 1000;

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key)!;
    }

    const result = fn(...args);

    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    cache.set(key, result);
    return result;
  }) as T;
}

// 사용
const calculateSimilarity = memoize(
  (seq1: string, seq2: string): number => {
    // 복잡한 계산
  },
  { maxSize: 500 }
);
```

---

### Task 2.5: 접근성 개선

**예상 시간**: 3시간

#### ARIA 라벨 추가

```svelte
<!-- ❌ Before -->
<button on:click={downloadExcel}>
  Download
</button>

<!-- ✅ After -->
<button
  on:click={downloadExcel}
  aria-label="Download calculation results as Excel file"
>
  <svg aria-hidden="true">...</svg>
  Download Excel
</button>
```

#### 키보드 네비게이션

```svelte
<!-- ❌ Before: 클릭만 가능 -->
<div on:click={handleSelect} class="selectable-item">
  {item.name}
</div>

<!-- ✅ After: 키보드 지원 -->
<div
  role="button"
  tabindex="0"
  on:click={handleSelect}
  on:keydown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect();
    }
  }}
  class="selectable-item"
>
  {item.name}
</div>
```

#### 색상 + 아이콘 조합

```svelte
<!-- ❌ Before: 색상만 -->
<span class="badge bg-danger">High</span>

<!-- ✅ After: 아이콘 + 색상 -->
<span class="badge bg-danger">
  <svg aria-label="Warning" role="img">
    <use href="#icon-warning" />
  </svg>
  High
</span>
```

---

## Phase 3: 품질 향상

> 목표: 테스트 커버리지 확보 및 문서화
>
> 기간: 3-5주 (70시간)

### Task 3.1: 테스트 인프라 구축

**예상 시간**: 12시간

#### Vitest 설정

```bash
npm install -D vitest @vitest/ui @testing-library/svelte
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte({ hot: !process.env.VITEST })],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
    },
  },
});
```

#### 테스트 유틸리티

```typescript
// src/test/utils/test-helpers.ts
export function createMockAminoAcid(
  overrides?: Partial<AminoAcid>
): AminoAcid {
  return {
    oneLetterCode: 'A',
    threeLetterCode: 'Ala',
    name: 'Alanine',
    monoisotopicWeight: 71.03711,
    molecularWeight: 71.08,
    ...overrides,
  };
}

export function createMockPossibility(
  overrides?: Partial<Possibility>
): Possibility {
  return {
    sequence: [],
    monoisotopicWeight: 0,
    molecularWeight: 0,
    reasons: [],
    ...overrides,
  };
}
```

---

### Task 3.2: 단위 테스트 작성

**예상 시간**: 40시간

#### weight-calculator.test.ts

```typescript
// src/lib/utils/__tests__/weight-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { WeightCalculator } from '../weight-calculator';

describe('WeightCalculator', () => {
  describe('calculateMonoisotopic', () => {
    it('should calculate weight from string sequence', () => {
      const weight = WeightCalculator.calculateMonoisotopic('GAL');
      expect(weight).toBeCloseTo(245.12, 2);
    });

    it('should handle empty sequence', () => {
      const weight = WeightCalculator.calculateMonoisotopic('');
      expect(weight).toBe(0);
    });

    it('should ignore unknown amino acids', () => {
      const weight = WeightCalculator.calculateMonoisotopic('AXB');
      // X, B는 표준 아미노산이 아니므로 A만 계산
      expect(weight).toBeCloseTo(71.03711, 2);
    });
  });

  describe('applyAdduct', () => {
    it('should add H+ adduct weight', () => {
      const weight = WeightCalculator.applyAdduct(1000, 'H+');
      expect(weight).toBeCloseTo(1001.00728, 5);
    });

    it('should not change weight for "none" adduct', () => {
      const weight = WeightCalculator.applyAdduct(1000, 'none');
      expect(weight).toBe(1000);
    });
  });
});
```

#### sequence-generator.test.ts

```typescript
// src/lib/services/stm/__tests__/sequence-generator.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { SequenceGenerator } from '../sequence-generator';

describe('SequenceGenerator', () => {
  let generator: SequenceGenerator;

  beforeEach(() => {
    generator = new SequenceGenerator();
  });

  it('should generate possibilities from RNA sequence', () => {
    const result = generator.generate({
      rnaSeq: 'AUGUUU',  // Met-Phe
      ncAAMap: {},
      codonTitles: {},
      selectedAminos: new Set(['M', 'F']),
    });

    expect(result).toHaveLength(1);
    expect(result[0].sequence).toHaveLength(2);
  });

  it('should handle truncation', () => {
    const result = generator.generate({
      rnaSeq: 'AUGUUUUGA',  // Met-Phe-Stop
      ncAAMap: {},
      codonTitles: {},
      selectedAminos: new Set(['M', 'F']),
    });

    // Truncation: MF, M
    expect(result.length).toBeGreaterThan(1);
  });

  it('should incorporate ncAA', () => {
    const result = generator.generate({
      rnaSeq: 'AUGAAA',  // Met-Lys
      ncAAMap: {
        'AAA': {
          aminoAcid: 'K',
          structure: '...',
          weight: 146.1,
          codons: ['AAA'],
          structureTitle: 'ncLys',
        },
      },
      codonTitles: {
        'AAA': ['natural', 'ncAA'],
      },
      selectedAminos: new Set(['M', 'K']),
    });

    // Natural K + ncAA K 두 가지 가능성
    expect(result.length).toBeGreaterThan(1);
  });

  it('should clear cache', () => {
    generator.generate({
      rnaSeq: 'AUG',
      ncAAMap: {},
      codonTitles: {},
      selectedAminos: new Set(['M']),
    });

    // Cache가 생성됨
    // @ts-ignore - private 접근
    expect(generator.memo.size).toBeGreaterThan(0);

    generator.clearCache();

    // @ts-ignore
    expect(generator.memo.size).toBe(0);
  });
});
```

#### simulated-annealing.test.ts

```typescript
// src/lib/services/mass-finder/__tests__/simulated-annealing.test.ts
import { describe, it, expect } from 'vitest';
import { MassFinderService } from '../mass-finder.service';

describe('MassFinderService - Simulated Annealing', () => {
  it('should find exact match', () => {
    const service = new MassFinderService({
      formyType: 'unknown',
      ionType: 'H+',
      topSolutionsCount: 10,
      initialTemperature: 10000,
      coolingRate: 0.99,
      iterations: 100,
    });

    // GAL = Gly(75.03) + Ala(89.05) + Leu(131.09) = 295.17
    const results = service.calculate(
      295.17,
      new Set(['G', 'A', 'L'])
    );

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].code).toBe('GAL');
    expect(results[0].monoisotopicWeight).toBeCloseTo(295.17, 1);
  });

  it('should respect formylation setting', () => {
    const withFormyl = new MassFinderService({
      formyType: 'on',
      ionType: 'H+',
      // ... 나머지 설정
    });

    const withoutFormyl = new MassFinderService({
      formyType: 'off',
      ionType: 'H+',
      // ... 나머지 설정
    });

    const results1 = withFormyl.calculate(1000, new Set(['G', 'A']));
    const results2 = withoutFormyl.calculate(1000, new Set(['G', 'A']));

    // Formylation이 켜져 있으면 질량 차이 발생
    expect(results1[0].monoisotopicWeight).not.toBe(
      results2[0].monoisotopicWeight
    );
  });

  it('should use reference sequence when provided', () => {
    const service = new MassFinderService({
      formyType: 'unknown',
      ionType: 'H+',
      topSolutionsCount: 10,
      initialTemperature: 10000,
      coolingRate: 0.99,
      iterations: 100,
    });

    const results = service.calculate(
      500,
      new Set(['G', 'A', 'L', 'V']),
      'GALV'  // 참조 서열
    );

    // 참조 서열과 유사한 결과가 상위에 와야 함
    expect(results[0].code).toContain('G');
    expect(results[0].code).toContain('A');
  });
});
```

#### Svelte 컴포넌트 테스트

```typescript
// src/lib/components/__tests__/AdductSelector.test.ts
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import AdductSelector from '../AdductSelector.svelte';

describe('AdductSelector', () => {
  it('should render all ion types', () => {
    const { container } = render(AdductSelector, {
      props: { ionType: 'H+' },
    });

    const select = container.querySelector('select');
    expect(select?.options.length).toBeGreaterThan(0);
  });

  it('should emit change event on selection', async () => {
    const { container, component } = render(AdductSelector, {
      props: { ionType: 'H+' },
    });

    const select = container.querySelector('select')!;

    let emittedValue: string | undefined;
    component.$on('change', (event) => {
      emittedValue = event.detail;
    });

    await fireEvent.change(select, { target: { value: 'Na+' } });

    expect(emittedValue).toBe('Na+');
  });

  it('should update bound value', async () => {
    const { container, component } = render(AdductSelector, {
      props: { ionType: 'H+' },
    });

    const select = container.querySelector('select')!;
    await fireEvent.change(select, { target: { value: 'K+' } });

    expect(component.ionType).toBe('K+');
  });
});
```

---

### Task 3.3: JSDoc 문서화

**예상 시간**: 12시간

#### 모범 사례

```typescript
/**
 * RNA 서열에서 가능한 모든 아미노산 서열을 생성합니다.
 *
 * 이 함수는 다음 생물학적 현상을 모델링합니다:
 * - ncAA (Non-canonical Amino Acid) 통합
 * - Truncation (조기 종결)
 * - Codon skipping (코돈 건너뛰기)
 * - Disulfide bond 형성 (C-C 결합)
 *
 * @param input - 서열 생성에 필요한 입력 데이터
 * @param input.rnaSeq - RNA 서열 (3의 배수 길이)
 * @param input.ncAAMap - ncAA 정의 맵 (코돈 → ncAA 정보)
 * @param input.codonTitles - 각 코돈에 대한 선택 가능한 옵션
 * @param input.selectedAminos - 사용 가능한 아미노산 집합
 *
 * @returns 생성된 모든 가능한 서열 배열
 *
 * @throws {Error} RNA 서열 길이가 3의 배수가 아닐 때
 *
 * @example
 * ```typescript
 * const generator = new SequenceGenerator();
 * const results = generator.generate({
 *   rnaSeq: 'AUGUUUUGA',
 *   ncAAMap: {},
 *   codonTitles: {},
 *   selectedAminos: new Set(['M', 'F'])
 * });
 * // Returns: [
 * //   { sequence: ['M', 'F'], ... },  // Full sequence
 * //   { sequence: ['M'], ... }         // Truncated
 * // ]
 * ```
 *
 * @remarks
 * - 재귀 알고리즘 사용으로 긴 서열에서 성능 저하 가능
 * - 메모이제이션을 통해 중복 계산 방지
 * - clearCache()로 메모리 관리 필요
 *
 * @see {@link https://docs.example.com/sequence-generation | Sequence Generation Guide}
 */
export generate(input: SequenceGeneratorInput): Possibility[] {
  // 구현
}
```

#### 타입 문서화

```typescript
/**
 * 단일 사이트 변형 정의
 *
 * 단일 아미노산에 적용되는 post-translational modification을 나타냅니다.
 *
 * @interface
 */
export interface SingleSiteModification {
  /**
   * 변형 타입 식별자
   * @readonly
   */
  type: 'single-site';

  /**
   * 변형 이름 (예: "Phosphorylation", "Methylation")
   */
  name: string;

  /**
   * 변형이 적용 가능한 아미노산 목록
   * @example ['S', 'T', 'Y'] // Serine, Threonine, Tyrosine
   */
  targetAminoAcids: string[];

  /**
   * 변형으로 인한 질량 변화 (Da)
   * @remarks 양수는 질량 증가, 음수는 감소를 의미
   * @example 79.966331 // Phosphorylation (+HPO3)
   */
  deltaWeight: number;

  /**
   * 변형 사이트 간 최소 거리 (residue 단위)
   * @default 0
   */
  distance: number;
}
```

---

### Task 3.4: 에러 처리 개선

**예상 시간**: 6시간

#### 커스텀 에러 클래스

```typescript
// src/lib/errors/calculation-errors.ts
export class CalculationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CalculationError';
  }
}

export class ValidationError extends CalculationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class CombinationOverflowError extends CalculationError {
  constructor(
    estimatedCount: number,
    maxAllowed: number
  ) {
    super(
      `Too many combinations: ${estimatedCount} exceeds limit of ${maxAllowed}`,
      'COMBINATION_OVERFLOW',
      { estimatedCount, maxAllowed }
    );
    this.name = 'CombinationOverflowError';
  }
}
```

#### 에러 핸들링

```typescript
// src/lib/services/stm/crosslinking-engine.ts
export class CrosslinkingEngine {
  generateCombinations(
    pairs: CrosslinkPair[],
    maxSize: number = 5
  ): CrosslinkCombination[] {
    const estimated = this.estimateCombinations(pairs.length, maxSize);

    if (estimated > MAX_COMBINATIONS) {
      throw new CombinationOverflowError(estimated, MAX_COMBINATIONS);
    }

    try {
      return this.generateFull(pairs, maxSize);
    } catch (error) {
      if (error instanceof RangeError) {
        throw new CalculationError(
          'Memory limit exceeded during combination generation',
          'MEMORY_OVERFLOW',
          { pairCount: pairs.length, maxSize }
        );
      }
      throw error;
    }
  }
}
```

#### UI 에러 표시

```svelte
<!-- src/lib/components/ErrorNotification.svelte -->
<script lang="ts">
  import type { CalculationError } from '$lib/errors/calculation-errors';

  export let error: CalculationError | Error | null = null;
  export let onDismiss: () => void;

  function getErrorMessage(err: Error): string {
    if (err instanceof CombinationOverflowError) {
      return `조합 수가 너무 많습니다. 변형 사이트를 ${err.details.maxAllowed / 2} 개 이하로 줄여주세요.`;
    }
    if (err instanceof ValidationError) {
      return `입력 검증 실패: ${err.message}`;
    }
    return err.message;
  }

  function getRecoveryAction(err: Error): string | null {
    if (err instanceof CombinationOverflowError) {
      return '변형 사이트 수를 줄이거나 maxSize 파라미터를 감소시켜 주세요.';
    }
    return null;
  }
</script>

{#if error}
  <div class="alert alert-danger" role="alert">
    <div class="d-flex align-items-start">
      <svg class="bi bi-exclamation-triangle me-2" aria-label="Error">
        <!-- SVG icon -->
      </svg>
      <div class="flex-grow-1">
        <h6 class="alert-heading">오류 발생</h6>
        <p>{getErrorMessage(error)}</p>
        {#if getRecoveryAction(error)}
          <hr />
          <p class="mb-0 small">
            <strong>해결 방법:</strong>
            {getRecoveryAction(error)}
          </p>
        {/if}
      </div>
      <button
        type="button"
        class="btn-close"
        aria-label="Close"
        on:click={onDismiss}
      ></button>
    </div>
  </div>
{/if}
```

---

### Task 3.5: SvelteKit 기능 활용

**예상 시간**: 8시간

#### +layout.js 데이터 로딩

```typescript
// src/routes/+layout.js
import { AMINO_ACIDS } from '$lib/data/amino-acids';
import { ION_TYPES } from '$lib/data/ions';

export const load = async () => {
  return {
    aminoAcids: AMINO_ACIDS,
    ionTypes: ION_TYPES,
    appVersion: '2.0.0',
  };
};
```

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  export let data;

  // 모든 페이지에서 접근 가능
  $: ({ aminoAcids, ionTypes, appVersion } = data);
</script>
```

#### +error.svelte 추가

```svelte
<!-- src/routes/+error.svelte -->
<script lang="ts">
  import { page } from '$app/stores';

  $: error = $page.error;
  $: status = $page.status;
</script>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-6 text-center">
      <h1 class="display-1">{status}</h1>
      <p class="lead">
        {#if status === 404}
          페이지를 찾을 수 없습니다
        {:else if status === 500}
          서버 오류가 발생했습니다
        {:else}
          오류가 발생했습니다
        {/if}
      </p>
      {#if error?.message}
        <p class="text-muted">{error.message}</p>
      {/if}
      <a href="/" class="btn btn-primary mt-3">홈으로 돌아가기</a>
    </div>
  </div>
</div>
```

#### +page.server.ts 추가 (선택사항)

```typescript
// src/routes/mts/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  // 서버 사이드에서만 실행
  // 예: 데이터베이스 조회, API 호출 등

  return {
    defaultConfig: {
      formyType: 'unknown',
      ionType: 'H+',
      saMode: 'normal',
    },
  };
};
```

---

### Task 3.6: 보안 강화

**예상 시간**: 4시간

#### CSP 헤더 설정

```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
    csp: {
      mode: 'auto',
      directives: {
        'default-src': ['self'],
        'script-src': ['self', 'unsafe-inline'],  // ChemDoodle 때문에 필요
        'style-src': ['self', 'unsafe-inline'],
        'img-src': ['self', 'data:', 'https:'],
        'font-src': ['self'],
        'connect-src': ['self'],
        'worker-src': ['self', 'blob:'],  // Web Worker
      },
    },
  },
};

export default config;
```

#### 입력 Sanitization

```typescript
// src/lib/utils/sanitize.ts
export function sanitizeFilename(filename: string): string {
  // 파일명에서 위험한 문자 제거
  return filename
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 255);  // 파일명 길이 제한
}

export function sanitizeRnaSequence(sequence: string): string {
  // RNA 서열에서 허용된 문자만 유지
  return sequence
    .toUpperCase()
    .replace(/[^AUGC]/g, '');
}

export function sanitizeNumericInput(
  input: string,
  min?: number,
  max?: number
): number | null {
  const num = parseFloat(input);

  if (isNaN(num)) return null;
  if (min !== undefined && num < min) return min;
  if (max !== undefined && num > max) return max;

  return num;
}
```

#### 사용 예시

```svelte
<script lang="ts">
  import { sanitizeFilename, sanitizeRnaSequence } from '$lib/utils/sanitize';

  let rnaInput = '';
  let filename = '';

  $: sanitizedRna = sanitizeRnaSequence(rnaInput);

  function handleDownload() {
    const safeName = sanitizeFilename(filename || 'results');
    downloadFile(`${safeName}.csv`, data);
  }
</script>

<input
  type="text"
  bind:value={rnaInput}
  placeholder="Enter RNA sequence"
/>
<p>Sanitized: {sanitizedRna}</p>
```

---

## 실행 체크리스트

### Week 1: Quick Wins

- [ ] Task 1.1: 프로덕션 로그 제거 (2h)
- [ ] Task 1.2: 주석 코드 제거 (1h)
- [ ] Task 1.3: 매직 넘버 추출 (4h)
- [ ] Task 1.4: Logger 유틸리티 (2h)
- [ ] Task 1.8: localStorage 래퍼 (3h)

**총 12시간 / 38시간 완료**

### Week 2: Strategic Tasks

- [ ] Task 1.5: stm_helper 분리 (16h)
  - [ ] Step 1: 인터페이스 정의
  - [ ] Step 2: sequence-generator 추출
  - [ ] Step 3: modification-applier 추출
  - [ ] Step 4: crosslinking-engine 추출
  - [ ] Step 5: deduplicator 추출
  - [ ] Step 6: 통합 및 테스트

**총 28시간 / 38시간 완료**

### Week 3: Type Safety & Performance

- [ ] Task 1.6: 타입 안전성 개선 (8h)
  - [ ] Step 1: 타입 정의
  - [ ] Step 2: Helper 파일 적용
  - [ ] Step 3: Svelte 컴포넌트 적용
- [ ] Task 1.7: 정적 상태 제거 (4h)
- [ ] Task 1.9: 조합 폭발 방지 (6h)

**Phase 1 완료 (38시간)**

### Week 4-5: Refactoring

- [ ] Task 2.1: 베이스 컴포넌트 (6h)
- [ ] Task 2.2: 중복 코드 통합 (6h)
- [ ] Task 2.3: amino_mapper 분리 (4h)
- [ ] Task 2.4: 성능 최적화 (6h)
- [ ] Task 2.5: 접근성 개선 (3h)

**Phase 2 완료 (25시간)**

### Week 6-10: Testing & Documentation

- [ ] Task 3.1: 테스트 인프라 (12h)
- [ ] Task 3.2: 단위 테스트 작성 (40h)
  - [ ] Utils 테스트 (8h)
  - [ ] Services 테스트 (16h)
  - [ ] Components 테스트 (16h)
- [ ] Task 3.3: JSDoc 문서화 (12h)
- [ ] Task 3.4: 에러 처리 개선 (6h)
- [ ] Task 3.5: SvelteKit 기능 (8h)
- [ ] Task 3.6: 보안 강화 (4h)

**Phase 3 완료 (70시간)**

---

## 성공 지표

### 코드 품질

| 지표 | 시작 | 목표 | 현재 |
|------|------|------|------|
| 평균 파일 크기 | 290 LOC | < 200 LOC | - |
| 최대 파일 크기 | 954 LOC | < 300 LOC | - |
| `any` 타입 | 25개 | 0개 | - |
| 주석 코드 | 275 LOC | 0 LOC | - |
| 매직 넘버 | 15+ | 0 | - |

### 테스트

| 지표 | 시작 | 목표 | 현재 |
|------|------|------|------|
| 테스트 커버리지 | 0% | > 70% | - |
| 단위 테스트 수 | 0 | > 100 | - |
| E2E 테스트 | 0 | > 10 | - |

### 성능

| 지표 | 시작 (추정) | 목표 | 현재 |
|------|-------------|------|------|
| MTS 계산 | 2.5s | < 2s | - |
| STM 생성 | 5s | < 3s | - |
| 번들 크기 | 450KB | < 350KB | - |

### 접근성

| 지표 | 시작 | 목표 | 현재 |
|------|------|------|------|
| ARIA 라벨 | 10% | 100% | - |
| 키보드 네비게이션 | 30% | 100% | - |
| Lighthouse 점수 | 62 | > 90 | - |

---

## 다음 단계

이 플랜을 완료한 후:

1. **성능 모니터링 설정**
   - Sentry 또는 유사 도구 통합
   - 실시간 에러 추적
   - 성능 메트릭 수집

2. **CI/CD 파이프라인 구축**
   - GitHub Actions 설정
   - 자동 테스트 실행
   - 자동 배포

3. **사용자 피드백 수집**
   - Analytics 통합
   - 사용자 행동 분석
   - A/B 테스트

4. **확장 기능 개발**
   - 결과 공유 기능
   - 계산 히스토리
   - 사용자 설정 저장

---

**작성일**: 2025-12-07
**최종 업데이트**: -
**담당자**: Development Team
**상태**: 📋 Ready to Start
