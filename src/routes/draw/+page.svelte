<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { Molecule } from '$lib/model/atom';
    import MolecularItem from '$lib/components/MolecularItem.svelte';
  
    let sketcher;
    let molecularFormula = writable('');
    let monoisotopicWeight = writable('');
    let moleculeJson = writable({});
    let savedData = writable([]);
  
    onMount(() => {
      // 기본 설정
      ChemDoodle.ELEMENT['H'].jmolColor = 'black';
      ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
      sketcher = new ChemDoodle.SketcherCanvas('sketcher', 500, 300, {
        useServices: false, // 허용 안된 기능이라 비활성화
        oneMolecule: true // 분자 구조 한 개만 그리게 처리
      });
      sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
      sketcher.styles.atoms_useJMOLColors = true;
      sketcher.styles.bonds_clearOverlaps_2D = true;
      sketcher.styles.shapes_color = 'c10000';
      sketcher.repaint();
  
      // 저장된 데이터 불러오기
      loadSavedData();
    });
  
    function calulateChemical() {
      let mol = sketcher.getMolecule();
      let molJson = new ChemDoodle.io.JSONInterpreter().molTo(mol);
      let obj = new ChemDoodle.io.JSONInterpreter().molFrom(molJson);
      let asString = JSON.stringify(obj);
      moleculeJson.set(molJson);
      const molecule = Molecule.fromJson(asString);
  
      molecularFormula.set(molecule.getMolecularFormula());
      monoisotopicWeight.set(molecule.getMonoisotopicMass().toString());
    }
  
    function saveData() {
      calulateChemical();
      const dataSet = {
        moleculeJson: $moleculeJson,
        molecularFormula: $molecularFormula,
        monoisotopicWeight: $monoisotopicWeight
      };
      let storedData = JSON.parse(localStorage.getItem('moleculeData') || '[]');
      storedData.push(dataSet);
      localStorage.setItem('moleculeData', JSON.stringify(storedData));
      loadSavedData();
      alert('Data Saved!');
    }
  
    function loadSavedData() {
      let storedData = JSON.parse(localStorage.getItem('moleculeData') || '[]');
      savedData.set(storedData);
    }
  
    function deleteData(index) {
      let storedData = JSON.parse(localStorage.getItem('moleculeData') || '[]');
      storedData.splice(index, 1);
      localStorage.setItem('moleculeData', JSON.stringify(storedData));
      loadSavedData();
    }
  </script>
  
  <svelte:head>
    <title>Mass Finder</title>
    <link rel="stylesheet" href="chem_doodle/install/ChemDoodleWeb.css" type="text/css" />
    <script type="text/javascript" src="chem_doodle/install/ChemDoodleWeb.js"></script>
    <link rel="stylesheet" href="chem_doodle/install/uis/jquery-ui-1.11.4.css" type="text/css" />
    <script type="text/javascript" src="chem_doodle/install/uis/ChemDoodleWeb-uis.js"></script>
  </svelte:head>
  
  <main class="container mt-5 p-4 bg-light rounded shadow">
    <h1 class="text-center mb-4">Chemical Draw Canvas</h1>
    <div class="text-center">
        <canvas id="sketcher" class="border border-secondary rounded mb-3 shadow" width="500" height="500"></canvas>
    </div>
    <div class="buttons text-center mb-4">
      <button class="btn btn-primary btn-lg" on:click={saveData}>Calculate & Save Data</button>
    </div>
    {#if $molecularFormula || $monoisotopicWeight}
      <div class="results">
        {#if $molecularFormula}
          <p class="alert alert-secondary">Molecular Formula: {$molecularFormula}</p>
        {/if}
        {#if $monoisotopicWeight}
          <p class="alert alert-secondary">Monoisotopic Weight: {$monoisotopicWeight}</p>
        {/if}
      </div>
    {/if}
    <!-- h2 좌측 정렬을 위해 text-start 사용 -->
    <h2 class="text-start my-4">Saved Molecule Data</h2>
    {#if $savedData.length > 0}
      <ul class="list-group">
        {#each $savedData as data, index}
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <MolecularItem {data} {index} {deleteData} />
          </li>
        {/each}
      </ul>
    {:else}
      <!-- 저장된 데이터가 없을 경우 메시지 표시 -->
      <p class="alert alert-info">No data available.</p>
    {/if}
  </main>
  
  <style>
    canvas {
      display: block;
      margin: 0 auto;
    }
  </style>
  