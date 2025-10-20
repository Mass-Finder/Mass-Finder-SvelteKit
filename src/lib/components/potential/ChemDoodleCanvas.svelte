<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { writable } from 'svelte/store';
  import { Molecule } from '$lib/model/atom';

  const dispatch = createEventDispatcher();

  let sketcher: any;
  export let structureName = '';
  export let molecularFormula: Writable<string> = writable('');
  export let monoisotopicWeight: Writable<string> = writable('');
  export let molecularWeight: Writable<string> = writable('');

  onMount(() => {
    // ChemDoodle 기본 설정
    ChemDoodle.ELEMENT['H'].jmolColor = 'black';
    ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
    sketcher = new ChemDoodle.SketcherCanvas('sketcher', 500, 300, {
      useServices: false,
      oneMolecule: true
    });
    sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
    sketcher.styles.atoms_useJMOLColors = true;
    sketcher.styles.bonds_clearOverlaps_2D = true;
    sketcher.styles.shapes_color = 'c10000';
    sketcher.repaint();
  });

  function calculateChemical() {
    try {
      let mol = sketcher.getMolecule();
      let molJson = new ChemDoodle.io.JSONInterpreter().molTo(mol);
      let obj = new ChemDoodle.io.JSONInterpreter().molFrom(molJson);
      let asString = JSON.stringify(obj);
      const molecule = Molecule.fromJson(asString);

      molecularFormula.set(molecule.getMolecularFormula());
      monoisotopicWeight.set(molecule.getMonoisotopicMass().toFixed(3).toString());
      molecularWeight.set(molecule.getMolecularMass().toFixed(3).toString());

      dispatch('calculated', {
        molecularFormula: $molecularFormula,
        monoisotopicWeight: $monoisotopicWeight,
        molecularWeight: $molecularWeight
      });
    } catch (error) {
      console.error('Error calculating molecular properties:', error);
      alert('Error calculating molecular properties. Please check your structure.');
    }
  }
</script>

<div class="canvas-section mb-3">
  <div class="mb-3">
    <label class="form-label fw-bold">Chemical Structure</label>

    <!-- Structure Name Input -->
    <div class="mb-2">
      <input
        type="text"
        bind:value={structureName}
        class="form-control"
        placeholder="Enter structure name (optional)"
      />
    </div>

    <div class="canvas-container text-center">
      <canvas id="sketcher" class="border border-secondary rounded shadow-sm" width="500" height="300"></canvas>
    </div>
  </div>

  <div class="mb-3">
    <button class="btn btn-success w-100" on:click={calculateChemical}>
      Calculate Molecular Properties
    </button>
  </div>

  {#if $molecularFormula || $monoisotopicWeight || $molecularWeight}
    <div class="results">
      {#if $molecularFormula}
        <div class="mb-2">
          <strong>Molecular Formula:</strong> {$molecularFormula}
        </div>
      {/if}
      {#if $monoisotopicWeight}
        <div class="mb-2">
          <strong>Monoisotopic Weight:</strong> {$monoisotopicWeight}
        </div>
      {/if}
      {#if $molecularWeight}
        <div class="mb-2">
          <strong>Molecular Weight:</strong> {$molecularWeight}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  canvas {
    display: block;
    margin: 0 auto;
  }

  .canvas-container {
    background-color: white;
    padding: 15px;
    border-radius: 8px;
  }

  .results {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  }

  .results strong {
    color: #495057;
  }
</style>
