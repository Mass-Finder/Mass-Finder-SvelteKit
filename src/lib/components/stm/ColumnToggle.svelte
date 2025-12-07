<script lang="ts">
  import { storage } from '$lib/services/storage.service';
  import { onMount } from 'svelte';

  export let label: string = 'Toggle';
  export let storageKey: string;
  export let defaultValue: boolean = true;
  export let onChange: (value: boolean) => void = () => {};

  let isEnabled = defaultValue;

  onMount(() => {
    // Load from localStorage
    const savedValue = storage.load<boolean>(storageKey);
    if (savedValue !== null) {
      isEnabled = savedValue;
    }
    onChange(isEnabled);
  });

  function handleToggle() {
    isEnabled = !isEnabled;
    // Save to localStorage
    storage.save(storageKey, isEnabled);
    onChange(isEnabled);
  }
</script>

<div class="column-toggle">
  <div class="toggle-label">
    <span class="label-text">{label}</span>
    <div class="toggle-switch" on:click={handleToggle} role="button" tabindex="0" on:keypress={(e) => e.key === 'Enter' && handleToggle()}>
      <span class="slider" class:active={isEnabled}></span>
    </div>
  </div>
</div>

<style>
  .column-toggle {
    display: inline-flex;
    align-items: center;
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
    margin: 0;
    user-select: none;
  }

  .label-text {
    font-size: 0.9rem;
    font-weight: 500;
    color: #495057;
  }

  .toggle-switch {
    position: relative;
    display: inline-block;
    width: 48px;
    height: 24px;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.3s;
    border-radius: 24px;
  }

  .slider:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }

  .slider.active {
    background-color: #0d6efd;
  }

  .slider.active:before {
    transform: translateX(24px);
  }

  .slider:hover {
    opacity: 0.9;
  }
</style>
