<script lang="ts">
  import NcAASelector from "$lib/components/NcAASelector.svelte";
  import SAModeSelector from "$lib/components/SAModeSelector.svelte";
  import InitialRnaInput from "$lib/components/InitialRnaInput.svelte";
  import PeptideSequenceSelector from "$lib/components/PeptideSequenceSelector.svelte";
  import { onDestroy } from "svelte";
  import { showAlert } from "$lib/stores/alertStore.js";
  import { aminoMap, molecularWeightMap, codonTableRtoS } from "$lib/helper/amino_mapper";
  import {
    findCompositionMatch,
    computeBenchmarkStats,
    isValidTargetSequence,
    runsToCSV,
    runsSummaryToCSV,
    type BenchmarkRun,
    type BenchmarkSolution,
    type BenchmarkStats,
  } from "$lib/helper/benchmark_helper";

  // ────────────────────────────────────────────────────────────────────────
  // 사용자 입력
  // ────────────────────────────────────────────────────────────────────────
  let detectedMass: number | null = null;
  let targetSequence: string = "";
  let rnaSequence: string = ""; // RNA 시퀀스 (선택, A/U/G/C, 길이 3 의 배수)
  let sequenceTemplate: any = null; // PeptideSequenceSelector 가 만든 fixed/gap 구조

  // ncAA: 기존 NcAASelector 재사용 (B/J/O/U/X/Z 6슬롯)
  let fullNcAA: Record<string, any> = {
    B: null, J: null, O: null, U: null, X: null, Z: null,
  };

  // SA 모드: SAModeSelector 가 채우는 객체
  let saConfig = {
    initialTemperature: 10000,
    absoluteTemperature: 0.001,
    saIterations: 100,
  };

  // 벤치마크 변수 (UI 노출, 변경 가능)
  let benchmarkRuns: number = 100; // 전체 반복 횟수
  let averageWindow: number = 3;   // 앞 N개 runtime 평균 윈도우

  // ────────────────────────────────────────────────────────────────────────
  // 고정값 (사양상 고정)
  // ────────────────────────────────────────────────────────────────────────
  const FIXED_FORMYLATION = "unknown" as const;
  const FIXED_ADDUCT = "+H" as const;
  const FIXED_AMINO_MAP = { ...aminoMap };

  // ────────────────────────────────────────────────────────────────────────
  // 실행 상태
  // ────────────────────────────────────────────────────────────────────────
  let worker: Worker | null = null;
  let isRunning = false;
  let progress = 0; // 0..benchmarkRuns
  let runs: BenchmarkRun[] = [];
  let stats: BenchmarkStats | null = null;
  let lastError: string = "";
  let showRunDetails = false;
  let cancelRequested = false;

  onDestroy(() => {
    if (worker) {
      worker.terminate();
      worker = null;
    }
  });

  // ────────────────────────────────────────────────────────────────────────
  // Worker 호출 1회 → Promise 래핑
  // ────────────────────────────────────────────────────────────────────────
  function runSAOnce(workerData: Record<string, unknown>): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!worker) {
        worker = new Worker(
          new URL("$lib/workers/mass_finder.worker.ts", import.meta.url),
          { type: "module" },
        );
      }
      const w = worker;
      const onMessage = (e: MessageEvent) => {
        w.removeEventListener("message", onMessage);
        w.removeEventListener("error", onError);
        if (e.data?.type === "success") {
          resolve(e.data.solutions ?? []);
        } else {
          reject(new Error(e.data?.error ?? "Unknown worker error"));
        }
      };
      const onError = (err: ErrorEvent) => {
        w.removeEventListener("message", onMessage);
        w.removeEventListener("error", onError);
        reject(err.error ?? new Error("Worker error"));
      };
      w.addEventListener("message", onMessage);
      w.addEventListener("error", onError);
      w.postMessage(workerData);
    });
  }

  function buildWorkerData() {
    // 선택된 ncAA 만 골라서 무게 맵 생성 (MTS 페이지와 동일한 방식)
    const filteredNcAA = Object.fromEntries(
      Object.entries(fullNcAA).filter(([, v]) => v !== null),
    );

    const filteredMonoWeights = Object.fromEntries(
      Object.entries(filteredNcAA).map(([k, v]: [string, any]) => [
        k,
        Number(v?.monoisotopicWeight),
      ]),
    );
    const filteredMolWeights = Object.fromEntries(
      Object.entries(filteredNcAA).map(([k, v]: [string, any]) => [
        k,
        Number(v?.molecularWeight),
      ]),
    );

    const monoisotopicMap = { ...FIXED_AMINO_MAP, ...filteredMonoWeights };
    const ncMolBase = Object.fromEntries(
      Object.entries(FIXED_AMINO_MAP).map(([k]) => [k, molecularWeightMap[k]]),
    );
    const molecularMap = { ...ncMolBase, ...filteredMolWeights };

    const base: Record<string, unknown> = {
      detectedMass,
      formylation: FIXED_FORMYLATION,
      adduct: FIXED_ADDUCT,
      monoisotopicMap,
      molecularMap,
      initialTemperature: saConfig.initialTemperature,
      absoluteTemperature: saConfig.absoluteTemperature,
      saIterations: saConfig.saIterations,
    };

    if (sequenceTemplate && sequenceTemplate.gapTotalLength > 0) {
      // Template 모드: fixed/gap 세그먼트 기반 calc
      base.sequenceTemplate = sequenceTemplate;
    } else {
      // 일반 모드: RNA 를 reference 로 사용 (없으면 빈 문자열 → mass-only SA)
      base.knownSequence = "";
      base.proteinSequence = rnaSequence;
    }
    return base;
  }

  function handleTemplateChange(e: CustomEvent) {
    const { fullSequence, positionStates, fixedSegments, gapSegments } = e.detail;
    if (!fullSequence) {
      sequenceTemplate = null;
      return;
    }
    const gapTotalLength = gapSegments.reduce(
      (sum: number, g: { length: number }) => sum + g.length,
      0,
    );
    sequenceTemplate = {
      fullSequence,
      positionStates,
      fixedSegments,
      gapSegments,
      totalLength: fullSequence.length,
      gapTotalLength,
    };
  }

  // RNA 시퀀스 검증: A/U/G/C only, 길이 3 의 배수 (빈 문자열은 OK)
  function validateRnaSequence(seq: string): { ok: boolean; message: string } {
    if (!seq) return { ok: true, message: "" };
    const validBases = /^[AUGC]+$/;
    if (!validBases.test(seq)) {
      return { ok: false, message: "RNA must contain only A, U, G, C" };
    }
    if (seq.length % 3 !== 0) {
      return {
        ok: false,
        message: "RNA length must be a multiple of 3 (codon units)",
      };
    }
    return { ok: true, message: "" };
  }

  // RNA → amino acid 변환 (UI 미리보기 + 검증 보조)
  function convertRnaToAminoAcids(seq: string): string {
    if (!seq) return "";
    const codons = seq.match(/.{1,3}/g) ?? [];
    let out = "";
    for (const codon of codons) {
      if (codon.length === 3) {
        const aa = (codonTableRtoS as Record<string, string>)[codon];
        if (aa && aa !== "[Stop]") out += aa;
        else if (aa === "[Stop]") break;
      }
    }
    return out;
  }

  $: rnaConverted = convertRnaToAminoAcids(rnaSequence);
  $: rnaValidation = validateRnaSequence(rnaSequence);
  $: fixedSegmentsLabel = sequenceTemplate?.fixedSegments?.length
    ? sequenceTemplate.fixedSegments
        .map((s: { sequence: string }) => `"${s.sequence}"`)
        .join(", ")
    : "None";

  // ────────────────────────────────────────────────────────────────────────
  // 입력 검증
  // ────────────────────────────────────────────────────────────────────────
  async function validate(): Promise<boolean> {
    if (detectedMass === null || Number.isNaN(detectedMass)) {
      await showAlert("Please input Detected mass", "Validation Error", "warning");
      return false;
    }
    if (detectedMass <= 0 || detectedMass > 10000) {
      await showAlert(
        "Detected mass must be between 1 and 10,000",
        "Validation Error",
        "warning",
      );
      return false;
    }
    if (!targetSequence || !isValidTargetSequence(targetSequence)) {
      await showAlert(
        "Please input a valid Target peptide sequence (letters only, optional 'f' prefix)",
        "Validation Error",
        "warning",
      );
      return false;
    }
    const rnaCheck = validateRnaSequence(rnaSequence);
    if (!rnaCheck.ok) {
      await showAlert(rnaCheck.message, "Validation Error", "warning");
      return false;
    }
    if (!Number.isInteger(benchmarkRuns) || benchmarkRuns < 1) {
      await showAlert("Benchmark iterations must be a positive integer", "Validation Error", "warning");
      return false;
    }
    if (!Number.isInteger(averageWindow) || averageWindow < 1) {
      await showAlert("Average window N must be a positive integer", "Validation Error", "warning");
      return false;
    }
    if (averageWindow > benchmarkRuns) {
      await showAlert(
        "Average window N must be less than or equal to total iterations",
        "Validation Error",
        "warning",
      );
      return false;
    }
    return true;
  }

  // ────────────────────────────────────────────────────────────────────────
  // 메인 벤치마크 루프
  // ────────────────────────────────────────────────────────────────────────
  async function handleRunBenchmark() {
    if (isRunning) return;
    if (!(await validate())) return;

    runs = [];
    stats = null;
    progress = 0;
    lastError = "";
    cancelRequested = false;
    isRunning = true;

    const workerData = buildWorkerData();
    const totalRuns = benchmarkRuns;

    try {
      for (let i = 0; i < totalRuns; i++) {
        if (cancelRequested) break;
        const start = performance.now();
        let solutions: any[] = [];
        try {
          solutions = await runSAOnce({ ...workerData });
        } catch (err) {
          // 한 회차 실패는 기록하고 계속 진행
          const runtime = performance.now() - start;
          const newRun: BenchmarkRun = {
            index: i + 1,
            runtime,
            success: false,
            matchedCode: undefined,
            solutions: [],
          };
          runs = [...runs, newRun];
          progress = i + 1;
          lastError = (err as Error).message ?? String(err);
          continue;
        }
        const runtime = performance.now() - start;
        const matched = findCompositionMatch(targetSequence, solutions);
        const trimmedSolutions: BenchmarkSolution[] = solutions.map((s: any) => ({
          code: s?.code,
          weight: s?.weight,
          molecularWeight: s?.molecularWeight,
          totalWeight: s?.totalWeight,
          similarity: s?.similarity,
          sequenceSimilarity: s?.sequenceSimilarity,
          formyType: s?.formyType,
          ionType: s?.ionType,
        }));
        const newRun: BenchmarkRun = {
          index: i + 1,
          runtime,
          success: !!matched,
          matchedCode: matched,
          solutions: trimmedSolutions,
        };
        runs = [...runs, newRun];
        progress = i + 1;

        // UI 업데이트 + 메인 스레드 양보
        await yieldToUI();
      }

      stats = computeBenchmarkStats(runs, averageWindow);
    } catch (e) {
      console.error(e);
      lastError = (e as Error).message ?? String(e);
      await showAlert("Benchmark failed", "Error", "error");
    } finally {
      isRunning = false;
    }
  }

  function yieldToUI(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  function handleCancel() {
    cancelRequested = true;
  }

  function handleNcAAChange(e: CustomEvent) {
    fullNcAA = e.detail;
  }

  function handleTargetInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    if (value.length === 0) {
      targetSequence = "";
      return;
    }
    // 첫 글자 'f' 만 Formylation prefix 로 보존하고, 나머지는 모두 대문자.
    // 대문자 'F' 는 Phe(페닐알라닌) 를 의미하므로 그대로 둔다.
    if (value[0] === "f") {
      targetSequence = "f" + value.slice(1).toUpperCase();
    } else {
      targetSequence = value.toUpperCase();
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // CSV 다운로드
  // ────────────────────────────────────────────────────────────────────────
  function downloadFile(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  function timestampForFilename(): string {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(
      d.getHours(),
    )}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }

  function handleDownloadDetailed() {
    if (runs.length === 0) return;
    const csv = runsToCSV(runs, targetSequence, detectedMass, rnaSequence);
    const safeTarget = targetSequence.replace(/[^A-Za-z0-9]/g, "_") || "target";
    downloadFile(
      csv,
      `mts-benchmark-detail-${safeTarget}-${timestampForFilename()}.csv`,
    );
  }

  function handleDownloadSummary() {
    if (runs.length === 0) return;
    const csv = runsSummaryToCSV(runs);
    const safeTarget = targetSequence.replace(/[^A-Za-z0-9]/g, "_") || "target";
    downloadFile(
      csv,
      `mts-benchmark-summary-${safeTarget}-${timestampForFilename()}.csv`,
    );
  }

  $: totalSolutionRows = runs.reduce(
    (sum, r) => sum + (r.solutions?.length ?? 0),
    0,
  );

  // 진단: 100x100 SA 솔루션 중 ncAA letter 가 실제로 등장한 비율
  $: ncAAStats = (() => {
    const ncAALetters = Object.keys(fullNcAA).filter(
      (k) => fullNcAA[k] !== null,
    );
    if (ncAALetters.length === 0 || runs.length === 0) return null;

    let totalSolutions = 0;
    let solutionsWithNcAA = 0;
    const perLetterCounts: Record<string, number> = {};
    for (const l of ncAALetters) perLetterCounts[l] = 0;

    for (const run of runs) {
      if (!run.solutions) continue;
      for (const sol of run.solutions) {
        totalSolutions++;
        const code = sol.code ?? "";
        let hasAny = false;
        for (const letter of ncAALetters) {
          if (code.includes(letter)) {
            perLetterCounts[letter]++;
            hasAny = true;
          }
        }
        if (hasAny) solutionsWithNcAA++;
      }
    }
    return {
      ncAALetters,
      totalSolutions,
      solutionsWithNcAA,
      percentage:
        totalSolutions > 0
          ? (solutionsWithNcAA / totalSolutions) * 100
          : 0,
      perLetterCounts,
    };
  })();

  function handleSAModeChange(e: CustomEvent) {
    saConfig = e.detail;
  }

  // 진행률 (0..1)
  $: progressRatio = benchmarkRuns > 0 ? progress / benchmarkRuns : 0;
  $: liveSuccessCount = runs.reduce((s, r) => s + (r.success ? 1 : 0), 0);

  function formatMs(value: number): string {
    if (!Number.isFinite(value)) return "—";
    if (value >= 1000) return `${(value / 1000).toFixed(2)} s`;
    return `${value.toFixed(2)} ms`;
  }
</script>

<svelte:head>
  <title>MTS Benchmark - X-MAS</title>
</svelte:head>

<div class="container mt-5">
  <div class="text-center mb-4">
    <h1>MTS Benchmark</h1>
    <p class="text-muted mb-0">
      Measure simulated-annealing performance against a known target peptide.
    </p>
  </div>

  <!-- Detected mass -->
  <div class="mb-3">
    <label for="bm-detected-mass" class="form-label fw-bold">
      Detected mass <span class="text-danger">*</span>
    </label>
    <input
      type="number"
      id="bm-detected-mass"
      class="form-control"
      placeholder="e.g. 1000"
      bind:value={detectedMass}
      disabled={isRunning}
    />
  </div>

  <!-- Target peptide -->
  <div class="mb-3">
    <label for="bm-target-seq" class="form-label fw-bold">
      Target peptide sequence <span class="text-danger">*</span>
    </label>
    <input
      type="text"
      id="bm-target-seq"
      class="form-control"
      placeholder="e.g. ACDEFG · 'fACDE' (formyl) · 'FACDE' (Phe-Ala-...)"
      bind:value={targetSequence}
      on:input={handleTargetInput}
      disabled={isRunning}
    />
    <small class="text-muted d-block mt-1">
      대문자 <code>F</code> = <strong>Phe</strong>(페닐알라닌), 소문자
      <code>f</code> 는 <strong>맨 앞에 올 때만 Formylation prefix</strong> 로
      처리됩니다. 비교는 시퀀스 순서와 무관한 구성(composition) 일치로 판정하며,
      맨 앞 소문자 <code>f</code> 는 비교 시 제외되어 Formylation 유무는 일치
      여부에 영향을 주지 않습니다.
    </small>
  </div>

  <!-- RNA sequence (optional, used as similarity reference / template anchor) -->
  <fieldset disabled={isRunning} class="rna-fieldset">
    <InitialRnaInput
      bind:value={rnaSequence}
      on:input={(e) => (rnaSequence = e.detail.value)}
    />

    <!-- Narrow search space: ncAA 위치 클릭 → fixed/variable 영역 분할 -->
    <PeptideSequenceSelector
      aminoSequence={rnaConverted}
      on:change={handleTemplateChange}
    />
  </fieldset>

  {#if sequenceTemplate && sequenceTemplate.gapTotalLength > 0}
    <div class="alert alert-warning py-2 small mb-3">
      <strong>Template mode active</strong> — Fixed:
      {fixedSegmentsLabel} |
      Variable: {sequenceTemplate.gapTotalLength} positions to predict.
      SA 가 위 fixed 부분을 그대로 두고 변동 영역만 탐색합니다.
    </div>
  {:else if rnaSequence && rnaValidation.ok && rnaConverted}
    <div class="alert alert-info py-2 small mb-3">
      RNA reference active — converted: <span class="fw-bold">{rnaConverted}</span>.
      SA fitness 가 mass 80% + sequence similarity 20% 로 계산되어 이 reference 와
      유사한 시퀀스가 우선됩니다. (펩타이드 타일을 클릭하면 일부 위치만 자유롭게
      두는 Template 모드로 전환됩니다.)
    </div>
  {/if}

  <!-- SA Mode -->
  <div class="mb-3">
    <SAModeSelector on:change={handleSAModeChange} />
  </div>

  <!-- ncAA (최대 6개) -->
  <div class="mb-3">
    <NcAASelector on:changeNcAA={handleNcAAChange} />
  </div>

  <!-- Benchmark variables -->
  <div class="row g-3 mb-3">
    <div class="col-12 col-md-6">
      <label for="bm-iterations" class="form-label fw-bold">
        Benchmark iterations
      </label>
      <input
        type="number"
        id="bm-iterations"
        class="form-control"
        min="1"
        bind:value={benchmarkRuns}
        disabled={isRunning}
      />
      <small class="text-muted">전체 반복 횟수 (기본 100)</small>
    </div>
    <div class="col-12 col-md-6">
      <label for="bm-window" class="form-label fw-bold">
        Average window (first N)
      </label>
      <input
        type="number"
        id="bm-window"
        class="form-control"
        min="1"
        bind:value={averageWindow}
        disabled={isRunning}
      />
      <small class="text-muted">앞에서 몇 번의 runtime 을 평균낼지 (기본 3)</small>
    </div>
  </div>

  <!-- Fixed parameters info -->
  <div class="alert alert-secondary mb-3">
    <strong>Fixed parameters</strong>
    <ul class="mb-0 small">
      <li>Formylation: <code>{FIXED_FORMYLATION}</code></li>
      <li>Adduct: <code>{FIXED_ADDUCT}</code></li>
      <li>Amino acid set: All 20 standard amino acids</li>
    </ul>
  </div>

  <!-- Run / Cancel buttons -->
  <div class="d-flex gap-2 mb-4">
    <button
      type="button"
      class="btn btn-primary flex-grow-1"
      on:click={handleRunBenchmark}
      disabled={isRunning}
    >
      {isRunning ? `Running... (${progress}/${benchmarkRuns})` : "Run Benchmark"}
    </button>
    {#if isRunning}
      <button type="button" class="btn btn-outline-danger" on:click={handleCancel}>
        Cancel
      </button>
    {/if}
  </div>

  <!-- Progress bar -->
  {#if isRunning || progress > 0}
    <div class="mb-4">
      <div class="d-flex justify-content-between mb-1">
        <small class="text-muted">Progress</small>
        <small class="text-muted">
          {progress} / {benchmarkRuns} ・ ✅ {liveSuccessCount}
        </small>
      </div>
      <div class="progress" style="height: 10px;">
        <div
          class="progress-bar"
          class:bg-success={!isRunning}
          role="progressbar"
          style="width: {(progressRatio * 100).toFixed(1)}%;"
          aria-valuenow={progress}
          aria-valuemin="0"
          aria-valuemax={benchmarkRuns}
        ></div>
      </div>
    </div>
  {/if}

  <!-- Results summary -->
  {#if stats}
    <div class="card mb-3">
      <div class="card-body">
        <h2 class="h5 card-title mb-3">Benchmark results</h2>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="metric-block">
              <div class="metric-label">Success rate</div>
              <div class="metric-value">
                {stats.successCount} / {stats.totalRuns}
                <small class="text-muted">
                  ({(stats.successRate * 100).toFixed(1)}%)
                </small>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="metric-block">
              <div class="metric-label">
                First {stats.averageWindow} runs avg runtime
              </div>
              <div class="metric-value">{formatMs(stats.firstNAverageRuntime)}</div>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="metric-sub">
              <span class="text-muted">Total avg:</span>
              <span>{formatMs(stats.averageRuntime)}</span>
            </div>
          </div>
          <div class="col-6 col-md-4">
            <div class="metric-sub">
              <span class="text-muted">Min:</span>
              <span>{formatMs(stats.minRuntime)}</span>
            </div>
          </div>
          <div class="col-6 col-md-4">
            <div class="metric-sub">
              <span class="text-muted">Max:</span>
              <span>{formatMs(stats.maxRuntime)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- ncAA usage diagnostic -->
  {#if ncAAStats}
    <div class="card mb-3">
      <div class="card-body">
        <h2 class="h6 card-title mb-2">
          ncAA inclusion in SA solutions
        </h2>
        <p class="small text-muted mb-2">
          전체 {ncAAStats.totalSolutions.toLocaleString()} 개 SA 솔루션 중
          <strong class="text-dark">{ncAAStats.solutionsWithNcAA.toLocaleString()}</strong>
          개가 선택한 ncAA letter 를 1개 이상 포함했습니다 (<strong>{ncAAStats.percentage.toFixed(1)}%</strong>).
        </p>
        <div class="d-flex flex-wrap gap-2">
          {#each ncAAStats.ncAALetters as letter}
            <span class="badge bg-info text-dark">
              <code>{letter}</code> ・ {ncAAStats.perLetterCounts[letter].toLocaleString()} 회
            </span>
          {/each}
        </div>
        {#if ncAAStats.percentage === 0}
          <small class="text-warning d-block mt-2">
            ⚠ ncAA letter 가 한 번도 등장하지 않았습니다. RNA reference 가 입력된
            경우 SA 가 reference 시퀀스의 표준 20 아미노산에 강하게 편향되며
            sortAmino 가 ncAA 포함 결과를 top-100 밖으로 밀어낼 수 있습니다.
            ncAA 등장을 보려면 RNA 를 비우고 다시 실행해 보세요.
          </small>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Error -->
  {#if lastError}
    <div class="alert alert-warning small">
      Last error: <code>{lastError}</code>
    </div>
  {/if}

  <!-- Download buttons -->
  {#if runs.length > 0}
    <div class="card mb-3">
      <div class="card-body">
        <h2 class="h6 card-title mb-2">Download as Excel-compatible CSV</h2>
        <p class="text-muted small mb-3">
          {totalSolutionRows.toLocaleString()} 개 SA 솔루션 행 (시퀀스 + 분자량 포함).
          Excel 에서 더블클릭으로 열거나 [데이터 → 텍스트로부터] 가져오기 하세요.
        </p>
        <div class="d-flex gap-2 flex-wrap">
          <button
            type="button"
            class="btn btn-success"
            on:click={handleDownloadDetailed}
            disabled={isRunning}
          >
            ⬇ Detailed CSV (per solution)
          </button>
          <button
            type="button"
            class="btn btn-outline-success"
            on:click={handleDownloadSummary}
            disabled={isRunning}
          >
            ⬇ Summary CSV (per run)
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Detail table (collapsible) -->
  {#if runs.length > 0}
    <button
      type="button"
      class="btn btn-link p-0 mb-2"
      on:click={() => (showRunDetails = !showRunDetails)}
    >
      {showRunDetails ? "Hide" : "Show"} per-run details ({runs.length})
    </button>

    {#if showRunDetails}
      <div class="table-responsive">
        <table class="table table-sm table-striped">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Runtime</th>
              <th scope="col">Match</th>
              <th scope="col">Matched code</th>
            </tr>
          </thead>
          <tbody>
            {#each runs as run (run.index)}
              <tr>
                <td>{run.index}</td>
                <td>{formatMs(run.runtime)}</td>
                <td>
                  {#if run.success}
                    <span class="badge bg-success">true</span>
                  {:else}
                    <span class="badge bg-secondary">false</span>
                  {/if}
                </td>
                <td><code>{run.matchedCode ?? "—"}</code></td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  {/if}
</div>

<style>
  .container {
    padding-left: 0;
    padding-right: 0;
    max-width: 960px;
  }

  .metric-block {
    padding: 12px 16px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .metric-label {
    font-size: 0.8rem;
    color: #6c757d;
    margin-bottom: 4px;
  }

  .metric-value {
    font-size: 1.4rem;
    font-weight: 600;
    color: #212529;
  }

  .metric-sub {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    padding: 6px 12px;
    background: #ffffff;
    border-radius: 6px;
    border: 1px solid #e9ecef;
    font-size: 0.9rem;
  }

  @media (max-width: 767px) {
    .container {
      margin-top: 1rem !important;
    }
    h1 {
      font-size: 1.6rem;
    }
  }
</style>
