# STM (Sequence to Mass) 페이지 기능 명세서

## 개요
STM 페이지는 입력된 RNA 시퀀스를 기반으로 다양한 생물학적 변이 가능성을 계산하고, 각 변이에 따른 분자량을 예측하는 시스템입니다.

## 핵심 기능

### 1. RNA 시퀀스 입력 및 처리
- **파일**: `src/routes/stm/+page.svelte:15`
- **변수**: `rnaSeq` - 사용자가 입력한 RNA 시퀀스
- **입력 조건**:
  - 길이가 3의 배수여야 함 (코돈 단위)
  - 유효한 RNA 염기(A, U, G, C)만 허용
  - Stop 코돈(UAG, UAA, UGA) 이전까지만 처리
- **검증 규칙**:
  - 빈 시퀀스 불허
  - 유효하지 않은 문자("?") 검사
  - 3의 배수 길이 확인

### 2. 변이 타입 정의

#### A. Non-canonical Amino Acid (ncAA) 관련 변이
**파일**: `src/lib/helper/stm_helper.ts:49-78`

**지원 변이 타입**:
1. **Full incorporation**: ncAA로 완전 대체
   - 해당 코돈이 지정된 ncAA로 번역
   - ncAA의 monoisotopic weight 적용
   
2. **reinitiation**: 앞쪽 절단으로 인한 부분 시퀀스
   - ncAA 위치부터 시작하는 시퀀스 생성
   - N-말단 부재로 Formylation 불가능
   
3. **Premature termination**: 뒤쪽 절단으로 인한 부분 시퀀스
   - ncAA 위치까지의 시퀀스 생성 (ncAA 포함)
   - C-말단 부재로 Admidation 불가능
   
4. **Skipping**: 해당 코돈 건너뛰기
   - 해당 위치에 아미노산이 삽입되지 않음
   - 시퀀스 길이 단축

#### B. 자연 아미노산 처리
**파일**: `src/lib/helper/stm_helper.ts:43-47`
- 표준 20개 아미노산으로의 정상 번역
- 사용자 선택 가능한 아미노산 부분집합 적용
- 표준 monoisotopic weight 사용

#### C. Disulfide Bond 형성
**파일**: `src/lib/helper/stm_helper.ts:329-402`
- **조건**: 시스테인(C) 2개 이상 존재 시
- **계산**: 가능한 모든 C-C 결합 조합
- **질량 변화**: 각 결합당 -2.02 Da
- **알고리즘**: 재귀적 페어링 조합 생성

#### D. Formylation (N-말단 포밀화) [BUILT-IN MODIFICATION]
**상태**: 이 기능은 **Potential Modification System의 기본 내장 수식**으로 제공됩니다.

**자동 제공 방식**:
- **파일**: `src/lib/components/stm/PotentialModificationDialog.svelte:12-24`
- PotentialModificationDialog를 열면 **Formylation이 자동으로 첫 번째 항목에 표시**됨
- 사용자가 별도로 생성하거나 저장할 필요 없음
- 스토리지에 저장되지 않으며, 매번 자동으로 생성됨

**기본 설정**:
```typescript
{
  name: 'Formylation',
  type: 'Single-site',
  condition: 'N-terminus',
  target: 'ALL',
  molecularFormula: '-',
  monoisotopicWeight: '27.99',
  molecularWeight: '29.02',
  structureName: 'f'
}
```

**사용 방법**:
1. **STM** 페이지에서 **Potential Modification** 선택 버튼 클릭
2. 다이얼로그에서 **Formylation** 항목을 선택 (항상 첫 번째에 위치)
3. 자동으로 N-terminus에 적용됨

**적용 조건**:
- N-말단이 존재하는 시퀀스 (reinitiation이 아닌 경우)
- Target이 ALL이므로 모든 첫 번째 아미노산에 적용 가능

**장점**:
- 사용자가 별도 설정 없이 즉시 사용 가능
- 다른 사용자 정의 Potential Modifications와 함께 조합 가능
- Power set 생성 시 Formylation 포함/미포함 모든 경우의 수 자동 계산

#### E. Admidation (C-말단 아미드화) [DEPRECATED]
**상태**: 이 기능은 현재 코드베이스에서 제거되었습니다.

**기존 기능 정의** (참고용):
- **질량 변화**: -0.98 Da
- **표시**: 시퀀스 끝에 소문자 'n' 추가
- **적용 조건**: C-말단 존재 시
- **참고**: AdmidationSelector 컴포넌트 및 관련 로직이 제거됨

### 2.5. Potential Modification System

**개요**: 사용자 정의 화학 수식(modification)을 아미노산 시퀀스에 적용하는 시스템입니다. 단일 아미노산 수식(Single-site)과 두 아미노산 간 결합(Crosslinking) 두 가지 타입을 지원합니다.

#### A. Single-site Modifications
**파일**: `src/lib/helper/stm_helper.ts:473-571`, `src/routes/potential/+page.svelte`

**수식 적용 위치**:
1. **N-terminus** (N-말단):
   - **개념**: 아미노산을 대체하지 않고 앞에 수식을 **추가**
   - **예시**: `MCCCRRC` + N-terminus `f` (target: M) → `fMCCCRRC`
   - **질량 계산**: `최종 질량 = 원래 질량 + 수식 질량`
   - **표시**: 수식명 + 아미노산 (예: `fM`)
   - **조합 생성**: 선택된 모든 N-terminus 수식의 power set 생성 (0개, 1개, 2개, ... 모두 적용)

2. **C-terminus** (C-말단):
   - **개념**: 아미노산을 대체하지 않고 뒤에 수식을 **추가**
   - **예시**: `MCCCRRC` + C-terminus `n` (target: C) → `MCCCRRCn`
   - **질량 계산**: `최종 질량 = 원래 질량 + 수식 질량`
   - **표시**: 아미노산 + 수식명 (예: `Cn`)
   - **조합 생성**: 선택된 모든 C-terminus 수식의 power set 생성 (0개, 1개, 2개, ... 모두 적용)

3. **Side Chain** (측쇄):
   - **개념**: 타겟 아미노산을 수식으로 **완전 대체**
   - **예시**: `MCCCRRC` + Side Chain `d1` (target: C) → `Md1CCRRC`
   - **질량 계산**: `최종 질량 = 원래 질량 - 타겟 질량 + 수식 질량`
   - **표시**: 수식명만 (예: `d1`)
   - **조합 생성**: 재귀적으로 0개, 1개, 2개, ... N개 적용 가능성 생성

**적용 조건**:
- 타겟 아미노산이 시퀀스에 존재해야 함
- ALL 옵션: 모든 타겟 위치에 적용
- 각 수식은 LocalStorage에 저장된 사용자 정의 데이터 사용

**Power Set 조합 생성 (N-terminus & C-terminus)**:
**파일**: `src/lib/helper/stm_helper.ts:245-248, 400-409`

사용자가 최대 4개의 Potential Modifications를 선택할 수 있으며, **조건이 맞더라도 모든 경우의 수가 자동으로 계산됩니다**:
- 0개 적용 (아무것도 적용 안됨)
- 1개만 적용
- 2개만 적용
- 3개만 적용
- 4개 모두 적용

시스템은 선택된 수식들의 **모든 가능한 조합(Power Set)**을 자동으로 생성합니다:

**예시 1**: N-terminus 수식 2개 선택 (f1, f2)
- 생성되는 조합: `[]` (0개), `[f1]`, `[f2]`, `[f1, f2]`
- 총 **4가지** 가능성 생성 (2²)

**예시 2**: N-terminus 2개 (f1, f2) + C-terminus 2개 (n1, n2) 선택
- N-terminus 조합: 4가지 (2²)
- C-terminus 조합: 4가지 (2²)
- 총 **16가지** 가능성 생성 (4 × 4)

**예시 3**: N-terminus 1개 (f1) + C-terminus 3개 (n1, n2, n3) 선택
- N-terminus 조합: 2가지 (2¹)
- C-terminus 조합: 8가지 (2³)
- 총 **16가지** 가능성 생성 (2 × 8)

**예시 4**: N-terminus 4개 선택 시
- 총 **16가지** 조합 (2⁴)
- 0개 적용: 1가지
- 1개 적용: 4가지
- 2개 적용: 6가지
- 3개 적용: 4가지
- 4개 적용: 1가지

**알고리즘**:
```typescript
// Power set 생성 함수
private static generatePowerSet<T>(array: T[]): T[][] {
    const result: T[][] = [[]];  // 빈 조합부터 시작
    for (const item of array) {
        const length = result.length;
        for (let i = 0; i < length; i++) {
            result.push([...result[i], item]);
        }
    }
    return result;
}

// N-terminus와 C-terminus의 모든 조합 생성
const nTerminusSubsets = generatePowerSet(nTerminusMods);
const cTerminusSubsets = generatePowerSet(cTerminusMods);

for (const nSubset of nTerminusSubsets) {
    for (const cSubset of cTerminusSubsets) {
        // 현재 조합만 적용한 possibility 생성
    }
}
```

**핵심 원리**:
- 사용자가 4개를 선택해도, 실제로 조건에 맞지 않으면 0개 적용된 결과도 포함
- 조건에 맞으면 1개, 2개, 3개, 4개 적용된 모든 경우가 결과에 포함
- 각 조합은 별도의 possibility로 생성되어 결과 테이블에 표시

**참고**: Side Chain modifications는 별도의 재귀 알고리즘을 사용하여 0개부터 N개까지 모든 적용 개수를 생성합니다 (applySideChainRecursive 함수).

**저장 데이터 구조**:
```javascript
{
  name: 'modification_name',
  type: 'Single-site',
  target: 'M',  // 또는 'ALL'
  condition: 'N-terminus' | 'C-terminus' | 'Side Chain',
  structureName: 'structure_name',
  moleculeJson: {...},  // ChemDoodle JSON
  molecularFormula: 'C6H12N2O',
  monoisotopicWeight: '144.10111',  // Delta 또는 absolute
  molecularWeight: '144.17280'      // Delta 또는 absolute
}
```

**질량 저장 방식**:
- **N-terminus/C-terminus**: Delta 값 저장 (ChemDoodle 값 - 타겟 아미노산 질량)
- **Side Chain**: Absolute 값 저장 (ChemDoodle 값 그대로)

#### B. Crosslinking Modifications
**파일**: `src/lib/helper/stm_helper.ts:573-706`, `src/routes/potential/+page.svelte`

**수식 적용 조건**:
1. **EVERYWHERE**: 두 타겟 아미노산이 시퀀스에 존재하기만 하면 적용
2. **DISTANCE**: 두 타겟 간 거리가 특정 조건을 만족할 때만 적용
   - 연산자: `>`, `<`, `=`
   - 거리 값: 정수 (최소 1)

**적용 알고리즘**:
```typescript
// 타겟1과 타겟2의 모든 위치 조합에서 crosslinking 가능성 검사
for (let i = 0; i < sequence.length; i++) {
  if (sequence[i] === target1) {
    for (let j = 0; j < sequence.length; j++) {
      if (sequence[j] === target2 && i !== j) {
        // 거리 조건 확인
        const distance = Math.abs(i - j);
        if (checkDistanceCondition(distance, operator, value)) {
          // Crosslinking 적용
        }
      }
    }
  }
}
```

**질량 계산**:
```javascript
// 두 아미노산을 수식으로 대체
최종 질량 = 원래 질량 - 타겟1 질량 - 타겟2 질량 + 수식 질량
```

**표시**:
- 수식명만 표시 (두 아미노산 모두 수식명으로 대체)
- 예시: `MCCCRRC` + Crosslinking `XL` (C-C) → `MXLCRRC`

**저장 데이터 구조**:
```javascript
{
  name: 'crosslink_name',
  type: 'Crosslinking',
  target1: 'C',
  target2: 'C',
  condition: 'EVERYWHERE' | 'DISTANCE',
  distanceOperator: '>' | '<' | '=',  // DISTANCE인 경우에만
  distanceValue: 5,                    // DISTANCE인 경우에만
  structureName: 'structure_name',
  moleculeJson: {...},
  molecularFormula: 'C6H8N2O2S2',
  monoisotopicWeight: '204.00271',  // Absolute 값
  molecularWeight: '204.27080'      // Absolute 값
}
```

#### C. 적용 우선순위
**파일**: `src/lib/components/stm/StmResultTable.svelte:196`

시퀀스 표시 시 다음 우선순위로 수식 적용:
1. **Crosslinking** (최우선)
2. **Side Chain**
3. **Single-site** (N-terminus 또는 C-terminus)
4. 자연 아미노산 (수식 없음)

```svelte
{#if item.letter.crosslinked && item.letter.crosslinkModification}
    {item.letter.crosslinkModification}
{:else if item.letter.sideChainModified && item.letter.sideChainModification}
    {item.letter.sideChainModification}
{:else if item.letter.singleSiteModified && item.letter.singleSiteModification}
    {#if item.letter.singleSiteCondition === 'N-terminus'}
        {item.letter.singleSiteModification}{item.letter.letter}
    {:else if item.letter.singleSiteCondition === 'C-terminus'}
        {item.letter.letter}{item.letter.singleSiteModification}
    {/if}
{:else}
    {item.letter.letter}
{/if}
```

#### D. UI 구성 요소
**파일**: `src/routes/potential/+page.svelte`, `src/lib/components/potential/*`

**주요 컴포넌트**:
- **PotentialModificationSelector**: 저장된 수식 목록에서 선택
- **SingleSiteSection**: Single-site 타입 설정 (타겟, 조건)
- **CrosslinkingSection**: Crosslinking 타입 설정 (타겟1, 타겟2, 조건, 거리)
- **ChemDoodleCanvas**: 화학 구조 그리기 및 분자량 계산
- **ModificationItem**: 저장된 수식 항목 표시
- **ProteinSelectDialog**: 타겟 아미노산 선택 모달 (Amino Acids, ncAA 탭)

#### E. 시퀀스 데이터 구조
**파일**: `src/lib/helper/stm_helper.ts:954-968`

```typescript
interface PossibilityLetter {
  letter: string;                          // 아미노산 문자
  natural: boolean;                        // 자연 아미노산 여부
  singleSiteModified?: boolean;            // Single-site 수식 적용 여부
  singleSiteModification?: string;         // Single-site 수식명
  singleSiteCondition?: string;            // 'N-terminus' | 'C-terminus' | 'Side Chain'
  sideChainModified?: boolean;             // Side Chain 수식 적용 여부
  sideChainModification?: string;          // Side Chain 수식명
  crosslinked?: boolean;                   // Crosslinking 수식 적용 여부
  crosslinkModification?: string;          // Crosslinking 수식명
}
```

### 3. 커스터마이제이션 시스템

#### A. ncAA 설정
**파일**: `src/routes/stm/+page.svelte:19-32`
```javascript
// 기본 ncAA 정의
let ncAA = { B: 0.0, J: 0.0, O: 0.0, U: 0.0, X: 0.0, Z: 0.0 };

// 각 ncAA에 할당할 코돈 매핑
let codonTitles = writable({
    B: [], J: [], O: [], U: [], X: [], Z: []
});
```

**설정 규칙**:
- 각 ncAA는 고유한 식별자(B, J, O, U, X, Z)를 가짐
- 코돈 할당은 다중 선택 가능 (1:N 매핑)
- 동일 코돈을 여러 ncAA에 할당 가능

#### B. Ion Adduct 타입 설정
**파일**: `src/routes/stm/+page.svelte:21`
```javascript
let ionTypes = ['H']; // 기본값: 수소 이온
```

**지원 이온 타입**:
- **Positive**: +H, +Na, +K, +NH₄ (UI에 "+" 부호 표시)
- **Negative**: -H, -Na, -K, -NH₄
- 다중 선택 가능
- 각 이온 타입별로 별도 결과 생성

#### C. 아미노산 선택
**파일**: `src/routes/stm/+page.svelte:13`
```javascript
let selectedMonoisotopicAminos = { ...aminoMap };
```

**기능**:
- 표준 20개 아미노산 중 계산에 포함할 아미노산 선택
- 체크 해제된 아미노산은 번역 결과에서 제외

#### D. 후처리 옵션 설정 [DEPRECATED]
**상태**: 기존 후처리 옵션들(Formylation, Admidation)은 **Potential Modification System**으로 통합되었습니다.

**변경 사항**:
- **Formylation**: Potential Modification의 Single-site N-terminus로 이동
- **Admidation**: 완전히 제거됨

**현재 사용 방법**: Potential Modification 페이지에서 해당 수식을 정의하고 STM에서 선택

### 4. 계산 알고리즘

#### A. 재귀적 가능성 생성
**파일**: `src/lib/helper/stm_helper.ts:36-138`

**핵심 특징**:
- **메모이제이션**: 동일한 하위 문제 재계산 방지
- **깊이 우선 탐색**: 전체 시퀀스 조합 생성
- **조기 종료**: Stop 코돈 발견 시 계산 중단

**알고리즘 흐름**:
1. 각 코돈 위치에서 가능한 변이 옵션 생성
2. 재귀적으로 다음 위치의 가능성과 조합
3. 메모이제이션을 통한 성능 최적화

#### B. 절단 시퀀스 생성
**파일**: `src/lib/helper/stm_helper.ts:178-234`

**생성 규칙**:
- ncAA가 할당된 모든 위치에서 절단 가능성 검토
- **reinitiation**: 절단 위치부터 끝까지
- **Premature termination**: 시작부터 절단 위치까지 (절단 위치 포함)

#### C. 질량 계산
**파일**: `src/lib/helper/stm_helper.ts:240-248`

**계산 공식**:
```javascript
// 기본 질량 = Σ(아미노산 질량) - 물 손실량
baseWeight = Σ(amino_weight) - water_loss

// 최종 질량 = 기본 질량 + Potential Modifications + 이온 부가체
finalWeight = baseWeight + potentialModifications + adduct_weight
```

**질량 구성 요소**:
- **아미노산 질량**: 자연 AA 또는 ncAA monoisotopic weight
- **물 손실**: 펩타이드 결합 형성으로 인한 손실
- **Potential Modifications**:
  - **N-terminus**: +수식 질량 (추가 개념)
  - **C-terminus**: +수식 질량 (추가 개념)
  - **Side Chain**: -타겟 질량 + 수식 질량 (대체 개념)
  - **Crosslinking**: -타겟1 질량 - 타겟2 질량 + 수식 질량 (대체 개념)
- **Ion adduct**: 이온 타입별 고유 질량

**참고**: Formylation(+27.99 Da)과 Admidation(-0.98 Da)은 이제 Potential Modification으로 정의해야 함

#### D. 결과 필터링 및 중복 제거
**파일**: `src/lib/helper/stm-core.ts:303-308, stm-utils.ts`

**필터링 조건**:
- 빈 시퀀스 제거
- **MIN_SEQUENCE_LENGTH** 이하 아미노산 시퀀스 제외
  - **파일**: `src/lib/helper/stm-core.ts:11`
  - **현재 값**: `const MIN_SEQUENCE_LENGTH = 3`
  - **적용 위치**:
    - 기본 시퀀스 생성 시 (308번 라인)
    - reinitiation 시퀀스 생성 시 (260번 라인)
    - Premature termination 시퀀스 생성 시 (282번 라인)
- 유니크 키 기반 중복 제거: `시퀀스-디설파이드패턴-이온타입`

### 5. Reason 분류 시스템

#### A. Reason 수집 로직
**파일**: `src/lib/helper/stm_helper.ts:291-322`

**수집 순서**:
1. **시퀀스 레벨 절단**: reinitiation, Premature termination
2. **개별 아미노산 레벨**: skipping

#### B. Reason 타입 정의
- **reinitiation**: 앞쪽 절단으로 인한 부분 시퀀스
- **Premature termination**: 뒤쪽 절단으로 인한 부분 시퀀스
- **skipping**: 코돈 건너뛰기 발생
- **Disulfide**: 디설파이드 결합 형성
- **Truncated**: 시퀀스 절단 발생
- **수식명 (x개수)**: Potential Modification 적용 (예: `d1 (x2)`, `dC`, `XL`)
  - 동일 수식이 여러 개 적용되면 개수 표시 (예: `d1 (x2)`)
  - Truncated는 중복이어도 하나만 표시

### 6. 입력 검증 시스템

#### A. 필수 검증 항목
**파일**: `src/routes/stm/+page.svelte:70-104`

1. **RNA 시퀀스 검증**:
   - 존재 여부
   - 유효한 염기(A, U, G, C) 사용
   - 3의 배수 길이

2. **ncAA 설정 검증**:
   - ncAA 선택 시 코돈 할당 필수
   - 할당된 코돈이 유효한 코돈 테이블 내 존재

3. **이온 타입 검증**:
   - 최소 1개 이상 선택 필수

#### B. 검증 함수
```javascript
// ncAA 선택했으나 코돈 미설정 검사
function checkCustomCodonTitles1() // :107-120

// 입력 코돈이 유효한 코돈 테이블 내 존재 검사  
function checkCustomCodonTitles2() // :122-151
```

### 7. 사용자 인터페이스 구조

#### A. 주요 컴포넌트
- **SeqConverter**: RNA 시퀀스 입력/변환
- **NcAACodonSelector**: ncAA와 코돈 매핑 설정
- **StmAdductSelector**: 이온 부가체 다중 선택
- **AminoMapSelector**: 표준 아미노산 선택
- **PotentialModificationSelector**: 사용자 정의 수식 선택 (Single-site, Crosslinking)
  - N-terminus, C-terminus, Side Chain 수식 적용
  - Formylation 등 기존 후처리 옵션 대체
- **StmResultTable**: 계산 결과 표시

#### B. 데이터 흐름
1. **입력 단계**: 사용자 입력 → 검증 → 설정 완료
2. **계산 단계**: StmHelper.calc() 호출 → 재귀적 가능성 생성
3. **후처리 단계**: 질량 계산 → 결과 필터링 → 중복 제거
4. **출력 단계**: StmResultTable로 결과 표시

### 8. 성능 최적화 전략

#### A. 계산 최적화
- **메모이제이션**: 동일한 하위 문제 재계산 방지
- **조기 종료**: Stop 코돈 발견 시 계산 중단
- **필터링**: 무의미한 결과 사전 제거
- **중복 제거**: 동일한 결과의 중복 생성 방지

#### B. 메모리 최적화
- 결과 저장 시 필수 정보만 유지
- 대용량 시퀀스 처리를 위한 점진적 계산

### 9. 확장 가능성

#### A. 새로운 ncAA 타입 추가
- `src/routes/stm/+page.svelte:19-32`에서 ncAA 객체 확장
- 새로운 식별자와 기본값 추가

#### B. 새로운 변이 타입 추가
- `src/lib/helper/stm_helper.ts:49-92`에서 변이 생성 로직 확장
- 새로운 조건과 질량 계산 규칙 정의

#### C. 새로운 후처리 옵션 추가
- 새로운 Selector 컴포넌트 생성
- `src/lib/helper/stm_helper.ts`에서 질량 계산 로직 확장

#### D. 새로운 이온 타입 추가
- `src/lib/helper/amino_mapper.ts`에서 ionTypes 확장
- 해당 이온의 질량 정보 추가

### 10. 생물학적 제약 조건

#### A. N-terminus Potential Modification 제약
**참고**: Formylation은 이제 Potential Modification의 N-terminus로 처리됩니다.
- reinitiation 시 N-terminus 수식 적용 불가 (N-말단 부재)
- 첫 번째 아미노산이 modification의 target과 일치해야 함
- 타겟이 ALL인 경우 모든 첫 번째 아미노산에 적용 가능

#### B. C-terminus Potential Modification 제약
**참고**: Admidation 기능은 제거되었으나, C-terminus 수식은 Potential Modification으로 가능합니다.
- Premature termination 시 C-terminus 수식 적용 불가 (C-말단 부재)
- 마지막 아미노산이 modification의 target과 일치해야 함
- 타겟이 ALL인 경우 모든 마지막 아미노산에 적용 가능

#### C. 절단 조건
- ncAA가 할당된 위치에서만 절단 발생
- reinitiation과 Premature termination은 상호 배타적

### 11. 주요 알고리즘 파라미터

#### A. 필터링 기준
- **최소 시퀀스 길이**: `MIN_SEQUENCE_LENGTH + 1` 개 아미노산 (현재: 4개)
  - **설정 파일**: `src/lib/helper/stm-core.ts:11`
  - **상수명**: `MIN_SEQUENCE_LENGTH`
  - **현재 값**: `3` (3개 이하 제외, 4개부터 포함)
  - **변경 방법**: 상수 값 수정 후 재빌드
- 최대 결과 수: 제한 없음 (사용자 시스템 성능에 의존)

#### B. 질량 정밀도
- Monoisotopic weight 사용
- 소수점 정밀도: 시스템 기본값 사용

#### C. 조합 생성 한계
- ncAA 개수: 최대 6개 (B, J, O, U, X, Z)
- 이론적 조합 수: 지수적 증가 (실제로는 필터링으로 제한)