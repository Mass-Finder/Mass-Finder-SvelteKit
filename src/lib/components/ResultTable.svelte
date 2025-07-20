<script>
  import { adductPrintName } from "$lib/helper/amino_mapper";

  export let bestSolutions = [];
  export let detectedMass;
  export let fullNcAA;
  export let hasReferenceSequence = false;

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
</script>

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
          <th scope="col">Seq. Similarity (%)</th>
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
              {#if solution.sequenceSimilarity !== undefined}
                <span class="badge" style="background-color: {solution.sequenceSimilarity > 70 ? '#28a745' : solution.sequenceSimilarity > 40 ? '#ffc107' : '#dc3545'}; color: white;">
                  {solution.sequenceSimilarity.toFixed(1)}%
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
