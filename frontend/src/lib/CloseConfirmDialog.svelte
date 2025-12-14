<!-- Author: Adam Vesely (xvesela00) -->

<script lang="ts">
  export let show = false;
  export let onConfirm: () => void;
  export let onCancel: () => void;
</script>

{#if show}
  <div class="modal-backdrop" on:click={onCancel}>
    <div class="modal-content" on:click|stopPropagation>
      <h2>Quit to Menu?</h2>
      <p>Your progress will be lost. Are you sure you want to quit?</p>
      <div class="button-group">
        <button class="btn btn-secondary" on:click={onCancel}>
          Cancel
        </button>
        <button class="btn btn-danger" on:click={onConfirm}>
          Quit
        </button>
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
    margin: 0 0 20px 0;
    font-size: 24px;
  }

  p {
    color: #CCCCCC;
    margin: 0 0 30px 0;
    font-size: 16px;
  }

  .button-group {
    display: flex;
    gap: 20px;
    justify-content: center;
  }

  .btn {
    padding: 12px 32px;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .btn-secondary {
    background-color: #34495E;
    color: #FFFFFF;
  }

  .btn-secondary:hover {
    background-color: #2C3E50;
    transform: scale(1.05);
  }

  .btn-danger {
    background-color: #E74C3C;
    color: #FFFFFF;
  }

  .btn-danger:hover {
    background-color: #C0392B;
    transform: scale(1.05);
  }
</style>
