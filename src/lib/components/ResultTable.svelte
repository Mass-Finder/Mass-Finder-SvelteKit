<script>
  import { adductPrintName } from "$lib/helper/amino_mapper";

  export let bestSolutions = [];
  export let detectedMass;
  export let fullNcAA;

  let sortOrder = {
    no: false,
    mass: false,
    difference: false,
  };

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

  function sortSolutions(key) {
    sortOrder[key] = !sortOrder[key];
    bestSolutions = [...bestSolutions].sort((a, b) => {
      let comparison = 0;
      if (key === 'mass') {
        comparison = a.weight - b.weight;
      } else if (key === 'molecularWeight') {
        comparison = a.molecularWeight - b.molecularWeight;
      }
      return sortOrder[key] ? -comparison : comparison;
    });
  }
</script>

<!-- Bootstrap Table -->
<div class="table-responsive mt-3">
  <table class="table table-striped table-hover">
    <thead class="table-light">
      <tr>
        <th scope="col">No. </th>
        <th scope="col" on:click={() => sortSolutions('mass')} style="cursor: pointer;">Monoisotopic Weight {sortOrder.mass ? '▲' : '▼'}</th>
        <th scope="col" on:click={() => sortSolutions('molecularWeight')} style="cursor: pointer;">Molecular Weight {sortOrder.molecularWeight ? '▲' : '▼'}</th>
        <th scope="col">Sequence</th>
        <th scope="col">Adduct</th>
        <th scope="col">Difference</th>
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
        </tr>
      {/each}
    </tbody>
  </table>
</div>
