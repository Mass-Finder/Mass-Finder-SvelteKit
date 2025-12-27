<script>
  import { createEventDispatcher, onMount, afterUpdate, tick } from 'svelte';
  import ProteinSelectDialog from './ProteinSelectDialog.svelte';
  import { SingleSiteCondition } from '../../../type/Types';
  import { aminoAcidMOL } from '$lib/helper/amino_mol';
  import { storage } from '$lib/services/storage.service';

  export let targetAminoAcid = '';
  export let condition = SingleSiteCondition.N_TERMINUS;

  const dispatch = createEventDispatcher();
  let showDialog = false;
  let canvasElement;

  // ALL 옵션은 N-terminus와 C-terminus에서만 사용 가능
  $: showAllOption = condition === SingleSiteCondition.N_TERMINUS || condition === SingleSiteCondition.C_TERMINUS;

  // Condition이 Side Chain으로 바뀌면 ALL 옵션이 없으므로 target을 초기화
  $: if (!showAllOption && targetAminoAcid === 'All') {
    targetAminoAcid = '';
  }

  // Target 변경 시 분자 구조 업데이트
  $: if (targetAminoAcid) {
    updateMoleculeDisplay();
  }

  function handleOpenDialog() {
    showDialog = true;
  }

  function handleSelectAminoAcid(event) {
    const newTarget = event.detail.code;
    // Target이 실제로 변경되었을 때만 이벤트 발생
    if (newTarget !== targetAminoAcid) {
      targetAminoAcid = newTarget;
      dispatch('targetChange', targetAminoAcid);
    } else {
      targetAminoAcid = newTarget;
    }
    showDialog = false;
  }

  function handleConditionChange() {
    dispatch('conditionChange', condition);
  }

  async function updateMoleculeDisplay() {
    if (!targetAminoAcid) return;

    // Wait for DOM to update
    await tick();

    // Add a small delay to ensure canvas is fully rendered
    setTimeout(() => {
      if (!canvasElement) return;

      const displayTarget = targetAminoAcid === 'All' ? 'G' : targetAminoAcid;

      // Check if it's a canonical amino acid
      if (aminoAcidMOL[displayTarget]) {
        displayCanonicalAminoAcid(displayTarget);
      } else {
        // Check if it's an ncAA from localStorage
        displayNcAA(displayTarget);
      }
    }, 100);
  }

  function displayCanonicalAminoAcid(aminoCode) {
    try {
      if (!canvasElement || !aminoAcidMOL[aminoCode]) return;

      ChemDoodle.ELEMENT['H'].jmolColor = 'black';
      ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
      let myCanvas = new ChemDoodle.ViewerCanvas('target-structure-canvas', 150, 150);
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

  function displayNcAA(ncaaTitle) {
    try {
      const savedNcAA = storage.load('moleculeData') || [];
      const ncaa = savedNcAA.find(item => item.title === ncaaTitle);

      if (ncaa && ncaa.moleculeJson) {
        ChemDoodle.ELEMENT['H'].jmolColor = 'black';
        ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
        let myCanvas = new ChemDoodle.ViewerCanvas('target-structure-canvas', 150, 150);
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

<div class="single-site-section mb-3">
  <!-- Condition Radio Buttons -->
  <div class="mb-3">
    <label class="form-label fw-bold">Condition</label>
    <div class="condition-group">
      {#each Object.values(SingleSiteCondition) as conditionOption}
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="singleSiteCondition"
            id="single-{conditionOption}"
            value={conditionOption}
            bind:group={condition}
            on:change={handleConditionChange}
          />
          <label class="form-check-label" for="single-{conditionOption}">
            {conditionOption}
          </label>
        </div>
      {/each}
    </div>
  </div>

  <!-- Target Amino Acid Selector -->
  <div class="mb-3">
    <label class="form-label fw-bold">Target <span class="text-danger">*</span></label>
    <div class="row">
      <div class="col-md-6">
        <button class="btn btn-outline-primary w-100 target-btn" on:click={handleOpenDialog}>
          {targetAminoAcid === '' ? 'Select canonical and non-canonical amino acid' : targetAminoAcid === 'All' ? 'All' : targetAminoAcid}
        </button>
        {#if targetAminoAcid}
          <div class="mt-3">
            <canvas bind:this={canvasElement} id="target-structure-canvas" width="150" height="150" class="border rounded" />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<ProteinSelectDialog
  bind:showDialog
  showAllOption={showAllOption}
  selectedValue={targetAminoAcid}
  on:select={handleSelectAminoAcid}
/>

<style>
  .condition-group {
    padding-left: 10px;
  }

  .form-check {
    margin-bottom: 8px;
  }

  .target-btn {
    background-color: white;
  }

  .target-btn:hover {
    background-color: #e7f1ff;
  }

  canvas {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>
