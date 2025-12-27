<script>
  import { createEventDispatcher, tick } from 'svelte';
  import ProteinSelectDialog from './ProteinSelectDialog.svelte';
  import { CrosslinkingCondition } from '../../../type/Types';
  import { aminoAcidMOL } from '$lib/helper/amino_mol';
  import { storage } from '$lib/services/storage.service';

  export let target1AminoAcid = '';
  export let target2AminoAcid = '';
  export let condition = CrosslinkingCondition.ADJACENT;
  export let distanceOperator = '>';
  export let distanceValue = 1;

  const dispatch = createEventDispatcher();
  let showDialog = false;
  let currentTarget = null;
  let canvas1Element;
  let canvas2Element;

  $: currentSelectedValue = currentTarget === 1 ? target1AminoAcid : currentTarget === 2 ? target2AminoAcid : '';

  // Target 1 변경 시 분자 구조 업데이트
  $: if (target1AminoAcid) {
    updateMoleculeDisplay(1, target1AminoAcid);
  }

  // Target 2 변경 시 분자 구조 업데이트
  $: if (target2AminoAcid) {
    updateMoleculeDisplay(2, target2AminoAcid);
  }

  function handleOpenDialog(targetNumber) {
    currentTarget = targetNumber;
    showDialog = true;
  }

  function handleSelectAminoAcid(event) {
    if (currentTarget === 1) {
      target1AminoAcid = event.detail.code;
      dispatch('target1Change', target1AminoAcid);
    } else if (currentTarget === 2) {
      target2AminoAcid = event.detail.code;
      dispatch('target2Change', target2AminoAcid);
    }
    showDialog = false;
    currentTarget = null;
  }

  function handleConditionChange() {
    dispatch('conditionChange', condition);
  }

  function handleDistanceOperatorChange() {
    dispatch('distanceOperatorChange', distanceOperator);
  }

  function handleDistanceValueChange() {
    dispatch('distanceValueChange', distanceValue);
  }

  // Distance 값 검증
  $: if (distanceValue < 1) {
    distanceValue = 1;
  }

  async function updateMoleculeDisplay(targetNumber, aminoAcid) {
    if (!aminoAcid) return;

    // Wait for DOM to update
    await tick();

    // Add a small delay to ensure canvas is fully rendered
    setTimeout(() => {
      const canvasElement = targetNumber === 1 ? canvas1Element : canvas2Element;
      if (!canvasElement) return;

      const canvasId = targetNumber === 1 ? 'target1-structure-canvas' : 'target2-structure-canvas';

      // Check if it's a canonical amino acid
      if (aminoAcidMOL[aminoAcid]) {
        displayCanonicalAminoAcid(canvasId, aminoAcid);
      } else {
        // Check if it's an ncAA from localStorage
        displayNcAA(canvasId, aminoAcid);
      }
    }, 100);
  }

  function displayCanonicalAminoAcid(canvasId, aminoCode) {
    try {
      const canvasElement = document.getElementById(canvasId);
      if (!canvasElement || !aminoAcidMOL[aminoCode]) return;

      ChemDoodle.ELEMENT['H'].jmolColor = 'black';
      ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
      let myCanvas = new ChemDoodle.ViewerCanvas(canvasId, 150, 150);
      myCanvas.styles.bonds_width_2D = 0.6;
      myCanvas.styles.bonds_saturationWidthAbs_2D = 2.6;
      myCanvas.styles.bonds_hashSpacing_2D = 2.5;
      myCanvas.styles.atoms_font_size_2D = 10;
      myCanvas.styles.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
      myCanvas.styles.atoms_displayTerminalCarbonLabels_2D = true;

      let mol = ChemDoodle.readMOL(aminoAcidMOL[aminoCode]);
      myCanvas.loadMolecule(mol);
      myCanvas.repaint();
    } catch (error) {
      console.error('Error displaying canonical amino acid structure:', error);
    }
  }

  function displayNcAA(canvasId, ncaaTitle) {
    try {
      const savedNcAA = storage.load('moleculeData') || [];
      const ncaa = savedNcAA.find(item => item.title === ncaaTitle);

      if (ncaa && ncaa.moleculeJson) {
        ChemDoodle.ELEMENT['H'].jmolColor = 'black';
        ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
        let myCanvas = new ChemDoodle.ViewerCanvas(canvasId, 150, 150);
        myCanvas.styles.bonds_width_2D = 0.6;
        myCanvas.styles.bonds_saturationWidthAbs_2D = 2.6;
        myCanvas.styles.bonds_hashSpacing_2D = 2.5;
        myCanvas.styles.atoms_font_size_2D = 10;
        myCanvas.styles.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
        myCanvas.styles.atoms_displayTerminalCarbonLabels_2D = true;

        let mol = new ChemDoodle.io.JSONInterpreter().molFrom(ncaa.moleculeJson);
        myCanvas.loadMolecule(mol);
        myCanvas.repaint();
      }
    } catch (error) {
      console.error('Error displaying ncAA structure:', error);
    }
  }
</script>

<div class="crosslinking-section mb-3">
  <!-- Condition Radio Buttons -->
  <div class="mb-3">
    <label class="form-label fw-bold">Condition</label>
    <div class="condition-group">
      {#each Object.values(CrosslinkingCondition) as conditionOption}
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="crosslinkingCondition"
            id="cross-{conditionOption}"
            value={conditionOption}
            bind:group={condition}
            on:change={handleConditionChange}
          />
          <label class="form-check-label" for="cross-{conditionOption}">
            {conditionOption}
          </label>

          {#if conditionOption === CrosslinkingCondition.DISTANCE && condition === CrosslinkingCondition.DISTANCE}
            <div class="distance-options d-inline-flex align-items-center ms-3">
              <select
                class="form-select form-select-sm"
                bind:value={distanceOperator}
                on:change={handleDistanceOperatorChange}
                style="width: 70px;"
              >
                <option value=">">{'>'}</option>
                <option value="=">{'='}</option>
                <option value="<">{'<'}</option>
              </select>
              <input
                type="number"
                class="form-control form-control-sm ms-2"
                bind:value={distanceValue}
                on:input={handleDistanceValueChange}
                min="1"
                style="width: 80px;"
              />
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>

  <!-- Target 1 and Target 2 -->
  <div class="row mb-3">
    <div class="col-md-6">
      <label class="form-label fw-bold">Target 1 <span class="text-danger">*</span></label>
      <button class="btn btn-outline-primary w-100 target-btn" on:click={() => handleOpenDialog(1)}>
        {target1AminoAcid === '' ? 'Select canonical and non-canonical amino acid' : target1AminoAcid}
      </button>
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold">Target 2 <span class="text-danger">*</span></label>
      <button class="btn btn-outline-primary w-100 target-btn" on:click={() => handleOpenDialog(2)}>
        {target2AminoAcid === '' ? 'Select canonical and non-canonical amino acid' : target2AminoAcid}
      </button>
    </div>
  </div>

  <!-- Molecular Structures -->
  {#if target1AminoAcid || target2AminoAcid}
    <div class="structures-container mb-3">
      {#if target1AminoAcid}
        <div class="structure-wrapper">
          <canvas bind:this={canvas1Element} id="target1-structure-canvas" width="150" height="150" class="border rounded" />
        </div>
      {/if}
      {#if target1AminoAcid && target2AminoAcid}
        <div class="plus-sign">+</div>
      {/if}
      {#if target2AminoAcid}
        <div class="structure-wrapper">
          <canvas bind:this={canvas2Element} id="target2-structure-canvas" width="150" height="150" class="border rounded" />
        </div>
      {/if}
    </div>
  {/if}
</div>

<ProteinSelectDialog
  bind:showDialog
  showAllOption={false}
  selectedValue={currentSelectedValue}
  on:select={handleSelectAminoAcid}
/>

<style>
  .condition-group {
    padding-left: 10px;
  }

  .form-check {
    margin-bottom: 8px;
  }

  .distance-options {
    gap: 5px;
  }

  .target-btn {
    background-color: white;
  }

  .target-btn:hover {
    background-color: #e7f1ff;
  }

  .structures-container {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }

  .structure-wrapper {
    display: flex;
    justify-content: center;
  }

  .plus-sign {
    font-size: 32px;
    font-weight: bold;
    color: #6c757d;
    user-select: none;
  }

  canvas {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>
