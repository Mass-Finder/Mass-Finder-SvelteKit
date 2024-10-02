<script>
  import IonSelector from '$lib/components/IonSelector.svelte';
  import FormylationSelector from '$lib/components/FormylationSelector.svelte';
  import AminoMapSelector from '$lib/components/AminoMapSelector.svelte';
  import NcAASelector from '$lib/components/NcAASelector.svelte';
  import ResultTable from '$lib/components/ResultTable.svelte';
  import { MassFinderHelper } from '$lib/helper/mass_finder_helper';
  import { getContext } from 'svelte';
  import { writable } from 'svelte/store';

  // 기초 아미노산 리스트
  const aminoMap = {
    G: 75.03,
    A: 89.05,
    S: 105.04,
    T: 119.06,
    C: 121.02,
    V: 117.08,
    L: 131.09,
    I: 131.09,
    M: 149.05,
    P: 115.06,
    F: 165.08,
    Y: 181.07,
    W: 204.09,
    D: 133.04,
    E: 147.05,
    N: 132.05,
    Q: 146.07,
    H: 155.07,
    K: 146.11,
    R: 174.11
  };

  // 상태 관리 변수들
  let exactMass = null;
  let essentialSequence = '';
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
          exactMass,
          essentialSequence,
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
    if (exactMass === null) {
      alert('Please Input Exact Mass');
      return false;
    }

    if (!validateEssentialSequence()) {
      alert('Please enter the correct Essential Sequence');
      return false;
    }

    return true;
  }

  function validateEssentialSequence() {
    let filteredNcAA = Object.fromEntries(
      Object.entries(ncAA).filter(([key, value]) => value !== 0)
    );

    for (let char of essentialSequence) {
      if (!aminoMap[char] && !filteredNcAA[char]) {
        return false;
      }
    }
    return true;
  }

  function handleEssentialSequenceInput(event) {
    const input = event.target;
    essentialSequence = input.value.toUpperCase();
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
    <label for="exact-mass" class="form-label">Exact Mass</label>
    <input
      type="number"
      id="exact-mass"
      bind:value={exactMass}
      class="form-control"
      placeholder="Exact Mass"
    />
  </div>

  <div class="mb-3">
    <label for="essential-sequence" class="form-label">Essential Sequence (Optional)</label>
    <input
      type="text"
      id="essential-sequence"
      bind:value={essentialSequence}
      class="form-control"
      placeholder="Essential Sequence"
      on:input={handleEssentialSequenceInput}
    />
  </div>

  <div class="mb-3">
    <FormylationSelector on:change={(e) => handleFormylationChange(e.detail)} />
  </div>

  <div class="mb-3">
    <IonSelector on:change={(e) => handleAdductChange(e.detail)} />
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

  {#if exactMass !== null && bestSolutions.length > 0}
    <ResultTable {bestSolutions} {exactMass} />
  {/if}
</div>
