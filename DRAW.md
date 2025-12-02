# Chemical Draw Canvas - 기능 명세서

## 개요
Chemical Draw Canvas는 ChemDoodle Web Components를 사용하여 화학 구조를 그리고, 분자 속성을 계산한 후 LocalStorage에 저장하는 페이지입니다. 주로 비표준 아미노산(ncAA)을 정의하고 저장하는 용도로 사용됩니다.

## 핵심 기능

### 1. 화학 구조 그리기
**파일**: `src/routes/draw/+page.svelte:108-116`

**기능**:
- ChemDoodle Web Components를 사용한 인터랙티브 화학 구조 편집기
- 원자, 결합, 고리 구조 등 다양한 화학 요소 그리기 지원
- 실시간 구조 미리보기

**컴포넌트**:
```svelte
<ChemDoodleCanvas
  bind:this={chemDoodleCanvas}
  bind:structureName={chemicalTitle}
  bind:molecularFormula
  bind:monoisotopicWeight
  bind:molecularWeight
  bind:moleculeJson
  showStructureName={false}
/>
```

**바인딩 데이터**:
- `structureName`: 화학 구조의 저장 타이틀
- `molecularFormula`: 계산된 분자식 (예: C6H12N2O)
- `monoisotopicWeight`: 계산된 단일 동위원소 질량
- `molecularWeight`: 계산된 분자량
- `moleculeJson`: ChemDoodle JSON 형식의 구조 데이터

### 2. 분자 속성 자동 계산
**파일**: `src/lib/components/potential/ChemDoodleCanvas.svelte`

**계산 항목**:
1. **Molecular Formula** (분자식)
   - 원자 종류와 개수로 표현
   - 예: C6H12N2O (탄소 6개, 수소 12개, 질소 2개, 산소 1개)

2. **Monoisotopic Weight** (단일 동위원소 질량)
   - 각 원소의 가장 풍부한 동위원소 질량 기준
   - 질량 분석에서 주로 사용
   - 소수점 5자리까지 표시

3. **Molecular Weight** (분자량)
   - 자연계 동위원소 비율을 고려한 평균 질량
   - 화학 계산에서 주로 사용
   - 소수점 5자리까지 표시

**계산 조건**:
- ChemDoodle의 내장 알고리즘 사용
- 구조가 그려지면 자동으로 계산
- Calculate 버튼 클릭 시 최종 확정

### 3. 데이터 저장 시스템
**파일**: `src/routes/draw/+page.svelte:19-41`

#### A. 저장 검증 로직

**타이틀 검증**:
```javascript
function checkTitleValid() {
    // 1. 타이틀 입력 확인
    if (!chemicalTitle) {
        alert('Please enter a title to save.');
        return false;
    }

    // 2. 공백 검사
    if (chemicalTitle.includes(' ')) {
        alert('Spaces cannot be entered.');
        return false;
    }

    // 3. 중복 검사
    if (checkTitleDuplicated()) {
        alert('The name already exists.');
        return false;
    }

    return true;
}
```

**분자 속성 검증**:
```javascript
// 분자식, 질량이 모두 계산되어야 저장 가능
if (!$molecularFormula || !$monoisotopicWeight || !$molecularWeight) {
    alert('Please calculate molecular properties first.');
    return;
}
```

#### B. 저장 데이터 구조

**LocalStorage 키**: `moleculeData`

**데이터 형식**:
```javascript
{
  title: 'ncAA_name',              // 고유 식별자 (공백 불허)
  moleculeJson: {...},              // ChemDoodle JSON 구조
  molecularFormula: 'C6H12N2O',    // 분자식
  monoisotopicWeight: '144.10111',  // 단일 동위원소 질량 (문자열)
  molecularWeight: '144.17280'      // 분자량 (문자열)
}
```

**저장 로직**:
```javascript
function saveData() {
    if (!checkTitleValid()) return;

    if (!$molecularFormula || !$monoisotopicWeight || !$molecularWeight) {
        alert('Please calculate molecular properties first.');
        return;
    }

    const dataSet = {
        title: chemicalTitle,
        moleculeJson: $moleculeJson,
        molecularFormula: $molecularFormula,
        monoisotopicWeight: $monoisotopicWeight,
        molecularWeight: $molecularWeight
    };

    let storedData = JSON.parse(localStorage.getItem('moleculeData') || '[]');
    storedData.push(dataSet);
    localStorage.setItem('moleculeData', JSON.stringify(storedData));

    loadSavedData();
    alert('Data Saved!');
    resetForm();
}
```

### 4. 저장된 데이터 관리
**파일**: `src/routes/draw/+page.svelte:43-53, 127-137`

#### A. 데이터 목록 표시

**컴포넌트**: `MolecularItem`
```svelte
{#if $savedData.length > 0}
  <ul class="list-group">
    {#each $savedData as data, index (data.title)}
      <li class="list-group-item">
        <MolecularItem {data} {index} {deleteData} />
      </li>
    {/each}
  </ul>
{:else}
  <p class="alert alert-info">No data available.</p>
{/if}
```

**표시 항목**:
- Title (타이틀)
- Molecular Formula (분자식)
- Monoisotopic Weight (단일 동위원소 질량)
- Molecular Weight (분자량)
- Delete 버튼

#### B. 데이터 삭제

```javascript
function deleteData(index) {
    let storedData = JSON.parse(localStorage.getItem('moleculeData') || '[]');
    storedData.splice(index, 1);
    localStorage.setItem('moleculeData', JSON.stringify(storedData));
    savedData.set([...storedData]);
}
```

**삭제 조건**:
- 인덱스 기반 삭제
- LocalStorage에서 즉시 제거
- UI 자동 업데이트

### 5. 폼 초기화
**파일**: `src/routes/draw/+page.svelte:55-64`

```javascript
function resetForm() {
    chemicalTitle = '';
    molecularFormula.set('');
    monoisotopicWeight.set('');
    molecularWeight.set('');
    moleculeJson.set({});

    if (chemDoodleCanvas) {
        chemDoodleCanvas.clearCanvas();
    }
}
```

**초기화 시점**:
- 데이터 저장 성공 후 자동 실행
- 새로운 구조 작성을 위한 준비

## 데이터 흐름

### 입력 단계
1. 사용자가 타이틀 입력
2. ChemDoodle 캔버스에서 화학 구조 그리기
3. Calculate 버튼으로 분자 속성 계산

### 저장 단계
1. "save ncAA" 버튼 클릭
2. 타이틀 검증 (공백, 중복 체크)
3. 분자 속성 검증 (계산 완료 확인)
4. LocalStorage에 데이터 추가
5. 폼 초기화

### 관리 단계
1. 저장된 데이터 목록 자동 로드
2. MolecularItem 컴포넌트로 각 항목 표시
3. Delete 버튼으로 개별 삭제 가능

## 타이틀 검증 규칙

### 1. 필수 입력
- 타이틀이 비어있으면 저장 불가
- 에러 메시지: "Please enter a title to save."

### 2. 공백 불허
```javascript
const hasSpace = chemicalTitle.includes(' ');
if (hasSpace) {
    alert('Spaces cannot be entered.');
    return false;
}
```

**이유**: 타이틀이 아미노산 식별자로 사용되므로 단일 문자열이어야 함

### 3. 중복 불허
```javascript
function checkTitleDuplicated() {
    const storedData = JSON.parse(localStorage.getItem('moleculeData') || '[]');
    const isDuplicate = storedData.some(data => data.title === chemicalTitle);
    return isDuplicate;
}
```

**이유**: 타이틀이 고유 키(unique key)로 사용됨

## 다른 페이지와의 통합

### STM 페이지와의 연동
**파일**: `src/routes/stm/+page.svelte`, `src/lib/components/NcAACodonSelector.svelte`

**사용 방식**:
1. Draw 페이지에서 ncAA 구조 저장
2. STM 페이지에서 `localStorage.getItem('moleculeData')` 로드
3. 저장된 ncAA를 코돈 매핑에 사용
4. ncAA의 monoisotopic weight를 질량 계산에 적용

**예시**:
```javascript
// STM에서 ncAA 데이터 로드
let savedNcAA = JSON.parse(localStorage.getItem('moleculeData') || '[]');

// ncAA 선택 및 코돈 할당
codonTitles.set({
    B: ['AUG'],  // B라는 ncAA를 AUG 코돈에 할당
    // ... 기타 ncAA
});

// 질량 계산 시 사용
const ncAAWeight = savedNcAA.find(item => item.title === 'B')?.monoisotopicWeight;
```

### Potential Modification과의 연동
**파일**: `src/routes/potential/+page.svelte`, `src/lib/components/potential/ChemDoodleCanvas.svelte`

**사용 방식**:
1. Draw 페이지에서 화학 수식 구조 저장
2. Potential Modification 페이지에서 Load Template로 불러오기
3. 타겟 아미노산 설정 및 조건 추가
4. Modification으로 저장

**참고**: Potential Modification 페이지에는 자체 ChemDoodleCanvas가 있어 직접 그릴 수도 있음

## 주요 컴포넌트

### ChemDoodleCanvas
**파일**: `src/lib/components/potential/ChemDoodleCanvas.svelte`

**기능**:
- 화학 구조 그리기 인터페이스
- 분자 속성 자동 계산
- JSON 형식으로 구조 저장
- Calculate/Clear 버튼 제공

**Props**:
- `showStructureName`: 구조 이름 입력 필드 표시 여부
- `modificationType`: (Potential에서만) Single-site/Crosslinking 타입
- `targetAminoAcid`: (Potential에서만) 타겟 아미노산

### MolecularItem
**파일**: `src/lib/components/MolecularItem.svelte`

**기능**:
- 저장된 분자 데이터 카드 형식 표시
- 분자식, 질량 정보 표시
- Delete 버튼 제공

**Props**:
- `data`: 분자 데이터 객체
- `index`: 배열 인덱스
- `deleteData`: 삭제 함수

## UI/UX 특징

### 1. 실시간 피드백
- ChemDoodle 캔버스에서 그릴 때마다 즉시 반영
- Calculate 버튼으로 분자 속성 즉시 계산

### 2. 명확한 검증 메시지
- "Please enter a title to save."
- "Spaces cannot be entered."
- "The name already exists."
- "Please calculate molecular properties first."

### 3. 자동 폼 초기화
- 저장 성공 후 자동으로 폼 리셋
- 연속 작업 편의성 제공

### 4. 저장 데이터 즉시 반영
- 저장/삭제 시 목록 자동 업데이트
- LocalStorage와 UI 동기화

## 데이터 저장 위치

**LocalStorage 키**: `moleculeData`

**형식**: JSON Array
```json
[
  {
    "title": "B",
    "moleculeJson": {...},
    "molecularFormula": "C6H12N2O",
    "monoisotopicWeight": "144.10111",
    "molecularWeight": "144.17280"
  },
  {
    "title": "d1",
    "moleculeJson": {...},
    "molecularFormula": "C8H14N2O2",
    "monoisotopicWeight": "170.10553",
    "molecularWeight": "170.21040"
  }
]
```

## 제약 조건

### 1. 타이틀 제약
- 공백 불허 (단일 식별자로 사용)
- 중복 불허 (고유 키)
- 필수 입력

### 2. 계산 제약
- 저장 전 반드시 Calculate 실행 필요
- 분자식, 두 가지 질량 모두 계산되어야 함

### 3. 브라우저 제약
- LocalStorage 사용 (브라우저별 저장)
- 브라우저 데이터 삭제 시 모든 데이터 손실
- 백업/복원 기능 없음

## 사용 예시

### ncAA 저장 워크플로우
1. Draw 페이지 접속
2. "Saved Title"에 `B` 입력 (ncAA 식별자)
3. ChemDoodle 캔버스에서 비표준 아미노산 구조 그리기
4. "save ncAA" 버튼 클릭
5. 분자 속성 자동 계산 및 저장 완료
6. "Saved Molecule Data" 섹션에서 확인

### Potential Modification 저장 워크플로우
1. Draw 페이지에서 화학 수식 구조 저장 (예: `d1`)
2. Potential Modification 페이지로 이동
3. Load Template에서 저장한 구조 선택
4. Single-site 또는 Crosslinking 설정
5. Potential Modification으로 최종 저장

## ChemDoodle 통합

### 지원 기능
- 원자 추가/삭제
- 결합 생성 (단일, 이중, 삼중 결합)
- 고리 구조 (벤젠, 사이클로헥산 등)
- 입체화학 표시
- 전하 표시

### 계산 알고리즘
- 내장 원소 질량 테이블 사용
- 동위원소 비율 반영 (Molecular Weight)
- 최빈 동위원소 기준 (Monoisotopic Weight)
- Hill System 분자식 표기법

## 성능 고려사항

### LocalStorage 용량
- 브라우저별 제한: 약 5-10MB
- JSON 구조 데이터로 인한 용량 증가
- 대량 저장 시 성능 저하 가능

### 권장 사항
- ncAA 개수: 최대 20-30개 권장
- 복잡한 구조는 파일 크기 증가
- 주기적으로 불필요한 데이터 삭제

이 문서는 Chemical Draw Canvas 페이지의 모든 기능과 사용 방법을 상세히 기술하여, 개발자와 사용자가 시스템을 정확히 이해하고 활용할 수 있도록 합니다.
