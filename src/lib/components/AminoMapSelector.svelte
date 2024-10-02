<script>
    import { createEventDispatcher } from 'svelte';
  
    // 외부에서 입력받은 [changeAminos] 를 호출하기 위함
    const dispatch = createEventDispatcher();
  
    /// 사용할 아미노산의 모음, 초기값은 전체
    let selectedAminos = {
      G: true,
      A: true,
      S: true,
      T: true,
      C: true,
      V: true,
      L: true,
      I: true,
      M: true,
      P: true,
      F: true,
      Y: true,
      W: true,
      D: true,
      E: true,
      N: true,
      Q: true,
      H: true,
      K: true,
      R: true
    };
  
    let buttonAllCheck = true;
  
    function handleCheckboxChange(key, value) {
      selectedAminos[key] = value;
      dispatch('changeAminos', selectedAminos);
      checkButtonAllSelected();
    }
  
    function checkButtonAllSelected() {
      buttonAllCheck = Object.values(selectedAminos).every((value) => value);
    }
  
    function toggleAllAminos() {
      const newValue = !buttonAllCheck;
      for (let key in selectedAminos) {
        selectedAminos[key] = newValue;
      }
      dispatch('changeAminos', selectedAminos);
      checkButtonAllSelected();
    }
  
    function toggleStrep() {
      const strep = ['W', 'S', 'H', 'P', 'Q', 'F', 'E', 'K'];
      for (let key in selectedAminos) {
        selectedAminos[key] = strep.includes(key);
      }
      dispatch('changeAminos', selectedAminos);
      checkButtonAllSelected();
    }
  </script>


<div>
	<div class="amino-acids-header row">
		<div class="col-md-6">
            <label class="form-label fw-bold mb-2" for="ncaa-btn">Amino Acid</label>
        </div>
		<div class="buttons mb-2 text-end col-md-6" id="ncaa-btn">
			<button class="btn btn-primary" type="button" on:click={toggleAllAminos}>{buttonAllCheck ? 'All Uncheck' : 'All Check'}</button>
			<button class="btn btn-primary"type="button" on:click={toggleStrep}>STREP</button>
		</div>
	</div>

	<div class="amino-acids">
        {#each Object.keys(selectedAminos) as key}
          <div class="form-check d-inline-block me-3">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="flexCheckDefault-{key}" 
              bind:checked={selectedAminos[key]}
              on:change={(e) => handleCheckboxChange(key, e.target.checked)}
            >
            <label class="form-check-label" for="flexCheckDefault-{key}">
              {key}
            </label>
          </div>
        {/each}
      </div>
      
</div>