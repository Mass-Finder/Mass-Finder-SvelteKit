<script>
  import AdductSelector from "$lib/components/AdductSelector.svelte";
  import FormylationSelector from "$lib/components/FormylationSelector.svelte";
  import AminoMapSelector from "$lib/components/AminoMapSelector.svelte";
  import NcAASelector from "$lib/components/NcAASelector.svelte";
  import ResultTable from "$lib/components/ResultTable.svelte";
  import InitialRnaInput from "$lib/components/InitialRnaInput.svelte";
  import SAModeSelector from "$lib/components/SAModeSelector.svelte";
  import PeptideSequenceSelector from "$lib/components/PeptideSequenceSelector.svelte";
  import { getContext, onDestroy } from "svelte";
  import { writable } from "svelte/store";
  import { showAlert } from "$lib/stores/alertStore.js";
  import {
    aminoMap,
    molecularWeightMap,
    codonTableRtoS,
  } from "$lib/helper/amino_mapper";

  // 상태 관리 변수들
  let detectedMass = null;
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

  // Template 상태 (PeptideSequenceSelector에서 전달)
  let sequenceTemplate = null;

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
    if (!(await validate())) return loading.set(false);

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
          showAlert("An error occurred while calculating", "Error", "error");
        }
        loading.set(false);
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        showAlert("An error occurred while calculating", "Error", "error");
        loading.set(false);
      };

      // Worker에 데이터 전송
      const workerData = {
        detectedMass,
        formylation,
        adduct,
        monoisotopicMap,
        molecularMap,
        initialTemperature: saConfig.initialTemperature,
        absoluteTemperature: saConfig.absoluteTemperature,
        saIterations: saConfig.saIterations,
      };

      if (sequenceTemplate && sequenceTemplate.gapTotalLength > 0) {
        // Template 모드: ncAA 선택이 있어서 갭이 존재하는 경우
        workerData.sequenceTemplate = sequenceTemplate;
      } else {
        // ncAA 미선택 또는 RNA 미입력: 기존 방식 (RNA를 참조 시퀀스로 사용)
        workerData.knownSequence = "";
        workerData.proteinSequence = proteinSequence;
      }

      worker.postMessage(workerData);
    } catch (error) {
      console.error("Error:", error);
      showAlert("An error occurred while calculating", "Error", "error");
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

  // PeptideSequenceSelector에서 전달받은 템플릿 정보 처리
  function handleTemplateChange(e) {
    const { fullSequence, positionStates, fixedSegments, gapSegments } = e.detail;

    if (!fullSequence) {
      sequenceTemplate = null;
      return;
    }

    sequenceTemplate = {
      fullSequence,
      positionStates,
      fixedSegments,
      gapSegments,
      totalLength: fullSequence.length,
      gapTotalLength: gapSegments.reduce((sum, g) => sum + g.length, 0),
    };
  }

  async function validate() {
    if (detectedMass === null) {
      await showAlert("Please Input Detected mass", "Validation Error", "warning");
      return false;
    }

    if (detectedMass > 10000) {
      await showAlert("The detected mass value is too large. Please enter a value below 10,000.", "Validation Error", "warning");
      return false;
    }

    if (!validatePeptideSequence()) {
      await showAlert("Please enter the correct Peptide sequence", "Validation Error", "warning");
      return false;
    }

    return true;
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

  async function validatePeptideSequence() {
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
      await showAlert("RNA sequence length must be a multiple of 3 (codon units)", "Validation Error", "warning");
      return false;
    }

    return true;
  }

  $: convertedAminoSequence = proteinSequence
    ? convertRnaToAminoAcids(proteinSequence)
    : "";
  $: hasReferenceSequence = proteinSequence && proteinSequence.trim() !== "";

  // maxResultCount가 변경될 때마다 결과를 다시 필터링
  $: if (allSolutions.length > 0) {
    bestSolutions = allSolutions.slice(0, maxResultCount);
  }
</script>

<svelte:head>
  <title>Mass to Sequence - X-MAS</title>
</svelte:head>

<div class="container mt-5">
  <div class="text-center mb-4">
    <h1>Mass to Sequence</h1>
  </div>

  <div class="mb-3">
    <label for="detected-mass" class="form-label fw-bold"
      >Detected mass <span class="text-danger">*</span></label
    >
    <input
      type="number"
      id="detected-mass"
      bind:value={detectedMass}
      class="form-control"
      placeholder="Detected mass"
      aria-required="true"
      required
    />
  </div>

  <InitialRnaInput
    bind:value={proteinSequence}
    on:input={(e) => (proteinSequence = e.detail.value)}
  />

  <!-- RNA 번역 펩타이드 시퀀스 맵: ncAA 위치 선택 및 Fixed/Variable 영역 시각화 -->
  <PeptideSequenceSelector
    aminoSequence={convertedAminoSequence}
    on:change={handleTemplateChange}
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

  <!-- 참조 시퀀스 정보 표시 -->
  {#if hasReferenceSequence && sequenceTemplate && sequenceTemplate.gapTotalLength > 0}
    <div class="alert alert-info mb-3">
      <div class="d-flex align-items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-info-circle me-2"
          viewBox="0 0 16 16"
          aria-hidden="true"
        >
          <path
            d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"
          />
          <path
            d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"
          />
        </svg>
        <strong>Template Mode Active</strong>
      </div>
      <small class="text-muted mt-1 d-block">
        Fixed: {sequenceTemplate.fixedSegments.map(s => `"${s.sequence}"`).join(', ') || 'None'} |
        Variable: {sequenceTemplate.gapTotalLength} positions to predict
      </small>
    </div>
  {:else if hasReferenceSequence}
    <div class="alert alert-info mb-3">
      <div class="d-flex align-items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-info-circle me-2"
          viewBox="0 0 16 16"
          aria-hidden="true"
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
        Click amino acids above to mark ncAA positions and define fixed regions.
      </small>
    </div>
  {/if}

  <!-- 계산 버튼 -->
  <button
    type="button"
    class="btn btn-primary w-100"
    on:click={handleCalculate}
  >
  Predict sequences

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
