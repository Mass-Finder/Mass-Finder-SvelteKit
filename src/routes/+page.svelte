<script>
    import { goto } from '$app/navigation';
    
    // Function to navigate to a specified academic route
    function navigateTo(path) {
        goto(path);
    }
</script>

<svelte:head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mass Finder</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            min-height: 100vh;
        }

        .main-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .title::after {
            content: '';
            position: absolute;
            bottom: -10px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 3px;
            border-radius: 2px;
        }

        .module-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
        }

        .module-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--accent-color);
            transform: scaleX(0);
            transition: transform 0.3s ease;
        }

        .module-card:hover {
            transform: translateY(-4px);
        }

        .module-card:hover::before {
            transform: scaleX(1);
        }

        .module-card.manual {
            --accent-color: #f39c12;
        }

        .module-card.stm {
            --accent-color: #e74c3c;
        }

        .module-card.mts {
            --accent-color: #27ae60;
        }

        .module-card.draw {
            --accent-color: #3498db;
        }

        .module-icon {
            width: 64px;
            height: 64px;
            background: var(--accent-color);
            color: white;
            font-size: 28px;
        }

        .module-button {
            background: var(--accent-color);
            border: none;
            transition: all 0.2s ease;
        }

        .module-button:hover {
            background: color-mix(in srgb, var(--accent-color) 85%, black);
            transform: translateY(-1px);
        }

        .module-features {
            list-style: none;
        }

        .module-features li {
            font-size: 0.85rem;
            color: #8e9aaf;
            padding-left: 16px;
            position: relative;
        }

        .module-features li::before {
            content: '•';
            position: absolute;
            left: 0;
            color: var(--accent-color);
            font-weight: bold;
        }
    </style>
</svelte:head>

<div class="d-flex align-items-center justify-content-center p-4" style="min-height: 100vh;">
    <div class="main-container rounded-4 shadow-lg p-5" style="width: 100%;">
        <div class="text-center mb-5">
            <h1 class="display-2 fw-light text-dark mb-3 position-relative" style="letter-spacing: -0.02em;">
                Mass Finder
            </h1>
            <p class="lead text-muted mt-4 lh-base">
                Advanced Computational Platform for Mass Spectrometry Analysis<br>
                and Protein Sequence Prediction
            </p>
        </div>

        <div class="row g-4 mt-4 mx-0">
            <div class="col-lg-6">
                <div class="module-card manual card h-100 border shadow-sm d-flex flex-column" role="button" tabindex="0" on:click={() => navigateTo('/manual')} on:keydown={(e) => e.key === 'Enter' && navigateTo('/manual')}>
                    <div class="p-4 flex-grow-1">
                        <div class="module-icon rounded-3 d-flex align-items-center justify-content-center mb-3 shadow">📖</div>
                        <h3 class="h4 fw-semibold text-dark mb-3">Manual</h3>
                        <p class="text-muted mb-3 lh-base">Comprehensive user guide and theoretical background for all computational modules.</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Algorithm explanations</li>
                            <li class="mb-2">Parameter guidelines</li>
                            <li class="mb-2">Best practices</li>
                        </ul>
                    </div>
                    <div class="p-4 pt-0">
                        <button class="module-button btn text-white w-100 py-3 rounded-3 fw-medium" on:click|stopPropagation={() => navigateTo('/manual')}>Access Manual</button>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="module-card stm card h-100 border shadow-sm d-flex flex-column" role="button" tabindex="0" on:click={() => navigateTo('/stm')} on:keydown={(e) => e.key === 'Enter' && navigateTo('/stm')}>
                    <div class="p-4 flex-grow-1">
                        <div class="module-icon rounded-3 d-flex align-items-center justify-content-center mb-3 shadow">🧬</div>
                        <h3 class="h4 fw-semibold text-dark mb-3">Sequence to Mass (STM)</h3>
                        <p class="text-muted mb-3 lh-base">Predict molecular masses from RNA sequences considering various biological variations and modifications.</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Non-canonical amino acid incorporation</li>
                            <li class="mb-2">Post-translational modifications</li>
                            <li class="mb-2">Disulfide bond calculations</li>
                            <li class="mb-2">Ion adduct analysis</li>
                        </ul>
                    </div>
                    <div class="p-4 pt-0">
                        <button class="module-button btn text-white w-100 py-3 rounded-3 fw-medium" on:click|stopPropagation={() => navigateTo('/stm')}>Start Analysis</button>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="module-card mts card h-100 border shadow-sm d-flex flex-column" role="button" tabindex="0" on:click={() => navigateTo('/mts')} on:keydown={(e) => e.key === 'Enter' && navigateTo('/mts')}>
                    <div class="p-4 flex-grow-1">
                        <div class="module-icon rounded-3 d-flex align-items-center justify-content-center mb-3 shadow">⚖️</div>
                        <h3 class="h4 fw-semibold text-dark mb-3">Mass to Sequence (MTS)</h3>
                        <p class="text-muted mb-3 lh-base">Determine optimal amino acid sequences from detected molecular masses using simulated annealing algorithms.</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Simulated annealing optimization</li>
                            <li class="mb-2">Known sequence constraints</li>
                            <li class="mb-2">RNA reference integration</li>
                            <li class="mb-2">Formylation & adduct handling</li>
                        </ul>
                    </div>
                    <div class="p-4 pt-0">
                        <button class="module-button btn text-white w-100 py-3 rounded-3 fw-medium" on:click|stopPropagation={() => navigateTo('/mts')}>Find Sequences</button>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="module-card draw card h-100 border shadow-sm d-flex flex-column" role="button" tabindex="0" on:click={() => navigateTo('/draw')} on:keydown={(e) => e.key === 'Enter' && navigateTo('/draw')}>
                    <div class="p-4 flex-grow-1">
                        <div class="module-icon rounded-3 d-flex align-items-center justify-content-center mb-3 shadow">✏️</div>
                        <h3 class="h4 fw-semibold text-dark mb-3">Structure Editor</h3>
                        <p class="text-muted mb-3 lh-base">Interactive molecular structure drawing tool for custom compound design and mass calculation.</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Chemical structure drawing</li>
                            <li class="mb-2">Real-time mass calculation</li>
                            <li class="mb-2">Export capabilities</li>
                            <li class="mb-2">Integration with analysis modules</li>
                        </ul>
                    </div>
                    <div class="p-4 pt-0">
                        <button class="module-button btn text-white w-100 py-3 rounded-3 fw-medium" on:click|stopPropagation={() => navigateTo('/draw')}>Open Editor</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center mt-5 pt-4 border-top">
            <p class="text-muted">Developed for computational mass spectrometry research</p>
        </div>
    </div>
</div>

