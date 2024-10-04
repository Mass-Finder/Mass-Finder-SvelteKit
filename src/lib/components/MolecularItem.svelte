<script>
    import { onMount } from 'svelte';
  
    export let data;
    export let index;
    export let deleteData;
  
    onMount(() => {
      let canvasId = `canvas-${index}`;
  
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
  </script>
  
  <div class="data-item card mb-3">
    <div class="card-body d-flex align-items-center">
      <div class="info me-3">
        <p class="card-text mb-1"><strong>Molecular Formula:</strong> {data.molecularFormula}</p>
        <p class="card-text mb-1"><strong>Monoisotopic Weight:</strong> {data.monoisotopicWeight}</p>
      </div>
      <canvas id={`canvas-${index}`} width="150" height="150" class="border rounded me-3" />
      <button class="btn btn-danger" on:click={() => deleteData(index)}>X</button>
    </div>
  </div>
  
  <style>
    .data-item {
      width: 100%;
    }
  
    .card-body {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  
    canvas {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
  </style>
  