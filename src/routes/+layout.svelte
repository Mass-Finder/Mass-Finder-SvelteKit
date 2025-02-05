<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	import { page } from '$app/stores';
  
	// Create loading store and set context
	export const loading = writable(false);
	setContext('loading', loading);

	// 현재 경로가 루트 경로인지 확인
	$: isRootPath = $page.url.pathname === '/';
</script>
  
<svelte:head>
	<title>Mass Finder</title>
	<meta
	  name="description"
	  content=""
	/>
</svelte:head>
  
<!-- Show loading spinner based on store value -->
{#if $loading}
	<div class="loading-overlay">
	  <div class="loading-spinner" />
	</div>
{/if}
  
{#if !isRootPath}
	<Navbar />
{/if}
<div class="content-container">
	<slot />
</div>
{#if !isRootPath}
	<Footer />
{/if}
  
<style>
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
	  padding: 0 5rem; /* 화면 좌우 여백 */
	  width: 100%;
	}
</style>
  