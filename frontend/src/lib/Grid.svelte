<script lang="ts">
  import type { IGrid } from '../types/interfaces';
  
  export let grid: IGrid;
  export let colors: Record<string, string> = {};
  export let onCellClick: ((row: number, col: number) => void) | undefined = undefined;
  export let onCellRightClick: ((row: number, col: number) => void) | undefined = undefined;
  export let hideShips = false;
  export let showHoverEffect = true;
  
  const handleCellClick = (row: number, col: number) => {
    if (onCellClick) {
      onCellClick(row, col);
    }
  };
  
  const handleCellRightClick = (event: MouseEvent, row: number, col: number) => {
    event.preventDefault();
    if (onCellRightClick) {
      onCellRightClick(row, col);
    }
  };
  
  $: getCellColor = (cellValue: string): string => {
    if (cellValue === 'empty' || hideShips) {
      return '#2C3E50';
    }
    return colors[cellValue] || '#2C3E50';
  };
  
  $: getCellStatus = (cellValue: string): string => {
    if (cellValue === 'hit') return 'hit';
    if (cellValue === 'miss') return 'miss';
    return '';
  };
</script>

<div class="grid-container">
  <div class="grid" style="--grid-size: {grid.gridSize}">
    {#each grid.tiles as row, rowIndex}
      {#each row as cell, colIndex}
        <button
          class="cell {getCellStatus(cell)}"
          class:hoverable={showHoverEffect}
          style="background-color: {getCellColor(cell)}"
          on:click={() => handleCellClick(rowIndex, colIndex)}
          on:contextmenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
        >
          {#if cell === 'hit'}
            <span class="hit-marker">✕</span>
          {:else if cell === 'miss'}
            <span class="miss-marker">•</span>
          {/if}
        </button>
      {/each}
    {/each}
  </div>
</div>

<style>
  .grid-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(var(--grid-size), 1fr);
    gap: 4px;
    padding: 16px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
  }

  .cell {
    aspect-ratio: 1;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .cell.hoverable:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(93, 173, 226, 0.5);
  }

  .cell.hit {
    background-color: #E74C3C !important;
  }

  .cell.miss {
    background-color: #34495E !important;
  }

  .hit-marker {
    color: #FFFFFF;
    font-size: 24px;
    font-weight: bold;
  }

  .miss-marker {
    color: #BDC3C7;
    font-size: 32px;
  }
</style>
