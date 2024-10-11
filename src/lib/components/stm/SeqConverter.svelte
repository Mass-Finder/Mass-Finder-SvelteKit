<script>

    import { codonTableRtoS, codonTableDtoS, shortToLongMapper } from '$lib/helper/amino_mapper';

    let selectedType = 'RNA'; // 초기값 RNA
    let inputValue = ''; // 입력받을 값
    let rnaSeq = '';
    let dnaSeq = '';
    let proteinSeq = '';
  
    // 시퀀스 변환 함수들
    // function translateRNAtoDNA(rna) {
    //   return rna.replace(/U/g, 'T');
    // }
  
    // function translateDNAtoRNA(dna) {
    //   return dna.replace(/T/g, 'U');
    // }
  
    function translateRNAtoProtein(rna) {
      return rna.match(/.{1,3}/g).map(codon => codonTableRtoS[codon] || '?').join('');
    }
  
    function translateDNAtoProtein(dna) {
        return dna.match(/.{1,3}/g).map(codon => codonTableDtoS[codon] || '?').join('');
    }

    function translateInputToProtein(protein) {
        return protein
            .match(/.{1,1}/g)
            .map(codon => shortToLongMapper[codon] ? codon : '?')
            .join('');
    }
  
    // 입력 값이 바뀔 때마다 호출되는 함수
    function updateSequences() {
        // 인풋값이 빈값이면 그냥 공백처리
        if(!inputValue) return proteinSeq = '';
        if (selectedType === 'RNA') {
            proteinSeq = translateRNAtoProtein(inputValue);
        } else if (selectedType === 'DNA') {
            proteinSeq = translateDNAtoProtein(inputValue);
        } else {
            proteinSeq = translateInputToProtein(inputValue);
        }
    }
  </script>
  
<!-- RNA/DNA/Protein 선택 섹션 -->
<div class="row mb-3">
    <div class="col-md-2">
      <label for="sequence-type" class="form-label fw-bold">Select Type</label>
      <select id="sequence-type" class="form-select" bind:value={selectedType} on:change={updateSequences}>
        <option value="RNA">RNA</option>
        <option value="DNA">DNA</option>
        <option value="Protein">Protein</option>
      </select>
    </div>

    <!-- 입력받는 input 필드 -->
    <div class="col-md-10">
      <label for="sequence-input" class="form-label fw-bold">Input Sequence</label>
      <input
        id="sequence-input"
        type="text"
        class="form-control"
        bind:value={inputValue}
        on:input={updateSequences}
        placeholder="Enter {selectedType}"
      />
    </div>
  </div>

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
    .container {
      max-width: 900px;
      margin: auto;
    }
  
    .card {
      min-height: 100px;
    }
  
    .card-text {
      font-family: monospace;
      word-wrap: break-word;
    }
  </style>
  