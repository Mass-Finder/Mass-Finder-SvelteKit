<script>
  import { createEventDispatcher } from 'svelte';
  import { codonTableRtoS } from '$lib/helper/amino_mapper';
  import SaveDialog from './stm/SeqSaveDialog.svelte';
  import LoadDialog from './stm/SeqLoadDialog.svelte';

  const dispatch = createEventDispatcher();

  export let value = '';
  export let placeholder = 'Enter RNA sequence (e.g., AUGAAAGUGCUGUGGGCUGCUCUG)';
  export let label = 'RNA Sequence for Initial Solution (Optional)';

  let showSaveDialog = false;
  let showLoadDialog = false;

  function handleInput(event) {
    const input = event.target;
    value = input.value.toUpperCase();
    dispatch('input', { value });
  }

  function convertRnaToAminoAcids(rnaSequence) {
    if (!rnaSequence) return '';
    
    // RNA 시퀀스를 3개씩 나누어 코돈으로 변환
    const codons = rnaSequence.match(/.{1,3}/g) || [];
    let aminoSequence = '';
    
    for (const codon of codons) {
      if (codon.length === 3) {
        const amino = codonTableRtoS[codon];
        if (amino && amino !== '[Stop]') {
          aminoSequence += amino;
        } else if (amino === '[Stop]') {
          break; // Stop 코돈을 만나면 중단
        }
      }
    }
    
    return aminoSequence;
  }

  function validateRnaSequence(sequence) {
    // 빈 문자열인 경우 유효함 (선택사항)
    if (sequence === '') return { isValid: true, message: '' };
    
    // RNA 시퀀스 검증: A, U, G, C만 허용
    const validRnaBases = ['A', 'U', 'G', 'C'];
    for (let char of sequence) {
      if (!validRnaBases.includes(char)) {
        return { isValid: false, message: 'Only A, U, G, C are allowed in RNA sequence' };
      }
    }
    
    // 3의 배수 길이 검증 (코돈 단위)
    if (sequence.length % 3 !== 0) {
      return { isValid: false, message: 'RNA sequence length must be a multiple of 3 (codon units)' };
    }
    
    return { isValid: true, message: '' };
  }

  function openSaveDialog() {
    showSaveDialog = true;
  }

  function handleSave(event) {
    const { title, content } = event.detail;
    const savedRnaSeqs = JSON.parse(localStorage.getItem("savedRnaSeqs")) || [];
    savedRnaSeqs.push({ title, content });
    localStorage.setItem("savedRnaSeqs", JSON.stringify(savedRnaSeqs));
  }

  function openLoadDialog() {
    showLoadDialog = true;
  }

  function handleLoad(event) {
    value = event.detail.content;
    dispatch('input', { value });
  }

  $: aminoSequence = convertRnaToAminoAcids(value);
  $: validation = validateRnaSequence(value);
</script>

<div class="mb-3">
  <div class="row">
    <div class="col-md-10">
      <label for="rna-sequence" class="form-label fw-bold">{label}</label>
      <input
        type="text"
        id="rna-sequence"
        bind:value={value}
        class="form-control {validation.isValid ? '' : 'is-invalid'}"
        {placeholder}
        on:input={handleInput}
      />
      {#if !validation.isValid}
        <div class="invalid-feedback">
          {validation.message}
        </div>
      {/if}
    </div>
    
    <!-- 저장과 불러오기 버튼 -->
    <div class="col-md-2 d-flex align-items-end">
      <button class="btn btn-light me-2" title="Save" on:click={openSaveDialog}>
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
  
  {#if value && aminoSequence}
    <div class="mt-2">
      <small class="text-muted">
        Converted amino acid sequence: <span class="fw-bold">{aminoSequence}</span>
      </small>
    </div>
  {/if}
</div>

<SaveDialog
  bind:showDialog={showSaveDialog}
  initialContent={value}
  on:save={handleSave}
/>

<LoadDialog
  bind:showDialog={showLoadDialog}
  on:select={handleLoad}
/> 