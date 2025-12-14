<script>
  import { createEventDispatcher } from 'svelte';
  import ColumnToggle from './ColumnToggle.svelte';

  const dispatch = createEventDispatcher();

  export let showNoteColumn = true;

  let selectedAdducts = ['+H']; // 기본값으로 +H 선택

  const adductOptions = [
    { value: '+H', label: '+H', group: 'Positive' },
    { value: '+Na', label: '+Na', group: 'Positive' },
    { value: '+K', label: '+K', group: 'Positive' },
    { value: '+NH₄', label: '+NH₄', group: 'Positive' },
    { value: '-H', label: '-H', group: 'Negative' },
    { value: '-Na', label: '-Na', group: 'Negative' },
    { value: '-K', label: '-K', group: 'Negative' },
    { value: '-NH₄', label: '-NH₄', group: 'Negative' }
  ];

  function handleChange(adductValue) {
    if (selectedAdducts.includes(adductValue)) {
      // 이미 선택된 경우 제거
      selectedAdducts = selectedAdducts.filter(item => item !== adductValue);
    } else {
      // 선택되지 않은 경우 추가
      selectedAdducts = [...selectedAdducts, adductValue];
    }
    
    // 아무것도 선택되지 않은 경우 'none' 값을 전달
    const resultAdducts = selectedAdducts.length === 0 ? ['none'] : selectedAdducts;
    dispatch('changeAdduct', resultAdducts);
  }

  function handleNoteColumnToggle(value) {
    showNoteColumn = value;
    dispatch('toggleNoteColumn', value);
  }
</script>

<div class="form-group">
  <div class="d-flex justify-content-between align-items-center mb-2">
    <label class="form-label fw-bold mb-0">Adducts (Multiple Selection)</label>
    <ColumnToggle
      label="Potential Byproducts"
      storageKey="stm-show-note-column"
      defaultValue={true}
      onChange={handleNoteColumnToggle}
    />
  </div>
  
  <div class="adduct-groups">
    <!-- Positive Group -->
    <div class="adduct-group">
      <h6 class="group-title">Positive</h6>
      <div class="checkboxes-row">
        {#each adductOptions.filter(option => option.group === 'Positive') as option}
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="stm-adduct-{option.value}"
              checked={selectedAdducts.includes(option.value)}
              on:change={() => handleChange(option.value)}
            >
            <label class="form-check-label" for="stm-adduct-{option.value}">
              {option.label}
            </label>
          </div>
        {/each}
      </div>
    </div>

    <!-- Negative Group -->
    <div class="adduct-group">
      <h6 class="group-title">Negative</h6>
      <div class="checkboxes-row">
        {#each adductOptions.filter(option => option.group === 'Negative') as option}
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id="stm-adduct-{option.value}"
              checked={selectedAdducts.includes(option.value)}
              on:change={() => handleChange(option.value)}
            >
            <label class="form-check-label" for="stm-adduct-{option.value}">
              {option.label}
            </label>
          </div>
        {/each}
      </div>
    </div>
  </div>
  {#if selectedAdducts.length === 0}
    <div class="alert alert-info mt-2">
      <small>No adduct selected - will show as [M] in results</small>
    </div>
  {/if}
</div>

<style>
  .form-group {
    margin-bottom: 10px;
  }

  .adduct-groups {
    display: flex;
    flex-direction: row;
    gap: 30px;
    align-items: flex-start;
  }

  .adduct-group {
    flex: 1;
  }

  .group-title {
    font-size: 0.9em;
    font-weight: bold;
    color: #666;
    margin-bottom: 8px;
    border-bottom: 1px solid #eee;
    padding-bottom: 4px;
  }

  .checkboxes-row {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .form-check {
    margin-bottom: 0;
  }

  .form-check-label {
    font-size: 0.9em;
  }

  .alert {
    padding: 8px 12px;
    border-radius: 4px;
    background-color: #d1ecf1;
    border: 1px solid #bee5eb;
    color: #0c5460;
  }
</style> 