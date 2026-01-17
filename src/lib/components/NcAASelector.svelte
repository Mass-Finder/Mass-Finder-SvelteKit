<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { createEventDispatcher } from 'svelte';
    import Modal from '$lib/components/Modal.svelte';
    import MolecularListItem from '$lib/components/MolecularListItem.svelte';
    import NcAaSelectItem from './NcAASelectItem.svelte';
    import { get } from 'svelte/store';
    import { storage } from '$lib/services/storage.service';
    import { showAlert } from '$lib/stores/alertStore.js';


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
      const storedData = storage.load('moleculeData') || [];
      savedData.set(storedData);
    }
  
    async function openModal(key) {
      if ($savedData.length == 0) {
        await showAlert('There is no ncAA created.', 'Information', 'info');
        return;
      }
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
  
    async function onClickBody(index) {
      let _data = $savedData[index];

      if(_checkAlreadyExistValue(_data)){
        await showAlert('This value has already been added.', 'Information', 'info');
        return;
      }

      selectData(_data);
      confirmSelection();
    }

    // 전달받은 값이 이미 selectedData에 존재하는지 체크
    function _checkAlreadyExistValue(data) {
      // 현재 `selectedData`의 모든 `value`를 가져옴
      let selectedDataValues = Object.values(get(selectedData));
      
      // `targetValue`가 `selectedDataValues` 중 하나와 일치하는지 체크
      return selectedDataValues.includes(data);
    }

    function onCancelSelectData(targetKey) {
      selectedData.update(currentData => {
      if (currentData.hasOwnProperty(targetKey)) {
        currentData[targetKey] = null;
      }
      return currentData;
      });
    }
  
    // Get keys of selectedData
    const keys = Object.keys($selectedData);
  </script>
  
  <div class="container mt-4">
    <label for="selector" class="form-label fw-bold">Non-canonical amino acids used</label>
    <div id="selector" class="row g-3">
      {#each keys as key}
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body d-flex align-items-center justify-content-center">
              {#if $selectedData[key]}
                <NcAaSelectItem data={$selectedData[key]} {key} {onCancelSelectData}/>
              {:else}
                <button 
                  id="select-btn-{key}" 
                  class="btn btn-outline-secondary w-100"
                  on:click={() => openModal(key)} 
                  aria-label="Select {key} non-canonical monomer">
                  Select
                </button>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
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

    .card-body {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  </style>
  