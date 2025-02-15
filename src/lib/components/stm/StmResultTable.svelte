<script>
  import { adductPrintName, aminoMap } from '$lib/helper/amino_mapper';

  export let possibilities = [];
  
  // 선택된 필터를 객체로 관리
  let selectedFilters = {
    'Only natural AA': false,
    'Truncated': false,
    'ncAA incorporated': false,
    'Skipped': false,
    'Disulfide': false
  };

  // 정렬 상태 관리
  let sortState = {
    monoisotopicWeight: 0,
    molecularWeight: 0,
    sequence: 0  // 0: 초기상태, 1: 오름차순, 2: 내림차순
  };

  const noteOptions = Object.keys(selectedFilters);

  // 필터링 및 정렬 로직
  $: filteredPossibilities = possibilities
    .filter(solution => {
      const activeFilters = Object.entries(selectedFilters).filter(([_, isSelected]) => isSelected);
      if (activeFilters.length === 0) return true;
      if (!solution.reasons || solution.reasons.length === 0) return selectedFilters['Only natural AA'];
      return activeFilters.some(([filter]) => solution.reasons.includes(filter));
    })
    .sort((a, b) => {
      // Monoisotopic Weight 정렬
      if (sortState.monoisotopicWeight === 1) {
        return a.weight - b.weight;
      } else if (sortState.monoisotopicWeight === 2) {
        return b.weight - a.weight;
      }
      
      // Molecular Weight 정렬
      if (sortState.molecularWeight === 1) {
        return a.molecularWeight - b.molecularWeight;
      } else if (sortState.molecularWeight === 2) {
        return b.molecularWeight - a.molecularWeight;
      }

      // Sequence Length 정렬
      if (sortState.sequence === 1) {
        return a.sequence.length - b.sequence.length;
      } else if (sortState.sequence === 2) {
        return b.sequence.length - a.sequence.length;
      }
      
      return 0;
    });

  function handleFilterChange(filter) {
    selectedFilters[filter] = !selectedFilters[filter];
  }

  function handleSort(column) {
    // 다른 컬럼의 정렬 상태 초기화
    Object.keys(sortState).forEach(key => {
      if (key !== column) sortState[key] = 0;
    });
    
    // 선택된 컬럼의 정렬 상태 순환
    sortState[column] = (sortState[column] + 1) % 3;
  }
  
  function formatReasons(reasons) {
    if (!reasons || reasons.length === 0) {
      return 'Only natural AA';
    }
    const counts = {};
    reasons.forEach(r => {
      counts[r] = (counts[r] || 0) + 1;
    });
    const formatted = Object.entries(counts).map(([r, count]) => {
      return count > 1 ? `${r} (x${count})` : r;
    });
    return formatted.join(', ');
  }

  function isDisulfideIndex(solution, index) {
    if (!solution.disulfide) return false;
    return solution.disulfide.some(pair => pair[0] === index || pair[1] === index);
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
        <th 
          scope="col" 
          class="sortable-header"
          on:click={() => handleSort('monoisotopicWeight')}
        >
          Monoisotopic Weight
          {#if sortState.monoisotopicWeight === 1}
            <span class="sort-icon">↑</span>
          {:else if sortState.monoisotopicWeight === 2}
            <span class="sort-icon">↓</span>
          {:else}
            <span class="sort-icon">↕</span>
          {/if}
        </th>
        <th 
          scope="col"
          class="sortable-header"
          on:click={() => handleSort('molecularWeight')}
        >
          Molecular Weight
          {#if sortState.molecularWeight === 1}
            <span class="sort-icon">↑</span>
          {:else if sortState.molecularWeight === 2}
            <span class="sort-icon">↓</span>
          {:else}
            <span class="sort-icon">↕</span>
          {/if}
        </th>
        <th 
          scope="col"
          class="sortable-header"
          on:click={() => handleSort('sequence')}
        >
          Sequence
          {#if sortState.sequence === 1}
            <span class="sort-icon">↑</span>
          {:else if sortState.sequence === 2}
            <span class="sort-icon">↓</span>
          {:else}
            <span class="sort-icon">↕</span>
          {/if}
        </th>
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
          <td>
            {#each solution.sequence as letter, letterIndex}
              <span class:text-danger={!letter.natural}>
                {letter.letter}
                {#if isDisulfideIndex(solution, letterIndex)}
                  <sup class="disulfide-marker">d</sup>
                {/if}
              </span>
            {/each}
          </td>
          <td>{adductPrintName(solution.adduct) || '-'}</td>
          <td>{formatReasons(solution.reasons)}</td>
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

  .sortable-header {
    cursor: pointer;
    user-select: none;
    position: relative;
    padding-right: 1.5rem;
  }

  .sortable-header:hover {
    background-color: #e9ecef;
  }

  .sort-icon {
    position: absolute;
    right: 0.5rem;
    color: #666;
  }

  th {
    white-space: nowrap;
  }

  .disulfide-marker {
    font-size: 0.7em;
    color: #666;
    margin-left: -5px;
  }

  .text-danger {
    color: red;
  }
</style>
