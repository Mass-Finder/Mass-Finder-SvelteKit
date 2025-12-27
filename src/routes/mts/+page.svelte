<script>
  import AdductSelector from "$lib/components/AdductSelector.svelte";
  import FormylationSelector from "$lib/components/FormylationSelector.svelte";
  import AminoMapSelector from "$lib/components/AminoMapSelector.svelte";
  import NcAASelector from "$lib/components/NcAASelector.svelte";
  import ResultTable from "$lib/components/ResultTable.svelte";
  import InitialRnaInput from "$lib/components/InitialRnaInput.svelte";
  import SAModeSelector from "$lib/components/SAModeSelector.svelte";
  import { getContext, onDestroy } from "svelte";
  import { writable } from "svelte/store";
  import {
    aminoMap,
    molecularWeightMap,
    codonTableRtoS,
  } from "$lib/helper/amino_mapper";

  // 상태 관리 변수들
  let detectedMass = null;
  let knownSequence = "";
  let proteinSequence = "";
  let formylation = "unknown";
  let adduct = "+H";
  // SA 모드 설정 (기본값: Think)
  let saConfig = {
    initialTemperature: 10000,
    absoluteTemperature: 0.001,
    saIterations: 50
  };
  /** @type {{ [key: string]: number }} */
  let selectedMonoisotopicAminos = { ...aminoMap };
  let fullNcAA = { B: null, J: null, O: null, U: null, X: null, Z: null };
  const loading = getContext("loading");
  let bestSolutions = [];
  let allSolutions = []; // 전체 결과를 저장할 배열
  let maxResultCount = 20; // 표시할 최대 결과 개수
  let worker;

  onDestroy(() => {
    if (worker) {
      worker.terminate();
    }
  });

  // Calculate 버튼 클릭 시 호출되는 메서드
  async function handleCalculate() {
    const startTime = performance.now();
    console.log("계산 시작:", new Date().toISOString());
    
    loading.set(true);
    if (!validate()) return loading.set(false);

    // topSolutionsCount는 인스턴스 변수이므로 worker에서 처리됨

    try {
      // 선택된 NCAA 값들
      let filteredNcAA = Object.fromEntries(
        Object.entries(fullNcAA).filter(([key, value]) => value !== null),
      );

      let filteredMonoisotopicWeights = Object.fromEntries(
        Object.entries(filteredNcAA).map(([key, value]) => [
          key,
          Number(value?.monoisotopicWeight),
        ]),
      );

      // monoisotopicMass 를 구하기 위한 전용 Map
      const monoisotopicMap = {
        ...selectedMonoisotopicAminos,
        ...filteredMonoisotopicWeights,
      };

      // selectedMonoisotopicAminos 와 같은 key를 가지고 value만 Molcular 로 가지는 맵
      let ncAAMolecularWeights = Object.fromEntries(
        Object.entries(selectedMonoisotopicAminos).map(([key, _]) => [
          key,
          molecularWeightMap[key],
        ]),
      );

      let filteredMolecularWeights = Object.fromEntries(
        Object.entries(filteredNcAA).map(([key, value]) => [
          key,
          Number(value?.molecularWeight),
        ]),
      );

      let molecularMap = {
        ...ncAAMolecularWeights,
        ...filteredMolecularWeights,
      };

      // Worker 생성 및 메시지 처리
      if (!worker) {
        worker = new Worker(
          new URL("$lib/workers/mass_finder.worker.ts", import.meta.url),
          { type: "module" },
        );
      }

      worker.onmessage = (e) => {
        const endTime = performance.now();
        const calculationTime = endTime - startTime;
        
        if (e.data.type === "success") {
          allSolutions = e.data.solutions;
          bestSolutions = allSolutions.slice(0, maxResultCount);
          console.log("All solutions count:", allSolutions.length);
          console.log("Displayed solutions:", bestSolutions.length);
          console.log(`계산 완료 시간: ${calculationTime.toFixed(2)}ms (${(calculationTime/1000).toFixed(2)}초)`);
        } else if (e.data.type === "error") {
          console.error("Worker error:", e.data.error);
          console.log(`계산 실패 시간: ${calculationTime.toFixed(2)}ms`);
          alert("An error occurred while calculating");
        }
        loading.set(false);
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        alert("An error occurred while calculating");
        loading.set(false);
      };

      // Worker에 데이터 전송
      worker.postMessage({
        detectedMass,
        knownSequence,
        proteinSequence,
        formylation,
        adduct,
        monoisotopicMap,
        molecularMap,
        initialTemperature: saConfig.initialTemperature,
        absoluteTemperature: saConfig.absoluteTemperature,
        saIterations: saConfig.saIterations,
      });
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred while calculating");
      loading.set(false);
    }
  }

  function handleFormylationChange(newFormylation) {
    formylation = newFormylation;
  }

  function handleAdductChange(newAdduct) {
    adduct = newAdduct;
  }

  function handleSAModeChange(newConfig) {
    saConfig = newConfig;
  }


  function handleNcAAChange(e) {
    fullNcAA = e.detail;
  }

  function handleAminoMapChange(newAminos) {
    selectedMonoisotopicAminos = Object.fromEntries(
      Object.entries(newAminos)
        .filter(([key, value]) => value)
        .map(([key]) => [key, aminoMap[key]]),
    );
  }

  function validate() {
    if (detectedMass === null) {
      alert("Please Input Detected Mass");
      return false;
    }

    if (detectedMass > 10000) {
      alert("The detected mass value is too large. Please enter a value below 10,000.");
      return false;
    }

    if (!validateknownSequence()) {
      alert("Please enter the correct KnownSequence");
      return false;
    }

    if (!validateProteinSequence()) {
      alert("Please enter the correct Protein sequence");
      return false;
    }

    return true;
  }

  function validateknownSequence() {
    let filteredNcAA = Object.fromEntries(
      Object.entries(fullNcAA).filter(([key, value]) => value !== null),
    );

    for (let char of knownSequence) {
      if (!aminoMap[char] && !filteredNcAA[char]) {
        return false;
      }
    }
    return true;
  }

  function handleknownSequenceInput(event) {
    const input = event.target;
    knownSequence = input.value.toUpperCase();
  }

  function convertRnaToAminoAcids(rnaSequence) {
    if (!rnaSequence) return "";

    // RNA 시퀀스를 3개씩 나누어 코돈으로 변환
    const codons = rnaSequence.match(/.{1,3}/g) || [];
    let aminoSequence = "";

    for (const codon of codons) {
      if (codon.length === 3) {
        const amino = codonTableRtoS[codon];
        if (amino && amino !== "[Stop]") {
          aminoSequence += amino;
        } else if (amino === "[Stop]") {
          break; // Stop 코돈을 만나면 중단
        }
      }
    }

    return aminoSequence;
  }

  function validateProteinSequence() {
    // 빈 문자열인 경우 유효함 (선택사항)
    if (proteinSequence === "") return true;

    // RNA 시퀀스 검증: A, U, G, C만 허용
    const validRnaBases = ["A", "U", "G", "C"];
    for (let char of proteinSequence) {
      if (!validRnaBases.includes(char)) {
        return false;
      }
    }

    // 3의 배수 길이 검증 (코돈 단위)
    if (proteinSequence.length % 3 !== 0) {
      alert("RNA sequence length must be a multiple of 3 (codon units)");
      return false;
    }

    return true;
  }

  function calculateProteinMass(rnaSequence) {
    if (!rnaSequence) return 0;

    // RNA 시퀀스를 아미노산으로 변환
    const aminoSequence = convertRnaToAminoAcids(rnaSequence);
    if (!aminoSequence) return 0;

    let filteredNcAA = Object.fromEntries(
      Object.entries(fullNcAA).filter(([key, value]) => value !== null),
    );

    return aminoSequence.split("").reduce((sum, char) => {
      if (selectedMonoisotopicAminos[char]) {
        return sum + selectedMonoisotopicAminos[char];
      } else if (filteredNcAA[char]) {
        return sum + parseFloat(filteredNcAA[char].monoisotopicWeight);
      }
      return sum;
    }, 0);
  }

  $: proteinMass = calculateProteinMass(proteinSequence);
  $: massWarning =
    proteinSequence &&
    detectedMass &&
    Math.abs(proteinMass - detectedMass) > detectedMass * 0.5;
  $: convertedAminoSequence = proteinSequence
    ? convertRnaToAminoAcids(proteinSequence)
    : "";
  $: hasReferenceSequence = proteinSequence && proteinSequence.trim() !== "";
  $: overlapInfo = checkSequenceOverlap(knownSequence, convertedAminoSequence);

  function checkSequenceOverlap(known, converted) {
    if (!known || !converted) {
      return { hasOverlap: false, message: "" };
    }

    // Fixed sequence가 RNA 변환 시퀀스에 포함되어 있는지 확인
    if (converted.indexOf(known) !== -1) {
      return {
        hasOverlap: true,
        message: `Fixed sequence "${known}" is already included in the RNA sequence. Duplicate portion will be automatically removed.`,
      };
    }

    // RNA 변환 시퀀스가 Fixed sequence에 포함되어 있는지 확인
    if (known.indexOf(converted) !== -1) {
      return {
        hasOverlap: true,
        message: `RNA sequence is already included in Fixed sequence "${known}". Only Fixed sequence will be used.`,
      };
    }

    // 부분 중복 확인
    for (let i = 1; i <= Math.min(known.length, converted.length); i++) {
      const knownSuffix = known.substring(known.length - i);
      const convertedPrefix = converted.substring(0, i);

      if (knownSuffix === convertedPrefix) {
        return {
          hasOverlap: true,
          message: `Partial overlap detected: "${knownSuffix}" appears at the end of Fixed sequence and start of RNA sequence. Duplicate will be automatically removed.`,
        };
      }

      const convertedSuffix = converted.substring(converted.length - i);
      const knownPrefix = known.substring(0, i);

      if (convertedSuffix === knownPrefix) {
        return {
          hasOverlap: true,
          message: `Partial overlap detected: "${convertedSuffix}" appears at the end of RNA sequence and start of Fixed sequence. Duplicate will be automatically removed.`,
        };
      }
    }

    return { hasOverlap: false, message: "" };
  }

  // 참조 시퀀스와 유사하게 결과 시퀀스를 재배열하는 함수
  function rearrangeSequenceToMatch(resultSequence, referenceSequence) {
    if (!resultSequence || !referenceSequence) return resultSequence;

    // 포밀화 처리
    const hasFormylation = resultSequence.startsWith("f");
    const cleanResult = hasFormylation
      ? resultSequence.slice(1)
      : resultSequence;
    const cleanReference = referenceSequence.replace(/^f/, "");

    if (!cleanResult || !cleanReference) return resultSequence;

    // 결과 시퀀스의 아미노산 개수 계산
    const resultCount = {};
    for (const amino of cleanResult) {
      resultCount[amino] = (resultCount[amino] || 0) + 1;
    }

    // 참조 시퀀스 순서를 따라 재배열
    let rearranged = "";
    const usedCount = {};

    // 1단계: 참조 시퀀스 순서대로 매칭되는 아미노산 배치
    for (const refAmino of cleanReference) {
      const used = usedCount[refAmino] || 0;
      const available = resultCount[refAmino] || 0;

      if (used < available) {
        rearranged += refAmino;
        usedCount[refAmino] = used + 1;
      }
    }

    // 2단계: 참조 시퀀스에 없거나 남은 아미노산들을 뒤에 추가
    for (const [amino, count] of Object.entries(resultCount)) {
      const used = usedCount[amino] || 0;
      const remaining = count - used;

      for (let i = 0; i < remaining; i++) {
        rearranged += amino;
      }
    }

    // 포밀화가 있었다면 다시 추가
    return hasFormylation ? "f" + rearranged : rearranged;
  }

  // maxResultCount가 변경될 때마다 결과를 다시 필터링하고 재배열
  $: if (allSolutions.length > 0) {
    let processedSolutions = allSolutions.slice(0, maxResultCount);

    // 참조 시퀀스가 있는 경우 시퀀스 재배열
    if (hasReferenceSequence && convertedAminoSequence) {
      processedSolutions = processedSolutions.map((solution) => ({
        ...solution,
        code: rearrangeSequenceToMatch(solution.code, convertedAminoSequence),
      }));
    }

    bestSolutions = processedSolutions;
  }
</script>

<div class="container mt-5">
  <div class="text-center mb-4">
    <h1>Mass to Sequence</h1>
  </div>

  <div class="mb-3">
    <label for="detected-mass" class="form-label fw-bold"
      >Detected Mass <span class="text-danger">*</span></label
    >
    <input
      type="number"
      id="detected-mass"
      bind:value={detectedMass}
      class="form-control"
      placeholder="Detected Mass"
    />
  </div>

  <div class="mb-3">
    <label for="essential-sequence" class="form-label fw-bold"
      >Fixed sequence</label
    >
    <input
      type="text"
      id="essential-sequence"
      bind:value={knownSequence}
      class="form-control"
      placeholder="Fixed sequence"
      on:input={handleknownSequenceInput}
    />
  </div>

  <InitialRnaInput
    bind:value={proteinSequence}
    on:input={(e) => (proteinSequence = e.detail.value)}
  />

  <div class="mb-3">
    <div class="selector-row">
      <div class="selector-item">
        <FormylationSelector
          on:change={(e) => handleFormylationChange(e.detail)}
        />
      </div>
      <div class="selector-item">
        <AdductSelector on:change={(e) => handleAdductChange(e.detail)} />
      </div>
    </div>
  </div>

  <div class="mb-3">
    <SAModeSelector on:change={(e) => handleSAModeChange(e.detail)} />
  </div>

  <!-- 필수 아미노산 선택 -->
  <div class="mb-3">
    <AminoMapSelector on:changeAminos={(e) => handleAminoMapChange(e.detail)} />
  </div>

  <!-- 커스텀 아미노산 선택 -->
  <div class="mb-3">
    <NcAASelector on:changeNcAA={handleNcAAChange} />
  </div>

  <!-- 시퀀스 중복 경고 -->
  {#if overlapInfo.hasOverlap}
    <div class="alert alert-warning mb-3">
      <div class="d-flex align-items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-exclamation-triangle me-2"
          viewBox="0 0 16 16"
        >
          <path
            d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-2.008 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"
          />
          <path
            d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z"
          />
        </svg>
        <strong>Sequence Overlap Detected</strong>
      </div>
      <small class="text-muted mt-1 d-block">
        {overlapInfo.message}
      </small>
    </div>
  {/if}

  <!-- 참조 시퀀스 정보 표시 -->
  {#if hasReferenceSequence}
    <div class="alert alert-info mb-3">
      <div class="d-flex align-items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-info-circle me-2"
          viewBox="0 0 16 16"
        >
          <path
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
          />
          <path
            d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
          />
        </svg>
        <strong>Reference Sequence Active</strong>
      </div>
      <small class="text-muted mt-1 d-block">
        The algorithm will prioritize finding sequences similar to: <span
          class="fw-bold">{convertedAminoSequence}</span
        >
        <br />
        Results will be optimized for both mass accuracy and sequence similarity.
      </small>
    </div>
  {/if}

  <!-- 계산 버튼 -->
  <button
    type="button"
    class="btn btn-primary w-100"
    on:click={handleCalculate}
  >
    Calculate{hasReferenceSequence ? " with Reference Sequence" : ""}!
  </button>


  {#if detectedMass !== null && bestSolutions.length > 0}
    <ResultTable
      {bestSolutions}
      {detectedMass}
      {fullNcAA}
      {hasReferenceSequence}
      bind:maxResultCount
    />
  {/if}
</div>

<style>
  .container {
    padding-left: 0;
    padding-right: 0;
  }

  .selector-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .selector-item {
    flex: 1;
    min-width: 280px;
    max-width: 100%;
  }

  /* 모바일: 전체 너비, 여백 최소화 */
  @media (max-width: 767px) {
    .container {
      margin-top: 1rem !important;
    }

    h1 {
      font-size: 1.75rem;
    }

    .selector-row {
      flex-direction: column;
      gap: 12px;
    }

    .selector-item {
      min-width: 100%;
      max-width: 100%;
    }

    .mb-3 {
      margin-bottom: 1rem !important;
    }

    .alert {
      font-size: 0.9rem;
      padding: 0.75rem;
    }

    .btn {
      padding: 0.75rem;
      font-size: 1rem;
    }
  }

  /* 태블릿 */
  @media (min-width: 768px) and (max-width: 1023px) {
    .selector-item {
      min-width: calc(50% - 8px);
    }

    .selector-item:last-child {
      flex-basis: 100%;
    }
  }

  /* 데스크톱 */
  @media (min-width: 1024px) {
    .selector-item {
      min-width: 280px;
    }
  }
</style>
