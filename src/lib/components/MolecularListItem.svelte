<script>
    import { onMount } from 'svelte';
    import { formatFormula } from '$lib/helper/formula_util';

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
  <div class="card mb-3 shadow-sm" on:click={() => onClickBody(index)} 
    role="button" 
    tabindex="0"
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && onClickBody(index)}>
    <div class="row g-0 align-items-center">
      <!-- Molecular Info -->
      <div class="col-md-8 p-3">
        <div class="card-body">
          <!-- New Title Section -->
          <h4 class="card-title text-primary mb-2"><strong>{data.title}</strong></h4>
          <h5 class="card-subtitle mb-2 text-muted">Molecular Formula: <span class="formula">{@html formatFormula(data.molecularFormula)}</span></h5>
          <p class="card-text">Monoisotopic Weight: {data.monoisotopicWeight}</p>
          <p class="card-text">Molecular Weight: {data.molecularWeight}</p>
        </div>
      </div>
  
      <!-- Canvas for Chemical Structure -->
      <div class="col-md-3 d-flex align-items-center justify-content-center p-3">
        <canvas id={`canvas1-${index}`} width="150" height="150" class="img-fluid border rounded" />
      </div>
    </div>
  </div>
  
  <style>
    .card {
      cursor: pointer;
      transition: box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease;
    }
    
    .card:hover {
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1);
      border-color: #007bff;
    }
    
    .card-body {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .card-title {
      font-size: 1.5rem;
      font-weight: bold;
    }
    
    .card-subtitle {
      font-size: 1.25rem;
    }
    
    .card-text {
      margin: 0;
      font-size: 1rem;
    }
    
    canvas {
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .formula {
      font-family: 'Times New Roman', Times, serif;
    }
  </style>