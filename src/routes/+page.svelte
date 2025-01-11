<script>
  import AdductSelector from '$lib/components/AdductSelector.svelte';
  import FormylationSelector from '$lib/components/FormylationSelector.svelte';
  import AminoMapSelector from '$lib/components/AminoMapSelector.svelte';
  import NcAASelector from '$lib/components/NcAASelector.svelte';
  import ResultTable from '$lib/components/ResultTable.svelte';
  import { MassFinderHelper } from '$lib/helper/mass_finder_helper';
  import { getContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { aminoMap, molecularWeightMap } from '$lib/helper/amino_mapper';

  // 상태 관리 변수들
  let detectedMass = null;
  let knownSequence = '';
  let formylation = 'yes';
  let adduct = 'H';
  let selectedMonoisotopicAminos = { ...aminoMap };
  let fullNcAA = { B: null, J: null, O: null, U: null, X: null, Z: null };
  const loading = getContext('loading');
  let bestSolutions = [];

  // Calculate 버튼 클릭 시 호출되는 메서드
  async function handleCalculate() {
    loading.set(true);
    if (!validate()) return loading.set(false);

    setTimeout(() => {
      try {
        // 선택된 NCAA 값들
        let filteredNcAA = Object.fromEntries(
          Object.entries(fullNcAA).filter(([key, value]) => value !== null)
        );

        let filteredMonoisotopicWeights = Object.fromEntries(
          Object.entries(filteredNcAA).map(([key, value]) => [key, Number(value?.monoisotopicWeight)])
        );

        // monoisotopicMass 를 구하기 위한 전용 Map
        const monoisotopicMap = { ...selectedMonoisotopicAminos, ...filteredMonoisotopicWeights };

        // selectedMonoisotopicAminos 와 같은 key를 가지고 value만 Molcular 로 가지는 맵
        let ncAAMolecularWeights = Object.fromEntries(
          Object.entries(selectedMonoisotopicAminos).map(([key, _]) => [key, molecularWeightMap[key]])
        );

        let filteredMolecularWeights = Object.fromEntries(
          Object.entries(filteredNcAA).map(([key, value]) => [key, Number(value?.molecularWeight)])
        );

        let molecularMap = { ...ncAAMolecularWeights, ...filteredMolecularWeights };


        bestSolutions = MassFinderHelper.calcByIonType(
		      detectedMass,
          knownSequence,
          formylation,
          adduct,
          monoisotopicMap,
          molecularMap
        );
        console.log('Best solutions:', bestSolutions);
      } finally {
        loading.set(false);
      }
    }, 100);
  }

  function handleFormylationChange(newFormylation) {
    formylation = newFormylation;
  }

  function handleAdductChange(newAdduct) {
    adduct = newAdduct;
  }

  function handleNcAAChange(e) {
    fullNcAA = e.detail;
  }

  function handleAminoMapChange(newAminos) {
    selectedMonoisotopicAminos = Object.fromEntries(
      Object.entries(newAminos)
        .filter(([key, value]) => value)
        .map(([key]) => [key, aminoMap[key]])
    );
  }

  function validate() {
    if (detectedMass === null) {
      alert('Please Input Detected Mass');
      return false;
    }

    if (!validateknownSequence()) {
      alert('Please enter the correct KnownSequence');
      return false;
    }

    return true;
  }

  function validateknownSequence() {
    let filteredNcAA = Object.fromEntries(
      Object.entries(fullNcAA).filter(([key, value]) => value !== null)
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
</script>

<div class="container mt-5">
  <div class="text-center mb-4">
    <h1>Mass Finder</h1>
  </div>

  <div class="mb-3">
    <label for="detected-mass" class="form-label fw-bold">Detected Mass</label>
    <input
      type="number"
      id="detected-mass"
      bind:value={detectedMass}
      class="form-control"
      placeholder="Detected Mass"
    />
  </div>

  <div class="mb-3">
    <label for="essential-sequence" class="form-label fw-bold">Known Sequence (Optional)</label>
    <input
      type="text"
      id="essential-sequence"
      bind:value={knownSequence}
      class="form-control"
      placeholder="Known Sequence"
      on:input={handleknownSequenceInput}
    />
  </div>

  <div class="mb-3 row">
	<div class="col-md-6">
	  <FormylationSelector on:change={(e) => handleFormylationChange(e.detail)} />
	</div>
	<div class="col-md-6">
	  <AdductSelector on:change={(e) => handleAdductChange(e.detail)} />
	</div>
  </div>

  <!-- 필수 아미노산 선택 -->
  <div class="mb-3">
    <AminoMapSelector on:changeAminos={(e) => handleAminoMapChange(e.detail)} />
  </div>

  <!-- 커스텀 아미노산 선택 -->
  <div class="mb-3">
    <NcAASelector on:changeNcAA={handleNcAAChange} />
  </div>

  <!-- 계산 버튼 -->
  <button type="button" class="btn btn-primary w-100" on:click={handleCalculate}>
    Calculate!
  </button>
  
  <!-- 최대 결과 개수 선택 -->
  <div class="mt-3 d-flex justify-content-end">
    <div class="w-20">
      <label for="solution-count" class="form-label fw-bold">Max Result Count</label>
      <select 
        id="solution-count" 
        class="form-select mb-3" 
        on:change={(e) => {
          MassFinderHelper.topSolutionsCount = parseInt(e.target.value);
        }}
      >
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>

  {#if detectedMass !== null && bestSolutions.length > 0}
    <ResultTable {bestSolutions} {detectedMass} {fullNcAA}/>
  {/if}
</div>
