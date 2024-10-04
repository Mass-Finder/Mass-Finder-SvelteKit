<script>
    import { onMount } from 'svelte';
  
    // 페이지 이동 예시
    function goToSection(sectionId) {
      // 해당 섹션 요소를 찾고 스크롤
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
      }
    }
  </script>
  
  <svelte:head>
    <title>User Guide</title>
  </svelte:head>
  
  <!-- Navigation Bar -->
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
    <div class="container-fluid">
      <a class="navbar-brand" href="#">User Guide</a>
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
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('introduction')}>Introduction</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('setup')}>Setup</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('usage')}>Usage</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="javascript:void(0)" on:click={() => goToSection('faq')}>FAQ</a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  
  <!-- Page Content -->
  <div class="container my-5">
    <!-- Introduction Section -->
    <section id="introduction" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Introduction</h2>
          <p class="card-text">
            Welcome to the user guide. This document provides a comprehensive introduction to the product, covering all the key features and functionalities you need to know.
          </p>
        </div>
      </div>
    </section>
  
    <!-- Setup Section -->
    <section id="setup" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Setup</h2>
          <p class="card-text">
            Follow these steps to set up your environment and get started with the product.
          </p>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">Step 1: Download the necessary files.</li>
            <li class="list-group-item">Step 2: Install the dependencies.</li>
            <li class="list-group-item">Step 3: Run the initialization script.</li>
          </ul>
        </div>
      </div>
    </section>
  
    <!-- Usage Section -->
    <section id="usage" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">Usage</h2>
          <p class="card-text">
            Below are some instructions on how to use the product effectively. Make sure to follow each step carefully.
          </p>
          
          <!-- Accordion for Usage Steps -->
          <div class="accordion" id="usageAccordion">
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingOne">
                <button
                  class="accordion-button"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  Step 1: Logging In
                </button>
              </h2>
              <div
                id="collapseOne"
                class="accordion-collapse collapse show"
                aria-labelledby="headingOne"
                data-bs-parent="#usageAccordion"
              >
                <div class="accordion-body">
                  Use your registered email and password to log into the platform. If you forgot your password, click on "Forgot Password".
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingTwo">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseTwo"
                  aria-expanded="false"
                  aria-controls="collapseTwo"
                >
                  Step 2: Navigating the Dashboard
                </button>
              </h2>
              <div
                id="collapseTwo"
                class="accordion-collapse collapse"
                aria-labelledby="headingTwo"
                data-bs-parent="#usageAccordion"
              >
                <div class="accordion-body">
                  Once logged in, you will be directed to the dashboard where you can view your data, manage settings, and perform actions.
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <h2 class="accordion-header" id="headingThree">
                <button
                  class="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapseThree"
                  aria-expanded="false"
                  aria-controls="collapseThree"
                >
                  Step 3: Customizing Settings
                </button>
              </h2>
              <div
                id="collapseThree"
                class="accordion-collapse collapse"
                aria-labelledby="headingThree"
                data-bs-parent="#usageAccordion"
              >
                <div class="accordion-body">
                  You can customize your preferences in the settings tab. Be sure to save your changes once you're done.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  
    <!-- FAQ Section -->
    <section id="faq" class="mb-5">
      <div class="card">
        <div class="card-body">
          <h2 class="card-title">FAQ</h2>
          <ul class="list-group list-group-flush">
            <li class="list-group-item">
              <strong>Q:</strong> How do I reset my password? <br />
              <strong>A:</strong> Go to the login page and click on "Forgot Password".
            </li>
            <li class="list-group-item">
              <strong>Q:</strong> Can I change my email address? <br />
              <strong>A:</strong> Yes, navigate to the settings page and update your email information.
            </li>
            <li class="list-group-item">
              <strong>Q:</strong> How do I contact support? <br />
              <strong>A:</strong> You can contact support through the "Help" section or by emailing support@example.com.
            </li>
          </ul>
        </div>
      </div>
    </section>
  
    <!-- Footer with CTA -->
    <footer class="text-center mt-5">
      <p class="mb-2">Have more questions?</p>
      <a href="mailto:support@example.com" class="btn btn-primary">Contact Support</a>
    </footer>
  </div>
  
  <style>
    .card {
      margin-bottom: 2rem;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
    .card-body {
      padding: 2rem;
    }
    .accordion-button {
      font-weight: bold;
    }
  </style>
  