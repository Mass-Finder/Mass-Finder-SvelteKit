<script>
    import { onMount } from 'svelte';
    import CodonSelectDialog from './CodonSelectDialog.svelte';
  
    export let data;
    export let key;
    export let onCancelSelectData;
    export let onChangeTitle;
    export let customCodonTitle;

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
      customCodonTitle = event.detail.codon;
      onChangeTitle(customCodonTitle, key);
      showCodonDialog = false;
    }
</script>

<div class="card-body text-center">
    <h5 class="card-title text-primary"><strong>{data.title}</strong></h5>
    <p class="card-text mb-1"><strong>Molecular Formula:</strong> {data.molecularFormula}</p>
    <p class="card-text mb-1"><strong>Monoisotopic Weight:</strong> {data.monoisotopicWeight}</p>
    <p class="card-text mb-1"><strong>Molecular Weight:</strong> {data.molecularWeight}</p>
    <canvas id={`canvas-ncaa-codon-${data.title}`} width="100" height="100" class="border rounded mt-2 mx-auto" />
    <button class="btn btn-danger btn-sm w-100 mt-3" on:click={() => onCancelSelectData(key)}>Cancel</button>
    <div class="row align-items-center mt-3">
        <label for="customCodon" class="form-label fw-bold col-md-4 mt-2">Codon:</label>
        <div class="col-md-8">
            <div class="input-group">
                <input
                    type="text"
                    id="customCodon"
                    bind:value={customCodonTitle}
                    class="form-control"
                    placeholder="ex) UAG"
                    readonly
                />
                <button 
                    class="btn btn-outline-secondary" 
                    type="button"
                    on:click={() => showCodonDialog = true}
                >
                    Select
                </button>
            </div>
        </div>
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

    input[readonly] {
        background-color: #fff;
        cursor: default;
    }
</style>
  