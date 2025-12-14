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

#### 질량 계산 방식

Single-site modification의 질량 계산 방식은 **Condition**에 따라 다릅니다:

##### N-terminus와 C-terminus (추가 개념)
- **개념**: 기존 아미노산을 **대체하지 않고** modification을 **앞 또는 뒤에 추가**
- **계산 공식**: `최종 질량 = 원래 시퀀스 질량 + modification 질량`
- **사용자 입력**: ChemDoodle로 그린 구조의 절대 질량에서 **target 아미노산 무게를 뺀 delta 값**을 저장

##### Side Chain (대체 개념)
- **개념**: 기존 target 아미노산을 modification으로 **완전히 대체**
- **계산 공식**: `최종 질량 = 원래 시퀀스 질량 - 원래 아미노산 질량 + 새 구조 질량`
- **사용자 입력**: ChemDoodle로 그린 구조의 **절대 질량**을 저장

#### 저장 시 처리

**Potential 화면에서 저장할 때**의 처리 방식은 **Condition**에 따라 다릅니다:

##### N-terminus와 C-terminus
ChemDoodle로 계산된 절대 질량에서 **target 아미노산의 무게를 자동으로 차감**하여 delta 값으로 저장합니다.

**저장 공식**:
- **저장값** = ChemDoodle 계산값 - target 아미노산 무게

**Target 아미노산 무게 결정**:
- Target이 **특정 아미노산**(예: M, C, A 등)인 경우: 해당 아미노산의 무게 사용
- Target이 **ALL**인 경우: **Glycine(G)의 무게** 사용
  - Monoisotopic Weight: 75.03203
  - Molecular Weight: 75.06700

**예시**:
1. **M → MP 변환** (N-terminus, Target: M)
   - ChemDoodle 계산값: 97.0
   - M의 Monoisotopic Weight: 149.05105
   - **저장값**: 97.0 - 149.05105 = **-52.05105**
   - 의미: M을 MP로 교체하면 질량이 52.05105 감소

2. **Formylation** (N-terminus, Target: ALL)
   - ChemDoodle 계산값: 28.01
   - Glycine Monoisotopic Weight: 75.03203
   - **저장값**: 28.01 - 75.03203 = **-47.02203**
   - 의미: 어떤 아미노산이든 f로 교체하면 평균적으로 47.02203 감소 (Glycine 기준)

##### Side Chain
ChemDoodle로 계산된 **절대 질량을 그대로 저장**합니다 (target 아미노산 무게 차감 없음).

**저장 공식**:
- **저장값** = ChemDoodle 계산값 (그대로)

**이유**:
- Side Chain modification은 STM 계산 시 **target 아미노산을 교체**하는 방식으로 적용됨
- 따라서 교체될 새로운 구조의 절대 질량이 필요함
- 계산 로직: `새 질량 = 원래 질량 - (target 무게 × 개수) + (modification 무게 × 개수)`

**예시**:
- **C → d1 변환** (Side Chain, Target: C)
  - ChemDoodle 계산값: 165.0
  - **저장값**: 165.0 (그대로 저장)
  - 의미: C를 d1 구조로 완전히 교체, d1 구조의 절대 질량

#### 예시
- **N-terminus**: `MSTINM` → `fMSTINM` (M 앞에 f 추가, M은 그대로 유지)
- **C-terminus**: `MSTINM` → `MSTINMn` (M 뒤에 n 추가, M은 그대로 유지)
- **Side Chain**: `MCCCRRC` → `Md1CCRRC` (C를 d1로 대체, 1개 적용)

#### Condition (조건)

##### 3.1.1 N-terminus (N 말단)
- **설명**: 시퀀스의 맨 앞 아미노산 **앞에** modification을 **추가**
- **중요**: 기존 아미노산을 대체하지 않고, 그 앞에 prefix로 추가됨
- **Target 옵션**:
  - `ALL`: 모든 결과물의 맨 앞에 적용 (Formylation과 동일한 동작)
    - 예: `MSTINM` → `fMSTINM` (모든 시퀀스 맨 앞에 f 추가)
  - `특정 아미노산`: 해당 아미노산이 맨 앞에 있을 때만 적용
    - 예: Target이 `M`인 경우, `MSTINM` → `fMSTINM` (M 앞에 f 추가, M은 유지)
    - 예: Target이 `M`이고 시퀀스가 `ASTINM`이면 적용 안 됨 (맨 앞이 A이므로)

##### 3.1.2 C-terminus (C 말단)
- **설명**: 시퀀스의 맨 뒤 아미노산 **뒤에** modification을 **추가**
- **중요**: 기존 아미노산을 대체하지 않고, 그 뒤에 suffix로 추가됨
- **Target 옵션**:
  - `ALL`: 모든 결과물의 맨 뒤에 적용 (Admidation과 동일한 동작)
    - 예: `MSTINM` → `MSTINMn` (모든 시퀀스 맨 뒤에 n 추가)
  - `특정 아미노산`: 해당 아미노산이 맨 뒤에 있을 때만 적용
    - 예: Target이 `M`인 경우, `MSTINM` → `MSTINMn` (M 뒤에 n 추가, M은 유지)
    - 예: Target이 `M`이고 시퀀스가 `MSTINA`이면 적용 안 됨 (맨 뒤가 A이므로)

##### 3.1.3 Side Chain (측쇄 변형)
- **설명**: **전체 시퀀스**의 target 아미노산을 modification으로 **대체** (맨 앞과 맨 뒤 포함)
- **중요**: N/C-terminus와 달리 기존 아미노산을 **완전히 대체**함
- **Target 옵션**:
  - `특정 아미노산만` 가능 (`ALL` 옵션 없음)
  - 예: Target이 `C`인 경우, 시퀀스의 **모든 C를 d1로 대체** 가능
    - `MCCCRRC` → `Md1CCRRC` (첫 번째 C를 d1로 대체, C는 사라짐)

**핵심 특징: 개수 기반 생성**

Side Chain modification은 **몇 개가 변화했는지**에 따라 분자량이 달라지므로, **위치가 아닌 개수**만 중요합니다.

- 같은 개수의 변화는 **위치와 상관없이 동일한 분자량**을 가짐
- 따라서 0개, 1개, 2개, ... N개 변화한 경우를 **각각 하나씩만** 대표로 생성
- 모든 위치 조합을 생성할 필요 없음 (성능 최적화)

**예시 1: 전체 시퀀스 적용**
```
시퀀스: MCCCRRC
Modification: Target C, Structure Name d1, Condition: Side Chain
전체 C 개수: 4개 (모든 위치 포함)

생성되는 결과:
1. 0개 변화: MCCCRRC (원본)
   - 질량: 원래 질량
   - Note: -

2. 1개 변화: Md1CCRRC (왼쪽부터 C 1개)
   - 질량: 원래 질량 + (delta × 1)
   - Note: d1 (x1)

3. 2개 변화: Md1d1CRRC (왼쪽부터 C 2개)
   - 질량: 원래 질량 + (delta × 2)
   - Note: d1 (x2)

4. 3개 변화: Md1d1d1RRC (왼쪽부터 C 3개)
   - 질량: 원래 질량 + (delta × 3)
   - Note: d1 (x3)

5. 4개 변화: Md1d1d1RRd1 (모든 C)
   - 질량: 원래 질량 + (delta × 4)
   - Note: d1 (x4)
```

**예시 2: 맨 앞이 Target인 경우**
```
시퀀스: CMCCMIY
Modification: Target C, Structure Name d1, Condition: Side Chain
전체 C 개수: 3개 (맨 앞 C 포함)

생성되는 결과:
1. 0개 변화: CMCCMIY
2. 1개 변화: d1MCCMIY (맨 앞 C)
3. 2개 변화: d1Md1CMIY (앞 2개 C)
4. 3개 변화: d1Md1d1MIY (모든 C)
```

**질량 계산 방식:**
- **각 개수별 질량** = 원래 시퀀스 질량 - (target 무게 × 변화 개수) + (modification 무게 × 변화 개수)
- `modification 무게`는 Potential 화면에서 저장된 절대 질량 값
- target 아미노산을 새로운 구조로 **교체**하는 방식으로 계산

**시퀀스 표시 규칙:**
- 변화된 아미노산을 Structure Name prefix로 표시
- 대표 시퀀스는 **왼쪽부터 순서대로** 적용한 형태로 표시
  - 예: `Md1d1CIY` (왼쪽 C 2개가 d1로 변경)

**Note(이유) 표시:**
- 적용된 개수를 표시: `d1 (x2)` 형식
- 0개 적용된 경우는 modification reason 표시 안 함

### 3.2 Crosslinking (교차 결합)

두 개의 아미노산이 쌍으로 결합하여 변화가 일어나는 modification 타입입니다.

#### 질량 계산 방식

**중요**: Crosslinking의 Molecular Weight는 **최종 구조의 절대 질량**을 입력합니다.

코드에서 자동으로 다음과 같이 계산합니다:
- **계산 공식**: `최종 질량 = 원래 시퀀스 질량 - 원래 두 아미노산 질량 + 새 구조 질량`
- **사용자 입력**: 새 구조의 절대 질량 (Potential 화면에서 ChemDoodle로 그린 구조의 질량)

#### 저장 시 처리

**중요**: Crosslinking은 **Single-site와 달리** ChemDoodle로 계산된 **절대 질량을 그대로 저장**합니다.

**저장 공식**:
- **저장값** = ChemDoodle 계산값 (target 아미노산 무게 차감 없음)

**이유**:
- Crosslinking은 STM 계산 로직에서 이미 두 아미노산을 교체하는 방식으로 처리되므로, Potential 화면에서는 **완성된 구조의 절대 질량**을 그대로 저장
- Single-site는 하나의 아미노산을 교체하므로 delta 값이 필요하지만, Crosslinking은 두 아미노산을 완전히 새로운 구조로 교체하므로 절대 질량이 필요

**예시**:
1. **Disulfide bond** (C-C → S-S 결합, Target1: C, Target2: C)
   - ChemDoodle 계산값: 240.292
   - **저장값**: 240.292 (그대로 저장)
   - 의미: C-C가 결합한 완성된 구조의 절대 질량

2. **Custom crosslinking** (C-C → dC1 구조, Target1: C, Target2: C)
   - ChemDoodle 계산값: 42.0
   - **저장값**: 42.0 (그대로 저장)
   - 의미: C-C가 dC1 구조로 변환된 완성된 구조의 절대 질량

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
// Single-site 예시 1: M → MP 변환
{
  name: "M_to_MP",
  type: "Single-site",
  target: "M",
  condition: "N-terminus",
  structureName: "MP",  // M이 MP로 표시됨
  moleculeJson: {...},
  molecularFormula: "...",
  // ChemDoodle에서 계산된 MP 구조의 절대 질량
  monoisotopicWeight: "97.0",
  molecularWeight: "97.0"
}

// Single-site 예시 2: Formylation (ALL)
{
  name: "Formylation",
  type: "Single-site",
  target: "ALL",  // 모든 아미노산에 적용
  condition: "N-terminus",
  structureName: "f",
  moleculeJson: {...},
  molecularFormula: "CHO",
  // ChemDoodle에서 계산된 formyl 구조의 절대 질량
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
   - **N-terminus**: 맨 앞 아미노산에 적용 (적용 O/X 2가지 결과)
   - **C-terminus**: 맨 뒤 아미노산에 적용 (적용 O/X 2가지 결과)
   - **Side Chain**: 전체 시퀀스의 target 아미노산에 개수별로 적용 (0개, 1개, 2개, ... N개 결과)
   - Target 필터링 로직
3. 적용된 modification은 reasons에 추가

##### Side Chain 알고리즘

**1. 전체 시퀀스에서 Target 개수 계산:**
```javascript
function countAllTargets(sequence, targetAA) {
  // 전체 시퀀스에서 target 아미노산 찾기 (맨 앞과 맨 뒤 포함)
  return sequence.filter(aa => aa === targetAA).length;
}
```

**2. 개수별 Possibility 생성:**
```javascript
function applySideChainModification(basePossibility, modification) {
  const results = [];
  const targetAA = modification.target;
  const totalCount = countAllTargets(basePossibility.sequence, targetAA);

  // 0개부터 N개까지 각각 생성
  for (let count = 0; count <= totalCount; count++) {
    const newPoss = clonePossibility(basePossibility);

    if (count > 0) {
      // 질량 업데이트 (REPLACE: target 무게를 빼고 modification 무게를 더함)
      const modWeight = parseFloat(modification.monoisotopicWeight);
      const modMolWeight = parseFloat(modification.molecularWeight);
      const targetMonoisotopicWeight = aminoMap[targetAA] || 0;
      const targetMolecularWeight = molecularWeightMap[targetAA] || 0;

      newPoss.weight = newPoss.weight - (targetMonoisotopicWeight * count) + (modWeight * count);
      newPoss.molecularWeight = newPoss.molecularWeight - (targetMolecularWeight * count) + (modMolWeight * count);

      // 시퀀스 업데이트 (왼쪽부터 count개를 modification structure name으로 변경)
      updateSequenceWithSideChain(newPoss, targetAA, modification.structureName, count);

      // Reasons 업데이트
      newPoss.reasons.push(`${modification.name} (x${count})`);
      newPoss.reasons = newPoss.reasons.filter(r => r !== "Only natural AA");
    }

    results.push(newPoss);
  }

  return results;
}
```

**3. 시퀀스 업데이트 (왼쪽부터 순서대로 적용):**
```javascript
function updateSequenceWithSideChain(possibility, targetAA, structureName, count) {
  let applied = 0;

  // 전체 시퀀스에서 왼쪽부터 count개 적용 (맨 앞과 맨 뒤 포함)
  for (let i = 0; i < possibility.sequence.length && applied < count; i++) {
    if (possibility.sequence[i].letter === targetAA) {
      possibility.sequence[i].sideChainModified = true;
      possibility.sequence[i].sideChainModification = structureName;
      applied++;
    }
  }

  // sequenceString 재생성 (structure name만 표시, letter는 표시 안 함)
  possibility.sequenceString = possibility.sequence
    .filter(item => item.letter !== "")
    .map(item => {
      if (item.sideChainModified && item.sideChainModification) {
        return item.sideChainModification;  // d1만 반환
      }
      if (item.singleSiteModified && item.singleSiteModification) {
        return item.singleSiteModification;
      }
      return item.letter;
    })
    .join("");
}
```

**예시:**
- 시퀀스: `MCCCRRC`, Target: C, Structure Name: d1
- 전체 C 개수: 4개
- 생성 결과:
  - count=0: `MCCCRRC`
  - count=1: `Md1CCRRC` (왼쪽 첫 번째 C)
  - count=2: `Md1d1CRRC` (왼쪽 두 개 C)
  - count=3: `Md1d1d1RRC` (왼쪽 세 개 C)
  - count=4: `Md1d1d1RRd1` (모든 C)

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

#### 7.1.1 Single-site Modification 분자량 계산 제약사항

**중요**: Single-site modification에서만 적용되는 추가 검증 규칙입니다.

**Target 선택 전 분자량 계산 불가**:
- Single-site 모드에서 Target 아미노산을 선택하기 전에는 "Calculate Molecular Properties" 버튼이 비활성화됨
- 이유: Single-site modification은 특정 아미노산의 변형이므로, 어떤 아미노산을 대상으로 하는지 명확해야 분자량 계산이 의미를 가짐
- Crosslinking 모드에는 이 제약이 적용되지 않음 (두 아미노산 간의 결합 구조이므로 Target 선택과 독립적으로 계산 가능)

**Target 변경 시 분자량 초기화**:
- Single-site 모드에서 Target 아미노산을 변경하면 이전에 계산된 분자량 값들이 자동으로 초기화됨
- 초기화 대상:
  - Molecular Formula
  - Monoisotopic Weight
  - Molecular Weight
  - Molecule JSON
- 이유: 다른 아미노산을 대상으로 하는 경우 기존 계산 결과는 더 이상 유효하지 않으므로, 사용자가 새로운 구조를 그리고 다시 계산하도록 유도
- Crosslinking 모드에는 이 제약이 적용되지 않음

**구현 위치**:
- UI 레벨에서 제어 (ChemDoodleCanvas 컴포넌트의 계산 버튼 비활성화)
- Target 변경 시 자동 초기화 로직 (potential/+page.svelte)

#### 7.1.2 Calculate Molecular Properties 결과 표시

**Calculate Molecular Properties 버튼을 클릭하면 나타나는 결과 화면**에서, 사용자가 그린 구조의 **절대 질량**뿐만 아니라 **실제로 저장될 delta 값** 및 **분자식 계산 결과**도 함께 표시해야 합니다.

**표시 내용**:
1. **Molecular Formula**: 그린 구조의 분자식
2. **Formula Calculation**: N/C-terminus의 경우 분자식 뺄셈 계산 과정 및 결과 (예: C4H5 - C3H2 = CH3)
3. **Monoisotopic Weight**: 그린 구조의 절대 질량 (Calculated)
4. **Molecular Weight**: 그린 구조의 절대 분자량 (Calculated)
5. **Delta Monoisotopic Weight**: 저장될 delta 값 (절대 질량 - target 아미노산 무게)
6. **Delta Molecular Weight**: 저장될 delta 분자량 (절대 분자량 - target 아미노산 무게)

**분자식 계산 로직**:
- **N-terminus와 C-terminus**: 그린 구조의 분자식에서 target 아미노산의 분자식을 차감
  - 계산 공식: `결과 분자식 = 그린 구조 분자식 - target 아미노산 분자식`
  - 예시 1: C4H5 - C3H2 = CH3
  - 예시 2: C3H2 - C1H4 = C2H-2 (음수 계수 허용)
- **Side Chain와 Crosslinking**: 분자식 계산 없음 (절대 값 그대로 사용)

**표시 예시**:

**Single-site N-terminus (Target: M)**
```
Molecular Formula: C5H11NO2S
Formula Calculation: C5H11NO2S - C5H11NO2S = (Empty formula, meaning same as target)
Monoisotopic Weight: 97.000 (Calculated)
Molecular Weight: 97.000 (Calculated)

Delta Monoisotopic Weight: -52.05105 (97.000 - 149.05105 [M])
Delta Molecular Weight: -52.20800 (97.000 - 149.20800 [M])
→ This delta value and result formula will be saved
```

**Single-site C-terminus (Target: ALL, based on Glycine)**
```
Molecular Formula: CHO
Formula Calculation: CHO - C2H5NO2 = C-1H-4N-1O-1 (Negative coefficients allowed)
Monoisotopic Weight: 28.010 (Calculated)
Molecular Weight: 28.010 (Calculated)

Delta Monoisotopic Weight: -47.02203 (28.010 - 75.03203 [G])
Delta Molecular Weight: -47.05700 (28.010 - 75.06700 [G])
→ This delta value and result formula will be saved (based on Glycine)
```

**Single-site N-terminus (Target: ALL, Formylation 예시)**
```
Molecular Formula: CHO
Formula Calculation: CHO - C2H5NO2 = C-1H-4N-1O-1
Monoisotopic Weight: 28.010 (Calculated)
Molecular Weight: 28.010 (Calculated)

Delta Monoisotopic Weight: -47.02203 (28.010 - 75.03203 [G])
Delta Molecular Weight: -47.05700 (28.010 - 75.06700 [G])
→ This delta value and result formula will be saved (based on Glycine)
```

**Single-site Side Chain (Target: C)**
```
Molecular Formula: C6H11NO2S
Monoisotopic Weight: 165.000 (Calculated)
Molecular Weight: 165.000 (Calculated)

→ This absolute value will be saved (No delta calculation for Side Chain)
→ No formula calculation (absolute formula saved as is)
```

**Crosslinking (Target1: C, Target2: C)**
```
Molecular Formula: C6H10N2O2S2
Monoisotopic Weight: 240.292 (Calculated)
Molecular Weight: 240.292 (Calculated)

→ This absolute value will be saved (No delta calculation for Crosslinking)
→ No formula calculation (absolute formula saved as is)
```

**저장되는 데이터**:
- **N-terminus와 C-terminus**:
  - `molecularFormula`: 뺄셈 결과 분자식 (예: CH3, C2H-2)
  - `originalFormula`: 원본 그린 구조의 분자식 (예: C4H5)
  - `formulaCalculation`: 전체 계산 과정 (예: "C4H5 - C3H2 = CH3")
- **Side Chain와 Crosslinking**:
  - `molecularFormula`: 그린 구조의 분자식 그대로
  - `originalFormula`: undefined
  - `formulaCalculation`: undefined

**구현 위치**:
- ChemDoodleCanvas.svelte의 결과 표시 영역
- Target 정보를 prop으로 받아서 delta 및 formula 계산/표시
- formula_util.ts의 parseFormula, subtractFormula, formatFormulaSubtraction 함수 사용

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
