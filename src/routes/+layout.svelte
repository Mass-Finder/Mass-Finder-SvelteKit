<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import AlertDialog from '$lib/components/AlertDialog.svelte';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
	import { alertStore } from '$lib/stores/alertStore.js';

	// Create loading store and set context
	export const loading = writable(false);
	setContext('loading', loading);

	// 현재 경로가 루트 경로인지 확인
	$: isRootPath = $page.url.pathname === '/';

	// Alert dialog state
	let alertDialog = null;
	alertStore.subscribe(value => {
		alertDialog = value;
	});
</script>
  
<svelte:head>
	<title>X-MAS</title>
	<meta
	  name="description"
	  content=""
	/>
</svelte:head>
  
<!-- Show loading spinner based on store value -->
{#if $loading}
	<div class="loading-overlay" role="status" aria-live="polite" aria-label="Loading">
	  <div class="loading-spinner" aria-hidden="true" />
	  <span class="sr-only">Loading, please wait...</span>
	</div>
{/if}
  
<!-- Skip to main content link for keyboard navigation -->
<a href="#main-content" class="skip-link">Skip to main content</a>

{#if !isRootPath}
	<Navbar />
{/if}
<main id="main-content" class="content-container">
	<slot />
</main>
{#if !isRootPath}
	<Footer />
{/if}

<!-- Global Alert Dialog -->
{#if alertDialog}
	<AlertDialog
		message={alertDialog.message}
		title={alertDialog.title}
		type={alertDialog.type}
		on:close={() => alertStore.close()}
	/>
{/if}

<style>
	.skip-link {
		position: absolute;
		top: -40px;
		left: 0;
		background: #0d6efd;
		color: white;
		padding: 8px 16px;
		text-decoration: none;
		z-index: 10000;
		border-radius: 0 0 4px 0;
	}

	.skip-link:focus {
		top: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.loading-overlay {
	  position: fixed;
	  top: 0;
	  left: 0;
	  right: 0;
	  bottom: 0;
	  background: rgba(255, 255, 255, 0.8);
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  z-index: 10;
	}
	.loading-spinner {
	  border: 4px solid rgba(0, 0, 0, 0.1);
	  border-top: 4px solid #3498db;
	  border-radius: 50%;
	  width: 40px;
	  height: 40px;
	  animation: spin 1s linear infinite;
	}
	@keyframes spin {
	  0% {
		transform: rotate(0deg);
	  }
	  100% {
		transform: rotate(360deg);
	  }
	}

	.content-container {
	  max-width: 1200px;
	  margin: 0 auto;
	  padding: 0 1rem; /* 기본 모바일 여백 */
	  width: 100%;
	}

	/* 태블릿 이상 */
	@media (min-width: 768px) {
	  .content-container {
		padding: 0 2rem;
	  }
	}

	/* 데스크톱 */
	@media (min-width: 1024px) {
	  .content-container {
		padding: 0 3rem;
	  }
	}

	/* 큰 데스크톱 */
	@media (min-width: 1440px) {
	  .content-container {
		padding: 0 5rem;
	  }
	}
</style>
  