<script>
  import { adductPrintName } from "$lib/helper/amino_mapper";

  export let bestSolutions = [];
  export let detectedMass;
  export let fullNcAA;

  function calculateDifference(target, value) {
    return Math.abs(target - value);
  }

  // ncAA 의 타이틀로 치환해줌, 치환된 여부를 포함한 배열 반환
  function replaceWithTitles(inputString) {
    return inputString.split("").map((char) => {
      if (fullNcAA[char]) {
        return { char: fullNcAA[char].title, isReplaced: true }; // 치환된 경우
      } else {
        return { char, isReplaced: false }; // 치환되지 않은 경우
      }
    });
  }
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
        <th scope="col">Difference</th>
      </tr>
    </thead>
    <tbody>
      {#each bestSolutions as solution, index}
        <tr>
          <td>{index + 1}</td>
          <td>{solution.weight.toFixed(3)}</td>
          <td>
            {#each replaceWithTitles(solution.code) as part}
              <!-- 치환된 글자는 빨간색으로 표시 -->
              <span style="color: {part.isReplaced ? 'red' : 'inherit'}"
                >{part.char}</span
              >
            {/each}
          </td>
          <td>{adductPrintName(solution.ionType)}</td>
          <td
            >{calculateDifference(detectedMass, solution.weight).toFixed(3)}</td
          >
        </tr>
      {/each}
    </tbody>
  </table>
</div>
