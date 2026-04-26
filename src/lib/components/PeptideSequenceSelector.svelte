<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  /** @type {string} */
  export let aminoSequence = '';

  /** @type {import('../../type/SequenceTemplate').PositionState[]} */
  let positionStates = [];

  /** @type {import('../../type/SequenceTemplate').NcAAZone[]} */
  let ncaaZones = [];

  // 드래그 상태
  let dragging = false;
  let dragZoneIndex = -1;
  let dragSide = ''; // 'left' | 'right'
  let dragStartX = 0;
  let dragStartCount = 0;

  const DEFAULT_YELLOW_COUNT = 3;

  // aminoSequence가 변경되면 상태 초기화
  $: if (aminoSequence) {
    resetStates(aminoSequence);
  } else {
    positionStates = [];
    ncaaZones = [];
    dispatchChange();
  }

  function resetStates(seq) {
    positionStates = new Array(seq.length).fill('green');
    ncaaZones = [];
    dispatchChange();
  }

  // 아미노산 클릭: 빨간색 토글
  function handleAminoClick(index) {
    if (dragging) return;

    const existingZoneIdx = ncaaZones.findIndex(z => z.ncaaIndex === index);

    if (existingZoneIdx !== -1) {
      // 이미 빨간색이면 제거 (토글)
      ncaaZones = ncaaZones.filter((_, i) => i !== existingZoneIdx);
    } else {
      // 새 ncAA zone 추가
      const leftMax = getMaxYellowLeft(index);
      const rightMax = getMaxYellowRight(index);
      ncaaZones = [...ncaaZones, {
        ncaaIndex: index,
        leftYellowCount: Math.min(DEFAULT_YELLOW_COUNT, leftMax),
        rightYellowCount: Math.min(DEFAULT_YELLOW_COUNT, rightMax),
      }];
      // 인덱스 순으로 정렬
      ncaaZones.sort((a, b) => a.ncaaIndex - b.ncaaIndex);
    }

    recalcYellowLimits();
    recalcPositionStates();
    dispatchChange();
  }

  // 노란 영역이 이미 빨간 존이 있는 곳과 겹치지 않도록 최대값 계산
  function getMaxYellowLeft(ncaaIndex) {
    // 왼쪽으로 갈 수 있는 최대 거리: 시퀀스 시작 또는 다른 zone의 영역까지
    let max = ncaaIndex; // 시퀀스 시작까지의 거리
    for (const zone of ncaaZones) {
      if (zone.ncaaIndex < ncaaIndex) {
        // 이 zone의 오른쪽 경계 이후부터 가능
        const zoneBoundary = zone.ncaaIndex + zone.rightYellowCount + 1;
        const available = ncaaIndex - zoneBoundary;
        if (available >= 0) {
          max = Math.min(max, available);
        } else {
          max = 0;
        }
      }
    }
    return max;
  }

  function getMaxYellowRight(ncaaIndex) {
    const seqLen = aminoSequence.length;
    let max = seqLen - ncaaIndex - 1; // 시퀀스 끝까지의 거리
    for (const zone of ncaaZones) {
      if (zone.ncaaIndex > ncaaIndex) {
        // 이 zone의 왼쪽 경계 이전까지 가능
        const zoneBoundary = zone.ncaaIndex - zone.leftYellowCount - 1;
        const available = zoneBoundary - ncaaIndex;
        if (available >= 0) {
          max = Math.min(max, available);
        } else {
          max = 0;
        }
      }
    }
    return max;
  }

  // 노란 제한값 재계산 (zone 추가/제거 후)
  function recalcYellowLimits() {
    ncaaZones = ncaaZones.map(zone => {
      const leftMax = getMaxYellowLeft(zone.ncaaIndex);
      const rightMax = getMaxYellowRight(zone.ncaaIndex);
      return {
        ...zone,
        leftYellowCount: Math.min(zone.leftYellowCount, leftMax),
        rightYellowCount: Math.min(zone.rightYellowCount, rightMax),
      };
    });
  }

  // positionStates 재계산
  function recalcPositionStates() {
    if (!aminoSequence) return;
    const states = new Array(aminoSequence.length).fill('green');

    for (const zone of ncaaZones) {
      // 빨간색
      states[zone.ncaaIndex] = 'red';

      // 왼쪽 노란색
      for (let i = 1; i <= zone.leftYellowCount; i++) {
        const idx = zone.ncaaIndex - i;
        if (idx >= 0 && states[idx] !== 'red') {
          states[idx] = 'yellow';
        }
      }

      // 오른쪽 노란색
      for (let i = 1; i <= zone.rightYellowCount; i++) {
        const idx = zone.ncaaIndex + i;
        if (idx < aminoSequence.length && states[idx] !== 'red') {
          states[idx] = 'yellow';
        }
      }
    }

    positionStates = states;
  }

  // 드래그 시작 (노란 영역 경계)
  function handleDragStart(event, zoneIndex, side) {
    event.preventDefault();
    dragging = true;
    dragZoneIndex = zoneIndex;
    dragSide = side;
    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    dragStartX = clientX;
    dragStartCount = side === 'left'
      ? ncaaZones[zoneIndex].leftYellowCount
      : ncaaZones[zoneIndex].rightYellowCount;

    window.addEventListener('mousemove', handleDragMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleDragMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);
  }

  function handleDragMove(event) {
    if (!dragging || dragZoneIndex < 0) return;
    event.preventDefault();

    const clientX = event.touches ? event.touches[0].clientX : event.clientX;
    // 한 타일의 대략적 너비 (px)
    const tileWidth = 36;
    const diff = clientX - dragStartX;
    const tileDiff = Math.round(diff / tileWidth);

    const zone = ncaaZones[dragZoneIndex];

    if (dragSide === 'left') {
      // 왼쪽 드래그: 왼쪽으로 드래그하면 노란 영역 확장
      const newCount = Math.max(0, dragStartCount - tileDiff);
      const maxLeft = getMaxYellowLeft(zone.ncaaIndex);
      ncaaZones[dragZoneIndex] = {
        ...zone,
        leftYellowCount: Math.min(newCount, maxLeft),
      };
    } else {
      // 오른쪽 드래그: 오른쪽으로 드래그하면 노란 영역 확장
      const newCount = Math.max(0, dragStartCount + tileDiff);
      const maxRight = getMaxYellowRight(zone.ncaaIndex);
      ncaaZones[dragZoneIndex] = {
        ...zone,
        rightYellowCount: Math.min(newCount, maxRight),
      };
    }

    ncaaZones = [...ncaaZones];
    recalcPositionStates();
    dispatchChange();
  }

  function handleDragEnd() {
    dragging = false;
    dragZoneIndex = -1;
    dragSide = '';
    window.removeEventListener('mousemove', handleDragMove);
    window.removeEventListener('mouseup', handleDragEnd);
    window.removeEventListener('touchmove', handleDragMove);
    window.removeEventListener('touchend', handleDragEnd);
  }

  // 특정 위치가 노란 영역의 경계(드래그 핸들)인지 확인
  function getDragHandle(index) {
    for (let zi = 0; zi < ncaaZones.length; zi++) {
      const zone = ncaaZones[zi];
      // 왼쪽 경계: ncaaIndex - leftYellowCount 위치
      const leftBoundary = zone.ncaaIndex - zone.leftYellowCount;
      if (index === leftBoundary && zone.leftYellowCount > 0) {
        return { zoneIndex: zi, side: 'left' };
      }
      // 왼쪽 노란이 0인 경우: 빨간 바로 왼쪽 초록이 핸들
      if (zone.leftYellowCount === 0 && index === zone.ncaaIndex - 1 && index >= 0 && positionStates[index] === 'green') {
        return { zoneIndex: zi, side: 'left' };
      }
      // 오른쪽 경계: ncaaIndex + rightYellowCount 위치
      const rightBoundary = zone.ncaaIndex + zone.rightYellowCount;
      if (index === rightBoundary && zone.rightYellowCount > 0) {
        return { zoneIndex: zi, side: 'right' };
      }
      // 오른쪽 노란이 0인 경우: 빨간 바로 오른쪽 초록이 핸들
      if (zone.rightYellowCount === 0 && index === zone.ncaaIndex + 1 && index < aminoSequence.length && positionStates[index] === 'green') {
        return { zoneIndex: zi, side: 'right' };
      }
    }
    return null;
  }

  // Fixed/Gap 세그먼트 계산
  function computeSegments() {
    if (!aminoSequence || positionStates.length === 0) {
      return { fixedSegments: [], gapSegments: [] };
    }

    const fixedSegments = [];
    const gapSegments = [];

    let i = 0;
    while (i < aminoSequence.length) {
      if (positionStates[i] === 'green') {
        // 연속된 green 수집
        let start = i;
        let seq = '';
        while (i < aminoSequence.length && positionStates[i] === 'green') {
          seq += aminoSequence[i];
          i++;
        }
        fixedSegments.push({ startIndex: start, sequence: seq });
      } else {
        // 연속된 red/yellow 수집
        let start = i;
        let origSeq = '';
        while (i < aminoSequence.length && positionStates[i] !== 'green') {
          origSeq += aminoSequence[i];
          i++;
        }
        gapSegments.push({ startIndex: start, length: origSeq.length, originalSequence: origSeq });
      }
    }

    return { fixedSegments, gapSegments };
  }

  function dispatchChange() {
    const { fixedSegments, gapSegments } = computeSegments();
    dispatch('change', {
      positionStates: [...positionStates],
      fixedSegments,
      gapSegments,
      ncaaZones: [...ncaaZones],
      fullSequence: aminoSequence,
    });
  }

  // 반응형 세그먼트 정보
  // positionStates/aminoSequence를 직접 참조해야 Svelte가 의존성으로 추적함
  $: segments = (positionStates, aminoSequence, computeSegments());
  $: fixedCount = positionStates.filter(s => s === 'green').length;
  $: gapCount = positionStates.filter(s => s !== 'green').length;
</script>

{#if aminoSequence}
  <div class="peptide-selector mb-3">
    <span class="form-label fw-bold d-block">Narrow search space (fix your sequence)</span>
    <div class="sequence-help">
      <small class="text-muted">
        Click amino acids to mark ncAA positions. Drag yellow edges to adjust boundaries.
      </small>
    </div>

    <div class="sequence-tiles" role="group" aria-label="Peptide sequence selector">
      {#each aminoSequence.split('') as amino, index}
        {@const state = positionStates[index] || 'green'}
        {@const handle = getDragHandle(index)}
        <div
          class="tile tile-{state}"
          class:tile-drag-handle={handle !== null && state === 'yellow'}
          role="button"
          tabindex="0"
          aria-label="Position {index + 1}: {amino} ({state})"
          on:click={() => handleAminoClick(index)}
          on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleAminoClick(index); }}
          on:mousedown={(e) => { if (handle && state === 'yellow') handleDragStart(e, handle.zoneIndex, handle.side); }}
          on:touchstart={(e) => { if (handle && state === 'yellow') handleDragStart(e, handle.zoneIndex, handle.side); }}
        >
          <span class="tile-amino">{amino}</span>
          <span class="tile-index">{index + 1}</span>
        </div>
      {/each}
    </div>

    <!-- 범례 -->
    <div class="legend mt-2">
      <span class="legend-item">
        <span class="legend-color legend-green"></span>
        <small>Fixed ({fixedCount})</small>
      </span>
      <span class="legend-item">
        <span class="legend-color legend-red"></span>
        <small>ncAA ({positionStates.filter(s => s === 'red').length})</small>
      </span>
      <span class="legend-item">
        <span class="legend-color legend-yellow"></span>
        <small>Variable ({positionStates.filter(s => s === 'yellow').length})</small>
      </span>
    </div>

    <!-- 세그먼트 요약 -->
    {#if ncaaZones.length > 0}
      <div class="segments-summary mt-2">
        <small class="text-muted">
          Fixed segments: {segments.fixedSegments.map(s => `"${s.sequence}"`).join(', ') || 'None'}
          {#if segments.gapSegments.length > 0}
            <br/>Variable gaps: {segments.gapSegments.map(s => `${s.length} positions`).join(', ')}
          {/if}
        </small>
      </div>
    {/if}
  </div>
{/if}

<style>
  .peptide-selector {
    user-select: none;
  }

  .sequence-help {
    margin-bottom: 8px;
  }

  .sequence-tiles {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 44px;
    border-radius: 4px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background-color 0.15s, border-color 0.15s, transform 0.1s;
  }

  .tile:hover {
    transform: scale(1.08);
    border-color: #666;
  }

  .tile:focus-visible {
    outline: 2px solid #0d6efd;
    outline-offset: 1px;
  }

  .tile-green {
    background-color: #c8e6c9;
    border-color: #a5d6a7;
    color: #2e7d32;
  }

  .tile-red {
    background-color: #ef9a9a;
    border-color: #e57373;
    color: #c62828;
  }

  .tile-yellow {
    background-color: #fff9c4;
    border-color: #fff176;
    color: #f57f17;
  }

  .tile-drag-handle {
    cursor: ew-resize;
    border-style: dashed;
    border-width: 2px;
  }

  .tile-amino {
    font-weight: 700;
    font-size: 14px;
    line-height: 1;
  }

  .tile-index {
    font-size: 9px;
    opacity: 0.6;
    line-height: 1;
    margin-top: 2px;
  }

  .legend {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .legend-color {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
  }

  .legend-green {
    background-color: #c8e6c9;
    border: 1px solid #a5d6a7;
  }

  .legend-red {
    background-color: #ef9a9a;
    border: 1px solid #e57373;
  }

  .legend-yellow {
    background-color: #fff9c4;
    border: 1px solid #fff176;
  }

  /* 모바일 */
  @media (max-width: 767px) {
    .tile {
      width: 28px;
      height: 38px;
    }

    .tile-amino {
      font-size: 12px;
    }

    .tile-index {
      font-size: 8px;
    }

    .legend {
      gap: 10px;
    }
  }
</style>
