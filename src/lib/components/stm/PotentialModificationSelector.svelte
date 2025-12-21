<script lang="ts">
    import { onMount } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    import { writable } from 'svelte/store';
    import type { PotentialModification } from '../../../type/Types';
    import PotentialModificationDialog from './PotentialModificationDialog.svelte';
    import PotentialModificationSelectItem from './PotentialModificationSelectItem.svelte';
    import { storage } from '$lib/services/storage.service';

    const dispatch = createEventDispatcher();
    const MAX_SELECTION = 4;

    // 로컬 스토리지에 저장된 모든 modification들
    let savedModifications = writable<PotentialModification[]>([]);

    // 슬롯에 선택된 modification들 (최대 4개)
    let selectedSlots = writable<Array<PotentialModification | null>>([null, null, null, null]);

    let showDialog = false;
    let currentSlotIndex = 0;

    onMount(() => {
        loadSavedModifications();
    });

    function loadSavedModifications() {
        const storedData = storage.load<PotentialModification[]>('potentialModifications');
        if (storedData) {
            savedModifications.set(storedData);
        }
    }

    function openDialog(slotIndex: number) {
        if ($savedModifications.length === 0) {
            alert('There are no modifications created.');
            return;
        }
        currentSlotIndex = slotIndex;
        showDialog = true;
    }

    function handleSelect(event: CustomEvent<PotentialModification>) {
        const selectedMod = event.detail;

        // 이미 다른 슬롯에 선택되어 있는지 확인
        const alreadySelected = $selectedSlots.some(
            (slot, idx) => slot && slot.name === selectedMod.name && idx !== currentSlotIndex
        );

        if (alreadySelected) {
            alert('This modification is already selected in another slot.');
            return;
        }

        // 슬롯에 추가
        selectedSlots.update(slots => {
            slots[currentSlotIndex] = selectedMod;
            return slots;
        });

        // 선택된 modification들을 부모 컴포넌트로 전달
        dispatchChanges();
    }

    function removeFromSlot(slotIndex: number) {
        selectedSlots.update(slots => {
            slots[slotIndex] = null;
            return slots;
        });

        dispatchChanges();
    }

    function dispatchChanges() {
        // null이 아닌 선택된 modification들만 전달
        const selected = $selectedSlots.filter(slot => slot !== null) as PotentialModification[];
        dispatch('change', selected);
    }

    // 다이얼로그에 표시할 modification들 (이미 선택된 것 제외)
    $: availableModifications = $savedModifications.filter(mod => {
        // 현재 편집 중인 슬롯에 이미 선택된 modification은 포함
        const isInCurrentSlot = $selectedSlots[currentSlotIndex]?.name === mod.name;
        if (isInCurrentSlot) return true;

        // 다른 슬롯에 선택된 modification은 제외
        return !$selectedSlots.some(slot => slot && slot.name === mod.name);
    });
</script>

<div class="container mt-4">
    <label for="potential-selector" class="form-label fw-bold">Potential modifications (Max {MAX_SELECTION})</label>
    <div id="potential-selector" class="row g-3">
        {#each $selectedSlots as slot, index}
            <div class="col-md-3 col-sm-6">
                <div class="card h-100">
                    <div class="card-body d-flex align-items-center justify-content-center">
                        {#if slot}
                            <PotentialModificationSelectItem
                                modification={slot}
                                onRemove={() => removeFromSlot(index)}
                            />
                        {:else}
                            <button
                                class="btn btn-outline-secondary w-100 select-btn"
                                on:click={() => openDialog(index)}
                                aria-label="Select modification for slot {index + 1}"
                            >
                                Select
                            </button>
                        {/if}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

<PotentialModificationDialog
    bind:showDialog
    {availableModifications}
    on:select={handleSelect}
/>

<style>
    .card {
        min-height: 180px;
    }

    .card-body {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 0.75rem;
    }

    .select-btn {
        height: 100%;
        min-height: 100px;
        font-size: 0.95rem;
    }

    .select-btn:hover {
        background-color: #e9ecef;
        border-color: #6c757d;
    }
</style>
