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
   
2. **Internal initiation**: 앞쪽 절단으로 인한 부분 시퀀스
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

#### D. Formylation (N-말단 포밀화)
**파일**: `src/lib/helper/stm_helper.ts:151-171`, `src/routes/stm/+page.svelte`

**기능 정의**:
- **질량 변화**: +27.99 Da
- **표시**: 시퀀스 앞에 소문자 'f' 추가
- **적용 조건** (모두 만족해야 함):
  1. 첫 번째 코돈이 AUG여야 함
  2. 실제로 첫 번째 아미노산이 번역되어야 함
     - 자연 아미노산 M으로 번역된 경우
     - AUG에 할당된 ncAA로 번역된 경우
  3. Internal initiation이 적용되지 않은 경우 (N-말단 존재)
  4. 사용자가 Formylation 옵션을 활성화한 경우

**사용자 제어**:
- FormylationSelector 컴포넌트를 통한 Yes/No/Unknown 선택
- M 아미노산을 선택에서 제외하면 M 번역 시 formylation 적용 안 됨

#### E. Admidation (C-말단 아미드화)
**파일**: `src/lib/helper/stm_helper.ts:272-277`, `src/lib/components/AdmidationSelector.svelte`

**기능 정의**:
- **질량 변화**: -0.98 Da
- **표시**: 시퀀스 끝에 소문자 'n' 추가
- **적용 조건**:
  1. 사용자가 Admidation 옵션을 활성화한 경우
  2. Premature termination이 적용되지 않은 경우 (C-말단 존재)

**사용자 제어**:
- AdmidationSelector 컴포넌트를 통한 Yes/No/Unknown 선택

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
- H+, Na+, K+, NH4+, Li+, Cs+, Ca2+, Mg2+, none
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
- Formylation 조건에도 영향 (M 체크 해제 시 formylation 불가)

#### D. 후처리 옵션 설정
**파일**: `src/routes/stm/+page.svelte:22-24`
```javascript
let formylation = false; // N-말단 포밀화
let admidation = false;  // C-말단 아미드화
```

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
- **Internal initiation**: 절단 위치부터 끝까지
- **Premature termination**: 시작부터 절단 위치까지 (절단 위치 포함)

#### C. 질량 계산
**파일**: `src/lib/helper/stm_helper.ts:246-289`

**계산 공식**:
```javascript
// 기본 질량 = Σ(아미노산 질량) - 물 손실량
baseWeight = Σ(amino_weight) - water_loss

// 최종 질량 = 기본 질량 + 후처리 + 이온 부가체
finalWeight = baseWeight + formylation + admidation + adduct_weight + disulfide_reduction
```

**질량 구성 요소**:
- **아미노산 질량**: 자연 AA 또는 ncAA monoisotopic weight
- **물 손실**: 펩타이드 결합 형성으로 인한 손실
- **Formylation**: +27.99 Da (조건부)
- **Admidation**: -0.98 Da (조건부)
- **Disulfide**: -2.02 Da × 결합 수
- **Ion adduct**: 이온 타입별 고유 질량

#### D. 결과 필터링 및 중복 제거
**파일**: `src/lib/helper/stm_helper.ts:240-244, 368-373`

**필터링 조건**:
- 빈 시퀀스 제거
- 3개 이하 아미노산 시퀀스 제외
- 유니크 키 기반 중복 제거: `시퀀스-디설파이드패턴-이온타입`

### 5. Reason 분류 시스템

#### A. Reason 수집 로직
**파일**: `src/lib/helper/stm_helper.ts:291-322`

**수집 순서**:
1. **시퀀스 레벨 절단**: Internal initiation, Premature termination
2. **개별 아미노산 레벨**: ncAA incorporated, Skipped
3. **기본값**: Only natural AA (변화 없는 경우)

#### B. Reason 타입 정의
- **Only natural AA**: 표준 번역, 변화 없음
- **ncAA incorporated**: 하나 이상의 ncAA 사용
- **Internal initiation**: 앞쪽 절단으로 인한 부분 시퀀스
- **Premature termination**: 뒤쪽 절단으로 인한 부분 시퀀스  
- **Skipped**: 코돈 건너뛰기 발생
- **Disulfide**: 디설파이드 결합 형성

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
- **FormylationSelector**: N-말단 포밀화 옵션
- **AdmidationSelector**: C-말단 아미드화 옵션
- **AminoMapSelector**: 표준 아미노산 선택
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

#### A. Formylation 제약
- 첫 번째 코돈이 AUG여야 함
- 실제 번역이 발생해야 함
- Internal initiation 시 적용 불가 (N-말단 부재)

#### B. Admidation 제약
- Premature termination 시 적용 불가 (C-말단 부재)

#### C. 절단 조건
- ncAA가 할당된 위치에서만 절단 발생
- Internal initiation과 Premature termination은 상호 배타적

### 11. 주요 알고리즘 파라미터

#### A. 필터링 기준
- 최소 시퀀스 길이: 4개 아미노산
- 최대 결과 수: 제한 없음 (사용자 시스템 성능에 의존)

#### B. 질량 정밀도
- Monoisotopic weight 사용
- 소수점 정밀도: 시스템 기본값 사용

#### C. 조합 생성 한계
- ncAA 개수: 최대 6개 (B, J, O, U, X, Z)
- 이론적 조합 수: 지수적 증가 (실제로는 필터링으로 제한)