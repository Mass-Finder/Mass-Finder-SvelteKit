<script>
    import SeqConverter from '$lib/components/stm/SeqConverter.svelte';
    import AminoMapSelector from '$lib/components/AminoMapSelector.svelte';
    import NcAACodonSelector from '$lib/components/stm/NcAACodonSelector.svelte';
    import { aminoMap } from '$lib/helper/amino_mapper';
    import { writable } from 'svelte/store';

    let selectedAminos = { ...aminoMap };

    let proteinSeq = '';

    // 선택된 ncaa
    let ncAA = { B: 0.0, J: 0.0, O: 0.0, U: 0.0, X: 0.0, Z: 0.0 };

    /// 선택된 ncaa를 어떤 코돈과 매핑할지 적어주는 부분
    let codonTitle = writable({
        B: null,
        J: null,
        O: null,
        U: null,
        X: null,
        Z: null
    });
  

    function handleAminoMapChange(newAminos) {
        selectedAminos = Object.fromEntries(
        Object.entries(newAminos)
            .filter(([key, value]) => value)
            .map(([key]) => [key, aminoMap[key]])
        );
    }

    function handleNcAAChange(e) {
        let _data = Object.entries(e.detail).reduce((acc, [key, value]) => {
        acc[key] = Number(value?.monoisotopicWeight ?? 0.0);
        return acc;
        }, {});
        ncAA = _data;
    }

    function _onTapCalcButton() {
        if(!_validateCheck()) return;
    }

    function _validateCheck(){
        // 입력값 없는 경우
        if(!proteinSeq){
            alert('Please enter RNA or DNA or Protein.');
            return false;
        }
        // 잘못된 입력값 있는경우
        if(proteinSeq.includes('?')){
            alert('Please enter the correct sequence.');
            return false;
        }
        checkNonZeroAndNullValues();

    }

    // ncaa가 선택이 된것중에 title이 모두 잘 들어가 있는지 체크
    function checkNonZeroAndNullValues() {
        // ncAA에서 value가 0이 아닌 key를 모음
        let nonZeroKeys = Object.keys(ncAA).filter(key => ncAA[key] !== 0);

       // codonTitle 값을 직접 구독해서 값 확인
        let currentCodonTitle = $codonTitle;  // $를 사용해 값을 바로 가져옴

        nonZeroKeys.forEach(key => {
            if (currentCodonTitle[key] === null) {
                console.log(`${key}의 codonTitle 값이 null입니다.`);
            } else {
                console.log(`${key}의 codonTitle 값이 null이 아닙니다: ${currentCodonTitle[key]}`);
            }
        });
    }

    function onChangeCodonTitle(upperValue, key){
        $codonTitle[key] = upperValue;
    }


</script>

<svelte:head>
  <link rel="stylesheet" href="chem_doodle/install/ChemDoodleWeb.css" type="text/css" />
  <script type="text/javascript" src="chem_doodle/install/ChemDoodleWeb.js"></script>
  <link rel="stylesheet" href="chem_doodle/install/uis/jquery-ui-1.11.4.css" type="text/css" />
  <script type="text/javascript" src="chem_doodle/install/uis/ChemDoodleWeb-uis.js"></script>
</svelte:head>

<div class="container mt-5">
    <div class="text-center mb-4">
      <h1>Sequence to Mass</h1>
    </div>

    <div class="mb-3">
        <label for="detected-mass" class="form-label fw-bold">Sequnece</label>
        <SeqConverter bind:proteinSeq={proteinSeq}></SeqConverter>
    </div>

    <div class="mb-3">
        <AminoMapSelector on:changeAminos={(e) => handleAminoMapChange(e.detail)} />
    </div>

    <div class="mb-3">
        <NcAACodonSelector on:changeNcAA={handleNcAAChange} bind:codonTitle={codonTitle} {onChangeCodonTitle} />
    </div>

    <button type="button" class="btn btn-primary w-100" on:click={_onTapCalcButton}>
        Predict Mass!
    </button>
</div>