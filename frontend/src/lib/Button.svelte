<script lang="ts">
  export let variant: 'primary' | 'danger' | 'secondary' = 'primary';
  export let disabled = false;
  export let onclick: (() => void) | undefined = undefined;
  
  const handleClick = () => {
    if (!disabled && onclick) {
      onclick();
    }
  };
</script>

<button 
  class="btn btn-{variant}"
  {disabled}
  on:click={handleClick}
>
  <slot />
</button>

<style>
  .btn {
    padding: 12px 32px;
    font-size: 16px;
    font-weight: 600;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  .btn:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    background-color: #5DADE2;
    color: #000000;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #3498DB;
  }

  .btn-danger {
    background-color: #FF6B6B;
    color: #FFFFFF;
  }

  .btn-danger:hover:not(:disabled) {
    background-color: #E74C3C;
  }

  .btn-secondary {
    background-color: #34495E;
    color: #FFFFFF;
  }

  .btn-secondary:hover:not(:disabled) {
    background-color: #2C3E50;
  }
</style>
