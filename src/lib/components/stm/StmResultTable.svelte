<script>
  import { adductPrintName } from '$lib/helper/amino_mapper';

  export let possibilities = [];
  let selectedNoteFilter = 'All Notes';

  const noteOptions = ['All Notes', 'Only natural AA', 'Truncated', 'ncAA incorporated', 'Skipped'];

  $: filteredPossibilities = filterPossibilities(selectedNoteFilter, possibilities);

  function filterPossibilities(filter, possibilities) {
    if (filter === 'All Notes') {
      return possibilities;
    }
    return possibilities.filter(solution => 
      solution.reason && solution.reason.includes(filter)
    );
  }
</script>

<!-- Bootstrap Table -->
<div class="table-responsive mt-3">
  <table class="table table-striped table-hover">
    <thead class="table-light">
      <tr>
        <th scope="col">No.</th>
        <th scope="col">Monoisotopic Weight</th>
        <th scope="col">Molecular Weight</th>
        <th scope="col">Sequence</th>
        <th scope="col">Adduct</th>
        <th scope="col">
          <select class="form-select" bind:value={selectedNoteFilter}>
            {#each noteOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each filteredPossibilities as solution, index}
        <tr>
          <td>{index + 1}</td>
          <td>{solution.weight.toFixed(3)}</td>
          <td>{solution.molecularWeight.toFixed(3)}</td>
          <td>{solution.sequence.join('')}</td>
          <td>{adductPrintName(solution.adduct) || '-'}</td>
          <td>{solution.reason || 'Only natural AA'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
