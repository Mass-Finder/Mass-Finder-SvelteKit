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
  
  <div class="mb-3">
    <label class="form-label fw-bold">Adduct</label>
  
    <!-- Radio options for ion types -->
    <div class="form-check">
      <input
        type="radio"
        value="H"
        id="ion-h"
        class="form-check-input"
        bind:group={ionType}
        on:change={handleChange}
      />
      <label class="form-check-label" for="ion-h">H</label>
    </div>
  
    <div class="form-check">
      <input
        type="radio"
        value="Na"
        id="ion-na"
        class="form-check-input"
        bind:group={ionType}
        on:change={handleChange}
      />
      <label class="form-check-label" for="ion-na">Na</label>
    </div>
  
    <div class="form-check">
      <input
        type="radio"
        value="K"
        id="ion-k"
        class="form-check-input"
        bind:group={ionType}
        on:change={handleChange}
      />
      <label class="form-check-label" for="ion-k">K</label>
    </div>
  
    <div class="form-check">
      <input
        type="radio"
        value="unknown"
        id="ion-unknown"
        class="form-check-input"
        bind:group={ionType}
        on:change={handleChange}
      />
      <label class="form-check-label" for="ion-unknown">Unknown</label>
    </div>
  </div>
  
  <style>
    .mb-3 {
      margin-bottom: 15px;
    }
  </style>
  