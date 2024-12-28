<script>
  import { adductPrintName } from '$lib/helper/amino_mapper';

  export let possibilities = [];

</script>

<!-- Bootstrap Table -->
<div class="table-responsive mt-3">
  <table class="table table-striped table-hover">
    <thead class="table-light">
      <tr>
        <th scope="col">No.</th>
        <th scope="col">Mass</th>
        <th scope="col">Sequence</th>
        <th scope="col">Adduct</th>
        <th scope="col">Note</th>
      </tr>
    </thead>
    <tbody>
      {#each possibilities as solution, index}
        <tr>
          <td>{index + 1}</td>
          <td>{solution.weight.toFixed(3)}</td>
          <td>{solution.sequence.join('')}</td>
          <td>{adductPrintName(solution.adduct) || '-'}</td>
          <td>{solution.reason || 'Theoretical value'}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
