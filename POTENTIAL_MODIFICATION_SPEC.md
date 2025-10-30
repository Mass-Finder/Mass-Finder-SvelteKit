# Potential Modification 기능 명세서

## 1. 개요

사용자가 직접 아미노산 modification을 정의하고 STM (Sequence to Mass) 계산에 활용할 수 있도록 하는 확장 기능입니다.

## 2. 배경 및 목적

### 현재 상황
- STM 화면에는 Formylation, Admidation, Disulfide와 같은 modification 기능이 존재
- 이러한 기능들은 개발자가 사전에 정의해놓은 것만 사용 가능
- 사용자의 특수한 연구 요구사항에 대응하기 어려움

### 개선 방향
- Potential 화면에서 사용자가 직접 modification을 정의하고 저장
- 저장된 modification을 STM 계산에 활용
- 유연하고 확장 가능한 modification 시스템 구축

## 3. Modification 타입

### 3.1 Single-site (단일 위치 변형)

하나의 아미노산에 변화가 일어나는 modification 타입입니다.

#### 예시
- `MSTINM` → `fMSTINM` (N-terminus에 f 추가)
- `MSTINM` → `MSTINMn` (C-terminus에 n 추가)

#### Condition (조건)

##### 3.1.1 N-terminus (N 말단)
- **설명**: 시퀀스의 맨 앞에 modification이 적용됨
- **Target 옵션**:
  - `ALL`: 모든 결과물의 맨 앞에 적용 (Formylation과 동일한 동작)
  - `특정 아미노산`: 해당 아미노산이 맨 앞에 있을 때만 적용
    - 예: Target이 `M`인 경우, `MSTINM`의 M 앞에만 적용

##### 3.1.2 C-terminus (C 말단)
- **설명**: 시퀀스의 맨 뒤에 modification이 적용됨
- **Target 옵션**:
  - `ALL`: 모든 결과물의 맨 뒤에 적용 (Admidation과 동일한 동작)
  - `특정 아미노산`: 해당 아미노산이 맨 뒤에 있을 때만 적용
    - 예: Target이 `M`인 경우, `MSTINM`의 M 뒤에만 적용

**주의**: Internal site 조건은 너무 많은 경우의 수를 생성하여 성능 문제를 일으킬 수 있으므로 제거되었습니다.

### 3.2 Crosslinking (교차 결합)

두 개의 아미노산이 쌍으로 결합하여 변화가 일어나는 modification 타입입니다.

#### 질량 계산 방식

**중요**: Crosslinking의 Molecular Weight는 **최종 구조의 절대 질량**을 입력합니다.

코드에서 자동으로 다음과 같이 계산합니다:
- **계산 공식**: `최종 질량 = 원래 시퀀스 질량 - 원래 두 아미노산 질량 + 새 구조 질량`
- **사용자 입력**: 새 구조의 절대 질량 (Potential 화면에서 ChemDoodle로 그린 구조의 질량)

**예시**:
1. **Disulfide bond** (C-C → S-S 결합)
   - C 2개의 원래 질량: 121.154 × 2 = 242.308
   - H2 제거 후 구조 질량: 240.292
   - 입력값: `240.292` (절대 질량)
   - 자동 계산: 242.308 - 240.292 = **-2.016** (감소)

2. **Custom crosslinking** (C-C → dC1 구조)
   - C 2개의 원래 질량: 121.154 × 2 = 242.308
   - dC1 구조 질량: 42
   - 입력값: `42` (절대 질량)
   - 자동 계산: 242.308 - 42 = **-200.308** (감소)

#### 표시 방식

Crosslinking이 적용된 경우, **각 아미노산을 개별적으로** Structure Name으로 표시합니다:
- `CC` → `dC1dC1` (두 개의 dC1로 표시)
- `MCCAAVAV` → `MdC1dC1AAVAV`

#### 예시
- Disulfide bond: `C-C` 결합 (질량 -2.02 감소)

#### Condition (조건)

##### 3.2.1 Adjacent (인접)
- **설명**: Target 1과 Target 2가 서로 바로 인접해 있을 때만 결합 가능
- **순서**: 1-2 또는 2-1 모두 가능
- **예시**: `MCCSTINM`에서 연속된 두 C가 결합 가능

##### 3.2.2 Adjacent (Target 1→2) (인접, 순서 1→2)
- **설명**: Target 1과 Target 2가 인접하고, 반드시 1-2 순서여야 함
- **예시**: Target 1이 C, Target 2가 D일 때
  - `MCDINM`: C 다음에 D가 있으므로 결합 가능
  - `MDCINM`: D 다음에 C가 있으므로 결합 불가능

##### 3.2.3 Adjacent (Target 2→1) (인접, 순서 2→1)
- **설명**: Target 1과 Target 2가 인접하고, 반드시 2-1 순서여야 함
- **예시**: Target 1이 C, Target 2가 D일 때
  - `MDCINM`: D 다음에 C가 있으므로 결합 가능
  - `MCDINM`: C 다음에 D가 있으므로 결합 불가능

##### 3.2.4 Distance (거리 조건)
- **설명**: Target 1과 Target 2 사이의 아미노산 개수에 조건을 부여
- **연산자**:
  - `= N`: Target 1과 2 사이에 정확히 N개의 아미노산이 있어야 함
  - `< N`: Target 1과 2 사이에 N개 이하의 아미노산이 있어야 함
  - `> N`: Target 1과 2 사이에 N개 이상의 아미노산이 있어야 함

- **예시** (Target 1: C, Target 2: C):
  - Distance `= 2`인 경우:
    - `MCSTCNM`: C와 C 사이에 S, T 2개 → 결합 가능
    - `MCSCNM`: C와 C 사이에 S 1개 → 결합 불가능

  - Distance `< 3`인 경우:
    - `MCCNM`: C와 C 사이에 0개 → 결합 가능
    - `MCSCNM`: C와 C 사이에 1개 → 결합 가능
    - `MCSTCNM`: C와 C 사이에 2개 → 결합 가능
    - `MCSTICNM`: C와 C 사이에 3개 → 결합 불가능

  - Distance `> 1`인 경우:
    - `MCCNM`: C와 C 사이에 0개 → 결합 불가능
    - `MCSCNM`: C와 C 사이에 1개 → 결합 불가능
    - `MCSTCNM`: C와 C 사이에 2개 → 결합 가능

## 4. 현재 기능과의 매핑

기존 STM의 하드코딩된 기능들은 Potential Modification의 조합으로 표현 가능합니다.

| 기존 기능 | Type | Condition | Target 1 | Target 2 | 비고 |
|---------|------|-----------|----------|----------|------|
| **Formylation** | Single-site | N-terminus | ALL | - | 모든 시퀀스 맨 앞에 적용 |
| **Admidation** | Single-site | C-terminus | ALL | - | 모든 시퀀스 맨 뒤에 적용 |

**주의**: 기존의 Disulfide 기능(Everywhere 조건)은 너무 많은 조합을 생성하여 성능 문제를 일으킬 수 있으므로 제거되었습니다. 대신 Distance 또는 Adjacent 조건을 사용하여 Potential Modification으로 정의할 수 있습니다.

## 5. 데이터 구조

### Potential 화면에서 저장되는 데이터 구조 (참고)

```javascript
// Single-site 예시
{
  name: "Custom_Formylation",
  type: "Single-site",
  target: "M",  // 또는 "ALL"
  condition: "N-terminus",  // or "C-terminus", "Internal site"
  structureName: "formyl_group",
  moleculeJson: {...},
  molecularFormula: "CHO",
  monoisotopicWeight: "28.01",
  molecularWeight: "28.01"
}

// Crosslinking 예시 1: Disulfide bond
{
  name: "Disulfide",
  type: "Crosslinking",
  target1: "C",
  target2: "C",
  condition: "Adjacent",
  structureName: "dC",  // 각 C가 dC로 표시됨
  moleculeJson: {...},
  molecularFormula: "C6H10N2O2S2",
  monoisotopicWeight: "240.292",  // H2 제거 후 구조의 절대 질량
  molecularWeight: "240.292"
}

// Crosslinking 예시 2: Custom structure (dC1)
{
  name: "Custom_C_Link",
  type: "Crosslinking",
  target1: "C",
  target2: "C",
  condition: "Adjacent",
  // Distance인 경우 추가 필드
  distanceOperator: ">",  // "=", "<", ">"
  distanceValue: 1,
  structureName: "dC1",  // 각 C가 dC1로 표시됨
  moleculeJson: {...},
  molecularFormula: "...",
  // ChemDoodle에서 계산된 최종 구조의 절대 질량을 입력
  monoisotopicWeight: "42.0",
  molecularWeight: "42.0"
}
```

## 6. STM 화면 통합 계획

### 6.1 UI 요구사항
1. Potential 화면에서 저장된 modification 목록을 불러오기
2. 사용자가 적용할 modification을 선택할 수 있는 UI 추가
3. **선택 제한**: 사용자는 **최대 4개**의 modification만 선택 가능
   - 4개 초과 선택 시 경고 메시지 표시 및 추가 선택 방지
   - 체크박스 UI에서 4개 선택 시 나머지 체크박스 비활성화
   - 선택된 modification만 계산에 적용됨
4. 기존 Formylation, Admidation, Disulfide와 함께 사용 가능해야 함

### 6.2 계산 로직 통합

#### 6.2.1 Single-site Modification
1. `stm_helper.ts`의 `generatePossibilities` 함수 확장
2. Single-site modification 적용 로직 구현
   - N-terminus, C-terminus, Internal site 조건 처리
   - Target 필터링 로직
3. 적용된 modification은 reasons에 추가

#### 6.2.2 Crosslinking Modification - 조합 생성 알고리즘

**핵심 요구사항**: Crosslinking modification은 여러 개가 적용될 수 있으므로, **모든 가능한 조합**을 생성해야 함.

##### 현재 문제점 (2025-10-28 발견)

**문제 1: 조합 생성 부재**
- 현재 구현은 모든 valid pairs를 한 번에 적용함
- 예: C가 4개 있으면 6개의 C-C 페어가 모두 적용된 1개의 결과만 생성
- **필요한 것**: 0개 적용, 1개 적용 (각 페어별), 2개 적용 (겹치지 않는 조합들)... 등 **모든 조합** 생성

**문제 2: 시퀀스 표시**
- Crosslinking이 적용된 아미노산이 원래 문자 그대로 표시됨 (C → C)
- **필요한 것**: Modification name을 prefix로 표시 (C → dC, modification name이 "dC"인 경우)

##### 조합 생성 예시

시퀀스: `MCCSTINM` (연속된 C가 2개)
Modification: C-C Crosslinking (이름: dC, 조건: Adjacent)

**생성되어야 하는 결과**:
1. **0개 적용**: `MCCSTINM` (원본)
2. **1개 적용**: `MdCdCSTINM` (C₁-C₂ 결합, dC (x1) 노트 표시)

시퀀스: `MCCSTINCCM` (C가 4개, 2쌍이 인접)
Modification: C-C Crosslinking (이름: dC, 조건: Adjacent)

**생성되어야 하는 결과**:
1. **0개 적용**: `MCCSTINCCM` (원본)
2. **1개 적용** (2가지):
   - C₁-C₂: `MdCdCSTINCC` 노트: dC (x1)
   - C₇-C₈: `MCCSTINdCdCM` 노트: dC (x1)
3. **2개 적용** (1가지, 겹치지 않는 조합):
   - C₁-C₂ + C₇-C₈: `MdCdCSTINdCdCM` 노트: dC (x2)

##### 시퀀스 표시 규칙

Crosslinking이 적용된 아미노산은 **modification name을 prefix로 표시**:

- **원본**: `MCSTINCM`
- **C₁-C₇ 결합 적용 후** (modification name: "dC"): `MdCSTINdCM`
  - 첫 번째 C와 마지막 C가 dC로 변경됨
  - 시퀀스에서 직접적으로 modification이 적용된 것을 확인 가능

**여러 modification이 있는 경우**:
- modification name이 "dC", "eC"인 경우, 각각 "dC", "eC"로 prefix 표시
- 동일한 modification이 여러 쌍에 적용되면 모두 같은 prefix 사용

**Note(이유) 표시**:
- 적용된 crosslinking 개수를 표시: `dC (x2)` 형식
- 0개 적용된 경우는 crosslinking reason 표시 안 함

##### 구현 방법

1. **Valid Pairs 찾기**:
   - 조건(Adjacent, Distance 등)을 만족하는 모든 페어링 찾기
   - 예: Adjacent 조건에서 MCCSTINCCM → [(0,1), (6,7)] (인덱스 기준)

2. **Non-overlapping Combinations 생성** (Backtracking):
   - 겹치지 않는 페어 조합 생성 (한 아미노산은 최대 1번만 결합)
   - 0개, 1개, 2개, ... 최대 개수까지 모든 조합 생성
   - 알고리즘: Recursive backtracking

3. **각 조합마다 Possibility 생성**:
   - 질량 계산: base weight + (modification weight × 적용된 페어 개수)
   - 시퀀스 문자열 업데이트: 결합된 아미노산을 modification name prefix로 변경
   - Reasons 업데이트: "dC (x2)" 형식으로 표시
   - Crosslinking 정보 저장

##### 알고리즘 의사코드

```javascript
function applyCrosslinkingModifications(basePossibilities, crosslinkingModifications) {
  let results = basePossibilities;

  // 각 crosslinking modification에 대해
  for (const modification of crosslinkingModifications) {
    const newResults = [];

    // 각 base possibility에 대해
    for (const basePoss of results) {
      // 이 modification의 모든 조합 생성
      const combinations = generateCrosslinkingCombinations(basePoss, modification);
      newResults.push(...combinations);
    }

    results = newResults;
  }

  return results;
}

function generateCrosslinkingCombinations(basePossibility, modification) {
  // 1. Valid pairs 찾기
  const validPairs = findValidPairs(basePossibility, modification);

  // 2. Non-overlapping combinations 생성
  const combinations = generateNonOverlappingCombinations(validPairs);
  // combinations = [[], [pair1], [pair2], ..., [pair1, pair3], ...]

  // 3. 각 조합마다 새로운 Possibility 생성
  const results = [];
  for (const combo of combinations) {
    const newPoss = clonePossibility(basePossibility);

    // 질량 업데이트
    const modWeight = parseFloat(modification.monoisotopicWeight);
    const modMolWeight = parseFloat(modification.molecularWeight);
    newPoss.weight += modWeight * combo.length;
    newPoss.molecularWeight += modMolWeight * combo.length;

    // 시퀀스 업데이트 (sequence array와 sequenceString 둘 다)
    if (combo.length > 0) {
      updateSequenceWithCrosslinking(newPoss, combo, modification.name);

      // Reasons 업데이트
      newPoss.reasons.push(`${modification.name} (x${combo.length})`);

      // "Only natural AA" 제거
      newPoss.reasons = newPoss.reasons.filter(r => r !== "Only natural AA");
    }

    // Crosslinking 정보 저장
    newPoss.crosslinking = (newPoss.crosslinking || []).concat(
      combo.map(pair => ({
        modification: modification.name,
        pair: pair
      }))
    );

    results.push(newPoss);
  }

  return results;
}

function generateNonOverlappingCombinations(pairs) {
  // Recursive backtracking으로 겹치지 않는 조합 생성
  const results = [[]]; // 빈 조합 (0개 적용)

  function backtrack(startIndex, currentCombo, usedIndices) {
    // currentCombo를 결과에 추가 (1개 이상인 경우)
    if (currentCombo.length > 0) {
      results.push([...currentCombo]);
    }

    // 다음 페어 선택
    for (let i = startIndex; i < pairs.length; i++) {
      const [idx1, idx2] = pairs[i];

      // 이미 사용된 인덱스는 건너뛰기
      if (usedIndices.has(idx1) || usedIndices.has(idx2)) continue;

      // 현재 페어 추가
      currentCombo.push(pairs[i]);
      usedIndices.add(idx1);
      usedIndices.add(idx2);

      // 재귀 호출
      backtrack(i + 1, currentCombo, usedIndices);

      // Backtrack
      currentCombo.pop();
      usedIndices.delete(idx1);
      usedIndices.delete(idx2);
    }
  }

  backtrack(0, [], new Set());
  return results;
}

function updateSequenceWithCrosslinking(possibility, pairs, modificationName) {
  // pairs에 포함된 인덱스들을 Set으로 변환
  const affectedIndices = new Set();
  pairs.forEach(([idx1, idx2]) => {
    affectedIndices.add(idx1);
    affectedIndices.add(idx2);
  });

  // sequence array 업데이트
  possibility.sequence = possibility.sequence.map((item, idx) => {
    if (affectedIndices.has(idx) && item.letter !== "") {
      return {
        ...item,
        crosslinked: true,
        crosslinkModification: modificationName
      };
    }
    return item;
  });

  // sequenceString 재생성
  possibility.sequenceString = possibility.sequence
    .filter(item => item.letter !== "")
    .map(item => {
      if (item.crosslinked && item.crosslinkModification) {
        return item.crosslinkModification + item.letter;
      }
      return item.letter;
    })
    .join("");
}
```

### 6.3 성능 고려사항

**Everywhere 조건 제거로 인한 개선**:
- Everywhere 조건은 시퀀스 내 모든 target 쌍을 생성하여 조합 폭발 문제를 일으킴
- Adjacent와 Distance 조건만 사용함으로써 valid pairs의 수가 크게 감소
- 예: C가 10개인 경우
  - Everywhere: 45개 페어 → 16,796개 조합 (Catalan number)
  - Adjacent: 최대 9개 페어 → 훨씬 적은 조합
  - Distance < 5: 제한된 페어 수 → 관리 가능한 조합

**남은 고려사항**:
- 여러 custom modification이 동시에 적용될 경우 조합 증가 가능
- **대응 방안**:
  - Modification 선택 개수 제한 (최대 4개)
  - Distance 조건에서 적절한 거리 값 설정 권장
  - Memoization 전략 유지
- Backtracking 알고리즘의 최대 조합 크기 제한 (maxSize 파라미터)

## 7. 검증 요구사항

### 7.1 Potential 화면에서의 검증
- ✅ 이미 구현됨: Modification name 중복 체크
- ✅ 이미 구현됨: Structure name 및 molecular properties 필수 입력
- ✅ 이미 구현됨: Target amino acid 선택 필수
- ✅ 이미 구현됨: Distance value 최소값 검증 (≥ 1)

### 7.2 STM 화면에서의 검증
- ✅ 이미 구현됨: 최대 4개 modification 선택 제한
- RNA sequence와 modification 조합의 유효성 체크
- 계산 불가능한 조합에 대한 사용자 알림

## 8. 향후 확장 가능성

- 여러 modification을 템플릿으로 묶어서 저장/불러오기
- Modification 적용 우선순위 설정
- Community-shared modification library
- Modification 시각화 기능 강화

---

**작성일**: 2025-10-27
**버전**: 1.0
**상태**: 초안
