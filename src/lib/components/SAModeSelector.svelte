<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { storage } from '$lib/services/storage.service';

  const dispatch = createEventDispatcher();
  
  // SA 모드 설정
  const saConfigs = {
    standard: {
      label: 'Standard',
      description: 'Balanced calculation with moderate exploration',
      initialTemperature: 10000,
      absoluteTemperature: 0.001,
      saIterations: 100
    },
    think: {
      label: 'Think',
      description: 'Thorough calculation with extensive exploration',
      initialTemperature: 50000,
      absoluteTemperature: 0.00001,
      saIterations: 100
    },
    ultrathink: {
      label: 'Ultra Think',
      description: 'Advanced reasoning with profound exploration',
      initialTemperature: 100000,
      absoluteTemperature: 0.000001,
      saIterations: 100
    }
  };

  // 기본값: Standard
  export let selectedMode = 'standard';
  
  // localStorage key
  const STORAGE_KEY = 'mts_sa_mode';
  
  // 컴포넌트 마운트 시 storage에서 값 로드
  onMount(() => {
    if (browser) {
      const savedMode = storage.load(STORAGE_KEY);
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

    // storage에 저장
    if (browser) {
      storage.save(STORAGE_KEY, selectedMode);
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
            <span class="mode-title">{config.label}</span>
            <span class="mode-description text-muted">{config.description}</span>
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
    gap: 6px;
  }

  .form-check {
    position: relative;
    padding: 10px 12px;
    border-radius: 6px;
    background-color: #ffffff;
    border: 1px solid #e0e0e0;
    transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
    cursor: pointer;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }

  .form-check:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
    border-color: #cccccc;
  }

  .form-check:has(.form-check-input:checked) {
    background-color: #e3f2fd;
    border-color: #2196f3;
    box-shadow: 0 1px 3px rgba(33, 150, 243, 0.2);
  }

  .form-check-input {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 12px;
    width: 18px;
    height: 18px;
    accent-color: #2196f3;
    margin: 0;
  }

  .mode-info {
    padding-right: 32px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mode-title {
    font-size: 0.95rem;
    font-weight: 500;
    color: #212121;
    line-height: 1.4;
    white-space: nowrap;
    min-width: 80px;
  }

  .mode-description {
    font-size: 0.8rem;
    color: #757575;
    line-height: 1.3;
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
    margin-top: 6px;
    line-height: 1.33;
  }

  .form-check:has(.form-check-input:checked) .mode-title {
    color: #1976d2;
  }
</style>