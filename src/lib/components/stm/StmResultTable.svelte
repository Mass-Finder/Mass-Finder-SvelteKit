<script>
  import { adductPrintName } from '$lib/helper/amino_mapper';

  export let possibilities = [];
  
  // 선택된 필터를 객체로 관리
  let selectedFilters = {
    'Only natural AA': false,
    'Truncated': false,
    'ncAA incorporated': false,
    'Skipped': false
  };

  const noteOptions = Object.keys(selectedFilters);

  // 필터링 로직 수정
  $: filteredPossibilities = possibilities.filter(solution => {
    // 선택된 필터가 없으면 모든 결과 표시
    const activeFilters = Object.entries(selectedFilters).filter(([_, isSelected]) => isSelected);
    if (activeFilters.length === 0) return true;

    // solution.reason이 없고 필터에 'Only natural AA'가 선택된 경우
    if (!solution.reason && selectedFilters['Only natural AA']) return true;

    // solution.reason이 있는 경우, 선택된 필터 중 하나라도 포함되어 있으면 표시
    return solution.reason && activeFilters.some(([filter]) => solution.reason.includes(filter));
  });

  function handleFilterChange(filter) {
    selectedFilters[filter] = !selectedFilters[filter];
  }
</script>

<!-- Bootstrap Table -->
<div class="table-responsive mt-3">
  <div class="filter-section mb-3">
    <div class="filter-label mb-2">Filter by:</div>
    <div class="filter-options">
      {#each noteOptions as option}
        <label class="filter-checkbox">
          <input
            type="checkbox"
            checked={selectedFilters[option]}
            on:change={() => handleFilterChange(option)}
          />
          <span class="filter-text">{option}</span>
        </label>
      {/each}
    </div>
  </div>

  <table class="table table-striped table-hover">
    <thead class="table-light">
      <tr>
        <th scope="col">No.</th>
        <th scope="col">Monoisotopic Weight</th>
        <th scope="col">Molecular Weight</th>
        <th scope="col">Sequence</th>
        <th scope="col">Adduct</th>
        <th scope="col">Note</th>
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

<style>
  .filter-section {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 4px;
  }

  .filter-label {
    font-weight: 600;
    color: #495057;
  }

  .filter-options {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .filter-checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  .filter-text {
    font-size: 0.9rem;
    color: #495057;
  }

  input[type="checkbox"] {
    width: 1rem;
    height: 1rem;
    cursor: pointer;
  }
</style>
