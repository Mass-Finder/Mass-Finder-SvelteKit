<script>
  // Footer component for X-MAS application
</script>

<footer class="bg-dark text-white py-4 mt-5">
  <div class="container">
    <div class="row align-items-center">
      <!-- Left: Address Information -->
      <div class="col-lg-6 col-md-12 mb-4 mb-lg-0">
        <h5 class="footer-title">Address</h5>
        <p class="footer-address mb-1">
          Department of Chemical Engineering, POSTECH 77, Cheongam-ro, Nam-Gu,
        </p>
        <p class="footer-address mb-1">
          Pohang, Gyeongbuk-Do, Korea (37673)
        </p>
        <p class="footer-contact mb-1">
          TEL: +82-54-279-5953
        </p>
        <p class="footer-contact mb-0">
          E-mail: <a href="mailto:jgoolee@postech.ac.kr" class="email-link">jgoolee@postech.ac.kr</a>
        </p>
      </div>

      <!-- Right: Logo Images -->
      <div class="col-lg-6 col-md-12">
        <div class="row align-items-center justify-content-center justify-content-lg-end">
          <!-- Left logos (stacked) -->
          <div class="col-6 col-sm-4 logo-stack">
            <img
              src="/images/CHB.JPG"
              alt="CHB Logo"
              class="footer-logo chb-logo mb-2"
            />
            <img
              src="/images/Postech_Logotype.svg"
              alt="POSTECH Logo"
              class="footer-logo postech-logo"
            />
          </div>
          <!-- Right logo -->
          <div class="col-6 col-sm-4 text-center text-sm-end">
            <img
              src="/images/chemical engineering.png"
              alt="Chemical Engineering Logo"
              class="footer-logo chem-logo"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-4 pt-3 border-top border-secondary">
      <p class="mb-0 copyright">Copyright &copy; chemical engineering. All rights reserve</p>
    </div>
  </div>
</footer>

<style>
  footer {
    background-color: #1a1a2e !important;
  }

  .footer-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: #f8f9fa;
  }

  .footer-address,
  .footer-contact {
    font-size: 0.9rem;
    color: #adb5bd;
    line-height: 1.6;
  }

  .email-link {
    color: #6ea8fe;
    text-decoration: none;
    transition: color 0.2s ease;
  }

  .email-link:hover {
    color: #9ec5fe;
    text-decoration: underline;
  }

  .logo-stack {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .footer-logo {
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  .chb-logo {
    width: 156px;
    max-height: 78px;
    border-radius: 4px;
  }

  .postech-logo {
    width: 156px;
    max-height: 52px;
  }

  .chem-logo {
    width: 140px;
    max-height: 120px;
  }

  .copyright {
    font-size: 0.85rem;
    color: #6c757d;
  }

  /* Tablet */
  @media (min-width: 768px) and (max-width: 991px) {
    .row.align-items-center > .col-md-12:first-child {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo-stack {
      align-items: center;
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    footer {
      padding: 1.5rem 0 !important;
    }

    .footer-title {
      font-size: 1rem;
      text-align: center;
    }

    .footer-address,
    .footer-contact {
      font-size: 0.8rem;
      text-align: center;
    }

    .logo-stack {
      align-items: center;
      margin-bottom: 1rem;
    }

    .chb-logo {
      width: 130px;
      max-height: 65px;
    }

    .postech-logo {
      width: 130px;
      max-height: 46px;
    }

    .chem-logo {
      width: 110px;
      max-height: 100px;
    }

    .copyright {
      font-size: 0.75rem;
    }
  }

  /* Small mobile */
  @media (max-width: 400px) {
    .chb-logo {
      width: 104px;
    }

    .postech-logo {
      width: 104px;
    }

    .chem-logo {
      width: 90px;
    }
  }
</style>
