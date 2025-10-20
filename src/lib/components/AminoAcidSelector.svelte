<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { shortToLongMapper } from '$lib/helper/amino_mapper';

  export let label = 'Target';

  const dispatch = createEventDispatcher();

  let selectedAminoAcid = 'G';

  type AminoAcidKey = keyof typeof shortToLongMapper;
  const aminoAcids: string[] = Object.keys(shortToLongMapper);

  function getAminoName(key: string): string {
    return shortToLongMapper[key as AminoAcidKey] || '';
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedAminoAcid = target.value;
    dispatch('change', selectedAminoAcid);
  }
</script>

<div class="form-group">
  <label class="form-label fw-bold" for="aminoAcidSelect-{label}">{label}</label>
  <select
    id="aminoAcidSelect-{label}"
    class="form-select"
    bind:value={selectedAminoAcid}
    on:change={handleChange}
  >
    {#each aminoAcids as aminoAcid}
      <option value={aminoAcid}>
        {aminoAcid} ({getAminoName(aminoAcid)})
      </option>
    {/each}
  </select>
</div>

<style>
  .form-group {
    margin-bottom: 10px;
  }
</style>
