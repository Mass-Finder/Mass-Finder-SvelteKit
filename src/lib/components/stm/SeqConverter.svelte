<script>
  import {
    codonTableRtoS,
    codonTableDtoS,
    shortToLongMapper,
  } from "$lib/helper/amino_mapper";
  import SaveDialog from './SeqSaveDialog.svelte';
  import LoadDialog from './SeqLoadDialog.svelte';
  import { storage } from '$lib/services/storage.service';

  let inputValue = ""; // 입력받을 값 (RNA만)
  export let rnaSeq = ""; // RNA 시퀀스를 직접 export
  let rnaSeqList = []; // RNA 시퀀스를 3개씩 나눈 리스트
  let proteinSeqList = []; // 변환된 단백질 시퀀스 리스트

  let showSaveDialog = false;
  let showLoadDialog = false;

  // RNA 시퀀스를 변환할 때, 변환 결과를 문자 리스트로 반환합니다.
  function translateRNAtoProtein(rna) {
    const codons = rna.match(/.{1,3}/g) || [];
    return codons.map((codon) => codonTableRtoS[codon] || "?");
  }

  // 입력 값이 바뀔 때마다 호출되는 함수
  function updateSequences() {
    // 입력값의 공백과 줄바꿈 제거
    inputValue = inputValue.replace(/[\s\n]/g, '');

    // 인풋값이 없으면 모든 리스트를 빈 리스트로 처리
    if (!inputValue) {
      proteinSeqList = [];
      rnaSeqList = [];
      rnaSeq = "";
      return;
    }
    
    // 입력값을 대문자로 변환
    handleInputToUpper();
    
    // DNA의 T를 RNA의 U로 변환
    inputValue = replaceTwithU(inputValue);
    
    // RNA 시퀀스를 3개씩 나누어 리스트로 저장
    rnaSeqList = inputValue.match(/.{1,3}/g) || [];
    proteinSeqList = translateRNAtoProtein(inputValue);
    
    // rnaSeq를 업데이트
    rnaSeq = inputValue;
  }

  // 입력값을 대문자로 변환
  function handleInputToUpper() {
    inputValue = inputValue.toUpperCase();
  }

  // DNA의 T를 RNA의 U로 변환
  function replaceTwithU(sequence) {
    return sequence.replace(/T/g, "U");
  }

  function openSavePopup() {
    showSaveDialog = true;
  }

  function handleSave(event) {
    const { title, content } = event.detail;
    const savedRnaSeqs = storage.load("savedRnaSeqs") || [];
    savedRnaSeqs.push({ title, content });
    storage.save("savedRnaSeqs", savedRnaSeqs);
  }

  function openLoadDialog() {
    showLoadDialog = true;
  }

  function handleLoad(event) {
    inputValue = event.detail.content;
    updateSequences();
  }
</script>

<!-- RNA 입력 섹션 -->
<div class="row mb-3">
  <!-- 입력받는 input 필드 -->
  <div class="col-md-10">
    <label for="sequence-input" class="form-label fw-bold">Input RNA sequence</label>
    <textarea
      id="sequence-input" 
      class="form-control"
      bind:value={inputValue}
      on:input={updateSequences}
      placeholder="Enter RNA sequence (e.g., AUGCCCGGG...)"
      rows="1"
      style="min-height: 38px; overflow-y: hidden;"
      on:input={(e) => {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
      }}
    ></textarea>
  </div>

  <!-- 저장과 불러오기 버튼 -->
  <div class="col-md-2 d-flex align-items-end">
    <button class="btn btn-light me-2" title="Save" on:click={openSavePopup}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path
          d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"
        />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
      </svg>
    </button>
    <button class="btn btn-light" title="Load" on:click={openLoadDialog}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8" />
        <path d="M9 15l3 3 3-3" />
      </svg>
    </button>
  </div>
</div>

<SaveDialog
  bind:showDialog={showSaveDialog}
  initialContent={inputValue}
  on:save={handleSave}
/>

<LoadDialog
  bind:showDialog={showLoadDialog}
  on:select={handleLoad}
/>

<!-- RNA 시퀀스 출력 섹션 -->
{#if inputValue}
  <div class="row mt-4">
    <div class="col-md-12">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title text-primary">RNA Sequence</h5>
          <p class="card-text">
            {#each rnaSeqList as codon, index}
              <span class="letter" data-index={index + 1}>{codon}</span>
            {/each}
          </p>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- 결과 출력 섹션 -->
<div class="row mt-4">
  <div class="col-md-12">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title text-primary">Protein sequence</h5>
        <!-- 단일 텍스트 노드처럼 연속된 문자를 출력.
             숫자는 ::before pseudo-element를 통해 표시되어, 복사/드래그 시 포함되지 않습니다. -->
        <p class="card-text">
          {#each proteinSeqList as letter, index}
            <span class="letter" data-index={index % 3 === 0 ? index + 1 : undefined}>{letter}</span>
          {/each}
        </p>
      </div>
    </div>
  </div>
</div>

<style>
  .card {
    min-height: 100px;
  }

  .card-text {
    font-family: monospace;
    word-wrap: break-word;
  }

  /* 각 글자를 감싸는 span은 인라인으로 처리하여 텍스트 연속성을 유지 */
  .letter {
    position: relative;
    display: inline;
    margin-right: 0.2em;
  }

  /* data-index가 있을 경우에만 ::before로 번호를 표시 */
  .letter::before {
    content: attr(data-index);
    position: absolute;
    top: -1em;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.5em;
    color: gray;
    user-select: none;
    pointer-events: none;
  }
</style>
