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
    <title>X-MAS</title>
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

        .module-card.potential {
            --accent-color: #9b59b6;
        }

        .module-icon {
            width: 64px;
            height: 64px;
            object-fit: cover;
            display: block;
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

        /* 모바일 반응형 */
        @media (max-width: 767px) {
            .main-container {
                padding: 1.5rem !important;
                margin: 1rem;
            }

            h1.display-2 {
                font-size: 2.5rem !important;
            }

            .lead {
                font-size: 1rem;
            }

            .module-icon {
                width: 48px;
                height: 48px;
            }

            .module-card .p-4 {
                padding: 1.25rem !important;
            }

            .h4 {
                font-size: 1.25rem;
            }

            .module-features li {
                font-size: 0.8rem;
            }

            .module-button {
                padding: 0.75rem !important;
                font-size: 0.95rem;
            }

            .row.g-4 {
                gap: 1rem !important;
            }

            .col-lg-6 {
                padding-left: 0 !important;
                padding-right: 0 !important;
            }

            .mt-5 {
                margin-top: 2rem !important;
            }

            .pt-4 {
                padding-top: 1.5rem !important;
            }
        }

        /* 타이틀 영역 위치 설정 */
        .title-area {
            position: relative;
        }

        /* 우측 상단 매뉴얼 버튼 */
        .manual-wrapper {
            position: absolute;
            top: 0;
            right: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
        }

        .top-manual-btn {
            background: #f39c12;
            color: white;
            border: none;
            border-radius: 0.5rem;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
            transition: all 0.2s ease;
            cursor: pointer;
            padding: 0;
        }

        .top-manual-btn:hover {
            background: color-mix(in srgb, #f39c12 85%, black);
            box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
        }

        .top-manual-btn .icon {
            font-size: 2rem;
            line-height: 1;
        }

        .manual-text {
            font-size: 0.875rem;
            color: #424242;
            font-weight: 500;
        }

        @media (max-width: 767px) {
            .top-manual-btn {
                width: 48px;
                height: 48px;
            }

            .top-manual-btn .icon {
                font-size: 1.5rem;
            }

            .manual-text {
                font-size: 0.75rem;
            }
        }

        /* 태블릿 */
        @media (min-width: 768px) and (max-width: 1023px) {
            .main-container {
                padding: 2.5rem !important;
            }

            h1.display-2 {
                font-size: 3rem;
            }

            .module-icon {
                width: 56px;
                height: 56px;
            }

            .top-manual-btn {
                width: 56px;
                height: 56px;
            }

            .top-manual-btn .icon {
                font-size: 1.75rem;
            }

            .manual-text {
                font-size: 0.8rem;
            }
        }
    </style>
</svelte:head>

<div class="d-flex align-items-center justify-content-center p-4" style="min-height: 100vh;">
    <div class="main-container rounded-4 shadow-lg p-5" style="width: 100%;">
        <div class="title-area text-center mb-5">
            <div class="manual-wrapper">
                <button
                    class="top-manual-btn"
                    on:click={() => navigateTo('/manual')}
                    aria-label="Open Manual"
                    title="Manual"
                >
                    <span class="icon">📖</span>
                </button>
                <div class="manual-text">Manual</div>
            </div>

            <h1 class="display-2 fw-light text-dark mb-3 position-relative" style="letter-spacing: -0.02em;">
                X-MAS
            </h1>
            <p class="lead text-muted mt-4 lh-base">
                eXpanded-code Mass Analysis System<br>
                for ncAA-containing peptides produced in cell-free systems
            </p>
        </div>

        <div class="row g-4 mt-4 mx-0">
            <div class="col-lg-6">
                <div class="module-card draw card h-100 border shadow-sm d-flex flex-column" role="button" tabindex="0" on:click={() => navigateTo('/draw')} on:keydown={(e) => e.key === 'Enter' && navigateTo('/draw')}>
                    <div class="p-4 flex-grow-1">
                        <img src="/images/My%20ncAA.png" alt="My ncAAs" class="module-icon rounded-3 mb-3 shadow" />
                        <h3 class="h4 fw-semibold text-dark mb-3">My ncAAs</h3>
                        <p class="text-muted mb-3 lh-base">My ncAAs allows users to incorporate novel substrates into their analyses by:</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Drawing the molecular structure of an ncAA</li>
                            <li class="mb-2">Automatically computing its molecular weight</li>
                            <li class="mb-2">Saving the ncAA for seamless use throughout X-MAS, enabling peptide mass prediction and identification of byproducts containing that ncAA</li>
                        </ul>
                    </div>
                    <div class="p-4 pt-0">
                        <button class="module-button btn text-white w-100 py-3 rounded-3 fw-medium" on:click|stopPropagation={() => navigateTo('/draw')}>Open My ncAAs</button>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="module-card potential card h-100 border shadow-sm d-flex flex-column" role="button" tabindex="0" on:click={() => navigateTo('/potential')} on:keydown={(e) => e.key === 'Enter' && navigateTo('/potential')}>
                    <div class="p-4 flex-grow-1">
                        <img src="/images/Modification.png" alt="Custom Enzymatic and Chemical Reactions" class="module-icon rounded-3 mb-3 shadow" />
                        <h3 class="h4 fw-semibold text-dark mb-3">Custom Enzymatic and Chemical Reactions</h3>
                        <p class="text-muted mb-3 lh-base">X-MAS predicts the masses of peptides that may be produced through user-defined enzymatic and chemical reactions. Users can define these reactions by drawing the target product, including:</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Single-site modifications</li>
                            <li class="mb-2">Crosslinking modifications (e.g., disulfide bond formation)</li>
                        </ul>
                    </div>
                    <div class="p-4 pt-0">
                        <button class="module-button btn text-white w-100 py-3 rounded-3 fw-medium" on:click|stopPropagation={() => navigateTo('/potential')}>Define Modifications</button>
                    </div>
                </div>
            </div>

            <div class="col-lg-6">
                <div class="module-card stm card h-100 border shadow-sm d-flex flex-column" role="button" tabindex="0" on:click={() => navigateTo('/stm')} on:keydown={(e) => e.key === 'Enter' && navigateTo('/stm')}>
                    <div class="p-4 flex-grow-1">
                        <img src="/images/STM.png" alt="Sequence-to-Mass" class="module-icon rounded-3 mb-3 shadow" />
                        <h3 class="h4 fw-semibold text-dark mb-3">Sequence-to-Mass (STM)</h3>
                        <p class="text-muted mb-3 lh-base">STM computes theoretical peptide masses based on the translational environment by allowing users to:</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Enter DNA or mRNA template sequences</li>
                            <li class="mb-2">Specify the amino acids present in the cell-free reaction</li>
                            <li class="mb-2">Apply user-defined chemical or enzymatic modifications</li>
                            <li class="mb-2">Load saved ncAAs and assign them to codons, enabling X-MAS to calculate theoretical masses for both intended products and possible byproducts containing ncAAs</li>
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
                        <img src="/images/MTS.png" alt="Mass-to-Sequences" class="module-icon rounded-3 mb-3 shadow" />
                        <h3 class="h4 fw-semibold text-dark mb-3">Mass-to-Sequences (MTS)</h3>
                        <p class="text-muted mb-3 lh-base">MTS enables users to resolve unexplained mass peaks by:</p>
                        <ul class="module-features ps-0 mb-0">
                            <li class="mb-2">Entering an observed m/z value</li>
                            <li class="mb-2">Specifying the set of canonical and non-canonical amino acids used in the reaction</li>
                            <li class="mb-2">Predicting peptide sequences whose theoretical masses correspond to the observed peak</li>
                        </ul>
                    </div>
                    <div class="p-4 pt-0">
                        <button class="module-button btn text-white w-100 py-3 rounded-3 fw-medium" on:click|stopPropagation={() => navigateTo('/mts')}>Identify unexpected products</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center mt-5 pt-4 border-top">
            <p class="text-muted">Developed for computational mass spectrometry research</p>
        </div>
    </div>
</div>

