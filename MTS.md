# Mass Finder (MTS) - 사용자 스토리 및 로직 문서

## 개요
Mass Finder의 MTS (Mass to Sequence) 기능은 감지된 분자량으로부터 가능한 아미노산 시퀀스를 예측하는 생화학 분석 도구입니다. 시뮬레이티드 어닐링 알고리즘을 사용하여 최적의 아미노산 조합을 찾아냅니다.

---

## 주요 사용자 스토리

### 1. 기본 분자량 분석
**As a** 생화학 연구자  
**I want to** 감지된 분자량을 입력하여 가능한 아미노산 시퀀스를 찾고 싶다  
**So that** 질량 분석 데이터로부터 단백질 구조를 추정할 수 있다

**Acceptance Criteria:**
- 감지된 분자량(Detected Mass)을 필수로 입력해야 함
- 시뮬레이티드 어닐링 알고리즘으로 최적해 탐색
- 분자량 정확도 기준으로 결과 정렬
- 최대 100개의 결과 제공

### 2. 알려진 시퀀스 활용
**As a** 연구자  
**I want to** 이미 알고 있는 부분 시퀀스(Known Sequence)를 제약 조건으로 사용하고 싶다  
**So that** 더 정확한 예측 결과를 얻을 수 있다

**Acceptance Criteria:**
- Known Sequence는 선택사항
- 입력된 시퀀스는 모든 결과에 포함되어야 함
- 선택된 아미노산과 ncAA만 유효한 입력으로 인정
- 자동으로 대문자 변환 처리

### 3. RNA 기반 참조 시퀀스 활용
**As a** 분자생물학 연구자  
**I want to** RNA 시퀀스를 입력하여 유사한 아미노산 시퀀스를 찾고 싶다  
**So that** 전사 후 번역 과정을 고려한 분석을 할 수 있다

**Acceptance Criteria:**
- RNA 시퀀스는 A, U, G, C만 허용
- 3의 배수 길이만 유효 (코돈 단위)
- 자동으로 아미노산 시퀀스 변환
- Stop 코돈에서 자동 중단
- 참조 시퀀스 활성화 알림 표시

### 4. 포밀레이션 및 이온 부가물 처리
**As a** 질량분석 전문가  
**I want to** 포밀레이션과 이온 부가물을 고려한 분석을 하고 싶다  
**So that** 실제 질량분석 조건을 반영한 정확한 결과를 얻을 수 있다

**Acceptance Criteria:**
- 포밀레이션: yes/no/unknown 선택 가능
- 9가지 이온 부가물 지원 (H+, Na+, K+ 등)
- 포밀레이션은 결과 시퀀스 맨 앞에 'f'로 표시
- 이온 무게는 최종 분자량에 추가

### 5. 사용자 정의 아미노산 선택
**As a** 연구자  
**I want to** 특정 아미노산만 사용하거나 비표준 아미노산(ncAA)을 추가하고 싶다  
**So that** 특수한 실험 조건에 맞는 분석을 할 수 있다

**Acceptance Criteria:**
- 20개 표준 아미노산 개별 선택/해제 가능
- 6개 ncAA (B, J, O, U, X, Z) 지원
- ncAA는 monoisotopic weight와 molecular weight 직접 입력
- 선택된 아미노산만 알고리즘에서 사용

### 6. 시퀀스 중복 감지 및 처리
**As a** 사용자  
**I want to** Known Sequence와 RNA 시퀀스 간 중복을 자동으로 감지하고 처리하고 싶다  
**So that** 중복된 정보로 인한 오류를 방지할 수 있다

**Acceptance Criteria:**
- 완전 포함, 부분 중복, 접두사/접미사 중복 감지
- 자동 중복 제거 및 알림 메시지 표시
- 최적화된 참조 시퀀스 생성

---

## 핵심 로직 조건

### 입력 검증 로직

#### 1. Detected Mass 검증
```typescript
// 조건: 필수 입력값
if (detectedMass === null) {
    alert('Please Input Detected Mass');
    return false;
}
```

#### 2. Known Sequence 검증
```typescript
// 조건: 선택된 아미노산 또는 ncAA만 허용
function validateknownSequence() {
    let filteredNcAA = Object.fromEntries(
        Object.entries(fullNcAA).filter(([key, value]) => value !== null)
    );
    
    for (let char of knownSequence) {
        if (!aminoMap[char] && !filteredNcAA[char]) {
            return false; // 유효하지 않은 아미노산
        }
    }
    return true;
}
```

#### 3. RNA Sequence 검증
```typescript
// 조건: A,U,G,C만 허용 + 3의 배수 길이
function validateProteinSequence() {
    if (proteinSequence === '') return true; // 빈 값은 유효
    
    const validRnaBases = ['A', 'U', 'G', 'C'];
    for (let char of proteinSequence) {
        if (!validRnaBases.includes(char)) return false;
    }
    
    if (proteinSequence.length % 3 !== 0) {
        alert('RNA sequence length must be a multiple of 3 (codon units)');
        return false;
    }
    return true;
}
```

### RNA → 아미노산 변환 로직

```typescript
// 조건: 3개씩 코돈 분할, Stop 코돈에서 중단
function convertRnaToAminoAcids(rnaSequence) {
    const codons = rnaSequence.match(/.{1,3}/g) || [];
    let aminoSequence = '';
    
    for (const codon of codons) {
        if (codon.length === 3) {
            const amino = codonTableRtoS[codon];
            if (amino && amino !== '[Stop]') {
                aminoSequence += amino;
            } else if (amino === '[Stop]') {
                break; // Stop 코돈에서 중단
            }
        }
    }
    return aminoSequence;
}
```

### 시퀀스 중복 감지 로직

```typescript
// 조건: 4단계 중복 검사
function checkSequenceOverlap(known, converted) {
    if (!known || !converted) return { hasOverlap: false };
    
    // 1. 완전 포함 검사
    if (converted.indexOf(known) !== -1) {
        return { hasOverlap: true, message: "Known Sequence included in RNA" };
    }
    
    // 2. 역방향 완전 포함 검사
    if (known.indexOf(converted) !== -1) {
        return { hasOverlap: true, message: "RNA sequence included in Known" };
    }
    
    // 3. 접미사-접두사 중복 검사
    for (let i = 1; i <= Math.min(known.length, converted.length); i++) {
        const knownSuffix = known.substring(known.length - i);
        const convertedPrefix = converted.substring(0, i);
        if (knownSuffix === convertedPrefix) {
            return { hasOverlap: true, message: "Partial overlap detected" };
        }
    }
    
    // 4. 접두사-접미사 중복 검사
    // ... 유사한 로직
    
    return { hasOverlap: false };
}
```

---

## 시뮬레이티드 어닐링 알고리즘 로직

### 1. 초기화 조건
```typescript
// 알고리즘 파라미터
const saIterations = 100;           // 반복 횟수
const initialTemperature = 10000.0; // 초기 온도
const coolingRate = 0.99;           // 냉각률
const absoluteTemperature = 0.00001; // 최소 온도
```

### 2. 초기 솔루션 생성 로직
```typescript
// 조건: RNA 시퀀스가 있으면 protein-based, 없으면 random
let currentSolution = proteinSequence ? 
    this.proteinBasedSolution(proteinSequence, targetMass) : 
    this.randomSolution(targetMass);
```

#### Protein-based Solution 로직
```typescript
// 조건: 선택된 아미노산만 사용, 원본 시퀀스 최대한 보존
static proteinBasedSolution(inputSequence: string, targetMass: number) {
    const isRnaSequence = /^[AUGC]+$/.test(inputSequence) && inputSequence.length % 3 === 0;
    const aminoSequence = isRnaSequence ? this.convertRnaToAminoAcids(inputSequence) : inputSequence;
    
    // 선택된 아미노산만 필터링
    const availableAminos = Object.keys(dataMap);
    const solution = [];
    
    // 초기 시퀀스에서 사용 가능한 아미노산만 추가
    for (const amino of aminoSequence.split('')) {
        if (dataMap[amino]) solution.push(amino);
    }
    
    // 목표 질량에 맞게 조정
    // ... 질량 기반 추가/제거 로직
}
```

#### Random Solution 로직
```typescript
// 조건: 가중치 기반 다양성 확보
static randomSolution(targetMass: number) {
    const aminoKeys = Object.keys(dataMap);
    if (aminoKeys.length === 0) return [];
    
    const randomSeed = Math.random();
    
    // 30% 확률로 가벼운 아미노산 (<120) 우선 선택
    // 30% 확률로 중간 무게 아미노산 (120-150) 우선 선택  
    // 40% 확률로 완전 랜덤 선택
}
```

### 3. Neighbor Solution 생성 로직
```typescript
// 조건: 70% 교체, 15% 추가, 15% 제거
static neighborSolution(currentSolution: string[], targetMass: number) {
    const changeType = Math.random();
    
    if (changeType < 0.7) {
        // 70% 확률로 아미노산 교체
        // 참조 시퀀스가 있으면 60% 확률로 참조 시퀀스에서 선택
    } else if (changeType < 0.85) {
        // 15% 확률로 아미노산 추가 (질량 허용 시)
    } else {
        // 15% 확률로 아미노산 제거 (최소 1개 유지)
    }
}
```

### 4. 평가 함수 로직
```typescript
// 조건: 참조 시퀀스 유무에 따른 복합 평가
static evaluate(solution: string[], targetMass: number) {
    const massDifference = Math.abs(targetMass - calculatedMass);
    
    if (referenceSequence) {
        // 참조 시퀀스가 있는 경우: 분자량 80% + 시퀀스 유사도 20%
        const sequenceSimilarity = calculateSequenceSimilarity(current, reference);
        const normalizedMassDiff = massDifference / targetMass;
        const sequenceDifference = (100 - sequenceSimilarity) / 100;
        return normalizedMassDiff * 0.8 + sequenceDifference * 0.2;
    } else {
        // 참조 시퀀스가 없는 경우: 분자량 차이만 고려
        return massDifference;
    }
}
```

### 5. 시퀀스 유사도 계산 로직
```typescript
// 조건: 정확한 아미노산 개수 매칭
export function calculateSequenceSimilarity(resultSequence: string, referenceSequence: string) {
    // 포밀화 제거
    const cleanResult = resultSequence.replace(/^f/, '');
    const cleanReference = referenceSequence.replace(/^f/, '');
    
    // 아미노산 개수 카운트
    const getAminoCount = (sequence) => {
        const count = {};
        for (const amino of sequence) {
            count[amino] = (count[amino] || 0) + 1;
        }
        return count;
    };
    
    const resultCount = getAminoCount(cleanResult);
    const referenceCount = getAminoCount(cleanReference);
    
    // 매칭되는 개수 계산 (최솟값 기준)
    let matchedCount = 0;
    let totalReferenceCount = 0;
    
    for (const [amino, refCount] of Object.entries(referenceCount)) {
        const resCount = resultCount[amino] || 0;
        matchedCount += Math.min(refCount, resCount);
        totalReferenceCount += refCount;
    }
    
    return (matchedCount / totalReferenceCount) * 100;
}
```

---

## 분자량 계산 로직

### 1. Monoisotopic Weight 계산
```typescript
// 조건: 포밀레이션 별도 처리, 물 증발량 계산
static getMonoisotopicWeightSum(solutionCombine: string) {
    if (solutionCombine.startsWith('f')) {
        // 포밀레이션이 있는 경우
        const aminoSequence = solutionCombine.slice(1); // 'f' 제외
        let result = aminoSequence.split('').reduce((sum, e) => sum + (dataMap[e] ?? 0), 0);
        result -= this.getWaterWeight(aminoSequence.length); // 아미노산만의 물 증발량
        result += fWeight; // 포밀레이션 무게 추가 (27.99)
        return result;
    } else {
        // 포밀레이션이 없는 경우
        let result = solutionCombine.split('').reduce((sum, e) => sum + (dataMap[e] ?? 0), 0);
        result -= this.getWaterWeight(solutionCombine.length);
        return result;
    }
}
```

### 2. 물 증발량 계산
```typescript
// 조건: 아미노산 길이 기반 계산
static getWaterWeight(aminoLength: number) {
    if (aminoLength === 0) return 0;
    return 18.01056 * (aminoLength - 1);
}
```

### 3. 이온 무게 추가
```typescript
// 조건: 최종 단계에서 이온 무게 추가
static calcByIonType(...) {
    let bestSolutions = this.calc(targetMass - getIonWeight(ionType), ...)
        .map(e => new AminoModel({
            ...e,
            weight: (e.weight ?? 0) + getIonWeight(e.ionType ?? 'unknown'),
            similarity: calculateSimilarity(targetMass, finalWeight)
        }));
}
```

---

## 결과 처리 로직

### 1. 결과 정렬 조건
```typescript
// 조건: 참조 시퀀스 유무에 따른 복합 정렬
export function sortAmino(list: AminoModel[], compareValue: number, referenceSequence?: string) {
    if (referenceSequence) {
        // 분자량 정확도 70% + 시퀀스 유사도 30%
        const scoreA = normalizedMassDiff * 0.7 + normalizedSeqDiff * 0.3;
        const scoreB = normalizedMassDiff * 0.7 + normalizedSeqDiff * 0.3;
        return scoreA - scoreB;
    } else {
        // 분자량 차이만 고려
        return Math.abs(a.weight - compareValue) - Math.abs(b.weight - compareValue);
    }
}
```

### 2. 중복 제거 조건
```typescript
// 조건: 코드 기준 중복 제거, 품질 우선 선택
export function removeDuplicates(inputList: AminoModel[]) {
    const uniqueMap = {};
    
    inputList.forEach(aminoModel => {
        const key = aminoModel.code ?? '';
        
        if (!uniqueMap[key]) {
            uniqueMap[key] = aminoModel;
        } else {
            // 분자량 유사도 우선, 동일하면 시퀀스 유사도 우선
            const existing = uniqueMap[key];
            if (current.similarity > existing.similarity || 
                (current.similarity === existing.similarity && 
                 current.sequenceSimilarity > existing.sequenceSimilarity)) {
                uniqueMap[key] = current;
            }
        }
    });
    
    return Object.values(uniqueMap);
}
```

### 3. 최종 결과 개수 제한
```typescript
// 조건: 사용자 선택 가능 (20, 50, 100개)
bestSolutions = allSolutions.slice(0, maxResultCount);
```

---

## Web Worker 비동기 처리

### 조건
- CPU 집약적 계산을 메인 스레드에서 분리
- UI 응답성 유지
- 에러 처리 및 진행 상태 표시

```typescript
// Worker 메시지 전송
worker.postMessage({
    detectedMass,
    knownSequence,
    proteinSequence,
    formylation,
    adduct,
    monoisotopicMap,
    molecularMap
});

// 결과 처리
worker.onmessage = (e) => {
    if (e.data.type === 'success') {
        allSolutions = e.data.solutions;
        bestSolutions = allSolutions.slice(0, maxResultCount);
    }
    loading.set(false);
};
```

---

## 주요 데이터 구조

### AminoModel
```typescript
interface AminoModel {
    code?: string;                    // 아미노산 시퀀스 코드
    weight?: number;                  // Monoisotopic weight
    molecularWeight?: number;         // Molecular weight
    similarity?: number;              // 분자량 유사도 (%)
    sequenceSimilarity?: number;      // 시퀀스 유사도 (%)
    formyType?: FormyType;           // 포밀레이션 타입
    ionType?: IonType;               // 이온 타입
    essentialSeq?: string;           // Known sequence
}
```

### 입력 파라미터
```typescript
interface MTSInputs {
    detectedMass: number;            // 필수: 감지된 분자량
    knownSequence: string;           // 선택: 알려진 시퀀스
    proteinSequence: string;         // 선택: RNA 시퀀스
    formylation: FormyType;          // 포밀레이션 설정
    adduct: IonType;                 // 이온 부가물 설정
    selectedAminos: AminoMap;        // 선택된 아미노산
    ncAA: NcAAMap;                   // 비표준 아미노산
}
```

---

## 성능 최적화 조건

### 1. 계산 최적화
- 시뮬레이티드 어닐링 파라미터 조정 가능
- 선택된 아미노산만 사용하여 탐색 공간 축소
- 중복 제거를 통한 결과 품질 향상

### 2. 메모리 최적화
- 최대 100개 결과로 메모리 사용량 제한
- 불필요한 계산 결과 즉시 제거
- 효율적인 데이터 구조 사용

### 3. UI 최적화
- Web Worker로 비동기 처리
- 진행 상태 표시
- 결과 페이지네이션 지원

이 문서는 Mass Finder MTS 기능의 완전한 사용자 스토리와 로직 조건을 상세히 기술하여, 개발자와 연구자가 시스템의 동작을 정확히 이해할 수 있도록 합니다.