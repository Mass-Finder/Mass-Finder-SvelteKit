<script>
  import { createEventDispatcher } from 'svelte';

  export let showDialog = false;
  export let showAllOption = false;
  export let selectedValue = '';
  const dispatch = createEventDispatcher();

  const aminoAcidTable = [
    {
      title: 'Gly (G)',
      code: 'G'
    },
    {
      title: 'Ala (A)',
      code: 'A'
    },
    {
      title: 'Ser (S)',
      code: 'S'
    },
    {
      title: 'Thr (T)',
      code: 'T'
    },
    {
      title: 'Cys (C)',
      code: 'C'
    },
    {
      title: 'Val (V)',
      code: 'V'
    },
    {
      title: 'Leu (L)',
      code: 'L'
    },
    {
      title: 'Ile (I)',
      code: 'I'
    },
    {
      title: 'Met (M)',
      code: 'M'
    },
    {
      title: 'Pro (P)',
      code: 'P'
    },
    {
      title: 'Phe (F)',
      code: 'F'
    },
    {
      title: 'Tyr (Y)',
      code: 'Y'
    },
    {
      title: 'Trp (W)',
      code: 'W'
    },
    {
      title: 'Asp (D)',
      code: 'D'
    },
    {
      title: 'Glu (E)',
      code: 'E'
    },
    {
      title: 'Asn (N)',
      code: 'N'
    },
    {
      title: 'Gln (Q)',
      code: 'Q'
    },
    {
      title: 'His (H)',
      code: 'H'
    },
    {
      title: 'Lys (K)',
      code: 'K'
    },
    {
      title: 'Arg (R)',
      code: 'R'
    }
  ];

  function handleSelect(code) {
    dispatch('select', { code });
  }

  function handleClose() {
    showDialog = false;
  }
</script>

{#if showDialog}
  <div class="dialog-overlay">
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>Amino Acid Selection</h3>
        <button type="button" class="btn-close" on:click={handleClose}></button>
      </div>
      <div class="amino-grid">
        {#if showAllOption}
          <button
            class="amino-btn {selectedValue === 'ALL' ? 'selected' : ''}"
            on:click={() => handleSelect('ALL')}
          >
            ALL
          </button>
        {/if}
        {#each aminoAcidTable as amino}
          <button
            class="amino-btn {selectedValue === amino.code ? 'selected' : ''}"
            on:click={() => handleSelect(amino.code)}
          >
            {amino.title}
          </button>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .dialog-content {
    background: white;
    padding: 1.5rem;
    border-radius: 4px;
    max-width: 600px;
    width: 95%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #dee2e6;
  }

  .dialog-header h3 {
    font-size: 1.5rem;
    margin: 0;
    color: #1a1a1a;
  }

  .amino-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .amino-btn {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 0.75rem 1rem;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.2s;
    color: #212529;
  }

  .amino-btn:hover {
    background: #e9ecef;
    border-color: #ced4da;
  }

  .amino-btn:focus {
    outline: none;
  }

  .all-option {
    background: #e7f3ff;
    border-color: #0d6efd;
    font-weight: 600;
    color: #0d6efd;
  }

  .all-option:hover {
    background: #cfe2ff;
    border-color: #0a58ca;
  }

  .all-option:focus {
    outline: none;
  }

  .amino-btn.selected {
    background: #0d6efd;
    border-color: #0d6efd;
    color: white;
    font-weight: 600;
  }

  .all-option.selected {
    background: #0d6efd;
    border-color: #0d6efd;
    color: white;
  }
</style>
