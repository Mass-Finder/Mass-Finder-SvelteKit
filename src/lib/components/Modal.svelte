<script>
    export let onClose;
  </script>
  
  <!-- Bootstrap Modal Structure -->
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" on:click={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
  
  <style>
    /* Override Bootstrap modal backdrop to always show */
    .modal.fade.show {
      display: block;
    }
  </style>
  