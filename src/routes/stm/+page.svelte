<script>
    import SeqConverter from '$lib/components/stm/SeqConverter.svelte';
    import AminoMapSelector from '$lib/components/AminoMapSelector.svelte';
    import { aminoMap } from '$lib/helper/amino_mapper';

    let selectedAminos = { ...aminoMap };


    function handleAminoMapChange(newAminos) {
        selectedAminos = Object.fromEntries(
        Object.entries(newAminos)
            .filter(([key, value]) => value)
            .map(([key]) => [key, aminoMap[key]])
        );
    }


</script>

<div class="container mt-5">
    <div class="text-center mb-4">
      <h1>Sequence to Mass</h1>
    </div>

    <div class="mb-3">
        <label for="detected-mass" class="form-label fw-bold">Sequnece</label>
        <SeqConverter></SeqConverter>
    </div>

    <div class="mb-3">
        <AminoMapSelector on:changeAminos={(e) => handleAminoMapChange(e.detail)} />
    </div>
</div>