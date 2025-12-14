<script>
    import { onMount } from 'svelte';
    import CodonSelectDialog from './CodonSelectDialog.svelte';
    import { formatFormula } from '$lib/helper/formula_util';

    export let data;
    export let key;
    export let onCancelSelectData;
    export let onChangeTitle;
    export let customCodonTitles;

    let showCodonDialog = false;

    onMount(() => {
      let canvasId = `canvas-ncaa-codon-${data.title}`;
  
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
        let mol = new ChemDoodle.io.JSONInterpreter().molFrom(data.moleculeJson);
        myCanvas.loadMolecule(mol);
        myCanvas.repaint();
      }, 100);
    });

    function handleCodonSelect(event) {
      const selectedCodon = event.detail.codon;
      if (!customCodonTitles.includes(selectedCodon)) {
        customCodonTitles = [...customCodonTitles, selectedCodon];
        onChangeTitle(customCodonTitles, key);
      }
      showCodonDialog = false;
    }

    function removeCodon(codonToRemove) {
      customCodonTitles = customCodonTitles.filter(codon => codon !== codonToRemove);
      onChangeTitle(customCodonTitles, key);
    }
</script>

<div class="card-body text-center">
    <h5 class="card-title text-primary"><strong>{data.title}</strong></h5>
    <p class="card-text mb-1"><strong>Molecular Formula:</strong> <span class="formula">{@html formatFormula(data.molecularFormula)}</span></p>
    <p class="card-text mb-1"><strong>Monoisotopic Weight:</strong> {data.monoisotopicWeight}</p>
    <p class="card-text mb-1"><strong>Molecular Weight:</strong> {data.molecularWeight}</p>
    <canvas id={`canvas-ncaa-codon-${data.title}`} width="100" height="100" class="border rounded mt-2 mx-auto" />
    <button class="btn btn-danger btn-sm w-100 mt-3" on:click={() => onCancelSelectData(key)}>Cancel</button>
    
    <div class="mt-3">
        <label class="form-label fw-bold">Codons:</label>
        
        <!-- 선택된 코돈들 표시 -->
        <div class="selected-codons mb-2">
          {#each customCodonTitles as codon}
            <span class="badge bg-primary me-1 mb-1">
              {codon}
              <button 
                type="button" 
                class="btn-close btn-close-white ms-1" 
                aria-label="Remove {codon}"
                on:click={() => removeCodon(codon)}
              ></button>
            </span>
          {/each}
        </div>
        
        <!-- 코돈 추가 버튼 -->
        <button 
          class="btn btn-outline-primary btn-sm w-100" 
          type="button"
          on:click={() => showCodonDialog = true}
        >
          Add Codon
        </button>
    </div>
</div>

<CodonSelectDialog
    bind:showDialog={showCodonDialog}
    on:select={handleCodonSelect}
/>

<style>
    canvas {
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  
    .card-title {
        font-size: 1.1rem;
    }
  
    .card-body {
        padding: 10px;
    }
  
    button {
        font-size: 0.875rem;
    }

    .selected-codons {
        min-height: 30px;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
    }

    .badge {
        display: inline-flex;
        align-items: center;
        font-size: 0.8em;
    }

    .btn-close {
        font-size: 0.6em;
        padding: 0;
        margin: 0;
        width: 12px;
        height: 12px;
    }

    .formula {
        font-family: 'Times New Roman', Times, serif;
    }
</style>
  