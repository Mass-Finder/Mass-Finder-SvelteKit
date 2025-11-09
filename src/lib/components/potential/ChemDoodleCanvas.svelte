<script>
  import { onMount, createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import { Molecule } from '$lib/model/atom';
  import { shortToLongMapper } from '$lib/helper/amino_mapper';

  const dispatch = createEventDispatcher();

  let sketcher;
  export let structureName = '';
  export let molecularFormula = writable('');
  export let monoisotopicWeight = writable('');
  export let molecularWeight = writable('');
  export let moleculeJson = writable({});

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

  // 아미노산 MOL 구조 정의 (간단한 구조)
  const aminoAcidMOL = {
    G: `
  ChemDoodle Web Components

  3  2  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
M  END`,
    A: `
  ChemDoodle Web Components

  4  3  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  2  4  1  0  0  0  0
M  END`,
    S: `
  ChemDoodle Web Components

  5  4  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  2  5  1  0  0  0  0
M  END`,
    C: `
  ChemDoodle Web Components

  5  4  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  2  5  1  0  0  0  0
M  END`,
    V: `
  ChemDoodle Web Components

  6  5  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  3  5  1  0  0  0  0
  2  6  1  0  0  0  0
M  END`,
    L: `
  ChemDoodle Web Components

  7  6  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  4  6  1  0  0  0  0
  2  7  1  0  0  0  0
M  END`,
    I: `
  ChemDoodle Web Components

  7  6  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  3  6  1  0  0  0  0
  2  7  1  0  0  0  0
M  END`,
    M: `
  ChemDoodle Web Components

  7  6  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.5000   -2.5981    0.0000 S   0  0  0  0  0  0  0  0  0  0  0  0
    6.0000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  5  6  1  0  0  0  0
  2  7  1  0  0  0  0
M  END`,
    P: `
  ChemDoodle Web Components

  8  8  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.2990    0.7500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.5981    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.5981   -1.5000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.2990   -2.2500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -1.5000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.2990    2.2500    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.5981    3.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  4  5  1  0  0  0  0
  5  6  1  0  0  0  0
  6  1  1  0  0  0  0
  2  7  1  0  0  0  0
  7  8  1  0  0  0  0
M  END`,
    F: `
  ChemDoodle Web Components

 13 13  0  0  0  0            999 V2000
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
    3.3344    1.2247    0.0000 H   0  0
  1  2  1  0
  2  3  2  0
  3  4  1  0
  4  5  2  0
  5  6  1  0
  6  1  2  0
  6  7  1  0
  7  8  1  0
  8  9  1  0
  8 10  1  0
 10 11  2  0
 10 12  1  0
  7 13  1  0
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
    2.0000    1.0000    0.0000 O   0  0
    2.2500    0.0000    0.0000 C   0  0
    1.5000   -1.0000    0.0000 N   0  0
    3.2500    0.0000    0.0000 C   0  0
    4.2500    1.0000    0.0000 O   0  0
    4.2500   -1.0000    0.0000 O   0  0
    2.7500    1.0000    0.0000 H   0  0
  1  2  2  0
  2  3  1  0
  3  4  2  0
  4  5  1  0
  5  6  2  0
  6  1  1  0
  1  7  1  0  // para-OH
  2  8  1  0
  8  9  1  0
  8 10  1  0
 10 11  2  0
 10 12  1  0
  7 13  1  0
M  END`,
    W: `
  ChemDoodle Web Components

15 16  0  0  0  0            999 V2000
    1.2990    0.7500    0.0000 C   0  0
    0.0000    0.0000    0.0000 C   0  0
    0.0000   -1.5000    0.0000 C   0  0
   -1.2990   -2.2500    0.0000 C   0  0
   -2.5981   -1.5000    0.0000 C   0  0
   -2.5981    0.0000    0.0000 C   0  0
   -1.2990    0.7500    0.0000 C   0  0
   -0.4330    2.2500    0.0000 N   0  0
    0.8660    2.2500    0.0000 C   0  0
    2.5981    0.0000    0.0000 C   0  0
    3.8971    0.7500    0.0000 C   0  0
    3.8971    2.2500    0.0000 N   0  0
    5.1962    0.0000    0.0000 C   0  0
    5.1962   -1.5000    0.0000 O   0  0
    6.4952    0.7500    0.0000 O   0  0
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
  1 10  1  0
 10 11  1  0
 11 12  1  0
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
  1  2  1  0  0  0  0
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
  1  2  1  0  0  0  0
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
  1  2  1  0  0  0  0
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
  1  2  1  0  0  0  0
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
    3.7500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.7500   -2.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    6.1770   -1.7990    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    6.1770   -0.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    4.7500    0.2010    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    3.0000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    2.5981    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
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
  1  2  1  0  0  0  0
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
  1  2  1  0  0  0  0
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

  6  5  0  0  0  0  0  0  0  0999 V2000
    0.0000    0.0000    0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000    0.0000    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500   -1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.7500   -1.2990    0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    1.5000   -2.5981    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.2500    1.2990    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0  0  0  0
  2  3  1  0  0  0  0
  3  4  1  0  0  0  0
  3  5  1  0  0  0  0
  2  6  1  0  0  0  0
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

    <!-- Structure Name Input -->
    <div class="mb-2">
      <input
        type="text"
        bind:value={structureName}
        class="form-control"
        placeholder="Enter structure name (required)"
        required
      />
    </div>

    <!-- Load Template Button -->
    <div class="mb-3">
      <button class="btn btn-outline-secondary w-100" on:click={openModal}>
        Load Template
      </button>
    </div>

    <div class="canvas-container text-center">
      <canvas id="sketcher" class="border border-secondary rounded shadow-sm" width="500" height="300"></canvas>
    </div>
  </div>

  <div class="mb-3">
    <button class="btn btn-success w-100" on:click={calculateChemical}>
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
          <strong>Monoisotopic Weight:</strong> {$monoisotopicWeight}
        </div>
      {/if}
      {#if $molecularWeight}
        <div class="mb-2">
          <strong>Molecular Weight:</strong> {$molecularWeight}
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
</style>
