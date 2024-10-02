<script>
    import { createEventDispatcher } from 'svelte';
  
    const dispatch = createEventDispatcher();
  
    // FormyType variable to hold the current radio selection
    let fomyType = 'yes';
  
    // Handle change of radio input
    function handleChange(event) {
      const target = event.target;
      fomyType = target.value;
      dispatch('change', fomyType);
    }
  </script>
  
  <div class="form-check">
    <label class="form-label fw-bold">Formylation</label>
    
    <div class="form-check">
      <input
        type="radio"
        value="yes"
        class="form-check-input"
        bind:group={fomyType}
        on:change={handleChange}
      />
      <label class="form-check-label">Yes</label>
    </div>
    
    <div class="form-check">
      <input
        type="radio"
        value="no"
        class="form-check-input"
        bind:group={fomyType}
        on:change={handleChange}
      />
      <label class="form-check-label">No</label>
    </div>
    
    <div class="form-check">
      <input
        type="radio"
        value="unknown"
        class="form-check-input"
        bind:group={fomyType}
        on:change={handleChange}
      />
      <label class="form-check-label">Unknown</label>
    </div>
  </div>
  
  <style>
    .form-check {
      margin-bottom: 10px;
    }
  </style>
  