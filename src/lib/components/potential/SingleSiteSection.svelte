<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AminoAcidSelector from '../AminoAcidSelector.svelte';
  import { SingleSiteCondition } from '../../../type/Types';

  export let targetAminoAcid = 'G';
  export let condition = SingleSiteCondition.N_TERMINUS;

  const dispatch = createEventDispatcher();

  function handleTargetChange(event: CustomEvent) {
    targetAminoAcid = event.detail;
    dispatch('targetChange', targetAminoAcid);
  }

  function handleConditionChange() {
    dispatch('conditionChange', condition);
  }
</script>

<div class="single-site-section mb-3">
  <!-- Target Amino Acid Selector -->
  <AminoAcidSelector label="Target" on:change={handleTargetChange} />

  <!-- Condition Radio Buttons -->
  <div class="mb-3">
    <label class="form-label fw-bold">Condition</label>
    <div class="condition-group">
      {#each Object.values(SingleSiteCondition) as conditionOption}
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="singleSiteCondition"
            id="single-{conditionOption}"
            value={conditionOption}
            bind:group={condition}
            on:change={handleConditionChange}
          />
          <label class="form-check-label" for="single-{conditionOption}">
            {conditionOption}
          </label>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .condition-group {
    padding-left: 10px;
  }

  .form-check {
    margin-bottom: 8px;
  }
</style>
