<script>
    import SeqConverter from "$lib/components/stm/SeqConverter.svelte";
    import AminoMapSelector from "$lib/components/AminoMapSelector.svelte";
    import NcAACodonSelector from "$lib/components/stm/NcAACodonSelector.svelte";
    import { aminoMap } from "$lib/helper/amino_mapper";
    import { writable, get } from "svelte/store";
    import { codonTableRtoS } from "$lib/helper/amino_mapper";
    import { StmHelper } from "$lib/helper/stm_helper";
    import StmResultTable from "$lib/components/stm/StmResultTable.svelte";
    import { getContext } from "svelte";
    import StmAdductSelector from "$lib/components/stm/StmAdductSelector.svelte";
    import FormylationSelector from "$lib/components/FormylationSelector.svelte";
    import PotentialModificationSelector from "$lib/components/stm/PotentialModificationSelector.svelte";
    let selectedMonoisotopicAminos = { ...aminoMap };

    let rnaSeq = ""; // RNA 시퀀스로 변경
    let possibilities = [];

    // 선택된 ncaa
    let ncAA = { B: 0.0, J: 0.0, O: 0.0, U: 0.0, X: 0.0, Z: 0.0 };

    let ionTypes = ['H']; // 배열로 변경
    let formylation = false; // 기본값 no
    let potentialModifications = []; // Potential modifications

    /// 선택된 ncaa를 어떤 코돈들과 매핑할지 적어주는 부분 (배열로 변경)
    let codonTitles = writable({
        B: [],
        J: [],
        O: [],
        U: [],
        X: [],
        Z: [],
    });

    const loading = getContext("loading");

    function handleAminoMapChange(newAminos) {
        selectedMonoisotopicAminos = Object.fromEntries(
            Object.entries(newAminos)
                .filter(([key, value]) => value)
                .map(([key]) => [key, aminoMap[key]]),
        );
    }

    function handleNcAAChange(e) {
        ncAA = e.detail;
    }

    function onChangeCodonTitles(codonArray, key) {
        $codonTitles[key] = codonArray;
    }

    function _onTapCalcButton() {
        loading.set(true);
        getSequenceBeforeStop();
        if (!_validateCheck()) return loading.set(false);
        try {
            possibilities = StmHelper.calc(
                rnaSeq,
                removeZeroValueNcAA(),
                removeEmptyCodonTitles(),
                selectedMonoisotopicAminos,
                ionTypes,
                formylation,
                potentialModifications
            );
        } finally {
            loading.set(false);
        }
    }

    function _validateCheck() {
        // 입력값 없는 경우
        if (!rnaSeq) {
            alert("Please enter RNA sequence.");
            return false;
        }
        // 잘못된 입력값 있는경우
        if (rnaSeq.includes("?")) {
            alert("Please enter the correct sequence.");
            return false;
        }
        // RNA 시퀀스 길이가 3의 배수가 아닌 경우
        if (rnaSeq.length % 3 !== 0) {
            alert("RNA sequence length must be a multiple of 3.");
            return false;
        }
        // ncaa가 선택이 되었으나 codon 값이 입력되지 않은 경우
        if (!checkCustomCodonTitles1()) {
            alert(
                "Codon name was not entered in the selected Used Non-Canonical Monomers value.",
            );
            return false;
        }
        // ncaa 의 codon 으로 입력된 값이 codonTableRtoS 에 매핑되지 않을때
        if (!checkCustomCodonTitles2()) {
            return false;
        }
        // adduct가 선택되지 않은 경우는 이제 허용 (none 값으로 처리)
        // if (ionTypes.length === 0) {
        //     alert("Please select at least one adduct type.");
        //     return false;
        // }

        return true;
    }

    // ncaa가 선택이 된것중에 codon들이 모두 잘 들어가 있는지 체크
    function checkCustomCodonTitles1() {
        // ncAA에서 value가 0이 아닌 key를 모음
        let nonZeroKeys = Object.keys(ncAA).filter((key) => ncAA[key] !== 0);

        // codonTitles 값을 직접 구독해서 값 확인
        let currentCodonTitles = $codonTitles;

        for (const key of nonZeroKeys) {
            if (!currentCodonTitles[key] || currentCodonTitles[key].length === 0) {
                return false;
            }
        }
        return true;
    }

    function checkCustomCodonTitles2() {
        // codonTitles의 현재 상태를 가져오기 위해 get 함수 사용
        let current = get(codonTitles);

        // ncAA에서 value가 0이 아닌 key를 모음
        let nonZeroKeys = Object.keys(ncAA).filter((key) => ncAA[key] !== 0);

        let msg = "";
        let isFirst = true;

        nonZeroKeys.forEach((key) => {
            if (key in current && current[key]) {
                current[key].forEach(codon => {
                    if (!(codon in codonTableRtoS)) {
                        // 첫 번째 줄에는 줄바꿈을 넣지 않음
                        if (!isFirst) {
                            msg = msg + "\n"; // 두 번째 이후로는 줄바꿈 추가
                        }
                        msg = msg + `Codon ${codon} is not mapped in RNA`;
                        isFirst = false; // 첫 번째 이후로는 줄바꿈 허용
                    }
                });
            }
        });
        if (msg) {
            alert(msg);
            return false;
        }
        return true;
    }

    // codonTitles 에서 빈 배열 제거
    function removeEmptyCodonTitles() {
        // 현재 codonTitles 값을 가져오기
        let current = get(codonTitles);

        // 빈 배열이 아닌 값만 새로운 객체에 저장
        let filteredCodonTitles = Object.fromEntries(
            Object.entries(current).filter(([key, value]) => value && value.length > 0),
        );

        return filteredCodonTitles;
    }

    // ncAA 에서 value 가 0 인거 제거
    function removeZeroValueNcAA() {
        // null이 아닌 값만 새로운 객체에 저장
        let filtedData = Object.fromEntries(
            Object.entries(ncAA).filter(([key, value]) => value !== 0.0),
        );
        return filtedData;
    }

    // RNA에서 Stop 코돈(UAG, UAA, UGA)이 존재할 수 있음, 그중 가장 앞에있는 stop의 앞까지만 잘라서 계산에 반영 해야함
    function getSequenceBeforeStop() {
        // Stop 코돈들
        const stopCodons = ['UAG', 'UAA', 'UGA'];
        
        // RNA 시퀀스를 3개씩 나누어 코돈으로 변환
        const codons = rnaSeq.match(/.{1,3}/g) || [];
        
        // 첫 번째 Stop 코돈의 인덱스 찾기
        let stopIndex = -1;
        for (let i = 0; i < codons.length; i++) {
            if (stopCodons.includes(codons[i])) {
                stopIndex = i;
                break;
            }
        }
        
        // Stop 코돈이 없는 경우 전체 시퀀스 유지
        if (stopIndex === -1) return;
        
        // Stop 코돈 이전까지의 코돈들만 다시 합쳐서 RNA 시퀀스 생성
        rnaSeq = codons.slice(0, stopIndex).join('');
    }

    function handleAdductChange(e) {
        ionTypes = e.detail;
    }

    function handlePotentialModificationChange(e) {
        potentialModifications = e.detail;
    }
</script>

<div class="container mt-5">
    <div class="text-center mb-4">
        <h1>Sequence to Mass</h1>
    </div>

    <div class="mb-3">
        <SeqConverter bind:rnaSeq></SeqConverter>
    </div>

    <div class="mb-3 d-flex justify-content-start align-items-center">
        <StmAdductSelector
            on:changeAdduct={handleAdductChange}
        />
        <div class="ms-3">
            <FormylationSelector showUnknown={false} fomyType="no" on:change={(e) => formylation = (e.detail === 'yes')} />
        </div>
    </div>

    <div class="mb-3">
        <PotentialModificationSelector
            on:change={handlePotentialModificationChange}
        />
    </div>

    <div class="mb-3">
        <AminoMapSelector
            on:changeAminos={(e) => handleAminoMapChange(e.detail)}
        />
    </div>

    <div class="mb-3">
        <NcAACodonSelector
            on:changeNcAA={handleNcAAChange}
            bind:codonTitles
            {onChangeCodonTitles}
        />
    </div>

    <button
        type="button"
        class="btn btn-primary w-100"
        on:click={_onTapCalcButton}
    >
        Predict Mass!
    </button>

    {#if rnaSeq !== null && possibilities.length > 0}
        <StmResultTable {possibilities} />
    {/if}
</div>
