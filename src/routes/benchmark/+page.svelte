<script lang="ts">
  import NcAASelector from "$lib/components/NcAASelector.svelte";
  import SAModeSelector from "$lib/components/SAModeSelector.svelte";
  import { onDestroy } from "svelte";
  import { showAlert } from "$lib/stores/alertStore.js";
  import { aminoMap, molecularWeightMap } from "$lib/helper/amino_mapper";
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
  const FIXED_RNA_SEQUENCE = ""; // RNA 미사용

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

    return {
      detectedMass,
      formylation: FIXED_FORMYLATION,
      adduct: FIXED_ADDUCT,
      monoisotopicMap,
      molecularMap,
      initialTemperature: saConfig.initialTemperature,
      absoluteTemperature: saConfig.absoluteTemperature,
      saIterations: saConfig.saIterations,
      knownSequence: "",
      proteinSequence: FIXED_RNA_SEQUENCE,
    };
  }

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
    // 대문자 정규화하면서 맨 앞 'F' 만 formylation 표기인 'f' 로 보존
    targetSequence = input.value.toUpperCase().replace(/^F/, "f");
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
    const csv = runsToCSV(runs, targetSequence, detectedMass);
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
      class="form-control text-uppercase"
      placeholder="e.g. ACDEFG (optional 'f' prefix for formylation)"
      bind:value={targetSequence}
      on:input={handleTargetInput}
      disabled={isRunning}
    />
    <small class="text-muted d-block mt-1">
      비교는 시퀀스 순서와 무관하게 구성(composition) 일치로 판정합니다. formylation
      <code>f</code> prefix 는 비교 시 무시됩니다.
    </small>
  </div>

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
      <li>RNA sequence used: <em>none</em></li>
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
