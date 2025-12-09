<script lang="ts">
  import Button from './Button.svelte';
  
  export let show = false;
  export let onConfirm: (() => void) | undefined = undefined;
  export let onCancel: (() => void) | undefined = undefined;
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };
  
  const handleBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) {
      handleCancel();
    }
  };
</script>

{#if show}
  <div class="modal-backdrop" on:click={handleBackdropClick} role="presentation">
    <div class="modal-content">
      <h2>Do you want to surrender?</h2>
      <div class="button-group">
        <Button variant="danger" onclick={handleCancel}>Cancel</Button>
        <Button variant="secondary" onclick={handleConfirm}>Confirm</Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #1a1a1a;
    padding: 40px;
    border-radius: 12px;
    text-align: center;
    min-width: 400px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  }

  h2 {
    color: #FFFFFF;
    margin: 0 0 30px 0;
    font-size: 24px;
  }

  .button-group {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
</style>
