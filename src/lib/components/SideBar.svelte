<script>
    import { onMount } from 'svelte';
    import { page } from '$app/stores'; // Import the current page store from SvelteKit
    import { get } from 'svelte/store';
  
    let menuItems = []; // Will store menu items parsed from JSON
    let currentPath = ''; // Will store the current path
  
    // Example JSON to simulate fetching menu items
    const exampleMenuData = [
      { name: 'Home', path: '/' },
      { name: 'Link', path: '/link' },
      {
        name: 'Dropdown',
        path: '#',
        dropdown: [
          { name: 'Action', path: '/action' },
          { name: 'Another action', path: '/another-action' },
          { name: 'Something else here', path: '/something-else' }
        ]
      },
      { name: 'Disabled', path: '#', disabled: true }
    ];
  
    onMount(() => {
      // Fetch and parse menu items from JSON (Simulating with exampleMenuData)
      menuItems = exampleMenuData;
      
      // Subscribe to the current page store to highlight active menu
      currentPath = get(page).url.pathname;
    });
  
    // Function to highlight the active route
    const isActive = (path) => currentPath === path;
  </script>
  
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <a class="navbar-brand" href="/">Navbar</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarSupportedContent"
      aria-controls="navbarSupportedContent"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
  
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
        {#each menuItems as menu}
          {#if !menu.dropdown}
            <li class="nav-item {isActive(menu.path) ? 'active' : ''}">
              <a
                class="nav-link {isActive(menu.path) ? 'text-white bg-primary' : ''} {menu.disabled ? 'disabled' : ''}"
                href={menu.path}
              >
                {menu.name}
              </a>
            </li>
          {:else}
            <!-- Handle dropdown menus -->
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="/"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {menu.name}
              </a>
              <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                {#each menu.dropdown as item}
                  <a
                    class="dropdown-item {isActive(item.path) ? 'text-white bg-primary' : ''}"
                    href={item.path}
                  >
                    {item.name}
                  </a>
                {/each}
              </div>
            </li>
          {/if}
        {/each}
      </ul>
    </div>
  </nav>
  
  <style>
    /* Optional: Active item styling */
    .active > .nav-link {
      color: white !important;
      background-color: #007bff; /* Bootstrap primary color */
    }
  </style>
  