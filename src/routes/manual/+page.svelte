<script>
    import { onMount } from 'svelte';
  
    // 페이지 이동 예시
    function goToSection(sectionId) {
      // 해당 섹션 요소를 찾고 스크롤
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  </script>
  
  <svelte:head>
    <title>X-MAS User Guide</title>
  </svelte:head>
  
  <!-- Navigation Bar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">X-MAS User Guide</a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('introduction')}>Introduction</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('stm')}>Sequence to Mass</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('mts')}>Mass to Sequence</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('draw')}>Add Non-Canonical Amino Acids</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  
  <!-- Page Content -->
  <div class="container my-5">
    <!-- Introduction Section -->
    <section id="introduction" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Welcome to X-MAS</h2>
          <p class="card-text">
            This tool was developed to facilitate mass spectrometry (MS) analysis after protein translation.
            It provides two key functions: (1) calculating the molecular mass of peptides from RNA
            sequence, and (2) predicting peptide sequences from MS peaks. We hope this program
            supports your research!
          </p>
        </div>
      </div>
    </section>
  
    <!-- Sequence to Mass Section -->
    <section id="stm" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Sequence to Mass</h2>
          <p class="card-text">
            Calculates the peptide mass from an input RNA sequence. Users may include non-canonical
            amino acids if needed. The calculation can also consider translation errors or post-
            translational modifications.
          </p>
          
          <!-- Accordion for STM Steps -->
          <div class="accordion" id="stmAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="stmHeadingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#stmCollapseOne"
                  aria-expanded="true"
                  aria-controls="stmCollapseOne"
                >
                  Step 1 – RNA Sequence
                </button>
              </h2>
              <div
                id="stmCollapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="stmHeadingOne"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  Enter the DNA or RNA sequence to be translated.<br>
                  If a DNA sequence is entered, it will automatically be converted to RNA.<br>
                  The entered sequence is stored locally, so it can be reused later.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="stmHeadingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#stmCollapseTwo"
                  aria-expanded="false"
                  aria-controls="stmCollapseTwo"
                >
                  Step 2 – Adduct
                </button>
              </h2>
              <div
                id="stmCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingTwo"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  Select one or more adducts. The mass of the selected adduct(s) will be added to the result: [M + Adduct]+<br>
                  If no adduct is selected, the unmodified mass will be displayed: [M]+
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="stmHeadingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#stmCollapseThree"
                  aria-expanded="false"
                  aria-controls="stmCollapseThree"
                >
                  Step 3 – Used Amino Acids
                </button>
              </h2>
              <div
                id="stmCollapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingThree"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  Select the amino acids used during translation.<br>
                  Codons corresponding to unselected amino acids will either be skipping or substituted with non-canonical amino acids.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="stmHeadingFour">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#stmCollapseFour"
                  aria-expanded="false"
                  aria-controls="stmCollapseFour"
                >
                  Step 4 – Used non-canonical amino acids
                </button>
              </h2>
              <div
                id="stmCollapseFour"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingFour"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  Select the non-canonical amino acids (ncAAs) used.<br>
                  To use an ncAA, you must first draw its structure and save it in the "Add Non-Canonical Amino Acids" tab.<br>
                  Each ncAA requires codon assignment. Multiple codons can be assigned to one ncAA, and the same codon can be assigned to different ncAAs.<br>
                  Assigned codons will be incorporated at corresponding positions in the RNA sequence.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="stmHeadingFive">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#stmCollapseFive"
                  aria-expanded="false"
                  aria-controls="stmCollapseFive"
                >
                  Step 5 – Used non-canonical amino acids
                </button>
              </h2>
              <div
                id="stmCollapseFive"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingFive"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  Select the non-canonical amino acids (ncAAs) used.<br>
                  To use an ncAA, you must first draw its structure and save it in the "Add Non-Canonical Amino Acids" tab.<br>
                  Each ncAA requires codon assignment. Multiple codons can be assigned to one ncAA, and the same codon can be assigned to different ncAAs.<br>
                  Assigned codons will be incorporated at corresponding positions in the RNA sequence.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="stmHeadingSix">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#stmCollapseSix"
                  aria-expanded="false"
                  aria-controls="stmCollapseSix"
                >
                  Step 6 – Calculate
                </button>
              </h2>
              <div
                id="stmCollapseSix"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingSix"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  Click the Calculate button to generate results.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  
    <!-- Mass to Sequence Section -->
    <section id="mts" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Mass to Sequence</h2>
          <p class="card-text">
            Predicts possible peptide sequences from a given mass. Providing as much known information
            as possible will improve the prediction accuracy.
          </p>
          
          <!-- Accordion for MTS Steps -->
          <div class="accordion" id="mtsAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseOne"
                  aria-expanded="true"
                  aria-controls="mtsCollapseOne"
                >
                  Step 1 – Mass
                </button>
              </h2>
              <div
                id="mtsCollapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="mtsHeadingOne"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  Enter the observed mass of an unknown MS peak.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseTwo"
                  aria-expanded="false"
                  aria-controls="mtsCollapseTwo"
                >
                  Step 2 – Used RNA Sequence
                </button>
              </h2>
              <div
                id="mtsCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingTwo"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  Enter the RNA sequence used for translation.<br>
                  This helps prioritize peptide sequences similar to the input.<br>
                  Although optional, entering the RNA sequence is strongly recommended, especially for high mass values, to reduce meaningless results.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseThree"
                  aria-expanded="false"
                  aria-controls="mtsCollapseThree"
                >
                  Step 3 – Fixed Sequence
                </button>
              </h2>
              <div
                id="mtsCollapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingThree"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  If any known region of the peptide sequence exists, enter it here.<br>
                  This reduces the number of possibilities and improves prediction accuracy.<br>
                  Leave it blank if unknown.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingFour">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseFour"
                  aria-expanded="false"
                  aria-controls="mtsCollapseFour"
                >
                  Step 4 – Post-Translational Modification
                </button>
              </h2>
              <div
                id="mtsCollapseFour"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingFour"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  Select whether N- or C-terminal modifications occur.<br>
                  <strong>• Formylation:</strong> N-terminal methionine is converted to formyl-methionine. It is denoted as 'f' and adds 28.<br>
                  <strong>• Amidation:</strong> C-terminal residue is amidated. It is denoted as 'n' and subtracts 0.98.<br>
                  Both options can be set to "unknown", in which case both modified and unmodified versions are considered during calculation.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingFive">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseFive"
                  aria-expanded="false"
                  aria-controls="mtsCollapseFive"
                >
                  Step 5 – Adduct
                </button>
              </h2>
              <div
                id="mtsCollapseFive"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingFive"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  Select adducts to be included in the final mass.<br>
                  If no adduct is selected, only the base mass is used.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingSix">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseSix"
                  aria-expanded="false"
                  aria-controls="mtsCollapseSix"
                >
                  Step 6 – Used Amino Acids
                </button>
              </h2>
              <div
                id="mtsCollapseSix"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingSix"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  Select the amino acids to be included in candidate sequences.<br>
                  Unselected amino acids will be excluded, reducing computational load.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingSeven">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseSeven"
                  aria-expanded="false"
                  aria-controls="mtsCollapseSeven"
                >
                  Step 7 – Used non-canonical amino acids
                </button>
              </h2>
              <div
                id="mtsCollapseSeven"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingSeven"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  Select the non-canonical amino acids used.<br>
                  To enable them, draw and save their structures in the "Add Non-Canonical Amino Acids" tab.<br>
                  Selected ncAAs will be included in candidate generation.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingEight">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseEight"
                  aria-expanded="false"
                  aria-controls="mtsCollapseEight"
                >
                  Step 8 – Calculate
                </button>
              </h2>
              <div
                id="mtsCollapseEight"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingEight"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  Click the Calculate button to display results.<br>
                  If the expected result does not appear, adjust the parameters and repeat the calculation.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  
    <!-- Add Non-Canonical Amino Acids Section -->
    <section id="draw" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Add Non-Canonical Amino Acids</h2>
          <p class="card-text">
            This tab allows you to draw and register the structure of non-canonical amino acids.
          </p>
          
          <!-- Accordion for Draw Steps -->
          <div class="accordion" id="drawAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="drawHeadingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#drawCollapseOne"
                  aria-expanded="true"
                  aria-controls="drawCollapseOne"
                >
                  Step 1 – Canvas
                </button>
              </h2>
              <div
                id="drawCollapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="drawHeadingOne"
                data-bs-parent="#drawAccordion"
              >
                <div class="accordion-body">
                  Draw the chemical structure of the ncAA on the canvas.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="drawHeadingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#drawCollapseTwo"
                  aria-expanded="false"
                  aria-controls="drawCollapseTwo"
                >
                  Step 2 – Code
                </button>
              </h2>
              <div
                id="drawCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="drawHeadingTwo"
                data-bs-parent="#drawAccordion"
              >
                <div class="accordion-body">
                  Assign a code to the ncAA.<br>
                  Letters, numbers, and special characters are allowed.<br>
                  Avoid using codes that overlap with standard amino acids to prevent confusion in result interpretation.
                </div>
              </div>
            </div>
            
            <div class="accordion-item">
              <h2 class="accordion-header" id="drawHeadingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#drawCollapseThree"
                  aria-expanded="false"
                  aria-controls="drawCollapseThree"
                >
                  Step 3 – Save
                </button>
              </h2>
              <div
                id="drawCollapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="drawHeadingThree"
                data-bs-parent="#drawAccordion"
              >
                <div class="accordion-body">
                  Click Save to calculate and store the molecular mass based on the drawn structure.<br>
                  Saved ncAAs can be reused without redrawing.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  
    <!-- Footer with CTA -->
    <!-- <footer class="text-center mt-5">
      <p class="mb-2">Need additional support?</p>
      <a href="mailto:support@massfinder.com" class="btn btn-primary">Contact Support</a>
    </footer> -->
  </div>
  
  <style>
    .card {
      margin-bottom: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .card-body {
      padding: 2rem;
    }
    .accordion-button {
      font-weight: bold;
    }
    .accordion-body {
      line-height: 1.6;
    }
  </style>