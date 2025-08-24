<script>
  import { adductPrintName } from "$lib/helper/amino_mapper";

  export let bestSolutions = [];
  export let detectedMass;
  export let fullNcAA;
  export let hasReferenceSequence = false;
  export let maxResultCount = 20;

  function calculateDifference(target, value) {
    return Math.abs(target - value);
  }

  function replaceWithTitles(inputString) {
    return inputString.split("").map((char) => {
      if (fullNcAA[char]) {
        return { char: fullNcAA[char].title, isReplaced: true };
      } else {
        return { char, isReplaced: false };
      }
    });
  }

  function downloadExcel() {
    const headers = [
      "No.",
      "Monoisotopic Weight",
      "Molecular Weight", 
      "Sequence",
      "Adduct",
      "Difference"
    ];
    
    if (hasReferenceSequence) {
      headers.push("Seq. Similarity");
    }

    const rows = bestSolutions.map((solution, index) => {
      const sequence = replaceWithTitles(solution.code).map(part => part.char).join("");
      const row = [
        index + 1,
        solution.weight.toFixed(3),
        solution.molecularWeight.toFixed(3),
        sequence,
        adductPrintName(solution.ionType),
        calculateDifference(detectedMass, solution.weight).toFixed(3)
      ];
      
      if (hasReferenceSequence) {
        if (solution.sequenceSimilarity !== undefined && solution.matchedCount !== undefined && solution.totalCount !== undefined) {
          row.push(`${solution.matchedCount}/${solution.totalCount}(${solution.sequenceSimilarity.toFixed(1)}%)`);
        } else {
          row.push("-");
        }
      }
      
      return row;
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `mass_finder_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<!-- Header with Excel Download Button and Max Result Count -->
{#if bestSolutions.length > 0}
  <div class="d-flex justify-content-end align-items-center mb-3 results-header">
    <div class="d-flex align-items-center gap-3">
      <div class="max-result-selector">
        <label for="solution-count" class="form-label fw-bold mb-0 me-2">Max Result Count</label>
        <select
          id="solution-count"
          class="form-select"
          bind:value={maxResultCount}
        >
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
      <button type="button" class="btn btn-success" on:click={downloadExcel}>
        <i class="fas fa-download me-2"></i>Download Excel
      </button>
    </div>
  </div>
{/if}

<!-- Bootstrap Table -->
<div class="table-responsive mt-3">
  <table class="table table-striped table-hover">
    <thead class="table-light">
      <tr>
        <th scope="col">No. </th>
        <th scope="col">Monoisotopic Weight</th>
        <th scope="col">Molecular Weight</th>
        <th scope="col">Sequence</th>
        <th scope="col">Adduct</th>
        <th scope="col">Difference</th>
        {#if hasReferenceSequence}
          <th scope="col">Seq. Similarity</th>
        {/if}
      </tr>
    </thead>
    <tbody>
      {#each bestSolutions as solution, index}
        <tr>
          <td>{index + 1}</td>
          <td>{solution.weight.toFixed(3)}</td>
          <td>{solution.molecularWeight.toFixed(3)}</td>
          <td>
            {#each replaceWithTitles(solution.code) as part}
              <span style="color: {part.isReplaced ? 'red' : 'inherit'}">{part.char}</span>
            {/each}
          </td>
          <td>{adductPrintName(solution.ionType)}</td>
          <td>{calculateDifference(detectedMass, solution.weight).toFixed(3)}</td>
          {#if hasReferenceSequence}
            <td>
              {#if solution.sequenceSimilarity !== undefined && solution.matchedCount !== undefined && solution.totalCount !== undefined}
                <span class="badge" style="background-color: {solution.sequenceSimilarity > 70 ? '#28a745' : solution.sequenceSimilarity > 40 ? '#ffc107' : '#dc3545'}; color: white;">
                  {solution.matchedCount}/{solution.totalCount}({solution.sequenceSimilarity.toFixed(1)}%)
                </span>
              {:else}
                <span class="text-muted">-</span>
              {/if}
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .results-header {
    margin-top: 2rem;
  }
  
  .max-result-selector {
    display: flex;
    align-items: center;
  }
  
  .max-result-selector .form-select {
    width: auto;
    min-width: 80px;
  }
  
  @media (max-width: 768px) {
    .d-flex.justify-content-end {
      flex-direction: column;
      align-items: flex-end;
      gap: 1rem;
    }
    
    .d-flex.align-items-center.gap-3 {
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
      width: 100%;
    }
    
    .max-result-selector {
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }
    
    .max-result-selector .form-select {
      width: 120px;
    }
  }
</style>
