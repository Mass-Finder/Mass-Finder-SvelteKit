<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { shortToLongMapper } from '$lib/helper/amino_mapper';
  import { storage } from '$lib/services/storage.service';

  export let showDialog = false;
  export let showAllOption = false;
  export let selectedValue = '';
  const dispatch = createEventDispatcher();

  let activeTab = 'amino-acids';
  let savedNcAA = [];

  $: if (showDialog) {
    loadSavedData();
  }

  function loadSavedData() {
    savedNcAA = storage.load('moleculeData') || [];
  }

  function handleSelect(code) {
    dispatch('select', { code });
  }

  function handleClose() {
    showDialog = false;
  }
</script>

{#if showDialog}
  <div class="modal-overlay" on:click={handleClose}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h5 class="modal-title">Select Target</h5>
        <button type="button" class="btn-close" on:click={handleClose}></button>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button
            class="nav-link {activeTab === 'amino-acids' ? 'active' : ''}"
            on:click={() => activeTab = 'amino-acids'}
          >
            Amino Acids
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link {activeTab === 'ncaa' ? 'active' : ''}"
            on:click={() => activeTab = 'ncaa'}
          >
            ncAA
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="modal-body">
        {#if activeTab === 'amino-acids'}
          <div class="amino-acid-grid">
            {#if showAllOption}
              <button
                class="btn btn-sm {selectedValue === 'All' ? 'btn-primary' : 'btn-outline-primary'} amino-btn all-btn"
                on:click={() => handleSelect('All')}
              >
                <div class="all-btn-content">
                  <div class="all-btn-text">All</div>
                  <div class="all-btn-subtext">(glycine example)</div>
                </div>
              </button>
            {/if}
            {#each Object.keys(shortToLongMapper) as aminoCode}
              <button
                class="btn btn-sm {selectedValue === aminoCode ? 'btn-primary' : 'btn-outline-primary'} amino-btn"
                on:click={() => handleSelect(aminoCode)}
                title={shortToLongMapper[aminoCode]}
              >
                {aminoCode}
              </button>
            {/each}
          </div>
        {:else if activeTab === 'ncaa'}
          {#if savedNcAA.length > 0}
            <div class="template-list">
              {#each savedNcAA as ncaa}
                <button
                  class="btn {selectedValue === ncaa.title ? 'btn-info' : 'btn-outline-info'} template-item"
                  on:click={() => handleSelect(ncaa.title)}
                >
                  <div class="template-name">{ncaa.title}</div>
                  <div class="template-formula">{ncaa.molecularFormula}</div>
                </button>
              {/each}
            </div>
          {:else}
            <p class="text-muted text-center">No ncAA data saved yet.</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  /* Modal Overlay */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 30px;
    max-width: 900px;
    width: 90%;
    max-height: 85vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    padding-bottom: 15px;
    border-bottom: 1px solid #dee2e6;
  }

  .modal-title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    line-height: 1;
  }

  .btn-close::before {
    content: '×';
  }

  /* Tabs */
  .nav-tabs {
    border-bottom: 1px solid #dee2e6;
  }

  .nav-item {
    margin-bottom: -1px;
  }

  .nav-link {
    background: none;
    border: 1px solid transparent;
    border-radius: 0.25rem 0.25rem 0 0;
    padding: 0.75rem 1.5rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    font-size: 1rem;
  }

  .nav-link:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  .nav-link.active {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }

  .modal-body {
    padding: 25px 0;
    min-height: 250px;
  }

  .amino-acid-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(75px, 1fr));
    gap: 12px;
  }

  .amino-btn {
    min-width: 75px;
    font-weight: bold;
    padding: 12px;
    font-size: 1rem;
    min-height: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .all-btn {
    font-weight: bold;
    padding: 8px;
    min-height: 60px;
    height: 60px;
  }

  .all-btn-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 3px;
  }

  .all-btn-text {
    font-weight: bold;
    font-size: 1rem;
  }

  .all-btn-subtext {
    font-size: 0.7rem;
    font-weight: normal;
    opacity: 0.75;
    line-height: 1.1;
  }

  /* ncAA Template List */
  .template-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .template-item {
    text-align: left;
    padding: 16px;
    width: 100%;
  }

  .template-name {
    font-weight: bold;
    margin-bottom: 6px;
    font-size: 1.05rem;
  }

  .template-formula {
    font-size: 0.95rem;
    color: #6c757d;
  }
</style>
