<script lang="ts">
  import Button from './Button.svelte';
  
  export let show = false;
  export let onOk: (() => void) | undefined = undefined;
  
  const handleOk = () => {
    if (onOk) {
      onOk();
    }
  };
</script>

{#if show}
  <div class="modal-backdrop" role="presentation">
    <div class="modal-content">
      <h2>You Win!</h2>
      <div class="button-group">
        <Button variant="primary" onclick={handleOk}>OK</Button>
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
    border: 2px solid #5DADE2;
  }

  h2 {
    color: #5DADE2;
    margin: 0 0 30px 0;
    font-size: 32px;
    font-weight: bold;
  }

  .button-group {
    display: flex;
    gap: 20px;
    justify-content: center;
  }
</style>
