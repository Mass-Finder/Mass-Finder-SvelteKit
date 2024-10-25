<script>
    import SeqConverter from "$lib/components/stm/SeqConverter.svelte";
    import AminoMapSelector from "$lib/components/AminoMapSelector.svelte";
    import NcAACodonSelector from "$lib/components/stm/NcAACodonSelector.svelte";
    import { aminoMap } from "$lib/helper/amino_mapper";
    import { writable, get } from "svelte/store";
    import { codonTableRtoS } from "$lib/helper/amino_mapper";

    let selectedAminos = { ...aminoMap };

    let proteinSeq = "";

    // 선택된 ncaa
    let ncAA = { B: 0.0, J: 0.0, O: 0.0, U: 0.0, X: 0.0, Z: 0.0 };

    /// 선택된 ncaa를 어떤 코돈과 매핑할지 적어주는 부분
    let codonTitle = writable({
        B: null,
        J: null,
        O: null,
        U: null,
        X: null,
        Z: null,
    });

    function handleAminoMapChange(newAminos) {
        selectedAminos = Object.fromEntries(
            Object.entries(newAminos)
                .filter(([key, value]) => value)
                .map(([key]) => [key, aminoMap[key]]),
        );
    }

    function handleNcAAChange(e) {
        let _data = Object.entries(e.detail).reduce((acc, [key, value]) => {
            acc[key] = Number(value?.monoisotopicWeight ?? 0.0);
            return acc;
        }, {});
        ncAA = _data;
    }

    function onChangeCodonTitle(upperValue, key) {
        $codonTitle[key] = upperValue;
    }

    function _onTapCalcButton() {
        if (!_validateCheck()) return;
    }

    function _validateCheck() {
        // 입력값 없는 경우
        if (!proteinSeq) {
            alert("Please enter RNA or DNA or Protein.");
            return false;
        }
        // 잘못된 입력값 있는경우
        if (proteinSeq.includes("?")) {
            alert("Please enter the correct sequence.");
            return false;
        }
        // ncaa가 선택이 되었으나 codon 값이 입력되지 않은 경우
        if (!checkCustomCodonTitle1()) {
            alert(
                "Codon name was not entered in the selected Used Non-Canonical Monomers value.",
            );
            return false;
        }
        // ncaa 의 codon 으로 입력된 값이 codonTableRtoS 에 매핑되지 않을때
        if (!checkCustomCodonTitle2()) {
            return false;
        }

        if(!checkSeqValidate()) {
            return false;
        }
    }

    // ncaa가 선택이 된것중에 title이 모두 잘 들어가 있는지 체크
    function checkCustomCodonTitle1() {
        // ncAA에서 value가 0이 아닌 key를 모음
        let nonZeroKeys = Object.keys(ncAA).filter((key) => ncAA[key] !== 0);

        // codonTitle 값을 직접 구독해서 값 확인
        let currentCodonTitle = $codonTitle;

        nonZeroKeys.forEach((key) => {
            if (currentCodonTitle[key] === null) return false;
        });
        return true;
    }

    function checkCustomCodonTitle2() {
        // codonTitle의 현재 상태를 가져오기 위해 get 함수 사용
        let current = get(codonTitle);

        // ncAA에서 value가 0이 아닌 key를 모음
        let nonZeroKeys = Object.keys(ncAA).filter((key) => ncAA[key] !== 0);

        let msg = "";
        let isFirst = true;

        nonZeroKeys.forEach((key) => {
            if (key in current) {
                let value = current[key];
                if (!(value in codonTableRtoS)) {
                    // 첫 번째 줄에는 줄바꿈을 넣지 않음
                    if (!isFirst) {
                        msg = msg + "\n"; // 두 번째 이후로는 줄바꿈 추가
                    }
                    msg = msg + `Codon ${value} is not mapped in RNA`;
                    isFirst = false; // 첫 번째 이후로는 줄바꿈 허용
                }
            }
        });
        if (msg) {
            alert(msg);
            return false;
        }
        return true;
    }

    /// selectedAminos 값과 ncaa 를 합쳐서 proteinSeq 의 모든 글자가 사용 아미노산에 등록이 된건지 체크
    function checkSeqValidate() {
        // codonTitle의 현재 상태를 가져오기 위해 get 함수 사용
        let current = get(codonTitle);

        // ncAA에서 value가 0이 아닌 key를 모음
        let nonZeroKeys = Object.keys(ncAA).filter((key) => ncAA[key] !== 0);
        let deepCopiedAminos = structuredClone(selectedAminos);
        nonZeroKeys.forEach((key) => {
            if (key in current) {
                let value = current[key];
                let seqValue = codonTableRtoS[value];
                // key 리스트에만 넣기 위해  value는 아무거나 넣음
                deepCopiedAminos[seqValue] = 1.0;
            }
        });

        let allExist = true; // 모든 글자가 존재하는지 여부를 저장
        let missingKeys = []; // 존재하지 않는 글자를 저장할 배열

        // 문자열을 한 글자씩 순회
        for (let i = 0; i < proteinSeq.length; i++) {
            let char = proteinSeq[i];

            // deepCopiedAminos에 해당 글자가 key로 존재하는지 체크
            if (!(char in deepCopiedAminos)) {
                allExist = false; // 한 글자라도 존재하지 않으면 false
                missingKeys.push(char); // 존재하지 않는 글자를 배열에 추가
            }
        }

        if(allExist === false){
            alert("\""+missingKeys + "\" cannot be used.");
            return false;
        }
        return true;
    }
</script>

<svelte:head>
    <link
        rel="stylesheet"
        href="chem_doodle/install/ChemDoodleWeb.css"
        type="text/css"
    />
    <script
        type="text/javascript"
        src="chem_doodle/install/ChemDoodleWeb.js"
    ></script>
    <link
        rel="stylesheet"
        href="chem_doodle/install/uis/jquery-ui-1.11.4.css"
        type="text/css"
    />
    <script
        type="text/javascript"
        src="chem_doodle/install/uis/ChemDoodleWeb-uis.js"
    ></script>
</svelte:head>

<div class="container mt-5">
    <div class="text-center mb-4">
        <h1>Sequence to Mass</h1>
    </div>

    <div class="mb-3">
        <label for="detected-mass" class="form-label fw-bold">Sequnece</label>
        <SeqConverter bind:proteinSeq></SeqConverter>
    </div>

    <div class="mb-3">
        <AminoMapSelector
            on:changeAminos={(e) => handleAminoMapChange(e.detail)}
        />
    </div>

    <div class="mb-3">
        <NcAACodonSelector
            on:changeNcAA={handleNcAAChange}
            bind:codonTitle
            {onChangeCodonTitle}
        />
    </div>

    <button
        type="button"
        class="btn btn-primary w-100"
        on:click={_onTapCalcButton}
    >
        Predict Mass!
    </button>
</div>
