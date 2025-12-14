<script>
  import { onMount } from 'svelte';
  import { formatFormula } from '$lib/helper/formula_util';

  export let modification;
  export let index;
  export let deleteModification;

  onMount(() => {
    let canvasId = `modification-canvas-${index}`;

    setTimeout(() => {
      ChemDoodle.ELEMENT['H'].jmolColor = 'black';
      ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
      let myCanvas = new ChemDoodle.ViewerCanvas(canvasId, 150, 150);
      myCanvas.styles.bonds_width_2D = 0.6;
      myCanvas.styles.bonds_saturationWidthAbs_2D = 2.6;
      myCanvas.styles.bonds_hashSpacing_2D = 2.5;
      myCanvas.styles.atoms_font_size_2D = 10;
      myCanvas.styles.atoms_font_families_2D = ['Helvetica', 'Arial', 'sans-serif'];
      myCanvas.styles.atoms_displayTerminalCarbonLabels_2D = true;
      let mol = new ChemDoodle.io.JSONInterpreter().molFrom(modification.moleculeJson);
      myCanvas.loadMolecule(mol);
      myCanvas.repaint();
    }, 100);
  });
</script>

<div class="modification-item">
  <div class="row g-0 align-items-center">
    <!-- Text Section -->
    <div class="col-md-8">
      <h5 class="mb-2 text-primary"><strong>{modification.name}</strong></h5>
      <div class="modification-details">
        <p class="mb-1"><strong>Type:</strong> {modification.type}</p>
        {#if modification.type === 'Single-site'}
          <p class="mb-1"><strong>Target:</strong> {modification.target}</p>
          <p class="mb-1"><strong>Condition:</strong> {modification.condition}</p>
        {:else}
          <p class="mb-1"><strong>Target 1:</strong> {modification.target1}</p>
          <p class="mb-1"><strong>Target 2:</strong> {modification.target2}</p>
          <p class="mb-1"><strong>Condition:</strong> {modification.condition}</p>
          {#if modification.condition === 'Distance'}
            <p class="mb-1"><strong>Distance:</strong> {modification.distanceOperator} {modification.distanceValue}</p>
          {/if}
        {/if}
        <p class="mb-1"><strong>Structure Name:</strong> {modification.structureName}</p>
        {#if modification.formulaCalculation}
          <p class="mb-1"><strong>Formula Calculation:</strong> <span class="formula">{@html formatFormula(modification.formulaCalculation)}</span></p>
        {/if}
        <p class="mb-1"><strong>Formula:</strong> <span class="formula">{@html formatFormula(modification.molecularFormula)}</span></p>
        <p class="mb-1"><strong>Monoisotopic Weight:</strong> {modification.monoisotopicWeight}</p>
        <p class="mb-1"><strong>Molecular Weight:</strong> {modification.molecularWeight}</p>
      </div>
    </div>
    <!-- Canvas Section -->
    <div class="col-md-2 d-flex justify-content-end">
      <canvas id={`modification-canvas-${index}`} width="150" height="150" class="border rounded me-3" />
    </div>
    <div class="col-md-1"></div>
    <!-- Delete Button -->
    <div class="col-md-1">
      <button class="btn btn-danger" on:click={() => deleteModification(index)}>X</button>
    </div>
  </div>
</div>

<style>
  .modification-item {
    width: 100%;
  }

  .modification-details {
    font-size: 0.9rem;
    color: #495057;
  }

  .modification-details p {
    margin-bottom: 0.25rem;
  }

  canvas {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .formula {
    font-family: 'Times New Roman', Times, serif;
  }
</style>
