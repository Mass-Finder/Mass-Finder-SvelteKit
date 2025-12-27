<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import SingleSiteSection from '$lib/components/potential/SingleSiteSection.svelte';
  import CrosslinkingSection from '$lib/components/potential/CrosslinkingSection.svelte';
  import ChemDoodleCanvas from '$lib/components/potential/ChemDoodleCanvas.svelte';
  import ModificationItem from '$lib/components/potential/ModificationItem.svelte';
  import { SingleSiteCondition, CrosslinkingCondition } from '../../type/Types';
  import { aminoMap, molecularWeightMap, aminoFormulaMap } from '$lib/helper/amino_mapper';
  import { storage } from '$lib/services/storage.service';
  import { formatFormulaSubtraction } from '$lib/helper/formula_util';

  let modificationName = '';
  let modificationType = 'Single-site';

  // Single-site variables
  let targetAminoAcid = '';
  let singleSiteCondition = SingleSiteCondition.N_TERMINUS;

  // Crosslinking variables
  let target1AminoAcid = '';
  let target2AminoAcid = '';
  let crosslinkingCondition = CrosslinkingCondition.EVERYWHERE;
  let distanceOperator = '>';
  let distanceValue = 1;

  // ChemDoodle variables
  let structureName = '';
  let molecularFormula = writable('');
  let monoisotopicWeight = writable('');
  let molecularWeight = writable('');
  let moleculeJson = writable({});
  let chemDoodleCanvas;

  // Saved modifications
  let savedModifications = writable([]);

  // Single-site 모드에서 Target 미선택 시 계산 버튼 비활성화
  $: calculateDisabled = modificationType === 'Single-site' && !targetAminoAcid;

  onMount(() => {
    loadSavedModifications();
  });

  function handleSave() {
    // Validation: Modification name
    if (!modificationName.trim()) {
      alert('Please enter a modification name.');
      return;
    }

    // Validation: Check for spaces in modification name
    if (modificationName.includes(' ')) {
      alert('Spaces cannot be entered in modification name.');
      return;
    }

    // Validation: Target amino acid(s)
    if (modificationType === 'Single-site') {
      if (!targetAminoAcid) {
        alert('Please select a target amino acid.');
        return;
      }
    } else {
      if (!target1AminoAcid || !target2AminoAcid) {
        alert('Please select both target amino acids.');
        return;
      }
    }

    // Validation: Distance value for crosslinking
    if (modificationType === 'Crosslinking' && crosslinkingCondition === CrosslinkingCondition.DISTANCE && distanceValue < 1) {
      alert('Distance value must be at least 1.');
      return;
    }

    // Validation: Structure name
    if (!structureName.trim()) {
      alert('Please enter a structure name.');
      return;
    }

    // Validation: Check for spaces in structure name
    if (structureName.includes(' ')) {
      alert('Spaces cannot be entered in structure name.');
      return;
    }

    // Validation: Molecular properties must be calculated
    if (!$molecularFormula || !$monoisotopicWeight || !$molecularWeight) {
      alert('Please calculate molecular weight first.');
      return;
    }

    // Check for duplicate modification name
    const storedData = storage.load('potentialModifications') || [];
    const isDuplicate = storedData.some(data => data.name === modificationName);
    if (isDuplicate) {
      alert('The modification name already exists.');
      return;
    }

    // Calculate values to save
    let savedMonoisotopicWeight;
    let savedMolecularWeight;
    let savedMolecularFormula;
    let formulaCalculation;

    if (modificationType === 'Single-site' &&
        (singleSiteCondition === SingleSiteCondition.N_TERMINUS || singleSiteCondition === SingleSiteCondition.C_TERMINUS)) {
      // For N-terminus and C-terminus: subtract target amino acid weight (or Glycine for All)
      const targetAA = targetAminoAcid === 'All' ? 'G' : targetAminoAcid;
      const targetMonoisotopicWeight = aminoMap[targetAA] || 0;
      const targetMolecularWeight = molecularWeightMap[targetAA] || 0;
      const targetFormula = aminoFormulaMap[targetAA] || '';

      // Save delta values
      savedMonoisotopicWeight = (parseFloat($monoisotopicWeight) - targetMonoisotopicWeight).toFixed(5);
      savedMolecularWeight = (parseFloat($molecularWeight) - targetMolecularWeight).toFixed(5);

      // Calculate and save formula subtraction
      formulaCalculation = formatFormulaSubtraction($molecularFormula, targetFormula);
      savedMolecularFormula = formulaCalculation.split(' = ')[1]; // Get result only
    } else {
      // For Side Chain and Crosslinking: save absolute values (no subtraction)
      savedMonoisotopicWeight = parseFloat($monoisotopicWeight).toFixed(5);
      savedMolecularWeight = parseFloat($molecularWeight).toFixed(5);
      savedMolecularFormula = $molecularFormula;
      formulaCalculation = undefined;
    }

    const modificationData = {
      name: modificationName,
      type: modificationType,
      ...(modificationType === 'Single-site'
        ? {
            target: targetAminoAcid,
            condition: singleSiteCondition
          }
        : {
            target1: target1AminoAcid,
            target2: target2AminoAcid,
            condition: crosslinkingCondition,
            ...(crosslinkingCondition === CrosslinkingCondition.DISTANCE && {
              distanceOperator,
              distanceValue
            })
          }
      ),
      structureName: structureName,
      moleculeJson: $moleculeJson,
      molecularFormula: savedMolecularFormula,
      originalFormula: $molecularFormula,
      formulaCalculation: formulaCalculation,
      monoisotopicWeight: savedMonoisotopicWeight,
      molecularWeight: savedMolecularWeight
    };

    // Save to storage
    storedData.push(modificationData);
    storage.save('potentialModifications', storedData);

    console.log('Saved Modification Data:', modificationData);
    alert('Modification saved successfully!');

    // Reset form after saving
    resetForm();
    loadSavedModifications();
  }

  function resetForm() {
    modificationName = '';
    targetAminoAcid = '';
    target1AminoAcid = '';
    target2AminoAcid = '';
    structureName = '';
    molecularFormula.set('');
    monoisotopicWeight.set('');
    molecularWeight.set('');
    moleculeJson.set({});

    // Clear the ChemDoodle canvas
    if (chemDoodleCanvas) {
      chemDoodleCanvas.clearCanvas();
    }
  }

  function loadSavedModifications() {
    const storedData = storage.load('potentialModifications') || [];
    savedModifications.set(storedData);
  }

  function deleteModification(index) {
    const storedData = storage.load('potentialModifications') || [];
    storedData.splice(index, 1);
    storage.save('potentialModifications', storedData);
    savedModifications.set([...storedData]);
  }

  function handleTargetChange() {
    // Single-site 모드에서 Target 변경 시 분자량 계산 초기화
    if (modificationType === 'Single-site' && chemDoodleCanvas) {
      chemDoodleCanvas.resetCalculation();
    }
  }
</script>

<div class="container mt-5">
  <div class="text-center mb-4">
    <h1>Potential Modification</h1>
  </div>

  <!-- Name Input -->
  <div class="mb-3">
    <label for="modification-name" class="form-label fw-bold">Name <span class="text-danger">*</span></label>
    <input
      type="text"
      id="modification-name"
      bind:value={modificationName}
      class="form-control"
      placeholder="Enter modification name"
    />
  </div>

  <!-- Type Selector -->
  <div class="mb-3">
    <label for="modification-type" class="form-label fw-bold">Type</label>
    <select id="modification-type" class="form-select" bind:value={modificationType}>
      <option value="Single-site">Single-site</option>
      <option value="Crosslinking">Crosslinking</option>
    </select>
  </div>

  {#if modificationType === 'Single-site'}
    <SingleSiteSection
      bind:targetAminoAcid
      bind:condition={singleSiteCondition}
      on:targetChange={handleTargetChange}
    />
  {:else}
    <CrosslinkingSection
      bind:target1AminoAcid
      bind:target2AminoAcid
      bind:condition={crosslinkingCondition}
      bind:distanceOperator
      bind:distanceValue
    />
  {/if}

  <!-- ChemDoodle Canvas -->
  <ChemDoodleCanvas
    bind:this={chemDoodleCanvas}
    bind:structureName
    bind:molecularFormula
    bind:monoisotopicWeight
    bind:molecularWeight
    bind:moleculeJson
    calculateDisabled={calculateDisabled}
    modificationType={modificationType}
    singleSiteCondition={singleSiteCondition}
    targetAminoAcid={targetAminoAcid}
    target1AminoAcid={target1AminoAcid}
    target2AminoAcid={target2AminoAcid}
  />

  <!-- Save Button -->
  <div class="mb-5">
    <button class="btn btn-primary btn-lg w-100" on:click={handleSave}>
      Save Modification
    </button>
  </div>

  <!-- Saved Modifications List -->
  <h2 class="text-start my-4">Saved Modifications</h2>
  {#if $savedModifications.length > 0}
    <ul class="list-group mb-5">
      {#each $savedModifications as modification, index (modification.name)}
        <li class="list-group-item">
          <ModificationItem {modification} {index} {deleteModification} />
        </li>
      {/each}
    </ul>
  {:else}
    <p class="alert alert-info">No saved modifications yet.</p>
  {/if}
</div>

<style>
  :global(body) {
    background-color: #f8f9fa;
  }

  .container {
    padding-left: 0;
    padding-right: 0;
  }

  /* 모바일 반응형 */
  @media (max-width: 767px) {
    .container {
      margin-top: 1rem !important;
      padding: 1rem !important;
    }

    h1 {
      font-size: 1.75rem;
      margin-bottom: 1rem !important;
    }

    h2 {
      font-size: 1.5rem;
    }

    .card {
      margin-bottom: 1rem;
    }

    .card-body {
      padding: 1rem;
    }

    .mb-3, .mb-4 {
      margin-bottom: 1rem !important;
    }

    .btn {
      padding: 0.75rem;
      font-size: 1rem;
    }

    .list-group-item {
      padding: 0.75rem;
    }

    .form-check {
      margin-bottom: 0.75rem;
    }
  }

  /* 태블릿 */
  @media (min-width: 768px) and (max-width: 1023px) {
    .container {
      padding: 2rem !important;
    }

    h1 {
      font-size: 2rem;
    }
  }
</style>
