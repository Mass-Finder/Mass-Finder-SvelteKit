<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import MolecularItem from '$lib/components/MolecularItem.svelte';
    import ChemDoodleCanvas from '$lib/components/potential/ChemDoodleCanvas.svelte';
    import { storage } from '$lib/services/storage.service';

    let molecularFormula = writable('');
    let monoisotopicWeight = writable('');
    let molecularWeight = writable('');
    let moleculeJson = writable({});
    let savedData = writable([]);
    let chemicalTitle = '';
    let chemDoodleCanvas;

    onMount(() => {
      loadSavedData();
    });

    function saveData() {
      if(!checkTitleValid()) return;

      // Validation: Molecular properties must be calculated
      if (!$molecularFormula || !$monoisotopicWeight || !$molecularWeight) {
        alert('Please calculate molecular weight first.');
        return;
      }

      const dataSet = {
        title: chemicalTitle,
        moleculeJson: $moleculeJson,
        molecularFormula: $molecularFormula,
        monoisotopicWeight: $monoisotopicWeight,
        molecularWeight: $molecularWeight
      };
      const storedData = storage.load('moleculeData') || [];
      storedData.push(dataSet);
      storage.save('moleculeData', storedData);
      loadSavedData();
      alert('Data Saved!');
      resetForm();
    }

    function loadSavedData() {
      const storedData = storage.load('moleculeData') || [];
      savedData.set(storedData);
    }

    function deleteData(index) {
      const storedData = storage.load('moleculeData') || [];
      storedData.splice(index, 1);
      storage.save('moleculeData', storedData);
      savedData.set([...storedData]);
    }

    function resetForm() {
      chemicalTitle = '';
      molecularFormula.set('');
      monoisotopicWeight.set('');
      molecularWeight.set('');
      moleculeJson.set({});
      if (chemDoodleCanvas) {
        chemDoodleCanvas.clearCanvas();
      }
    }

    /// 입력된 타이틀이 저장 가능한지 체크
    function checkTitleValid(){
        if(!chemicalTitle) {
            alert('Please enter a title to save.');
            return false;
        }
        const hasSpace = chemicalTitle.includes(' ');
        if(hasSpace) {
            alert('Spaces cannot be entered.');
            return false;
        }
        if(checkTitleDuplicated()) {
            alert('The name already exists.');
            return false;
        }
        return true;
    }

    function checkTitleDuplicated() {
        const storedData = storage.load('moleculeData') || [];
        const isDuplicate = storedData.some(data => data.title === chemicalTitle);
        return isDuplicate;
    }
  </script>

  
  <main class="container mt-5 p-4 bg-light rounded shadow">
    <h1 class="text-center mb-4">My ncAAs</h1>

    <!-- Title Input -->
    <div class="mb-3">
      <label for="chemical-title" class="form-label fw-bold">Name of ncAA</label>
      <input
        type="text"
        id="chemical-title"
        bind:value={chemicalTitle}
        class="form-control"
        placeholder="Enter title"
      />
    </div>

    <!-- ChemDoodle Canvas Component -->
    <ChemDoodleCanvas
      bind:this={chemDoodleCanvas}
      bind:structureName={chemicalTitle}
      bind:molecularFormula
      bind:monoisotopicWeight
      bind:molecularWeight
      bind:moleculeJson
      showStructureName={false}
    />

    <!-- Save Button -->
    <div class="mb-4">
      <button class="btn btn-primary btn-lg w-100" on:click={saveData}>
        Save ncAA
      </button>
    </div>

    <!-- Saved ncAA -->
    <h2 class="text-start my-4">Saved ncAA</h2>
    {#if $savedData.length > 0}
      <ul class="list-group">
        {#each $savedData as data, index (data.title)}
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <MolecularItem {data} {index} {deleteData} />
          </li>
        {/each}
      </ul>
    {:else}
      <p class="alert alert-info">No data available.</p>
    {/if}
  </main>

  <style>
    main.container {
      padding-left: 0;
      padding-right: 0;
    }

    /* 모바일 반응형 */
    @media (max-width: 767px) {
      main.container {
        margin-top: 1rem !important;
        padding: 1rem !important;
      }

      h1 {
        font-size: 1.75rem;
        margin-bottom: 1rem !important;
      }

      h2 {
        font-size: 1.5rem;
      }

      .mb-3, .mb-4 {
        margin-bottom: 1rem !important;
      }

      .btn {
        padding: 0.75rem;
        font-size: 1rem;
      }

      .list-group-item {
        padding: 0.75rem;
      }
    }

    /* 태블릿 */
    @media (min-width: 768px) and (max-width: 1023px) {
      main.container {
        padding: 2rem !important;
      }

      h1 {
        font-size: 2rem;
      }
    }
  </style>