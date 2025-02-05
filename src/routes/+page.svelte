<script>
  import { goto } from '$app/navigation';

  // 버튼 클릭 시 지정된 경로로 이동하는 함수
  function navigateTo(path) {
    goto(path);
  }
</script>

<div class="container d-flex justify-content-center align-items-center" style="min-height: 100vh;">
  <div class="text-center">
    <h1 class="mb-4">메인 메뉴</h1>
    <div class="d-grid gap-3">
      <button class="btn btn-primary btn-lg" on:click={() => navigateTo('/draw')}>
        Chemical Draw
      </button>
      <button class="btn btn-secondary btn-lg" on:click={() => navigateTo('/stm')}>
        Sequence To Mass
      </button>
      <button class="btn btn-success btn-lg" on:click={() => navigateTo('/mts')}>
        Mass To Sequence
      </button>
      <button class="btn btn-info btn-lg" on:click={() => navigateTo('/draw')}>
        Chemical Draw
      </button>
    </div>
  </div>
</div>
