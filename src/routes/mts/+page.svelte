<script>
  import AdductSelector from '$lib/components/AdductSelector.svelte';
  import FormylationSelector from '$lib/components/FormylationSelector.svelte';
  import AminoMapSelector from '$lib/components/AminoMapSelector.svelte';
  import NcAASelector from '$lib/components/NcAASelector.svelte';
  import ResultTable from '$lib/components/ResultTable.svelte';
  import InitialRnaInput from '$lib/components/InitialRnaInput.svelte';
  import { getContext, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { aminoMap, molecularWeightMap, codonTableRtoS } from '$lib/helper/amino_mapper';

  // 상태 관리 변수들
  let detectedMass = null;
  let knownSequence = '';
  let proteinSequence = '';
  let formylation = 'yes';
  let adduct = 'H';
  let selectedMonoisotopicAminos = { ...aminoMap };
  let fullNcAA = { B: null, J: null, O: null, U: null, X: null, Z: null };
  const loading = getContext('loading');
  let bestSolutions = [];
  let worker;

  onDestroy(() => {
    if (worker) {
      worker.terminate();
    }
  });

  // Calculate 버튼 클릭 시 호출되는 메서드
  async function handleCalculate() {
    loading.set(true);
    if (!validate()) return loading.set(false);

    try {
      // 선택된 NCAA 값들
      let filteredNcAA = Object.fromEntries(
        Object.entries(fullNcAA).filter(([key, value]) => value !== null)
      );

      let filteredMonoisotopicWeights = Object.fromEntries(
        Object.entries(filteredNcAA).map(([key, value]) => [key, Number(value?.monoisotopicWeight)])
      );

      // monoisotopicMass 를 구하기 위한 전용 Map
      const monoisotopicMap = { ...selectedMonoisotopicAminos, ...filteredMonoisotopicWeights };

      // selectedMonoisotopicAminos 와 같은 key를 가지고 value만 Molcular 로 가지는 맵
      let ncAAMolecularWeights = Object.fromEntries(
        Object.entries(selectedMonoisotopicAminos).map(([key, _]) => [key, molecularWeightMap[key]])
      );

      let filteredMolecularWeights = Object.fromEntries(
        Object.entries(filteredNcAA).map(([key, value]) => [key, Number(value?.molecularWeight)])
      );

      let molecularMap = { ...ncAAMolecularWeights, ...filteredMolecularWeights };

      // Worker 생성 및 메시지 처리
      if (!worker) {
        worker = new Worker(
          new URL('$lib/workers/mass_finder.worker.ts', import.meta.url),
          { type: 'module' }
        );
      }

      worker.onmessage = (e) => {
        if (e.data.type === 'success') {
          bestSolutions = e.data.solutions;
          console.log('Best solutions:', bestSolutions);
        } else if (e.data.type === 'error') {
          console.error('Worker error:', e.data.error);
          alert('An error occurred while calculating');
        }
        loading.set(false);
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
        alert('An error occurred while calculating');
        loading.set(false);
      };

      // Worker에 데이터 전송
      worker.postMessage({
        detectedMass,
        knownSequence,
        proteinSequence,
        formylation,
        adduct,
        monoisotopicMap,
        molecularMap
      });

    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while calculating');
      loading.set(false);
    }
  }

  function handleFormylationChange(newFormylation) {
    formylation = newFormylation;
  }

  function handleAdductChange(newAdduct) {
    adduct = newAdduct;
  }

  function handleNcAAChange(e) {
    fullNcAA = e.detail;
  }

  function handleAminoMapChange(newAminos) {
    selectedMonoisotopicAminos = Object.fromEntries(
      Object.entries(newAminos)
        .filter(([key, value]) => value)
        .map(([key]) => [key, aminoMap[key]])
    );
  }

  function validate() {
    if (detectedMass === null) {
      alert('Please Input Detected Mass');
      return false;
    }

    if (!validateknownSequence()) {
      alert('Please enter the correct KnownSequence');
      return false;
    }

    if (!validateProteinSequence()) {
      alert('Please enter the correct Protein Sequence');
      return false;
    }

    return true;
  }

  function validateknownSequence() {
    let filteredNcAA = Object.fromEntries(
      Object.entries(fullNcAA).filter(([key, value]) => value !== null)
    );

    for (let char of knownSequence) {
      if (!aminoMap[char] && !filteredNcAA[char]) {
        return false;
      }
    }
    return true;
  }

  function handleknownSequenceInput(event) {
    const input = event.target;
    knownSequence = input.value.toUpperCase();
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

  function validateProteinSequence() {
    // 빈 문자열인 경우 유효함 (선택사항)
    if (proteinSequence === '') return true;
    
    // RNA 시퀀스 검증: A, U, G, C만 허용
    const validRnaBases = ['A', 'U', 'G', 'C'];
    for (let char of proteinSequence) {
      if (!validRnaBases.includes(char)) {
        return false;
      }
    }
    
    // 3의 배수 길이 검증 (코돈 단위)
    if (proteinSequence.length % 3 !== 0) {
      alert('RNA sequence length must be a multiple of 3 (codon units)');
      return false;
    }
    
    return true;
  }

  function calculateProteinMass(rnaSequence) {
    if (!rnaSequence) return 0;
    
    // RNA 시퀀스를 아미노산으로 변환
    const aminoSequence = convertRnaToAminoAcids(rnaSequence);
    if (!aminoSequence) return 0;
    
    let filteredNcAA = Object.fromEntries(
      Object.entries(fullNcAA).filter(([key, value]) => value !== null)
    );

    return aminoSequence.split('').reduce((sum, char) => {
      if (selectedMonoisotopicAminos[char]) {
        return sum + selectedMonoisotopicAminos[char];
      } else if (filteredNcAA[char]) {
        return sum + parseFloat(filteredNcAA[char].monoisotopicWeight);
      }
      return sum;
    }, 0);
  }

  $: proteinMass = calculateProteinMass(proteinSequence);
  $: massWarning = proteinSequence && detectedMass && Math.abs(proteinMass - detectedMass) > (detectedMass * 0.5);
</script>

<div class="container mt-5">
  <div class="text-center mb-4">
    <h1>Mass to Sequence</h1>
  </div>

  <div class="mb-3">
    <label for="detected-mass" class="form-label fw-bold">Detected Mass</label>
    <input
      type="number"
      id="detected-mass"
      bind:value={detectedMass}
      class="form-control"
      placeholder="Detected Mass"
    />
  </div>

  <div class="mb-3">
    <label for="essential-sequence" class="form-label fw-bold">Known Sequence (Optional)</label>
    <input
      type="text"
      id="essential-sequence"
      bind:value={knownSequence}
      class="form-control"
      placeholder="Known Sequence"
      on:input={handleknownSequenceInput}
    />
  </div>

  <InitialRnaInput 
    bind:value={proteinSequence} 
    on:input={(e) => proteinSequence = e.detail.value}
  />

  <div class="mb-3 row">
	<div class="col-md-6">
	  <FormylationSelector on:change={(e) => handleFormylationChange(e.detail)} />
	</div>
	<div class="col-md-6">
	  <AdductSelector on:change={(e) => handleAdductChange(e.detail)} />
	</div>
  </div>

  <!-- 필수 아미노산 선택 -->
  <div class="mb-3">
    <AminoMapSelector on:changeAminos={(e) => handleAminoMapChange(e.detail)} />
  </div>

  <!-- 커스텀 아미노산 선택 -->
  <div class="mb-3">
    <NcAASelector on:changeNcAA={handleNcAAChange} />
  </div>

  <!-- 계산 버튼 -->
  <button type="button" class="btn btn-primary w-100" on:click={handleCalculate}>
    Calculate!
  </button>
  
  <!-- 최대 결과 개수 선택 -->
  <div class="mt-3 d-flex justify-content-end">
    <div class="w-20">
      <label for="solution-count" class="form-label fw-bold">Max Result Count</label>
      <select 
        id="solution-count" 
        class="form-select mb-3" 
        on:change={(e) => {
          MassFinderHelper.topSolutionsCount = parseInt(e.target.value);
        }}
      >
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  </div>

  {#if detectedMass !== null && bestSolutions.length > 0}
    <ResultTable {bestSolutions} {detectedMass} {fullNcAA}/>
  {/if}
</div>
