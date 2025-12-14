<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Modal from '$lib/components/Modal.svelte';
    import { formatFormula } from '$lib/helper/formula_util';
    import { SingleSiteCondition, type PotentialModification } from '../../../type/Types';
    import type { MoleculeJson } from '$lib/model/atom';

    export let showDialog: boolean = false;
    export let availableModifications: PotentialModification[] = [];

    const dispatch = createEventDispatcher();

    // 기본 Formylation 객체 (스토리지에 저장되지 않음)
    const formylationModification: PotentialModification = {
        name: 'Formylation',
        type: 'Single-site',
        condition: SingleSiteCondition.N_TERMINUS,
        target: 'All',
        molecularFormula: 'CHO',
        monoisotopicWeight: '27.99',
        molecularWeight: '29.02',
        structureName: 'f',
        moleculeJson: {} as MoleculeJson
    };

    // 사용 가능한 modification 목록 (Formylation + 사용자 정의 modifications)
    $: allModifications = [formylationModification, ...availableModifications];

    function handleSelect(mod: PotentialModification) {
        dispatch('select', mod);
        showDialog = false;
    }

    function getModificationInfo(mod: PotentialModification): string {
        if (mod.type === 'Single-site') {
            return `${mod.condition} | Target: ${mod.target}`;
        } else {
            let info = `${mod.condition} | Targets: ${mod.target1}-${mod.target2}`;
            if (mod.condition === 'Distance' && mod.distanceOperator && mod.distanceValue !== undefined) {
                info += ` (${mod.distanceOperator} ${mod.distanceValue})`;
            }
            return info;
        }
    }
</script>

{#if showDialog}
    <Modal onClose={() => showDialog = false}>
        <div class="dialog-header">
            <h5>Select Potential Modification</h5>
            <p class="text-muted small">Choose a modification to apply</p>
        </div>

        <ul class="list-group">
            {#each allModifications as mod (mod.name)}
                <li
                    class="list-group-item list-group-item-action modification-list-item"
                    on:click={() => handleSelect(mod)}
                    on:keypress={(e) => e.key === 'Enter' && handleSelect(mod)}
                    role="button"
                    tabindex="0"
                >
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-1 modification-name">{mod.name}</h6>
                            <p class="mb-1 text-muted small">{getModificationInfo(mod)}</p>
                            <div class="modification-properties">
                                <span class="badge bg-light text-dark me-1">
                                    {mod.type}
                                </span>
                                <span class="text-muted small">
                                    Formula: <span class="formula">{@html formatFormula(mod.molecularFormula)}</span> |
                                    Weight: {mod.monoisotopicWeight}
                                </span>
                            </div>
                        </div>
                        <i class="bi bi-chevron-right text-muted"></i>
                    </div>
                </li>
            {/each}
        </ul>
    </Modal>
{/if}

<style>
    .dialog-header {
        padding: 0 0 1rem 0;
        border-bottom: 1px solid #dee2e6;
        margin-bottom: 1rem;
    }

    .dialog-header h5 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .dialog-header p {
        margin: 0.25rem 0 0 0;
    }

    .modification-list-item {
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .modification-list-item:hover {
        background-color: #f8f9fa;
    }

    .modification-name {
        color: #0d6efd;
        font-weight: 600;
        font-size: 1rem;
    }

    .modification-properties {
        margin-top: 0.5rem;
    }

    .list-group {
        max-height: 400px;
        overflow-y: auto;
    }

    .alert {
        margin-bottom: 0;
    }

    .formula {
        font-family: 'Times New Roman', Times, serif;
    }
</style>
