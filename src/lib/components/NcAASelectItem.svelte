<script>
    import { onMount } from 'svelte';
  
    export let data;
    export let key;
    export let onCancelSelectData;

    onMount(() => {
      let canvasId = `canvas-ncaa-${data.title}`;
  
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
 <div class="card-body text-center">
    <!-- Title Section -->
    <h5 class="card-title text-primary"><strong>{data.title}</strong></h5>
    <!-- Molecular Info Section -->
    <p class="card-text mb-1"><strong>Molecular Formula:</strong> {data.molecularFormula}</p>
    <p class="card-text mb-1"><strong>Monoisotopic Weight:</strong> {data.monoisotopicWeight}</p>
    <p class="card-text mb-1"><strong>Molecular Weight:</strong> {data.molecularWeight}</p>
    <!-- Canvas Section -->
    <canvas id={`canvas-ncaa-${data.title}`} width="100" height="100" class="border rounded mt-2 mx-auto" />
    <!-- Delete Button -->
    <button class="btn btn-danger btn-sm w-100 mt-3" on:click={() => onCancelSelectData(key)}>Cancel</button>
  </div>
  
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
  </style>
  