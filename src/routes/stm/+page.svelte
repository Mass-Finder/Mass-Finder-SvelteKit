<script>
      import SeqConverter from '$lib/components/stm/SeqConverter.svelte';

</script>

<div class="container mt-5">
    <div class="text-center mb-4">
      <h1>Sequence to Mass</h1>
    </div>

    <div class="mb-3">
        <label for="detected-mass" class="form-label fw-bold">Sequnece</label>
        <SeqConverter></SeqConverter>
      </div>
</div>