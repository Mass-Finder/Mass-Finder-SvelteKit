<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // FormyType variable to hold the current dropdown selection
  let fomyType = 'yes';

  // Handle change of select input
  function handleChange(event) {
    fomyType = event.target.value;
    dispatch('change', fomyType);
  }
</script>

<div class="form-group">
  <label class="form-label fw-bold" for="formylationSelect">Formylation (f)</label>
  <select id="formylationSelect" class="form-select" bind:value={fomyType} on:change={handleChange}>
    <option value="yes">Yes</option>
    <option value="no">No</option>
    <option value="unknown">Unknown</option>
  </select>
</div>


<style>
  .form-group {
    margin-bottom: 10px;
  }
</style>
