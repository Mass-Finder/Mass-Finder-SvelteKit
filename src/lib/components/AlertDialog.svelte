<script>
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let message = '';
  export let title = 'Alert';
  export let type = 'info'; // 'info', 'warning', 'error', 'success'

  const dispatch = createEventDispatcher();
  let dialogElement;
  let closeButton;

  const typeIcons = {
    info: '&#8505;',
    warning: '&#9888;',
    error: '&#10060;',
    success: '&#10004;'
  };

  const typeColors = {
    info: '#0d6efd',
    warning: '#ffc107',
    error: '#dc3545',
    success: '#198754'
  };

  function close() {
    dispatch('close');
  }

  function handleKeydown(e) {
    if (e.key === 'Escape') {
      close();
    }

    // Focus trap
    if (e.key === 'Tab') {
      e.preventDefault();
      closeButton?.focus();
    }
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      close();
    }
  }

  onMount(() => {
    // Focus on close button when dialog opens
    closeButton?.focus();

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  });

  onDestroy(() => {
    // Restore body scroll
    document.body.style.overflow = '';
  });
</script>

<div
  class="alert-backdrop"
  role="presentation"
  on:click={handleBackdropClick}
  on:keydown={handleKeydown}
>
  <div
    bind:this={dialogElement}
    role="alertdialog"
    aria-labelledby="alert-title"
    aria-describedby="alert-message"
    aria-modal="true"
    class="alert-dialog"
  >
    <div class="alert-header" style="border-left-color: {typeColors[type]}">
      <span class="alert-icon" style="color: {typeColors[type]}" aria-hidden="true">
        {@html typeIcons[type]}
      </span>
      <h2 id="alert-title" class="alert-title">{title}</h2>
    </div>

    <div class="alert-body">
      <p id="alert-message">{message}</p>
    </div>

    <div class="alert-footer">
      <button
        bind:this={closeButton}
        type="button"
        class="btn btn-primary"
        on:click={close}
        aria-label="Close alert dialog"
      >
        OK
      </button>
    </div>
  </div>
</div>

<style>
  .alert-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }

  .alert-dialog {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 90%;
    margin: 0 1rem;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .alert-header {
    padding: 1.5rem 1.5rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-left: 4px solid;
  }

  .alert-icon {
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 1;
  }

  .alert-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #212529;
  }

  .alert-body {
    padding: 0 1.5rem 1.5rem;
    padding-left: calc(1.5rem + 1.5rem + 0.75rem);
  }

  .alert-body p {
    margin: 0;
    color: #495057;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  .alert-footer {
    padding: 1rem 1.5rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    justify-content: flex-end;
  }

  .btn {
    padding: 0.5rem 1.5rem;
    font-size: 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #0d6efd;
    color: white;
  }

  .btn-primary:hover {
    background: #0b5ed7;
  }

  .btn-primary:focus {
    outline: 2px solid #0d6efd;
    outline-offset: 2px;
  }

  /* 모바일 반응형 */
  @media (max-width: 767px) {
    .alert-dialog {
      max-width: 100%;
      margin: 0 0.5rem;
    }

    .alert-header {
      padding: 1rem 1rem 0.75rem;
    }

    .alert-title {
      font-size: 1.1rem;
    }

    .alert-body {
      padding: 0 1rem 1rem;
      padding-left: calc(1rem + 1.5rem + 0.75rem);
      font-size: 0.9rem;
    }

    .alert-footer {
      padding: 0.75rem 1rem;
    }

    .btn {
      width: 100%;
      padding: 0.75rem;
    }
  }
</style>
