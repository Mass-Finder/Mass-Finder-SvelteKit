<script>
  import { goto } from '$app/navigation';

  // Function to navigate to a specified academic route
  function navigateTo(path) {
    goto(path);
  }
</script>

<div class="container py-5">
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card shadow-sm border-0" style="background-color: #fdfdfd;">
        <div class="card-body text-center">
          <h1 class="card-title mb-4" style="font-family: 'Times New Roman', serif;">
            Mass Finder
          </h1>
          <p class="card-text mb-4" style="font-size: 1.1rem; color: #555;">
            Provides various functionalities for chemical molecular sequences.
          </p>
          <div class="d-grid gap-3">
            <button class="btn btn-outline-warning btn-lg" on:click={() => navigateTo('/manual')}>
              Mass Finder Manual
            </button>
            <button class="btn btn-outline-secondary btn-lg" on:click={() => navigateTo('/stm')}>
              Sequence to Mass Calculation
            </button>
            <button class="btn btn-outline-success btn-lg" on:click={() => navigateTo('/mts')}>
              Mass to Sequence Analysis
            </button>
            <button class="btn btn-outline-primary btn-lg" on:click={() => navigateTo('/draw')}>
              Chemical Structure Drawing
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
