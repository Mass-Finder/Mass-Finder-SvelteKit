<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let ionType = 'H';
  function handleChange(event) {
    const target = event.target;
    ionType = target.value;
    dispatch('change', ionType);
  }
</script>

<div class="form-group">
  <label class="form-label fw-bold" for="IonSelect">Adduct</label>
  <select id="IonSelect" class="form-select" bind:value={ionType} on:change={handleChange}>
    <optgroup label="Positive">
      <option value="H">H</option>
      <option value="Na">Na</option>
      <option value="K">K</option>
      <option value="NH₄">NH₄</option>
    </optgroup>
    <optgroup label="Negative">
      <option value="-H">-H</option>
      <option value="-Na">-Na</option>
      <option value="-K">-K</option>
      <option value="-NH₄">-NH₄</option>
    </optgroup>
  </select>
</div>

<style>
  .form-group {
    margin-bottom: 10px;
  }
</style>
