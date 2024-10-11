<script>
  import AdductSelector from '$lib/components/AdductSelector.svelte';
  import FormylationSelector from '$lib/components/FormylationSelector.svelte';
  import AminoMapSelector from '$lib/components/AminoMapSelector.svelte';
  import NcAASelector from '$lib/components/NcAASelector.svelte';
  import ResultTable from '$lib/components/ResultTable.svelte';
  import { MassFinderHelper } from '$lib/helper/mass_finder_helper';
  import { getContext } from 'svelte';
  import { writable } from 'svelte/store';
  import { aminoMap } from '$lib/helper/amino_mapper';

  // 상태 관리 변수들
  let detectedMass = null;
  let knownSequence = '';
  let formylation = 'yes';
  let adduct = 'H';
  let selectedAminos = { ...aminoMap };
  let ncAA = { B: 0.0, J: 0.0, O: 0.0, U: 0.0, X: 0.0, Z: 0.0 };
  const loading = getContext('loading');
  let bestSolutions = [];

  // Calculate 버튼 클릭 시 호출되는 메서드
  async function handleCalculate() {
    loading.set(true);
    if (!validate()) return loading.set(false);

    setTimeout(() => {
      try {
        let filteredNcAA = Object.fromEntries(
          Object.entries(ncAA).filter(([key, value]) => value !== 0)
        );

        const aminoMapMerged = { ...selectedAminos, ...filteredNcAA };

        bestSolutions = MassFinderHelper.calcByIonType(
		      detectedMass,
          knownSequence,
          formylation,
          adduct,
          aminoMapMerged
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
    let _data = Object.entries(e.detail).reduce((acc, [key, value]) => {
      acc[key] = Number(value?.monoisotopicWeight ?? 0.0);
      return acc;
    }, {});
    ncAA = _data;
  }

  function handleAminoMapChange(newAminos) {
    selectedAminos = Object.fromEntries(
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
      Object.entries(ncAA).filter(([key, value]) => value !== 0)
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

<svelte:head>
  <title>Mass Finder</title>
  <link rel="stylesheet" href="chem_doodle/install/ChemDoodleWeb.css" type="text/css" />
  <script type="text/javascript" src="chem_doodle/install/ChemDoodleWeb.js"></script>
  <link rel="stylesheet" href="chem_doodle/install/uis/jquery-ui-1.11.4.css" type="text/css" />
  <script type="text/javascript" src="chem_doodle/install/uis/ChemDoodleWeb-uis.js"></script>
</svelte:head>

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

  <div class="mb-3">
    <AminoMapSelector on:changeAminos={(e) => handleAminoMapChange(e.detail)} />
  </div>

  <div class="mb-3">
    <NcAASelector on:changeNcAA={handleNcAAChange} />
  </div>

  <button type="button" class="btn btn-primary w-100" on:click={handleCalculate}>
    Calculate!
  </button>

  {#if detectedMass !== null && bestSolutions.length > 0}
    <ResultTable {bestSolutions} {detectedMass} />
  {/if}
</div>
