<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  // showUnknown 프로퍼티로 unknown 옵션 노출 여부를 제어 (기본은 true)
  export let showUnknown = true;

  // fomyType 변수: 외부에서 입력받을 수 있도록 export 하며 기본값은 'yes'
  export let fomyType = 'yes';

  // select input 변경 시 처리 함수
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
    {#if showUnknown}
      <option value="unknown">Unknown</option>
    {/if}
  </select>
</div>

<style>
  .form-group {
    margin-bottom: 10px;
  }
</style>
