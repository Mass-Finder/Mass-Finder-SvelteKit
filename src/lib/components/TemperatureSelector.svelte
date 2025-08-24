<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();
  
  // 초기 온도 변수: 기본값 10000
  export let initialTemperature = 10000;
  
  // localStorage key
  const STORAGE_KEY = 'mts_initial_temperature';
  
  // 컴포넌트 마운트 시 localStorage에서 값 로드
  onMount(() => {
    if (browser) {
      const savedTemperature = localStorage.getItem(STORAGE_KEY);
      if (savedTemperature) {
        const temp = parseInt(savedTemperature);
        if (temp >= 1000 && temp <= 50000) {
          initialTemperature = temp;
          dispatch('change', initialTemperature);
        }
      }
    }
  });
  
  // 슬라이더 변경 시 처리 함수
  function handleSliderChange(event) {
    initialTemperature = parseInt(event.target.value);
    
    // localStorage에 저장
    if (browser) {
      localStorage.setItem(STORAGE_KEY, initialTemperature.toString());
    }
    
    dispatch('change', initialTemperature);
  }
</script>

<div class="temperature-selector">
  <label class="selector-label" for="temperatureSlider">
    <span class="label-text">Initial Temperature</span>
    <span class="temp-value">{initialTemperature.toLocaleString()}</span>
  </label>
  <div class="slider-container">
    <input 
      id="temperatureSlider" 
      type="range" 
      class="temperature-slider" 
      min="1000" 
      max="50000" 
      step="1000"
      bind:value={initialTemperature} 
      on:input={handleSliderChange}
    />
    <div class="slider-labels">
      <span>1K</span>
      <span>10K</span>
      <span>20K</span>
      <span>30K</span>
      <span>40K</span>
      <span>50K</span>
    </div>
  </div>
  <small class="helper-text">
    Higher values explore more solutions but take longer to calculate
  </small>
</div>

<style>
  .temperature-selector {
    width: 100%;
    padding: 0;
    margin-bottom: 10px;
  }

  .selector-label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    color: #424242;
  }

  .label-text {
    color: #424242;
  }

  .temp-value {
    color: #2196F3;
    font-weight: 700;
    font-size: 0.9rem;
    background: rgba(33, 150, 243, 0.1);
    padding: 2px 8px;
    border-radius: 12px;
  }

  .slider-container {
    margin-bottom: 12px;
  }

  .temperature-slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #E0E0E0;
    outline: none;
    cursor: pointer;
    margin-bottom: 8px;
  }

  .temperature-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  }

  .temperature-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.3);
  }

  .temperature-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #2196F3;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 2px 6px rgba(0,0,0,0.2);
  }

  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #757575;
    margin-top: 4px;
  }

  .helper-text {
    font-size: 0.75rem;
    color: #757575;
    line-height: 1.4;
    margin-top: 4px;
    display: block;
  }

  @media (max-width: 768px) {
    .temperature-selector {
      padding: 0;
    }
    
    .selector-label {
      font-size: 0.8rem;
    }
    
    .temp-value {
      font-size: 0.85rem;
      padding: 1px 6px;
    }
    
    .temperature-slider {
      height: 5px;
    }
    
    .temperature-slider::-webkit-slider-thumb {
      width: 18px;
      height: 18px;
    }
    
    .slider-labels {
      font-size: 0.7rem;
    }

    .helper-text {
      font-size: 0.7rem;
    }
  }
</style>