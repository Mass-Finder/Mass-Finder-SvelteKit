<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';
    // import { menuStore } from '$lib/stores/menuStore';
    import { goto } from '$app/navigation';
  
    let menus = [];
  
    onMount(async () => {
      if (browser) {
        const response = await fetch('/json/menu.json');
        menus = await response.json();
        // menuStore.set(menus);
      }
    });
  
    function onTapDraw() {
      const isLocalhost =
        window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      window.location.href = isLocalhost ? 'draw' : '/draw.html';
    }
  </script>
  
  <!-- Bootstrap Navbar Implementation -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
    <div class="container-fluid">
      <!-- Brand name -->
      <a class="navbar-brand mx-5 font-extrabold" href="/">X-MAS</a>
  
      <!-- Toggler/collapsible Button for mobile view -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
  
      <!-- Collapsible content -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <!-- Optional: Navigation items from menus JSON (currently placeholder) -->
        <ul class="navbar-nav me-auto">
          {#each menus as menu}
            <li class="nav-item">
              <a class="nav-link" href={menu.link}>{menu.title}</a>
            </li>
          {/each}
        </ul>     
      </div>
    </div>
  </nav>
  