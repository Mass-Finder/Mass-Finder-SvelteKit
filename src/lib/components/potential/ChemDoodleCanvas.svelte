<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import { Molecule } from '$lib/model/atom';
  import { shortToLongMapper, aminoMap, molecularWeightMap } from '$lib/helper/amino_mapper';

  const dispatch = createEventDispatcher();

  let sketcher;
  export let structureName = '';
  export let molecularFormula = writable('');
  export let monoisotopicWeight = writable('');
  export let molecularWeight = writable('');
  export let moleculeJson = writable({});
  export let showStructureName = true; // 기본값: Structure Name 입력 필드 표시
  export let calculateDisabled = false; // 계산 버튼 비활성화 여부

  // Delta 계산을 위한 props
  export let modificationType = 'Single-site';
  export let targetAminoAcid = '';
  export let target1AminoAcid = '';
  export let target2AminoAcid = '';

  // Modal state
  let showModal = false;
  let activeTab = 'amino-acids'; // 'amino-acids', 'ncaa', 'modifications'
  let savedNcAA = [];
  let savedModifications = [];

  onMount(() => {
    // ChemDoodle 기본 설정
    ChemDoodle.ELEMENT['H'].jmolColor = 'black';
    ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
    sketcher = new ChemDoodle.SketcherCanvas('sketcher', 500, 300, {
      useServices: false,
      oneMolecule: true
    });
    sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true;
    sketcher.styles.atoms_useJMOLColors = true;
    sketcher.styles.bonds_clearOverlaps_2D = true;
    sketcher.styles.shapes_color = 'c10000';
    sketcher.repaint();

    // Load saved data from localStorage
    loadSavedData();
  });

  function loadSavedData() {
    savedNcAA = JSON.parse(localStorage.getItem('moleculeData') || '[]');
    savedModifications = JSON.parse(localStorage.getItem('potentialModifications') || '[]');
  }

  function openModal() {
    loadSavedData();
    showModal = true;
  }

  function closeModal() {
    showModal = false;
  }

  export function clearCanvas() {
    if (sketcher) {
      sketcher.clear();
      sketcher.repaint();
    }
  }

  export function resetCalculation() {
    molecularFormula.set('');
    monoisotopicWeight.set('');
    molecularWeight.set('');
    moleculeJson.set({});
  }

  // Delta 값 계산 (Single-site만)
  $: deltaMonoisotopicWeight = modificationType === 'Single-site' ? calculateDelta($monoisotopicWeight, 'monoisotopic') : null;
  $: deltaMolecularWeight = modificationType === 'Single-site' ? calculateDelta($molecularWeight, 'molecular') : null;

  function calculateDelta(calculatedWeight, weightType) {
    if (!calculatedWeight || modificationType !== 'Single-site') return null;

    const targetAA = targetAminoAcid === 'ALL' ? 'G' : targetAminoAcid;
    if (!targetAA) return null;

    const targetWeight = weightType === 'monoisotopic'
      ? (aminoMap[targetAA] || 0)
      : (molecularWeightMap[targetAA] || 0);

    const delta = parseFloat(calculatedWeight) - targetWeight;
    return {
      value: delta.toFixed(5),
      calculatedWeight: parseFloat(calculatedWeight).toFixed(3),
      targetWeight: targetWeight.toFixed(5),
      targetLabel: targetAminoAcid === 'ALL' ? 'G (Glycine)' : targetAminoAcid
    };
  }

  // 아미노산 MOL 구조 정의 (간단한 구조)
  const aminoAcidMOL = {
    G: `
  ChemDoodle Web Components

  5  4  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  2  0  0  0  0
  3  5  1  0  0  0  0
M  END`,
    A: `
  ChemDoodle Web Components

  6  5  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  2  4  1  0  0  0  0
  4  5  2  0  0  0  0
  4  6  1  0  0  0  0
M  END`,
    S: `
  ChemDoodle Web Components

  7  6  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  2  5  1  0  0  0  0
  5  6  2  0  0  0  0
  5  7  1  0  0  0  0
M  END`,
    C: `
  ChemDoodle Web Components

  7  6  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  2  5  1  0  0  0  0
  5  6  2  0  0  0  0
  5  7  1  0  0  0  0
M  END`,
    V: `
  ChemDoodle Web Components

  8  7  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  3  5  1  0  0  0  0
  2  6  1  0  0  0  0
  6  7  2  0  0  0  0
  6  8  1  0  0  0  0
M  END`,
    L: `
  ChemDoodle Web Components

  9  8  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  4  6  1  0  0  0  0
  2  7  1  0  0  0  0
  7  8  2  0  0  0  0
  7  9  1  0  0  0  0
M  END`,
    I: `
  ChemDoodle Web Components

  9  8  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  3  6  1  1  0  0  0
  2  7  1  0  0  0  0
  7  8  2  0  0  0  0
  7  9  1  0  0  0  0
M  END`,
    M: `
  ChemDoodle Web Components

  9  8  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
    6.0000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  5  6  1  0  0  0  0
  2  7  1  0  0  0  0
  7  8  2  0  0  0  0
  7  9  1  0  0  0  0
M  END`,
    P: `
  ChemDoodle Web Components

  8  8  0  0  0  0  0  0  0  0999 V2000
    1.0000    0.5000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    2.4265   -0.5365    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.8819   -2.2135    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.1181   -2.2135    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.4265   -0.5365    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.4265    0.9635    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.6265    1.6635    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.2265    1.6635    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  5  1  1  0  0  0  0
  2  6  1  0  0  0  0
  6  7  2  0  0  0  0
  6  8  1  0  0  0  0
M  END`,
    F: `
  ChemDoodle Web Components

 12 12  0  0  0  0            999 V2000
   -0.1292    1.2247    0.0000 C   0  0
   -1.2434    0.6124    0.0000 C   0  0
   -1.2434   -0.6124    0.0000 C   0  0
   -0.1292   -1.2247    0.0000 C   0  0
    0.9851   -0.6124    0.0000 C   0  0
    0.9851    0.6124    0.0000 C   0  0
    2.2201    1.2247    0.0000 C   0  0
    2.9535    0.0000    0.0000 C   0  0
    2.2201   -1.2247    0.0000 N   0  0
    4.0678    0.0000    0.0000 C   0  0
    4.8013    1.2247    0.0000 O   0  0
    4.8013   -1.2247    0.0000 O   0  0
  1  2  2  0
  2  3  1  0
  3  4  2  0
  4  5  1  0
  5  6  2  0
  6  1  1  0
  6  7  1  0
  7  8  1  0
  8  9  1  6
  8 10  1  0
 10 11  2  0
 10 12  1  0
M  END`,
    Y: `
  ChemDoodle Web Components

13 13  0  0  0  0            999 V2000
    0.8660    0.5000    0.0000 C   0  0
    0.0000    1.0000    0.0000 C   0  0
   -0.8660    0.5000    0.0000 C   0  0
   -0.8660   -0.5000    0.0000 C   0  0
    0.0000   -1.0000    0.0000 C   0  0
    0.8660   -0.5000    0.0000 C   0  0
    0.0000    2.5000    0.0000 O   0  0
    2.1650   -1.0000    0.0000 C   0  0
    3.4640   -0.2500    0.0000 C   0  0
    3.4640    1.2500    0.0000 N   0  0
    4.7630   -1.0000    0.0000 C   0  0
    6.0620   -0.2500    0.0000 O   0  0
    4.7630   -2.5000    0.0000 O   0  0
  1  2  2  0
  2  3  1  0
  3  4  2  0
  4  5  1  0
  5  6  2  0
  6  1  1  0
  3  7  1  0
  6  8  1  0
  8  9  1  0
  9 10  1  6
  9 11  1  0
 11 12  2  0
 11 13  1  0
M  END`,
    W: `
  ChemDoodle Web Components

15 16  0  0  0  0            999 V2000
   -1.2130    2.7260    0.0000 C   0  0
   -0.7500    1.2990    0.0000 C   0  0
   -1.5000    0.0000    0.0000 C   0  0
   -0.7500   -1.2990    0.0000 C   0  0
    0.7500   -1.2990    0.0000 C   0  0
    1.5000    0.0000    0.0000 C   0  0
    0.7500    1.2990    0.0000 C   0  0
    1.2130    2.7260    0.0000 N   0  0
    0.0000    3.6080    0.0000 C   0  0
   -2.5130    3.4760    0.0000 C   0  0
   -3.8120    2.7260    0.0000 C   0  0
   -3.8120    1.2260    0.0000 N   0  0
   -5.1110    3.4760    0.0000 C   0  0
   -5.1110    4.9760    0.0000 O   0  0
   -6.4100    2.7260    0.0000 O   0  0
  1  2  1  0
  2  3  2  0
  3  4  1  0
  4  5  2  0
  5  6  1  0
  6  7  2  0
  7  2  1  0
  7  8  1  0
  8  9  2  0
  9  1  1  0
 10  1  1  0
 10 11  1  0
 11 12  1  6
 11 13  1  0
 13 14  2  0
 13 15  1  0
M  END`,
    D: `
  ChemDoodle Web Components

  9  8  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000    0.0000    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  2  5  1  0  0  0  0
  4  6  2  0  0  0  0
  4  7  1  0  0  0  0
  5  8  2  0  0  0  0
  5  9  1  0  0  0  0
M  END`,
    E: `
  ChemDoodle Web Components

 10  9  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    5.2500   -3.8971    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    5.2500   -1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  2  6  1  0  0  0  0
  5  7  2  0  0  0  0
  5  8  1  0  0  0  0
  6  9  2  0  0  0  0
  6 10  1  0  0  0  0
M  END`,
    N: `
  ChemDoodle Web Components

  9  8  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  2  5  1  0  0  0  0
  4  6  2  0  0  0  0
  4  7  1  0  0  0  0
  5  8  2  0  0  0  0
  5  9  1  0  0  0  0
M  END`,
    Q: `
  ChemDoodle Web Components

 10  9  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    5.2500   -3.8971    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    5.2500   -1.2990    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  2  6  1  0  0  0  0
  5  7  2  0  0  0  0
  5  8  1  0  0  0  0
  6  9  2  0  0  0  0
  6 10  1  0  0  0  0
M  END`,
    H: `
  ChemDoodle Web Components

 11 11  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.0000   -1.5000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    5.0360   -0.0730    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    6.7140   -0.6180    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    6.7140   -2.3820    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    5.0360   -2.9270    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  2  4  1  0  0  0  0
  4  5  1  0  0  0  0
  5  6  1  0  0  0  0
  6  7  2  0  0  0  0
  7  8  1  0  0  0  0
  8  9  2  0  0  0  0
  9  5  1  0  0  0  0
  3 10  2  0  0  0  0
  3 11  1  0  0  0  0
M  END`,
    K: `
  ChemDoodle Web Components

 10  9  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    6.0000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    6.7500   -3.8971    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  5  6  1  0  0  0  0
  6  7  1  0  0  0  0
  2  8  1  0  0  0  0
  8  9  2  0  0  0  0
  8 10  1  0  0  0  0
M  END`,
    R: `
  ChemDoodle Web Components

 12 11  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    6.0000   -2.5981    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    6.7500   -3.8971    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    7.5000   -5.1962    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    8.2500   -2.5981    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  5  6  1  0  0  0  0
  6  7  1  0  0  0  0
  2  8  1  0  0  0  0
  7  9  1  0  0  0  0
  7 10  2  0  0  0  0
  8 11  2  0  0  0  0
  8 12  1  0  0  0  0
M  END`,
    T: `
  ChemDoodle Web Components

  8  7  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  6  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  3  5  1  0  0  0  0
  2  6  1  0  0  0  0
  6  7  2  0  0  0  0
  6  8  1  0  0  0  0
M  END`,
  };

  function loadAminoAcid(aminoCode) {
    if (sketcher && aminoAcidMOL[aminoCode]) {
      try {
        const mol = ChemDoodle.readMOL(aminoAcidMOL[aminoCode]);
        sketcher.loadMolecule(mol);
        closeModal();
      } catch (error) {
        console.error('Error loading amino acid structure:', error);
        alert('Failed to load amino acid structure.');
      }
    }
  }

  function loadNcAA(ncaaData) {
    if (sketcher && ncaaData.moleculeJson) {
      try {
        const mol = new ChemDoodle.io.JSONInterpreter().molFrom(ncaaData.moleculeJson);
        sketcher.loadMolecule(mol);
        closeModal();
      } catch (error) {
        console.error('Error loading ncAA structure:', error);
        alert('Failed to load ncAA structure.');
      }
    }
  }

  function loadModification(modData) {
    if (sketcher && modData.moleculeJson) {
      try {
        const mol = new ChemDoodle.io.JSONInterpreter().molFrom(modData.moleculeJson);
        sketcher.loadMolecule(mol);
        closeModal();
      } catch (error) {
        console.error('Error loading modification structure:', error);
        alert('Failed to load modification structure.');
      }
    }
  }

  function calculateChemical() {
    try {
      let mol = sketcher.getMolecule();
      let molJson = new ChemDoodle.io.JSONInterpreter().molTo(mol);
      let obj = new ChemDoodle.io.JSONInterpreter().molFrom(molJson);
      let asString = JSON.stringify(obj);
      const molecule = Molecule.fromJson(asString);

      moleculeJson.set(molJson);
      molecularFormula.set(molecule.getMolecularFormula());
      monoisotopicWeight.set(molecule.getMonoisotopicMass().toFixed(3).toString());
      molecularWeight.set(molecule.getMolecularMass().toFixed(3).toString());

      dispatch('calculated', {
        moleculeJson: molJson,
        molecularFormula: $molecularFormula,
        monoisotopicWeight: $monoisotopicWeight,
        molecularWeight: $molecularWeight
      });
    } catch (error) {
      console.error('Error calculating molecular properties:', error);
      alert('Error calculating molecular properties. Please check your structure.');
    }
  }
</script>

<div class="canvas-section mb-3">
  <div class="mb-3">
    <label class="form-label fw-bold">Chemical Structure</label>

    <!-- Structure Name Input (조건부 렌더링) -->
    {#if showStructureName}
      <div class="mb-2">
        <input
          type="text"
          bind:value={structureName}
          class="form-control"
          placeholder="Enter structure name (required)"
          required
        />
      </div>
    {/if}

    <div class="canvas-container">
      <div class="d-flex justify-content-end mb-2">
        <button class="btn btn-primary btn-load-template" on:click={openModal}>
          Load Template
        </button>
      </div>
      <div class="text-center">
        <canvas id="sketcher" class="border border-secondary rounded shadow-sm" width="500" height="300"></canvas>
      </div>
    </div>
  </div>

  <div class="mb-3">
    <button
      class="btn btn-success w-100"
      on:click={calculateChemical}
      disabled={calculateDisabled}
    >
      Calculate Molecular Properties
    </button>
  </div>

  {#if $molecularFormula || $monoisotopicWeight || $molecularWeight}
    <div class="results">
      {#if $molecularFormula}
        <div class="mb-2">
          <strong>Molecular Formula:</strong> {$molecularFormula}
        </div>
      {/if}
      {#if $monoisotopicWeight}
        <div class="mb-2">
          <strong>Monoisotopic Weight:</strong> {$monoisotopicWeight} <span class="text-muted">(Calculated)</span>
        </div>
      {/if}
      {#if $molecularWeight}
        <div class="mb-2">
          <strong>Molecular Weight:</strong> {$molecularWeight} <span class="text-muted">(Calculated)</span>
        </div>
      {/if}

      {#if deltaMonoisotopicWeight}
        <div class="mt-3 pt-3 border-top">
          <div class="mb-2 delta-result">
            <strong>Delta Monoisotopic Weight:</strong>
            <span class="delta-value">{deltaMonoisotopicWeight.value}</span>
            <div class="delta-formula">
              ({deltaMonoisotopicWeight.calculatedWeight} - {deltaMonoisotopicWeight.targetWeight} [{deltaMonoisotopicWeight.targetLabel}])
            </div>
          </div>
        </div>
      {/if}

      {#if deltaMolecularWeight}
        <div class="mb-2 delta-result">
          <strong>Delta Molecular Weight:</strong>
          <span class="delta-value">{deltaMolecularWeight.value}</span>
          <div class="delta-formula">
            ({deltaMolecularWeight.calculatedWeight} - {deltaMolecularWeight.targetWeight} [{deltaMolecularWeight.targetLabel}])
          </div>
        </div>
        <div class="mt-2 save-notice">
          → This delta value will be saved
        </div>
      {:else if modificationType === 'Crosslinking' && $molecularWeight}
        <div class="mt-3 pt-3 border-top">
          <div class="mt-2 save-notice-crosslink">
            → This absolute value will be saved (No delta calculation for Crosslinking)
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>

<!-- Template Selection Modal -->
{#if showModal}
  <div class="modal-overlay" on:click={closeModal}>
    <div class="modal-content" on:click|stopPropagation>
      <div class="modal-header">
        <h5 class="modal-title">Load Template</h5>
        <button type="button" class="btn-close" on:click={closeModal}></button>
      </div>

      <!-- Tabs -->
      <ul class="nav nav-tabs mb-3">
        <li class="nav-item">
          <button
            class="nav-link {activeTab === 'amino-acids' ? 'active' : ''}"
            on:click={() => activeTab = 'amino-acids'}
          >
            Amino Acids
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link {activeTab === 'ncaa' ? 'active' : ''}"
            on:click={() => activeTab = 'ncaa'}
          >
            ncAA
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link {activeTab === 'modifications' ? 'active' : ''}"
            on:click={() => activeTab = 'modifications'}
          >
            Potential Modifications
          </button>
        </li>
      </ul>

      <!-- Tab Content -->
      <div class="modal-body">
        {#if activeTab === 'amino-acids'}
          <div class="amino-acid-grid">
            {#each Object.keys(shortToLongMapper) as aminoCode}
              <button
                class="btn btn-sm btn-outline-primary amino-btn"
                on:click={() => loadAminoAcid(aminoCode)}
                title={shortToLongMapper[aminoCode]}
              >
                {aminoCode}
              </button>
            {/each}
          </div>
        {:else if activeTab === 'ncaa'}
          {#if savedNcAA.length > 0}
            <div class="template-list">
              {#each savedNcAA as ncaa}
                <button
                  class="btn btn-outline-info template-item"
                  on:click={() => loadNcAA(ncaa)}
                >
                  <div class="template-name">{ncaa.title}</div>
                  <div class="template-formula">{ncaa.molecularFormula}</div>
                </button>
              {/each}
            </div>
          {:else}
            <p class="text-muted text-center">No ncAA data saved yet.</p>
          {/if}
        {:else if activeTab === 'modifications'}
          {#if savedModifications.length > 0}
            <div class="template-list">
              {#each savedModifications as mod}
                <button
                  class="btn btn-outline-success template-item"
                  on:click={() => loadModification(mod)}
                >
                  <div class="template-name">{mod.name}</div>
                  <div class="template-formula">{mod.molecularFormula}</div>
                </button>
              {/each}
            </div>
          {:else}
            <p class="text-muted text-center">No modifications saved yet.</p>
          {/if}
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  canvas {
    display: block;
    margin: 0 auto;
  }

  .canvas-container {
    background-color: white;
    padding: 15px;
    border-radius: 8px;
  }

  .results {
    padding: 15px;
    background-color: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #dee2e6;
  }

  .results strong {
    color: #495057;
  }

  .delta-result {
    background-color: #e7f3ff;
    padding: 8px;
    border-radius: 4px;
  }

  .delta-value {
    color: #0056b3;
    font-weight: bold;
    font-size: 1.1em;
    margin-left: 8px;
  }

  .delta-formula {
    font-size: 0.9em;
    color: #6c757d;
    margin-top: 4px;
    font-family: monospace;
  }

  .save-notice {
    color: #28a745;
    font-weight: bold;
    font-style: italic;
  }

  .save-notice-crosslink {
    color: #17a2b8;
    font-weight: bold;
    font-style: italic;
  }

  /* Modal Styles */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #dee2e6;
  }

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0;
    width: 24px;
    height: 24px;
    line-height: 1;
  }

  .btn-close::before {
    content: '×';
  }

  .nav-tabs {
    border-bottom: 1px solid #dee2e6;
  }

  .nav-item {
    margin-bottom: -1px;
  }

  .nav-link {
    background: none;
    border: 1px solid transparent;
    border-radius: 0.25rem 0.25rem 0 0;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  .nav-link:hover {
    border-color: #e9ecef #e9ecef #dee2e6;
  }

  .nav-link.active {
    color: #495057;
    background-color: #fff;
    border-color: #dee2e6 #dee2e6 #fff;
  }

  .modal-body {
    padding: 20px 0;
    min-height: 200px;
  }

  .amino-acid-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
    gap: 8px;
  }

  .amino-btn {
    min-width: 50px;
    font-weight: bold;
    padding: 10px;
  }

  .template-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .template-item {
    text-align: left;
    padding: 12px;
    width: 100%;
  }

  .template-name {
    font-weight: bold;
    margin-bottom: 4px;
  }

  .template-formula {
    font-size: 0.875rem;
    color: #6c757d;
  }

  .btn-load-template {
    width: 150px;
  }
</style>
