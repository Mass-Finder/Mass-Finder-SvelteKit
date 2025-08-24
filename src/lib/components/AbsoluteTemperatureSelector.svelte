<script>
  import { createEventDispatcher, onMount } from 'svelte';
  import { browser } from '$app/environment';

  const dispatch = createEventDispatcher();
  
  // 절대 온도 변수: 기본값 0.00001
  export let absoluteTemperature = 0.00001;
  
  // 절대 온도 옵션 배열 생성 (0.1부터 0.00001까지 10배수로)
  const temperatureOptions = [0.1, 0.01, 0.001, 0.0001, 0.00001];
  
  // 슬라이더용 인덱스 (0~4)
  let sliderIndex = 4; // 기본값 0.00001에 해당하는 인덱스
  
  // localStorage key
  const STORAGE_KEY = 'mts_absolute_temperature';
  
  // 슬라이더 값을 절대 온도로 변환
  $: absoluteTemperature = temperatureOptions[sliderIndex];
  
  // 컴포넌트 마운트 시 localStorage에서 값 로드
  onMount(() => {
    if (browser) {
      const savedTemperature = localStorage.getItem(STORAGE_KEY);
      if (savedTemperature) {
        const temp = parseFloat(savedTemperature);
        const index = temperatureOptions.indexOf(temp);
        if (index !== -1) {
          sliderIndex = index;
          dispatch('change', absoluteTemperature);
        }
      }
    }
  });
  
  // 슬라이더 변경 시 처리 함수
  function handleSliderChange(event) {
    sliderIndex = parseInt(event.target.value);
    
    // localStorage에 저장
    if (browser) {
      localStorage.setItem(STORAGE_KEY, absoluteTemperature.toString());
    }
    
    dispatch('change', absoluteTemperature);
  }
</script>

<div class="temperature-selector">
  <label class="selector-label" for="absoluteTemperatureSlider">
    <span class="label-text">Absolute Temperature</span>
    <span class="temp-value">{absoluteTemperature}</span>
  </label>
  <div class="slider-container">
    <input 
      id="absoluteTemperatureSlider" 
      type="range" 
      class="temperature-slider" 
      min="0" 
      max="4" 
      step="1"
      bind:value={sliderIndex} 
      on:input={handleSliderChange}
    />
    <div class="slider-labels">
      <span>0.1</span>
      <span>0.01</span>
      <span>0.001</span>
      <span>0.0001</span>
      <span>0.00001</span>
    </div>
  </div>
  <small class="helper-text">
    Lower values stop the algorithm earlier
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