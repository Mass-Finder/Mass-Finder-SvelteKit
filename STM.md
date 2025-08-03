# STM (Sequence to Mass) 페이지 분석

## 개요
STM 페이지는 입력된 RNA 시퀀스를 기반으로 다양한 생물학적 변이 가능성을 계산하고, 각 변이에 따른 분자량을 예측하는 화면입니다.

## 핵심 기능

### 1. RNA 시퀀스 입력 및 처리
- **파일**: `src/routes/stm/+page.svelte:15`
- **변수**: `rnaSeq` - 사용자가 입력한 RNA 시퀀스
- **검증**: 
  - 길이가 3의 배수여야 함 (코돈 단위)
  - Stop 코돈(UAG, UAA, UGA) 이전까지만 처리
  - 유효하지 않은 문자("?") 검사

### 2. 변이 종류

#### A. Non-canonical Amino Acid (ncAA) 관련 변이
- **파일**: `src/lib/helper/stm_helper.ts:49-78`
- **종류**:
  1. **Full incorporation**: ncAA로 완전히 대체
  2. **Truncated**: 번역 중단 현상
  3. **Skipped**: 해당 코돈 건너뛰기

#### B. 자연 아미노산 처리
- **파일**: `src/lib/helper/stm_helper.ts:43-47`
- 표준 20개 아미노산으로의 번역
- 사용자가 선택한 아미노산만 포함

#### C. Disulfide Bond 형성
- **파일**: `src/lib/helper/stm_helper.ts:180-226`
- 시스테인(C) 2개 이상 시 가능한 모든 조합 계산
- 각 결합당 -2.02 Da 질량 감소

#### D. Formylation
- **파일**: `src/routes/stm/+page.svelte:22, 218`
- N-말단 포밀화 (+27.99 Da)
- 선택적 적용 가능

### 3. 커스터마이제이션 가능한 구성요소

#### A. ncAA 설정 (src/routes/stm/+page.svelte:19-32)
```javascript
// 사용할 ncAA 정의
let ncAA = { B: 0.0, J: 0.0, O: 0.0, U: 0.0, X: 0.0, Z: 0.0 };

// 각 ncAA에 할당할 코돈들
let codonTitles = writable({
    B: [], J: [], O: [], U: [], X: [], Z: []
});
```

#### B. Ion Adduct 타입 (src/routes/stm/+page.svelte:21)
```javascript
let ionTypes = ['H']; // 기본값: 수소 이온
// 가능한 타입: H+, Na+, K+, NH4+ 등
```

#### C. 아미노산 선택 (src/routes/stm/+page.svelte:13)
```javascript
let selectedMonoisotopicAminos = { ...aminoMap };
// 계산에 포함할 표준 아미노산 선택
```

### 4. 계산 알고리즘 핵심

#### A. 재귀적 가능성 생성 (stm_helper.ts:33-103)
- **메모이제이션** 사용으로 성능 최적화
- 각 코돈 위치에서 가능한 모든 변이 조합 생성
- 깊이 우선 탐색으로 전체 시퀀스 조합 계산

#### B. 질량 계산 (stm_helper.ts:117-143)
```javascript
// 기본 질량 계산
baseWeight += aminoMap[item.letter]; // 또는 ncAA 질량
baseWeight -= MassFinderHelper.getWaterWeight(baseCount); // 물 손실

// 최종 질량 = 기본 질량 + 포밀화 + 이온 부가체 + 디설파이드
finalWeight = baseWeight + formylationWeight + adductWeight - disulfideReduction;
```

#### C. 중복 제거 및 필터링 (stm_helper.ts:108, 114-115)
- 빈 시퀀스 제거
- 3개 이하 아미노산 시퀀스 제외
- 유니크 키 기반 중복 제거

### 5. 사용자 입력 검증 시스템

#### A. 필수 검증 항목 (src/routes/stm/+page.svelte:70-104)
1. RNA 시퀀스 존재 여부
2. 유효한 문자 사용 여부
3. 3의 배수 길이 확인
4. ncAA-코돈 매핑 완성도
5. 코돈 테이블 내 존재 여부

#### B. 커스텀 검증 함수들
```javascript
// ncAA가 선택되었으나 코돈이 미설정된 경우 체크
function checkCustomCodonTitles1() // :107-120

// 입력된 코돈이 실제 코돈 테이블에 존재하는지 체크  
function checkCustomCodonTitles2() // :122-151
```

## 변이 조건 커스터마이제이션 방법

### 1. 새로운 ncAA 타입 추가
`src/routes/stm/+page.svelte:19-32`에서 ncAA 객체와 codonTitles에 새 키 추가

### 2. 변이 확률/조건 수정
`src/lib/helper/stm_helper.ts:49-92`에서 각 변이 타입의 발생 조건 수정

### 3. 새로운 이온 타입 추가
`src/lib/helper/amino_mapper.ts`에서 ionTypes 확장 후 `src/routes/stm/+page.svelte:21`에서 활용

### 4. 질량 계산 로직 수정
`src/lib/helper/stm_helper.ts:117-143`에서 질량 계산 공식 수정

### 5. 필터링 조건 변경
`src/lib/helper/stm_helper.ts:108, 114-115`에서 결과 필터링 조건 조정

## 컴포넌트 구조

### 주요 컴포넌트
- **SeqConverter**: RNA 시퀀스 입력/변환
- **NcAACodonSelector**: ncAA와 코돈 매핑 설정
- **StmAdductSelector**: 이온 부가체 선택
- **FormylationSelector**: 포밀화 옵션
- **AminoMapSelector**: 표준 아미노산 선택
- **StmResultTable**: 계산 결과 표시

### 데이터 흐름
1. 사용자 입력 → 검증 → StmHelper.calc() 호출
2. 재귀적 가능성 생성 → 질량 계산 → 결과 필터링
3. 최종 결과를 StmResultTable로 표시

## 성능 최적화 포인트
- **메모이제이션**: 동일한 하위 문제 재계산 방지
- **조기 종료**: Stop 코돈 발견 시 계산 중단
- **필터링**: 무의미한 결과 사전 제거
- **중복 제거**: 동일한 결과의 중복 생성 방지

## 커스터마이제이션을 위한 주요 파일들
- `src/lib/helper/stm_helper.ts:generatePossibilities()` - 핵심 변이 생성 로직
- `src/lib/helper/amino_mapper.ts` - 새로운 아미노산이나 이온 타입 추가
- `src/routes/stm/+page.svelte` - UI 및 사용자 입력 처리
- `src/lib/components/stm/NcAACodonSelector.svelte` - ncAA 선택 인터페이스

## 현재 지원하는 변이 조건들

### 1. 자연 번역
- 표준 코돈 테이블 번역
- 사용자 선택 가능한 아미노산 부분집합
- 물 손실량 계산

### 2. ncAA 도입
- 자연 아미노산의 완전 대체
- ncAA당 커스텀 코돈 할당
- ncAA 분자량으로 질량 계산

### 3. 번역 오류
- **Truncation**: ncAA 위치에서 조기 종료
- **Skipping**: 도입 없이 코돈 우회
- 생물학적 현실성 모델링

### 4. 번역 후 수정
- **Disulfide bonds**: 가능한 모든 C-C 결합
- **Formylation**: 선택적 N-말단 수정
- 각 수정에 대한 질량 조정

### 5. 이온 부가체 형성
- 시퀀스당 다중 이온 타입
- 각 부가체별 별도 결과
- 이온 타입별 질량 이동 계산