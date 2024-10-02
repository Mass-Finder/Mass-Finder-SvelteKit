<script>
    import { onMount } from 'svelte';
  
    export let data;
    export let index;
    export let onClickBody;
  
    onMount(() => {
      let canvasId = `canvas1-${index}`;
  
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
  
  <!-- Data item with Bootstrap styling -->
  <div class="card mb-3" on:click={() => onClickBody(index)}>
    <div class="row g-0">
      <!-- Molecular Info -->
      <div class="col-md-8 p-3">
        <div class="card-body">
          <h5 class="card-title">Molecular Formula: {data.molecularFormula}</h5>
          <p class="card-text">Monoisotopic Weight: {data.monoisotopicWeight}</p>
        </div>
      </div>
  
      <!-- Canvas for Chemical Structure -->
      <div class="col-md-4 d-flex align-items-center justify-content-center">
        <canvas id={`canvas1-${index}`} width="150" height="150" class="img-fluid" />
      </div>
    </div>
  </div>
  
  <style>
    .card {
      cursor: pointer;
      transition: box-shadow 0.3s ease;
    }
    .card:hover {
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .card-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .card-title {
      margin-bottom: 5px;
      font-size: 1.25rem;
    }
    .card-text {
      margin: 0;
    }
    canvas {
      border: 1px solid #ccc;
      border-radius: 8px;
    }
  </style>
  