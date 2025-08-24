<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();
  
  // SA 모드 설정
  const saConfigs = {
    simple: {
      label: 'Simple',
      description: 'Fast calculation with basic exploration',
      initialTemperature: 1000,
      absoluteTemperature: 0.1,
      saIterations: 20
    },
    think: {
      label: 'Think',
      description: 'Balanced calculation with moderate exploration',
      initialTemperature: 10000,
      absoluteTemperature: 0.001,
      saIterations: 50
    },
    deepthink: {
      label: 'Deep Think',
      description: 'Thorough calculation with extensive exploration',
      initialTemperature: 50000,
      absoluteTemperature: 0.00001,
      saIterations: 100
    }
  };
  
  // 기본값: Think
  export let selectedMode = 'think';
  
  // localStorage key
  const STORAGE_KEY = 'mts_sa_mode';
  
  // 컴포넌트 마운트 시 localStorage에서 값 로드
  onMount(() => {
    if (browser) {
      const savedMode = localStorage.getItem(STORAGE_KEY);
      if (savedMode && saConfigs[savedMode]) {
        selectedMode = savedMode;
        dispatch('change', saConfigs[selectedMode]);
      } else {
        // 기본값으로 초기화
        dispatch('change', saConfigs[selectedMode]);
      }
    }
  });
  
  // 라디오 버튼 변경 시 처리 함수
  function handleModeChange(event) {
    selectedMode = event.target.value;
    
    // localStorage에 저장
    if (browser) {
      localStorage.setItem(STORAGE_KEY, selectedMode);
    }
    
    dispatch('change', saConfigs[selectedMode]);
  }
</script>

<div class="form-group">
  <label class="form-label fw-bold">Simulated Annealing Mode</label>
  
  <div class="sa-mode-options">
    {#each Object.entries(saConfigs) as [mode, config]}
      <div class="form-check">
        <input 
          class="form-check-input" 
          type="radio" 
          name="saMode" 
          id="saMode_{mode}"
          value={mode}
          bind:group={selectedMode}
          on:change={handleModeChange}
        />
        <label class="form-check-label" for="saMode_{mode}">
          <div class="mode-info">
            <div class="mode-title">{config.label}</div>
            <small class="mode-description text-muted">{config.description}</small>
          </div>
        </label>
      </div>
    {/each}
  </div>
  
  <small class="form-text text-muted mt-2">
    Higher modes provide better accuracy but take more time to calculate
  </small>
</div>

<style>
  .form-group {
    margin-bottom: 24px;
  }
  
  .form-label {
    font-size: 0.875rem;
    color: #424242;
    letter-spacing: 0.0071428571em;
    margin-bottom: 16px;
  }
  
  .sa-mode-options {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .form-check {
    position: relative;
    padding: 16px;
    border-radius: 8px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  }
  
  .form-check:hover {
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    border-color: #cccccc;
  }
  
  .form-check:has(.form-check-input:checked) {
    background-color: #e3f2fd;
    border-color: #2196f3;
    box-shadow: 0 2px 4px rgba(33, 150, 243, 0.2), 0 2px 4px rgba(33, 150, 243, 0.14);
  }
  
  .form-check-input {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 20px;
    height: 20px;
    accent-color: #2196f3;
  }
  
  .mode-info {
    padding-right: 32px;
  }
  
  .mode-title {
    font-size: 1rem;
    font-weight: 500;
    color: #212121;
    margin-bottom: 4px;
    line-height: 1.5;
  }
  
  .mode-description {
    font-size: 0.875rem;
    color: #757575;
    line-height: 1.43;
    margin: 0;
  }
  
  .form-check-label {
    cursor: pointer;
    width: 100%;
    display: block;
  }
  
  .form-text {
    font-size: 0.75rem;
    color: #757575;
    margin-top: 8px;
    line-height: 1.33;
  }
  
  .form-check:has(.form-check-input:checked) .mode-title {
    color: #1976d2;
  }
</style>