<script>
    import { createEventDispatcher } from "svelte";
    import { storage } from '$lib/services/storage.service';

    export let showDialog = false;

    let savedSequences = [];
    const dispatch = createEventDispatcher();

    $: if (showDialog) {
        loadSavedSequences();
    }

    function loadSavedSequences() {
        savedSequences = storage.load("savedRnaSeqs") || [];
    }

    function handleSelect(content) {
        dispatch("select", { content });
        handleClose();
    }

    function handleClose() {
        showDialog = false;
        dispatch("close");
    }

    function deleteSequence(index, event) {
        event.stopPropagation(); // 버튼 클릭이 sequence-item 클릭으로 전파되는 것을 방지
        savedSequences = savedSequences.filter((_, i) => i !== index);
        storage.save("savedRnaSeqs", savedSequences);
    }
</script>

{#if showDialog}
    <div class="dialog-overlay">
        <div class="dialog-content">
            <h2 class="dialog-title">Load Sequence</h2>

            <div class="sequence-list">
                {#if savedSequences.length === 0}
                    <p class="text-muted text-center">
                        No saved sequences found.
                    </p>
                {:else}
                    {#each savedSequences as sequence, index}
                        <div class="sequence-item-wrapper">
                            <button
                                type="button"
                                class="sequence-item btn btn-light w-100 text-start"
                                on:click={() => handleSelect(sequence.content)}
                            >
                                <div class="sequence-title">
                                    {sequence.title || "Untitled"}
                                </div>
                                <div class="sequence-content">
                                    {sequence.content}
                                </div>
                            </button>
                            <button
                                type="button"
                                class="btn btn-outline-danger delete-btn"
                                on:click={(e) => deleteSequence(index, e)}
                                title="Delete sequence"
                            >
                                ×
                            </button>
                        </div>
                    {/each}
                {/if}
            </div>

            <div class="dialog-actions">
                <button
                    type="button"
                    class="btn btn-secondary"
                    on:click={handleClose}
                >
                    Close
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .dialog-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        width: 100%;
        max-width: 500px;
        max-height: 80vh;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        display: flex;
        flex-direction: column;
    }

    .dialog-title {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
    }

    .sequence-list {
        flex: 1;
        overflow-y: auto;
        margin-bottom: 1.5rem;
    }

    .sequence-item {
        padding: 1rem;
        border: 1px solid #dee2e6;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .sequence-item:hover {
        background-color: #f8f9fa;
        border-color: #adb5bd;
    }

    .sequence-title {
        font-weight: bold;
        margin-bottom: 0.5rem;
    }

    .sequence-content {
        font-family: monospace;
        word-break: break-all;
        color: #666;
    }

    .dialog-actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 1rem;
    }

    .sequence-item-wrapper {
        position: relative;
        display: flex;
        align-items: stretch;
        margin-bottom: 0.5rem;
    }

    .sequence-item {
        margin-bottom: 0;
        flex-grow: 1;
    }

    .delete-btn {
        margin-left: 0.5rem;
        padding: 0 0.75rem;
        font-size: 1.5rem;
        line-height: 1;
        align-self: stretch;
    }
</style>
