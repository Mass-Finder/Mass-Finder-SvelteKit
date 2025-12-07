<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { storage } from '$lib/services/storage.service';

  const dispatch = createEventDispatcher();
  
  // 초기 온도 변수: 기본값 10000
  export let initialTemperature = 10000;
  
  // 온도 옵션 배열 생성 (1000부터 50000까지 1000 단위)
  const temperatureOptions = Array.from({ length: 50 }, (_, i) => (i + 1) * 1000);
  
  // localStorage key
  const STORAGE_KEY = 'mts_initial_temperature';
  
  // 컴포넌트 마운트 시 storage에서 값 로드
  onMount(() => {
    if (browser) {
      const savedTemperature = storage.load(STORAGE_KEY);
      if (savedTemperature) {
        const temp = typeof savedTemperature === 'number' ? savedTemperature : parseInt(savedTemperature);
        if (temperatureOptions.includes(temp)) {
          initialTemperature = temp;
          dispatch('change', initialTemperature);
        }
      }
    }
  });
  
  // select input 변경 시 처리 함수
  function handleChange(event) {
    initialTemperature = parseInt(event.target.value);

    // storage에 저장
    if (browser) {
      storage.save(STORAGE_KEY, initialTemperature);
    }

    dispatch('change', initialTemperature);
  }
</script>

<div class="form-group">
  <label class="form-label fw-bold" for="temperatureSelect">Initial Temperature</label>
  <select 
    id="temperatureSelect" 
    class="form-select" 
    bind:value={initialTemperature} 
    on:change={handleChange}
  >
    {#each temperatureOptions as temp}
      <option value={temp}>{temp.toLocaleString()}</option>
    {/each}
  </select>
  <small class="form-text text-muted">
    Higher values explore more solutions but take longer
  </small>
</div>

<style>
  .form-group {
    margin-bottom: 10px;
  }
</style>