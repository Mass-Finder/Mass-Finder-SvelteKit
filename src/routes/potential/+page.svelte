<script lang="ts">
  import { writable } from 'svelte/store';
  import SingleSiteSection from '$lib/components/potential/SingleSiteSection.svelte';
  import CrosslinkingSection from '$lib/components/potential/CrosslinkingSection.svelte';
  import ChemDoodleCanvas from '$lib/components/potential/ChemDoodleCanvas.svelte';
  import type { ModificationType, DistanceOperator } from '../../type/Types';
  import { SingleSiteCondition, CrosslinkingCondition } from '../../type/Types';

  let modificationName = '';
  let modificationType: ModificationType = 'Single-site';

  // Single-site variables
  let targetAminoAcid = 'G';
  let singleSiteCondition: SingleSiteCondition = SingleSiteCondition.N_TERMINUS;

  // Crosslinking variables
  let target1AminoAcid = 'G';
  let target2AminoAcid = 'G';
  let crosslinkingCondition: CrosslinkingCondition = CrosslinkingCondition.EVERYWHERE;
  let distanceOperator: DistanceOperator = '>';
  let distanceValue = 1;

  // ChemDoodle variables
  let structureName = '';
  let molecularFormula = writable('');
  let monoisotopicWeight = writable('');
  let molecularWeight = writable('');

  function handleSave() {
    if (!modificationName.trim()) {
      alert('Please enter a modification name.');
      return;
    }

    if (modificationType === 'Crosslinking' && crosslinkingCondition === CrosslinkingCondition.DISTANCE && distanceValue < 1) {
      alert('Distance value must be at least 1.');
      return;
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
      structureName: structureName || 'Unnamed Structure',
      molecularFormula: $molecularFormula,
      monoisotopicWeight: $monoisotopicWeight,
      molecularWeight: $molecularWeight
    };

    console.log('Saved Modification Data:', modificationData);
    alert('Modification saved successfully!');
  }
</script>

<div class="container mt-5">
  <div class="text-center mb-4">
    <h1>Potential Modification</h1>
  </div>

  <!-- Name Input -->
  <div class="mb-3">
    <label for="modification-name" class="form-label fw-bold">Name</label>
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
    bind:structureName
    bind:molecularFormula
    bind:monoisotopicWeight
    bind:molecularWeight
  />

  <!-- Save Button -->
  <div class="mb-5">
    <button class="btn btn-primary btn-lg w-100" on:click={handleSave}>
      Save Modification
    </button>
  </div>
</div>

<style>
  :global(body) {
    background-color: #f8f9fa;
  }
</style>
