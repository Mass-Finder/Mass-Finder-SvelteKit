<script lang="ts">
    import type { PotentialModification } from '../../../type/Types';

    export let modification: PotentialModification;
    export let onRemove: () => void;

    function getModificationInfo(mod: PotentialModification): string {
        if (mod.type === 'Single-site') {
            return `${mod.condition} | Target: ${mod.target}`;
        } else {
            let info = `${mod.condition} | ${mod.target1}-${mod.target2}`;
            if (mod.condition === 'Distance' && mod.distanceOperator && mod.distanceValue !== undefined) {
                info += ` (${mod.distanceOperator} ${mod.distanceValue})`;
            }
            return info;
        }
    }
</script>

<div class="modification-item-card">
    <div class="modification-header">
        <h6 class="modification-name">{modification.name}</h6>
        <span class="badge bg-info type-badge">{modification.type}</span>
    </div>

    <div class="modification-details">
        <p class="detail-text">{getModificationInfo(modification)}</p>
        <p class="detail-text mb-1">
            <strong>Formula:</strong> {modification.molecularFormula}
        </p>
        <p class="detail-text mb-0">
            <strong>Weight:</strong> {modification.monoisotopicWeight}
        </p>
    </div>

    <button
        class="btn btn-danger btn-sm w-100 mt-2"
        on:click={onRemove}
    >
        Remove
    </button>
</div>

<style>
    .modification-item-card {
        padding: 0.75rem;
        height: 100%;
        display: flex;
        flex-direction: column;
    }

    .modification-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.5rem;
    }

    .modification-name {
        font-size: 0.95rem;
        font-weight: 600;
        color: #0d6efd;
        margin: 0;
        flex: 1;
        word-break: break-word;
    }

    .type-badge {
        font-size: 0.7rem;
        margin-left: 0.5rem;
        white-space: nowrap;
    }

    .modification-details {
        flex: 1;
        font-size: 0.85rem;
    }

    .detail-text {
        margin-bottom: 0.25rem;
        color: #495057;
        font-size: 0.8rem;
    }

    button {
        font-size: 0.8rem;
    }
</style>
