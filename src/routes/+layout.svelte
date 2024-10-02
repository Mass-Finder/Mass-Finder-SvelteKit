<script>
	import '../app.css';
	import Navbar from '$lib/components/Navbar.svelte';
	// import Footer from '$lib/components/Footer.svelte';
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
  
	// Create loading store and set context
	export const loading = writable(false);
	setContext('loading', loading);
  </script>
  
  <svelte:head>
	<title>Mass Finder</title>
	<meta
	  name="description"
	  content="E-commerce solution built with SvelteKit, a headless CMS integration, uses Stripe for payments, providing better performance and faster development time"
	/>
  </svelte:head>
  
  <!-- Show loading spinner based on store value -->
  {#if $loading}
	<div class="loading-overlay">
	  <div class="loading-spinner" />
	</div>
  {/if}
  
  <Navbar />
  <slot />
  <!-- <Footer /> -->
  
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
  </style>
  