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
      <option value="H">H</option>
      <option value="Na">Na</option>
      <option value="K">K</option>
    </select>
  </div>
  
  
  <style>
    .form-group {
      margin-bottom: 10px;
    }
  </style>
  