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

##### 3.1.3 Internal site (내부 위치)
- **설명**: 시퀀스의 맨 앞과 맨 뒤가 아닌 내부 영역에 modification이 적용됨
- **Target 옵션**:
  - `특정 아미노산`: 해당 아미노산이 내부 위치에 있을 때 적용
    - 예: `MSTINM`에서 `S`, `T`, `I`, `N`이 내부 위치

### 3.2 Crosslinking (교차 결합)

두 개의 아미노산이 쌍으로 결합하여 변화가 일어나는 modification 타입입니다.

#### 예시
- Disulfide bond: `C-C` 결합 (질량 -2.02 감소)

#### Condition (조건)

##### 3.2.1 Everywhere (모든 위치)
- **설명**: Target 1과 Target 2가 시퀀스 내 어느 위치에 있어도 결합 가능
- **동작**: 현재의 Disulfide 기능과 동일
- **예시**: `MCSTINCM`에서 첫 번째 C와 마지막 C가 결합 가능

##### 3.2.2 Adjacent (인접)
- **설명**: Target 1과 Target 2가 서로 바로 인접해 있을 때만 결합 가능
- **순서**: 1-2 또는 2-1 모두 가능
- **예시**: `MCCSTINM`에서 연속된 두 C가 결합 가능

##### 3.2.3 Adjacent (Target 1→2) (인접, 순서 1→2)
- **설명**: Target 1과 Target 2가 인접하고, 반드시 1-2 순서여야 함
- **예시**: Target 1이 C, Target 2가 D일 때
  - `MCDINM`: C 다음에 D가 있으므로 결합 가능
  - `MDCINM`: D 다음에 C가 있으므로 결합 불가능

##### 3.2.4 Adjacent (Target 2→1) (인접, 순서 2→1)
- **설명**: Target 1과 Target 2가 인접하고, 반드시 2-1 순서여야 함
- **예시**: Target 1이 C, Target 2가 D일 때
  - `MDCINM`: D 다음에 C가 있으므로 결합 가능
  - `MCDINM`: C 다음에 D가 있으므로 결합 불가능

##### 3.2.5 Distance (거리 조건)
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
| **Disulfide** | Crosslinking | Everywhere | C | C | Cysteine 간 결합 |

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

// Crosslinking 예시
{
  name: "Custom_Disulfide",
  type: "Crosslinking",
  target1: "C",
  target2: "C",
  condition: "Everywhere",  // or "Adjacent", "Adjacent (Target 1→2)", "Adjacent (Target 2→1)", "Distance"
  // Distance인 경우 추가 필드
  distanceOperator: ">",  // "=", "<", ">"
  distanceValue: 1,
  structureName: "disulfide_bond",
  moleculeJson: {...},
  molecularFormula: "...",
  monoisotopicWeight: "-2.02",
  molecularWeight: "-2.02"
}
```

## 6. STM 화면 통합 계획

### 6.1 UI 요구사항
1. Potential 화면에서 저장된 modification 목록을 불러오기
2. 사용자가 적용할 modification을 선택할 수 있는 UI 추가
3. 기존 Formylation, Admidation, Disulfide와 함께 사용 가능해야 함

### 6.2 계산 로직 통합
1. `stm_helper.ts`의 `generatePossibilities` 함수 확장
2. Single-site modification 적용 로직 구현
   - N-terminus, C-terminus, Internal site 조건 처리
   - Target 필터링 로직
3. Crosslinking modification 적용 로직 구현
   - Everywhere, Adjacent, Distance 조건 처리
   - 기존 Disulfide 로직 재사용 및 일반화

### 6.3 성능 고려사항
- 여러 custom modification이 동시에 적용될 경우 조합 폭발 가능성
- Memoization 전략 유지
- 사용자에게 계산 복잡도 경고 (선택 사항)

## 7. 검증 요구사항

### 7.1 Potential 화면에서의 검증
- ✅ 이미 구현됨: Modification name 중복 체크
- ✅ 이미 구현됨: Structure name 및 molecular properties 필수 입력
- ✅ 이미 구현됨: Target amino acid 선택 필수
- ✅ 이미 구현됨: Distance value 최소값 검증 (≥ 1)

### 7.2 STM 화면에서의 검증
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
