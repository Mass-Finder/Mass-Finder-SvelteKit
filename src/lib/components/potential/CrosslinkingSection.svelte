<script>
  import { createEventDispatcher } from 'svelte';
  import ProteinSelectDialog from './ProteinSelectDialog.svelte';
  import { CrosslinkingCondition } from '../../../type/Types';

  export let target1AminoAcid = '';
  export let target2AminoAcid = '';
  export let condition = CrosslinkingCondition.ADJACENT;
  export let distanceOperator = '>';
  export let distanceValue = 1;

  const dispatch = createEventDispatcher();
  let showDialog = false;
  let currentTarget = null;

  $: currentSelectedValue = currentTarget === 1 ? target1AminoAcid : currentTarget === 2 ? target2AminoAcid : '';

  function handleOpenDialog(targetNumber) {
    currentTarget = targetNumber;
    showDialog = true;
  }

  function handleSelectAminoAcid(event) {
    if (currentTarget === 1) {
      target1AminoAcid = event.detail.code;
      dispatch('target1Change', target1AminoAcid);
    } else if (currentTarget === 2) {
      target2AminoAcid = event.detail.code;
      dispatch('target2Change', target2AminoAcid);
    }
    showDialog = false;
    currentTarget = null;
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

  <!-- Target 1 and Target 2 -->
  <div class="row mb-3">
    <div class="col-md-6">
      <label class="form-label fw-bold">Target 1</label>
      <button class="btn btn-outline-primary w-100 target-btn" on:click={() => handleOpenDialog(1)}>
        {target1AminoAcid === '' ? 'Select Amino Acid' : target1AminoAcid}
      </button>
    </div>
    <div class="col-md-6">
      <label class="form-label fw-bold">Target 2</label>
      <button class="btn btn-outline-primary w-100 target-btn" on:click={() => handleOpenDialog(2)}>
        {target2AminoAcid === '' ? 'Select Amino Acid' : target2AminoAcid}
      </button>
    </div>
  </div>
</div>

<ProteinSelectDialog
  bind:showDialog
  showAllOption={false}
  selectedValue={currentSelectedValue}
  on:select={handleSelectAminoAcid}
/>

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

  .target-btn {
    background-color: white;
  }

  .target-btn:hover {
    background-color: #e7f1ff;
  }
</style>
