<script>
    import SeqConverter from '$lib/components/stm/SeqConverter.svelte';
    import AminoMapSelector from '$lib/components/AminoMapSelector.svelte';
    import NcAACodonSelector from '$lib/components/stm/NcAACodonSelector.svelte';
    import { aminoMap } from '$lib/helper/amino_mapper';
    import { writable } from 'svelte/store';

    let selectedAminos = { ...aminoMap };

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
        <SeqConverter></SeqConverter>
    </div>

    <div class="mb-3">
        <AminoMapSelector on:changeAminos={(e) => handleAminoMapChange(e.detail)} />
    </div>

    <div class="mb-3">
        <NcAACodonSelector on:changeNcAA={handleNcAAChange} {codonTitle} />
    </div>

    <button type="button" class="btn btn-primary w-100" on:click={_onTapCalcButton}>
        Predict Mass!
    </button>
</div>