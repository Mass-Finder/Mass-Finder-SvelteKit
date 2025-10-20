<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import AminoAcidSelector from '../AminoAcidSelector.svelte';
  import { CrosslinkingCondition } from '../../../type/Types';
  import type { DistanceOperator } from '../../../type/Types';

  export let target1AminoAcid = 'G';
  export let target2AminoAcid = 'G';
  export let condition = CrosslinkingCondition.EVERYWHERE;
  export let distanceOperator: DistanceOperator = '>';
  export let distanceValue = 1;

  const dispatch = createEventDispatcher();

  function handleTarget1Change(event: CustomEvent) {
    target1AminoAcid = event.detail;
    dispatch('target1Change', target1AminoAcid);
  }

  function handleTarget2Change(event: CustomEvent) {
    target2AminoAcid = event.detail;
    dispatch('target2Change', target2AminoAcid);
  }

  function handleConditionChange() {
    dispatch('conditionChange', condition);
  }

  function handleDistanceOperatorChange() {
    dispatch('distanceOperatorChange', distanceOperator);
  }

  function handleDistanceValueChange() {
    dispatch('distanceValueChange', distanceValue);
  }

  // Distance 값 검증
  $: if (distanceValue < 1) {
    distanceValue = 1;
  }
</script>

<div class="crosslinking-section mb-3">
  <!-- Target 1 and Target 2 -->
  <div class="row mb-3">
    <div class="col-md-6">
      <AminoAcidSelector label="Target 1" on:change={handleTarget1Change} />
    </div>
    <div class="col-md-6">
      <AminoAcidSelector label="Target 2" on:change={handleTarget2Change} />
    </div>
  </div>

  <!-- Condition Radio Buttons -->
  <div class="mb-3">
    <label class="form-label fw-bold">Condition</label>
    <div class="condition-group">
      {#each Object.values(CrosslinkingCondition) as conditionOption}
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="crosslinkingCondition"
            id="cross-{conditionOption}"
            value={conditionOption}
            bind:group={condition}
            on:change={handleConditionChange}
          />
          <label class="form-check-label" for="cross-{conditionOption}">
            {conditionOption}
          </label>

          {#if conditionOption === CrosslinkingCondition.DISTANCE && condition === CrosslinkingCondition.DISTANCE}
            <div class="distance-options d-inline-flex align-items-center ms-3">
              <select
                class="form-select form-select-sm"
                bind:value={distanceOperator}
                on:change={handleDistanceOperatorChange}
                style="width: 70px;"
              >
                <option value=">">{'>'}</option>
                <option value="=">{'='}</option>
                <option value="<">{'<'}</option>
              </select>
              <input
                type="number"
                class="form-control form-control-sm ms-2"
                bind:value={distanceValue}
                on:input={handleDistanceValueChange}
                min="1"
                style="width: 80px;"
              />
            </div>
          {/if}
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

  .distance-options {
    gap: 5px;
  }
</style>
