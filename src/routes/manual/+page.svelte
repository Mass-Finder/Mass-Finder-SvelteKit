<script>
    import { onMount } from 'svelte';

    // 페이지 이동
    function goToSection(sectionId) {
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
      <a class="navbar-brand" href="#" on:click={(e) => {e.preventDefault(); goToSection('introduction')}}>X-MAS User Guide</a>
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
            <a class="nav-link" href="#" on:click={(e) => {e.preventDefault(); goToSection('introduction')}}>Introduction</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" on:click={(e) => {e.preventDefault(); goToSection('stm')}}>Sequence to Mass</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" on:click={(e) => {e.preventDefault(); goToSection('mts')}}>Mass to Sequence</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" on:click={(e) => {e.preventDefault(); goToSection('draw')}}>Add ncAA</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#" on:click={(e) => {e.preventDefault(); goToSection('potential')}}>Potential Modification</a>
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
            <strong>X-MAS (Experimental Mass Analysis System)</strong> is a specialized tool designed for biochemical researchers working with mass spectrometry (MS) analysis of peptides and proteins.
          </p>
          <p class="card-text">
            This tool provides two complementary approaches:
          </p>
          <ul>
            <li><strong>Sequence to Mass (STM):</strong> Calculate the expected molecular mass of peptides from RNA sequences, considering various translation phenomena including non-canonical amino acids (ncAA) and post-translational modifications.</li>
            <li><strong>Mass to Sequence (MTS):</strong> Predict possible peptide sequences from observed MS peaks using simulated annealing algorithm.</li>
          </ul>
          <p class="card-text">
            Whether you're validating translation products, identifying unknown peaks, or exploring genetic code expansion experiments, X-MAS helps bridge the gap between nucleotide sequences and mass spectrometry data.
          </p>
        </div>
      </div>
    </section>

    <!-- Sequence to Mass Section -->
    <section id="stm" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Sequence to Mass (STM)</h2>
          <p class="card-text">
            <strong>Purpose:</strong> Calculate all possible peptide masses that could arise from an RNA sequence, considering biological phenomena such as:
          </p>
          <ul>
            <li>Non-canonical amino acid (ncAA) incorporation</li>
            <li>Translation reinitiation and premature termination</li>
            <li>Ribosome skipping</li>
            <li>Post-translational modifications</li>
            <li>Ion adduct formation</li>
          </ul>

          <div class="alert alert-info mt-3">
            <strong>💡 When to use:</strong> Use STM when you have an RNA sequence and want to predict what masses you should observe in your MS experiment. This is especially useful for validating genetic code expansion experiments or identifying expected translation products.
          </div>

          <!-- Accordion for STM Steps -->
          <div class="accordion mt-4" id="stmAccordion">
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
                  <p><strong>Enter your RNA sequence</strong> (A, U, G, C bases only).</p>
                  <ul>
                    <li>DNA sequences will be automatically converted to RNA (T→U)</li>
                    <li>Sequence length must be a multiple of 3 (codon units)</li>
                    <li>Translation stops at the first stop codon (UAG, UAA, UGA)</li>
                    <li>Sequences are saved locally for reuse</li>
                  </ul>
                  <p class="mt-2"><strong>Example:</strong> <code>AUGUUUGGC</code> → Encodes Met-Phe-Gly</p>
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
                  Step 2 – Adduct Selection
                </button>
              </h2>
              <div
                id="stmCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingTwo"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Select ion adducts</strong> that form during mass spectrometry analysis.</p>
                  <p><strong>Available adducts:</strong></p>
                  <ul>
                    <li><strong>H⁺</strong> (Proton) - Most common in positive mode MS</li>
                    <li><strong>Na⁺</strong> (Sodium) - Common contaminant/adduct</li>
                    <li><strong>K⁺</strong> (Potassium) - Another common metal adduct</li>
                    <li><strong>NH₄⁺</strong> (Ammonium)</li>
                    <li><strong>Li⁺, Cs⁺, Ca²⁺, Mg²⁺</strong></li>
                    <li><strong>none</strong> - Neutral mass [M]</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Tip:</strong> You can select multiple adducts. The tool will generate separate results for each, displayed as [M+H]⁺, [M+Na]⁺, etc.</p>
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
                  <p><strong>Select which of the 20 standard amino acids</strong> are available during translation.</p>
                  <p><strong>Why this matters:</strong></p>
                  <ul>
                    <li>Unselected amino acids won't be incorporated, even if their codons appear in the RNA sequence</li>
                    <li>Codons for unselected amino acids may result in ribosome skipping or ncAA incorporation (if assigned)</li>
                    <li>Useful for experiments with limited amino acid pools</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Tip:</strong> Keep all amino acids selected unless you're specifically modeling amino acid starvation or selective incorporation experiments.</p>
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
                  Step 4 – Non-Canonical Amino Acids (ncAA)
                </button>
              </h2>
              <div
                id="stmCollapseFour"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingFour"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Assign non-canonical amino acids</strong> to specific codons for genetic code expansion experiments.</p>
                  <p><strong>Workflow:</strong></p>
                  <ol>
                    <li>First, draw and save your ncAA structures in the <strong>"Add ncAA"</strong> tab (see section below)</li>
                    <li>Return to STM and select which ncAA you're using</li>
                    <li>Assign codons to each ncAA (multiple codons can be assigned to one ncAA)</li>
                    <li>The same codon can be assigned to different ncAAs (all possibilities will be calculated)</li>
                  </ol>
                  <p><strong>Biological phenomena modeled:</strong></p>
                  <ul>
                    <li><strong>Full incorporation:</strong> ncAA successfully replaces natural amino acid</li>
                    <li><strong>Ribosome skipping:</strong> Codon is skipped, resulting in shorter peptide</li>
                    <li><strong>Reinitiation:</strong> Translation starts downstream from ncAA position (N-terminus missing)</li>
                    <li><strong>Premature termination:</strong> Translation stops at ncAA position (C-terminus missing)</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Tip:</strong> If you observe unexpected peaks in your MS data, check if they match reinitiation or premature termination products.</p>
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
                  Step 5 – Potential Modification (Optional)
                </button>
              </h2>
              <div
                id="stmCollapseFive"
                class="accordion-collapse collapse"
                aria-labelledby="stmHeadingFive"
                data-bs-parent="#stmAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Apply custom chemical modifications</strong> to your peptides (post-translational modifications or chemical reactions).</p>
                  <p><strong>You can select up to 4 modifications</strong> from your saved library. The system will automatically calculate all possible combinations (0, 1, 2, 3, or 4 modifications applied).</p>

                  <p class="mt-3"><strong>Modification types:</strong></p>

                  <div class="ms-3">
                    <p><strong>1. Single-site modifications:</strong></p>
                    <ul>
                      <li><strong>N-terminus:</strong> Adds modification to the first amino acid (e.g., formylation: fM)
                        <br><small class="text-muted">Example: Formyl-methionine formation at start codon</small>
                      </li>
                      <li><strong>C-terminus:</strong> Adds modification to the last amino acid (e.g., amidation: Mn)
                        <br><small class="text-muted">Example: C-terminal amidation for peptide stability</small>
                      </li>
                      <li><strong>Side Chain:</strong> Replaces specific amino acids with modified versions
                        <br><small class="text-muted">Example: Phosphorylation, methylation, acetylation</small>
                      </li>
                    </ul>

                    <p class="mt-2"><strong>2. Crosslinking modifications:</strong></p>
                    <ul>
                      <li>Chemical bonds between two amino acids (e.g., disulfide bonds: C-C)</li>
                      <li>Can specify distance requirements or adjacency</li>
                    </ul>
                  </div>

                  <p class="mt-3"><strong>💡 Power Set Combination:</strong> When you select multiple modifications, the system generates ALL possible combinations. For example:</p>
                  <ul>
                    <li>Select 2 N-terminus + 2 C-terminus mods → 16 combinations (4×4)</li>
                    <li>Each combination represents a different biological scenario</li>
                    <li>This ensures comprehensive coverage of all possibilities</li>
                  </ul>

                  <p class="mt-2"><strong>⚠️ Note:</strong> First define your modifications in the <strong>"Potential Modification"</strong> tab, then select them here. See the Potential Modification section for details.</p>
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
                  <p><strong>Click Calculate</strong> to generate all possible peptide masses.</p>
                  <p><strong>Results include:</strong></p>
                  <ul>
                    <li><strong>Sequence:</strong> Amino acid sequence with modification markers (e.g., fM for formyl-Met, d1 for modified Cys)</li>
                    <li><strong>Monoisotopic Weight:</strong> Most accurate mass for MS analysis</li>
                    <li><strong>Molecular Weight:</strong> Average mass considering isotope distribution</li>
                    <li><strong>Adduct:</strong> Selected ion adduct ([M+H]⁺, [M+Na]⁺, etc.)</li>
                    <li><strong>Note:</strong> Biological phenomena applied (ncAA incorporated, reinitiation, modifications, etc.)</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Tip:</strong> Results are automatically deduplicated. If two sequences have identical mass and adduct, only one is shown.</p>
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
          <h2 class="card-title">Mass to Sequence (MTS)</h2>
          <p class="card-text">
            <strong>Purpose:</strong> Predict possible peptide sequences from an observed mass spectrometry peak using a simulated annealing optimization algorithm.
          </p>
          <p class="card-text">
            This is particularly useful when you:
          </p>
          <ul>
            <li>Detect an unknown peak in your MS data</li>
            <li>Want to identify potential peptide sequences matching a specific mass</li>
            <li>Have partial sequence information to narrow down possibilities</li>
            <li>Need to validate or identify translation products</li>
          </ul>

          <div class="alert alert-warning mt-3">
            <strong>⚠️ Important:</strong> Providing as much known information as possible (RNA sequence, fixed regions, amino acid pool) significantly improves prediction accuracy and reduces computation time.
          </div>

          <!-- Accordion for MTS Steps -->
          <div class="accordion mt-4" id="mtsAccordion">
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
                  Step 1 – Detected Mass
                </button>
              </h2>
              <div
                id="mtsCollapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="mtsHeadingOne"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Enter the observed mass</strong> from your mass spectrometry peak (required).</p>
                  <p><strong>💡 Tips for best results:</strong></p>
                  <ul>
                    <li>Use the monoisotopic mass (most intense peak in the isotope cluster)</li>
                    <li>Ensure the mass is calibrated and accurate</li>
                    <li>If you selected an adduct, enter the mass including the adduct (e.g., for [M+Na]⁺, enter M+22.99)</li>
                  </ul>
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
                  Step 2 – RNA Sequence (Optional, Highly Recommended)
                </button>
              </h2>
              <div
                id="mtsCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingTwo"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Enter the RNA sequence</strong> used for translation if known.</p>
                  <p><strong>Why this helps:</strong></p>
                  <ul>
                    <li>The algorithm will prioritize sequences with similar amino acid composition</li>
                    <li>Significantly reduces meaningless results, especially for high masses</li>
                    <li>Results are scored by both mass accuracy (95%) and sequence similarity (5%)</li>
                    <li>Final ranking uses 90% mass accuracy + 10% sequence similarity</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Strongly recommended:</strong> Always provide the RNA sequence if available. It dramatically improves result quality.</p>
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
                  Step 3 – Fixed Sequence (Optional)
                </button>
              </h2>
              <div
                id="mtsCollapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingThree"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Enter any known regions</strong> of the peptide sequence (e.g., from MS/MS fragmentation or Edman sequencing).</p>
                  <p><strong>Benefits:</strong></p>
                  <ul>
                    <li>All predicted sequences will contain this fixed region</li>
                    <li>Dramatically reduces search space and improves accuracy</li>
                    <li>Useful when you have partial sequence information from tandem MS</li>
                  </ul>
                  <p class="mt-2"><strong>Example:</strong> If you know the peptide contains <code>MSTINM</code>, enter this sequence and the algorithm will only generate sequences containing this subsequence.</p>
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
                  Step 4 – Formylation
                </button>
              </h2>
              <div
                id="mtsCollapseFour"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingFour"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Specify if N-terminal formylation</strong> is present.</p>
                  <p><strong>Options:</strong></p>
                  <ul>
                    <li><strong>Yes:</strong> All predicted sequences will have formylation (adds ~28 Da to mass, denoted as 'f')</li>
                    <li><strong>No:</strong> No formylation in predicted sequences</li>
                  </ul>
                  <p class="mt-2"><strong>Background:</strong> In bacterial translation and some eukaryotic organelles, the start codon AUG encodes formyl-methionine (fMet) instead of methionine. This adds a formyl group (CHO) to the N-terminus.</p>
                  <p class="mt-2"><strong>💡 Note:</strong> For more complex N-terminus modifications, use the Potential Modification system instead.</p>
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
                  Step 5 – Adduct Selection
                </button>
              </h2>
              <div
                id="mtsCollapseFive"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingFive"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Select the ion adduct</strong> observed in your MS peak.</p>
                  <p>The algorithm will account for the adduct mass when predicting sequences. For example, if you select [M+Na]⁺, it will subtract the sodium mass from your detected mass before searching for matching sequences.</p>
                  <p class="mt-2"><strong>💡 Tip:</strong> [M+H]⁺ is the most common adduct in positive mode ESI-MS.</p>
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
                  <p><strong>Select which amino acids</strong> to include in candidate sequences.</p>
                  <p><strong>Why narrow the search:</strong></p>
                  <ul>
                    <li>Reduces computational complexity</li>
                    <li>Improves result quality by excluding unlikely amino acids</li>
                    <li>Useful if you know certain amino acids were not available during translation</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Tip:</strong> Keep all amino acids selected unless you have specific reasons to exclude some.</p>
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
                  Step 7 – Non-Canonical Amino Acids (Optional)
                </button>
              </h2>
              <div
                id="mtsCollapseSeven"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingSeven"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Include non-canonical amino acids</strong> in the search if your experiment used genetic code expansion.</p>
                  <p>First, define and save your ncAA structures in the <strong>"Add ncAA"</strong> tab, then select them here. The algorithm will consider these ncAAs as possible building blocks.</p>
                  <p class="mt-2"><strong>💡 Tip:</strong> Only select ncAAs that were actually present in your translation system.</p>
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
                  Step 8 – Algorithm Mode & Result Count
                </button>
              </h2>
              <div
                id="mtsCollapseEight"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingEight"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Select the computational intensity</strong> of the simulated annealing algorithm:</p>

                  <table class="table table-sm mt-2">
                    <thead>
                      <tr>
                        <th>Mode</th>
                        <th>Search Depth</th>
                        <th>Best For</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Think</strong></td>
                        <td>Balanced (10,000 initial temp)</td>
                        <td>Quick searches, low masses, or when RNA sequence is provided</td>
                      </tr>
                      <tr>
                        <td><strong>Deep Think</strong></td>
                        <td>Thorough (50,000 initial temp)</td>
                        <td>High masses or complex sequences</td>
                      </tr>
                      <tr>
                        <td><strong>Ultra Think</strong></td>
                        <td>Exhaustive (100,000 initial temp)</td>
                        <td>Maximum accuracy needed, or when other modes don't find good matches</td>
                      </tr>
                    </tbody>
                  </table>

                  <p class="mt-3"><strong>Result Count:</strong> Choose how many top results to display (20, 50, or 100).</p>

                  <p class="mt-2"><strong>💡 Recommendation:</strong> Start with <strong>Think</strong> mode. If results aren't satisfactory, try <strong>Deep Think</strong> or <strong>Ultra Think</strong>.</p>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="mtsHeadingNine">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#mtsCollapseNine"
                  aria-expanded="false"
                  aria-controls="mtsCollapseNine"
                >
                  Step 9 – Calculate
                </button>
              </h2>
              <div
                id="mtsCollapseNine"
                class="accordion-collapse collapse"
                aria-labelledby="mtsHeadingNine"
                data-bs-parent="#mtsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Click Calculate</strong> to start the prediction.</p>
                  <p><strong>Results include:</strong></p>
                  <ul>
                    <li><strong>Sequence:</strong> Predicted amino acid sequence</li>
                    <li><strong>Monoisotopic/Molecular Weight:</strong> Calculated mass</li>
                    <li><strong>Similarity:</strong> Mass accuracy (% match to detected mass)</li>
                    <li><strong>Sequence Similarity:</strong> If RNA sequence was provided, similarity to expected translation</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Interpreting results:</strong> Top results are sorted by a combined score. Look for sequences with both high mass accuracy AND high sequence similarity (if RNA was provided).</p>
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
          <h2 class="card-title">Add Non-Canonical Amino Acids (ncAA)</h2>
          <p class="card-text">
            <strong>Purpose:</strong> Define and save the chemical structures of non-canonical amino acids for use in STM and MTS calculations.
          </p>
          <p class="card-text">
            This is essential for genetic code expansion experiments where you incorporate synthetic or modified amino acids into proteins.
          </p>

          <div class="alert alert-info mt-3">
            <strong>💡 When to use:</strong> Use this tab BEFORE running STM or MTS calculations if your experiment involves non-canonical amino acids. Draw and save each ncAA structure once, then reuse it in multiple analyses.
          </div>

          <!-- Accordion for Draw Steps -->
          <div class="accordion mt-4" id="drawAccordion">
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
                  Step 1 – Draw Chemical Structure
                </button>
              </h2>
              <div
                id="drawCollapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="drawHeadingOne"
                data-bs-parent="#drawAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Use the ChemDoodle canvas</strong> to draw your ncAA structure.</p>
                  <p><strong>Drawing tools:</strong></p>
                  <ul>
                    <li>Atoms: Click to add or change atoms (C, N, O, S, etc.)</li>
                    <li>Bonds: Single, double, triple bonds</li>
                    <li>Rings: Benzene, cyclohexane, and other ring structures</li>
                    <li>Stereochemistry: Wedge/dash bonds for 3D configuration</li>
                    <li>Charges: Add formal charges if needed</li>
                  </ul>
                  <p class="mt-2"><strong>💡 Tip:</strong> Draw the complete structure of the amino acid residue as it would appear in a peptide chain (i.e., after condensation, without the separate -OH from COOH and -H from NH₂).</p>
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
                  Step 2 – Assign a Code
                </button>
              </h2>
              <div
                id="drawCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="drawHeadingTwo"
                data-bs-parent="#drawAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Enter a unique code/abbreviation</strong> for this ncAA (e.g., "B", "J", "pAF", "AzF").</p>
                  <p><strong>Requirements:</strong></p>
                  <ul>
                    <li>No spaces allowed (use single continuous string)</li>
                    <li>Must be unique (no duplicates)</li>
                    <li>Letters, numbers, and special characters are allowed</li>
                  </ul>
                  <p class="mt-2"><strong>⚠️ Important:</strong> Avoid using codes that match the 20 standard amino acid abbreviations (A, C, D, E, F, G, H, I, K, L, M, N, P, Q, R, S, T, V, W, Y) to prevent confusion in results.</p>
                  <p class="mt-2"><strong>💡 Recommendation:</strong> Use descriptive abbreviations from literature or create your own systematic naming (e.g., "pAF" for para-azido-phenylalanine).</p>
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
                  Step 3 – Calculate and Save
                </button>
              </h2>
              <div
                id="drawCollapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="drawHeadingThree"
                data-bs-parent="#drawAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Click "save ncAA"</strong> to calculate molecular properties and save.</p>
                  <p><strong>Automatically calculated:</strong></p>
                  <ul>
                    <li><strong>Molecular Formula:</strong> Chemical formula (e.g., C₁₁H₁₂N₂O₂)</li>
                    <li><strong>Monoisotopic Weight:</strong> Mass using most abundant isotopes (for MS analysis)</li>
                    <li><strong>Molecular Weight:</strong> Average mass considering natural isotope distribution</li>
                  </ul>
                  <p class="mt-2"><strong>Storage:</strong> All ncAAs are saved in your browser's local storage and will be available for future sessions.</p>
                  <p class="mt-2"><strong>Management:</strong> View saved ncAAs in the list below the canvas. Click "Delete" to remove any ncAA.</p>
                  <p class="mt-2"><strong>💡 Tip:</strong> Once saved, your ncAA is immediately available in both STM and MTS tabs. You can reuse it across multiple experiments without redrawing.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Potential Modification Section -->
    <section id="potential" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Potential Modification</h2>
          <p class="card-text">
            <strong>Purpose:</strong> Define custom chemical modifications that can be applied to peptides during STM calculations. This allows you to model post-translational modifications, chemical reactions, or any structural changes to amino acid residues.
          </p>

          <div class="alert alert-info mt-3">
            <strong>💡 Workflow:</strong>
            <ol class="mb-0">
              <li>Define and save modifications in this tab</li>
              <li>Go to STM tab and select up to 4 saved modifications</li>
              <li>Run calculation - all combinations will be generated automatically</li>
            </ol>
          </div>

          <!-- Accordion for Potential Modification -->
          <div class="accordion mt-4" id="potentialAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="potentialHeadingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#potentialCollapseOne"
                  aria-expanded="true"
                  aria-controls="potentialCollapseOne"
                >
                  Modification Type: Single-site
                </button>
              </h2>
              <div
                id="potentialCollapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="potentialHeadingOne"
                data-bs-parent="#potentialAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Single-site modifications</strong> affect one amino acid at a time. Choose where the modification occurs:</p>

                  <div class="mt-3">
                    <h6><strong>1. N-terminus (N-terminal modification)</strong></h6>
                    <ul>
                      <li><strong>Effect:</strong> Adds a chemical group to the <em>first</em> amino acid (N-terminus)</li>
                      <li><strong>Example:</strong> Formylation (fMet), acetylation, biotinylation</li>
                      <li><strong>Notation:</strong> Modification appears before amino acid (e.g., <code>fM</code> for formyl-methionine)</li>
                      <li><strong>Target options:</strong>
                        <ul>
                          <li><strong>ALL:</strong> Applies to any N-terminal amino acid</li>
                          <li><strong>Specific amino acid:</strong> Only applies when that amino acid is at N-terminus (e.g., only modify if first AA is M)</li>
                        </ul>
                      </li>
                    </ul>
                  </div>

                  <div class="mt-3">
                    <h6><strong>2. C-terminus (C-terminal modification)</strong></h6>
                    <ul>
                      <li><strong>Effect:</strong> Adds a chemical group to the <em>last</em> amino acid (C-terminus)</li>
                      <li><strong>Example:</strong> Amidation, methylation</li>
                      <li><strong>Notation:</strong> Modification appears after amino acid (e.g., <code>Mn</code> for amidated-methionine)</li>
                      <li><strong>Target options:</strong> Same as N-terminus (ALL or specific amino acid)</li>
                    </ul>
                  </div>

                  <div class="mt-3">
                    <h6><strong>3. Side Chain (internal modification)</strong></h6>
                    <ul>
                      <li><strong>Effect:</strong> Replaces a specific amino acid with its modified version <em>throughout the entire sequence</em></li>
                      <li><strong>Example:</strong> Phosphorylation (pS, pT, pY), methylation (mK), acetylation (acK)</li>
                      <li><strong>Notation:</strong> Modification replaces the amino acid letter (e.g., <code>pS</code> replaces <code>S</code>)</li>
                      <li><strong>Target:</strong> Must specify which amino acid to modify (e.g., all cysteines)</li>
                      <li><strong>Combination:</strong> System generates all possibilities (0 modified, 1 modified, 2 modified, ..., all modified)</li>
                    </ul>
                  </div>

                  <p class="mt-3"><strong>How to define:</strong></p>
                  <ol>
                    <li>Select "Single-site" type</li>
                    <li>Choose condition (N-terminus, C-terminus, or Side Chain)</li>
                    <li>Select target amino acid (or ALL for terminal modifications)</li>
                    <li>Draw the modified structure on the canvas OR load from saved templates</li>
                    <li>Assign a structure name (short code that will appear in results, e.g., "f", "p", "ac")</li>
                    <li>Calculate molecular properties</li>
                    <li>Save the modification</li>
                  </ol>

                  <div class="alert alert-warning mt-3">
                    <strong>⚠️ Mass calculation:</strong>
                    <ul class="mb-0">
                      <li><strong>N/C-terminus:</strong> Draw the complete modified amino acid. The system will automatically calculate the delta mass (difference from unmodified amino acid).</li>
                      <li><strong>Side Chain:</strong> Draw the complete structure of the modified amino acid. The system will use this absolute mass and replace the original amino acid mass during calculation.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="potentialHeadingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#potentialCollapseTwo"
                  aria-expanded="false"
                  aria-controls="potentialCollapseTwo"
                >
                  Modification Type: Crosslinking
                </button>
              </h2>
              <div
                id="potentialCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="potentialHeadingTwo"
                data-bs-parent="#potentialAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Crosslinking modifications</strong> create chemical bonds between two amino acids in the sequence.</p>

                  <p><strong>Common examples:</strong></p>
                  <ul>
                    <li><strong>Disulfide bonds:</strong> Cysteine-Cysteine (C-C → S-S bridge)</li>
                    <li><strong>Dityrosine:</strong> Tyrosine-Tyrosine crosslink</li>
                    <li><strong>Chemical crosslinkers:</strong> EDC, DSS, BS3, etc.</li>
                    <li><strong>Enzymatic crosslinks:</strong> Transglutaminase-mediated Gln-Lys bonds</li>
                  </ul>

                  <p class="mt-3"><strong>Conditions (when crosslinking occurs):</strong></p>

                  <div class="ms-3">
                    <p><strong>1. Adjacent:</strong> Two amino acids must be next to each other</p>
                    <ul>
                      <li>Example: C-C in sequence <code>...MCC...</code></li>
                    </ul>

                    <p class="mt-2"><strong>2. Adjacent (Target 1→2):</strong> Target 1 must come immediately before Target 2</p>
                    <ul>
                      <li>Example: If Target 1=C, Target 2=D, only <code>CD</code> is valid (not <code>DC</code>)</li>
                    </ul>

                    <p class="mt-2"><strong>3. Adjacent (Target 2→1):</strong> Target 2 must come immediately before Target 1</p>
                    <ul>
                      <li>Reverse of above</li>
                    </ul>

                    <p class="mt-2"><strong>4. Distance:</strong> Specify distance between the two amino acids</p>
                    <ul>
                      <li><strong>= N:</strong> Exactly N amino acids between them</li>
                      <li><strong>&lt; N:</strong> Fewer than N amino acids between them</li>
                      <li><strong>&gt; N:</strong> More than N amino acids between them</li>
                      <li>Example: Distance = 2 allows <code>...C-X-X-C...</code> (2 amino acids between cysteines)</li>
                    </ul>
                  </div>

                  <p class="mt-3"><strong>How to define:</strong></p>
                  <ol>
                    <li>Select "Crosslinking" type</li>
                    <li>Choose Target 1 and Target 2 (the two amino acids that will crosslink)</li>
                    <li>Select condition (Adjacent or Distance with operator and value)</li>
                    <li>Draw the crosslinked structure (the final product of both amino acids linked together)</li>
                    <li>Assign a structure name (e.g., "SS" for disulfide, "XL" for generic crosslink)</li>
                    <li>Calculate molecular properties</li>
                    <li>Save the modification</li>
                  </ol>

                  <p class="mt-3"><strong>Combination generation:</strong> The system automatically generates all valid crosslinking combinations:</p>
                  <ul>
                    <li>0 crosslinks (no modification)</li>
                    <li>1 crosslink (each valid pair individually)</li>
                    <li>2 crosslinks (all valid non-overlapping pairs)</li>
                    <li>3 or more (if sequence allows)</li>
                  </ul>

                  <div class="alert alert-info mt-3">
                    <strong>💡 Example: Disulfide bonds</strong><br>
                    Sequence: <code>MCCSTINCCM</code> (4 cysteines)<br>
                    Condition: Adjacent (C-C)<br>
                    Valid pairs: C₁-C₂, C₇-C₈<br>
                    Results generated:
                    <ul class="mb-0">
                      <li>No crosslink: <code>MCCSTINCCM</code></li>
                      <li>One crosslink: <code>M[SS]STINCCM</code> or <code>MCCSTIN[SS]M</code></li>
                      <li>Two crosslinks: <code>M[SS]STIN[SS]M</code></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="potentialHeadingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#potentialCollapseThree"
                  aria-expanded="false"
                  aria-controls="potentialCollapseThree"
                >
                  Power Set Combination Logic
                </button>
              </h2>
              <div
                id="potentialCollapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="potentialHeadingThree"
                data-bs-parent="#potentialAccordion"
              >
                <div class="accordion-body">
                  <p><strong>When you select multiple modifications in STM</strong>, the system generates ALL possible combinations (called a "power set").</p>

                  <p class="mt-3"><strong>Why this matters:</strong></p>
                  <p>In real biological systems, modifications may or may not occur, and multiple modifications can be present simultaneously. By generating all combinations, you can identify which scenario matches your MS data.</p>

                  <p class="mt-3"><strong>Example scenarios:</strong></p>

                  <div class="ms-3">
                    <p><strong>Scenario 1: Two N-terminus modifications selected (f1, f2)</strong></p>
                    <p>Generated results:</p>
                    <ul>
                      <li>0 modifications applied</li>
                      <li>Only f1 applied</li>
                      <li>Only f2 applied</li>
                      <li>Both f1 and f2 applied</li>
                    </ul>
                    <p>Total: <strong>4 combinations</strong> (2²)</p>

                    <p class="mt-3"><strong>Scenario 2: 2 N-terminus + 2 C-terminus modifications selected</strong></p>
                    <p>N-terminus combinations: 4 (as above)<br>
                    C-terminus combinations: 4 (same logic)<br>
                    Total: <strong>16 combinations</strong> (4 × 4)</p>

                    <p class="mt-3"><strong>Scenario 3: Maximum selection (4 N-terminus modifications)</strong></p>
                    <p>Total: <strong>16 combinations</strong> (2⁴)</p>
                    <ul>
                      <li>0 applied: 1 way</li>
                      <li>1 applied: 4 ways</li>
                      <li>2 applied: 6 ways</li>
                      <li>3 applied: 4 ways</li>
                      <li>4 applied: 1 way</li>
                    </ul>
                  </div>

                  <div class="alert alert-success mt-3">
                    <strong>💡 Key insight:</strong> You don't need to manually test each combination. Select up to 4 modifications that MIGHT be present, and the system will automatically calculate all possibilities. Then compare the results with your MS data to identify which modifications are actually present.
                  </div>

                  <p class="mt-3"><strong>⚠️ Limitation:</strong> Maximum 4 modifications can be selected to keep computation manageable. If you need more, you can run separate calculations and compare results.</p>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="potentialHeadingFour">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#potentialCollapseFour"
                  aria-expanded="false"
                  aria-controls="potentialCollapseFour"
                >
                  Using Load Template
                </button>
              </h2>
              <div
                id="potentialCollapseFour"
                class="accordion-collapse collapse"
                aria-labelledby="potentialHeadingFour"
                data-bs-parent="#potentialAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Load Template</strong> allows you to reuse chemical structures you previously saved in the "Add ncAA" tab.</p>

                  <p class="mt-2"><strong>Workflow:</strong></p>
                  <ol>
                    <li>Go to "Add ncAA" tab and draw/save common structures (e.g., phospho-group, acetyl-group)</li>
                    <li>Return to Potential Modification tab</li>
                    <li>Click "Load Template"</li>
                    <li>Select the saved structure</li>
                    <li>The structure will load into the canvas</li>
                    <li>Add modification-specific information (target, condition, etc.)</li>
                    <li>Save as a Potential Modification</li>
                  </ol>

                  <p class="mt-3"><strong>💡 Tip:</strong> This saves time if you use the same chemical groups repeatedly (e.g., phosphate, methyl, acetyl groups).</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tips and Best Practices Section -->
    <section id="tips" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Tips & Best Practices</h2>

          <div class="accordion" id="tipsAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="tipsHeadingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#tipsCollapseOne"
                  aria-expanded="true"
                  aria-controls="tipsCollapseOne"
                >
                  General Workflow
                </button>
              </h2>
              <div
                id="tipsCollapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="tipsHeadingOne"
                data-bs-parent="#tipsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>Recommended order:</strong></p>
                  <ol>
                    <li><strong>Preparation phase:</strong>
                      <ul>
                        <li>Define and save ncAAs (if using genetic code expansion)</li>
                        <li>Define and save Potential Modifications (if modeling PTMs)</li>
                      </ul>
                    </li>
                    <li><strong>Prediction phase (STM):</strong>
                      <ul>
                        <li>Enter RNA sequence</li>
                        <li>Configure parameters (amino acids, ncAAs, modifications)</li>
                        <li>Calculate to get expected masses</li>
                      </ul>
                    </li>
                    <li><strong>Identification phase (MTS):</strong>
                      <ul>
                        <li>Take observed MS peaks</li>
                        <li>Use MTS to identify unknown sequences</li>
                        <li>Provide as much known information as possible</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="tipsHeadingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#tipsCollapseTwo"
                  aria-expanded="false"
                  aria-controls="tipsCollapseTwo"
                >
                  Data Management
                </button>
              </h2>
              <div
                id="tipsCollapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="tipsHeadingTwo"
                data-bs-parent="#tipsAccordion"
              >
                <div class="accordion-body">
                  <ul>
                    <li><strong>Local storage:</strong> All your data (ncAAs, modifications, sequences) is stored in your browser. It persists across sessions but is specific to this browser.</li>
                    <li><strong>Backup:</strong> Currently, there's no export/import function. Keep records of your ncAA structures and modification definitions separately.</li>
                    <li><strong>Browser data:</strong> Clearing browser data will delete all saved structures and modifications.</li>
                    <li><strong>Excel export:</strong> You can export result tables to Excel for further analysis and record-keeping.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h2 class="accordion-header" id="tipsHeadingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#tipsCollapseThree"
                  aria-expanded="false"
                  aria-controls="tipsCollapseThree"
                >
                  Troubleshooting
                </button>
              </h2>
              <div
                id="tipsCollapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="tipsHeadingThree"
                data-bs-parent="#tipsAccordion"
              >
                <div class="accordion-body">
                  <p><strong>STM returns too many results:</strong></p>
                  <ul>
                    <li>Deselect amino acids that weren't present in your experiment</li>
                    <li>Limit the number of selected Potential Modifications</li>
                    <li>Check if ncAA codon assignments are correct</li>
                  </ul>

                  <p class="mt-3"><strong>MTS doesn't find good matches:</strong></p>
                  <ul>
                    <li>Try a higher algorithm mode (Deep Think or Ultra Think)</li>
                    <li>Verify the detected mass is accurate</li>
                    <li>Double-check the adduct selection</li>
                    <li>Provide RNA sequence if available</li>
                    <li>Check if formylation setting is correct</li>
                  </ul>

                  <p class="mt-3"><strong>Mass doesn't match expected value:</strong></p>
                  <ul>
                    <li>Verify ncAA structures are drawn correctly</li>
                    <li>Check if water loss is being calculated correctly (peptide bond formation)</li>
                    <li>Ensure adduct mass is included/excluded appropriately</li>
                    <li>Confirm modification structures are accurate</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <style>
    .container {
      padding-left: 0;
      padding-right: 0;
    }

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
    .table {
      margin-top: 1rem;
    }
    code {
      background-color: #f8f9fa;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }

    /* 모바일 반응형 */
    @media (max-width: 767px) {
      .container {
        margin-top: 0 !important;
        margin-bottom: 1rem !important;
      }

      .navbar {
        padding: 0.5rem 1rem;
      }

      .navbar-brand {
        font-size: 1rem;
      }

      .nav-link {
        font-size: 0.9rem;
        padding: 0.5rem;
      }

      .card {
        margin-bottom: 1rem;
        border-radius: 8px;
      }

      .card-body {
        padding: 1rem;
      }

      .card-title {
        font-size: 1.5rem;
      }

      h2 {
        font-size: 1.5rem;
      }

      h6 {
        font-size: 1rem;
      }

      .accordion-button {
        font-size: 0.95rem;
        padding: 0.75rem 1rem;
      }

      .accordion-body {
        font-size: 0.9rem;
        padding: 1rem;
      }

      .alert {
        font-size: 0.9rem;
        padding: 0.75rem;
      }

      .table {
        font-size: 0.85rem;
      }

      code {
        font-size: 0.85rem;
        padding: 1px 4px;
      }

      ul, ol {
        padding-left: 1.25rem;
      }

      .ms-3 {
        margin-left: 0.75rem !important;
      }
    }

    /* 태블릿 */
    @media (min-width: 768px) and (max-width: 1023px) {
      .card-body {
        padding: 1.5rem;
      }

      .accordion-button {
        font-size: 1rem;
      }

      .accordion-body {
        font-size: 0.95rem;
      }
    }

    /* 테이블 가로 스크롤 (모바일) */
    @media (max-width: 767px) {
      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .table {
        min-width: 500px;
      }
    }
  </style>
