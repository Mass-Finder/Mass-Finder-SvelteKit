<script>
  import {
    codonTableRtoS,
    codonTableDtoS,
    shortToLongMapper,
  } from "$lib/helper/amino_mapper";
  import SaveDialog from './SeqSaveDialog.svelte';

  let selectedType = "RNA"; // 초기값 RNA
  let inputValue = ""; // 입력받을 값
  export let proteinSeq;

  let showSaveDialog = false;

  function translateRNAtoProtein(rna) {
    return rna
      .match(/.{1,3}/g)
      .map((codon) => codonTableRtoS[codon] || "?")
      .join("");
  }

  function translateInputToProtein(protein) {
    return protein
      .match(/.{1,1}/g)
      .map((codon) => (shortToLongMapper[codon] ? codon : "?"))
      .join("");
  }

  // 입력 값이 바뀔 때마다 호출되는 함수
  function updateSequences() {
    // 인풋값이 빈값이면 그냥 공백처리
    if (!inputValue) return (proteinSeq = "");
    // 일단 대문자 만들어놓고 시작
    handleInputToUpper();

    if (selectedType === "RNA") {
      inputValue = replaceTwithU(inputValue);
      proteinSeq = translateRNAtoProtein(inputValue);
    } else {
      proteinSeq = translateInputToProtein(inputValue);
    }
  }

  // 입력값 대문자로
  function handleInputToUpper() {
    inputValue = inputValue.toUpperCase();
  }

  function replaceTwithU(sequence) {
    return sequence.replace(/T/g, "U");
  }

  function openSavePopup() {
    showSaveDialog = true;
  }

  function handleSave(event) {
    const { title, content } = event.detail;
    const savedRnaSeqs = JSON.parse(localStorage.getItem("savedRnaSeqs")) || [];
    savedRnaSeqs.push({ title, content });
    localStorage.setItem("savedRnaSeqs", JSON.stringify(savedRnaSeqs));
  }
</script>

<!-- RNA/DNA/Protein 선택 섹션 -->
<div class="row mb-3">
  <div class="col-md-2">
    <label for="sequence-type" class="form-label fw-bold">Select Type</label>
    <select
      id="sequence-type"
      class="form-select"
      bind:value={selectedType}
      on:change={updateSequences}
    >
      <option value="RNA">RNA</option>
      <option value="Protein">Protein</option>
    </select>
  </div>

  <!-- 입력받는 input 필드 -->
  <div class="col-md-8">
    <label for="sequence-input" class="form-label fw-bold">Input Sequence</label
    >
    <input
      id="sequence-input"
      type="text"
      class="form-control"
      bind:value={inputValue}
      on:input={updateSequences}
      placeholder="Enter {selectedType}"
    />
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
    <button class="btn btn-light" title="Load">
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

<!-- 결과 출력 섹션 -->
<div class="row mt-4">
  <div class="col-md-12">
    <div class="card">
      <div class="card-body">
        <h5 class="card-title text-primary">Protein Sequence</h5>
        <p class="card-text">{proteinSeq}</p>
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
</style>
