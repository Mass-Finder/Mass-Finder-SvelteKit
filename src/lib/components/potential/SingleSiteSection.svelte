<script>
  import { createEventDispatcher } from 'svelte';
  import ProteinSelectDialog from './ProteinSelectDialog.svelte';
  import { SingleSiteCondition } from '../../../type/Types';

  export let targetAminoAcid = '';
  export let condition = SingleSiteCondition.N_TERMINUS;

  const dispatch = createEventDispatcher();
  let showDialog = false;

  // ALL 옵션은 N-terminus와 C-terminus에서만 사용 가능
  $: showAllOption = condition === SingleSiteCondition.N_TERMINUS || condition === SingleSiteCondition.C_TERMINUS;

  // Condition이 Side Chain으로 바뀌면 ALL 옵션이 없으므로 target을 초기화
  $: if (!showAllOption && targetAminoAcid === 'All') {
    targetAminoAcid = '';
  }

  function handleOpenDialog() {
    showDialog = true;
  }

  function handleSelectAminoAcid(event) {
    const newTarget = event.detail.code;
    // Target이 실제로 변경되었을 때만 이벤트 발생
    if (newTarget !== targetAminoAcid) {
      targetAminoAcid = newTarget;
      dispatch('targetChange', targetAminoAcid);
    } else {
      targetAminoAcid = newTarget;
    }
    showDialog = false;
  }

  function handleConditionChange() {
    dispatch('conditionChange', condition);
  }
</script>

<div class="single-site-section mb-3">
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

  <!-- Target Amino Acid Selector -->
  <div class="mb-3">
    <div class="row">
      <div class="col-md-6">
        <label class="form-label fw-bold">Target <span class="text-danger">*</span></label>
        <button class="btn btn-outline-primary w-100 target-btn" on:click={handleOpenDialog}>
          {targetAminoAcid === '' ? 'Select Amino Acid' : targetAminoAcid === 'All' ? 'All' : targetAminoAcid}
        </button>
      </div>
    </div>
  </div>
</div>

<ProteinSelectDialog
  bind:showDialog
  showAllOption={showAllOption}
  selectedValue={targetAminoAcid}
  on:select={handleSelectAminoAcid}
/>

<style>
  .condition-group {
    padding-left: 10px;
  }

  .form-check {
    margin-bottom: 8px;
  }

  .target-btn {
    background-color: white;
  }

  .target-btn:hover {
    background-color: #e7f1ff;
  }
</style>
