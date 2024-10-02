<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { createEventDispatcher } from 'svelte';
    import Modal from '$lib/components/Modal.svelte';
    import MolecularListItem from '$lib/components/MolecularListItem.svelte';
  
    const dispatch = createEventDispatcher();
  
    let savedData = writable([]);
    let selectedData = writable({
      B: null,
      J: null,
      O: null,
      U: null,
      X: null,
      Z: null
    });
  
    let showModal = writable(false);
    let selectedKey = 'B'; // Default key
  
    onMount(() => {
      loadSavedData();
    });
  
    function loadSavedData() {
      let storedData = JSON.parse(localStorage.getItem('moleculeData') || '[]');
      savedData.set(storedData);
    }
  
    function openModal(key) {
      if ($savedData.length == 0) return alert('There is no ncAA created.');
      selectedKey = key;
      showModal.set(true);
    }
  
    function closeModal() {
      showModal.set(false);
    }
  
    function selectData(data) {
      selectedData.update((values) => ({ ...values, [selectedKey]: data }));
      closeModal();
    }
  
    function confirmSelection() {
      dispatch('changeNcAA', $selectedData);
    }
  
    function onClickBody(index) {
      let _data = $savedData[index];
      selectData(_data);
      confirmSelection();
    }
  
    // Get keys of selectedData
    const keys = Object.keys($selectedData);
  </script>
  
  <div class="container mt-4">
    <label class="form-label fw-bold">ncAA Selector</label>
    <div class="row">
      {#each keys as key}
        <div class="col-md-4">
          <div class="mb-3">
            <label class="form-label">{key} :</label>
            <button class="btn btn-outline-secondary w-100" on:click={() => openModal(key)}>
              {#if $selectedData[key]}
                <div>{$selectedData[key].molecularFormula}</div>
                <div>{$selectedData[key].monoisotopicWeight}</div>
              {:else}
                Select
              {/if}
            </button>
          </div>
        </div>
      {/each}
    </div>
    <button class="btn btn-primary" on:click={confirmSelection}>Confirm</button>
  </div>
  
  {#if $showModal}
    <Modal onClose={closeModal}>
      <ul class="list-group">
        {#each $savedData as data, index}
          <li class="list-group-item">
            <MolecularListItem {data} {index} {onClickBody} />
          </li>
        {/each}
      </ul>
    </Modal>
  {/if}
  
  <style>
    .list-group-item {
      cursor: pointer;
    }
  </style>
  