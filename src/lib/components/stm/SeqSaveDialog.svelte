<script>
  import { createEventDispatcher } from 'svelte';
  
  export let showDialog = false;
  export let initialContent = '';
  
  let title = '';
  let content = '';
  let contentError = false;
  
  const dispatch = createEventDispatcher();
  
  $: if (showDialog) {
    content = initialContent;
  }
  
  function handleSubmit() {
    if (!content.trim()) {
      contentError = true;
      return;
    }
    
    dispatch('save', { title: title.trim(), content: content.trim() });
    handleClose();
  }
  
  function handleClose() {
    showDialog = false;
    title = '';
    content = '';
    contentError = false;
    dispatch('close');
  }
</script>

{#if showDialog}
  <div class="dialog-overlay">
    <div class="dialog-content">
      <h2 class="dialog-title">Save Sequence</h2>
      
      <div class="form-group mb-3">
        <label for="title" class="form-label">Title (Optional)</label>
        <input
          type="text"
          id="title"
          class="form-control"
          bind:value={title}
          placeholder="Enter title"
        />
      </div>
      
      <div class="form-group mb-4">
        <label for="content" class="form-label">Content <span class="text-danger">*</span></label>
        <input
          type="text"
          id="content"
          class="form-control {contentError ? 'is-invalid' : ''}"
          bind:value={content}
          placeholder="Enter content"
          on:input={() => contentError = false}
        />
        {#if contentError}
          <div class="invalid-feedback">
            Content is required
          </div>
        {/if}
      </div>
      
      <div class="dialog-actions">
        <button type="button" class="btn btn-secondary me-2" on:click={handleClose}>
          Cancel
        </button>
        <button type="button" class="btn btn-primary" on:click={handleSubmit}>
          Save
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .dialog-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }
  
  .dialog-title {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
  }
  
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
</style> 