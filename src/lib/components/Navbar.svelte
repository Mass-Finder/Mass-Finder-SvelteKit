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

  <style>
    /* 모바일 반응형 */
    @media (max-width: 767px) {
      .navbar-brand {
        margin-left: 0 !important;
        margin-right: 0 !important;
        font-size: 1.25rem;
      }

      .container-fluid {
        padding-left: 1rem;
        padding-right: 1rem;
      }

      .navbar-nav {
        margin-top: 0.5rem;
      }

      .nav-link {
        padding: 0.5rem 0;
        font-size: 0.95rem;
      }
    }

    /* 태블릿 */
    @media (min-width: 768px) and (max-width: 1023px) {
      .navbar-brand {
        margin-left: 1rem !important;
        margin-right: 1rem !important;
      }
    }
  </style>
  