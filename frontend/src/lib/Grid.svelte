<script lang="ts">
  import type { IGrid, IShip, IPlacedShip } from '../types/interfaces';
  
  export let grid: IGrid;
  export let colors: Record<string, string> = {};
  export let onCellClick: ((row: number, col: number) => void) | undefined = undefined;
  export let onCellRightClick: ((row: number, col: number) => void) | undefined = undefined;
  export let onCellMouseEnter: ((row: number, col: number) => void) | undefined = undefined;
  export let onGridMouseLeave: (() => void) | undefined = undefined;
  export let hideShips = false;
  export let showHoverEffect = true;
  export let activeShipName: string | null = null;
  
  // Preview props
  export let previewRow: number | null = null;
  export let previewCol: number | null = null;
  export let previewShip: IShip | IPlacedShip | null = null;
  export let previewRotation: number = 0;
  export let previewValid: boolean = true;
  
  // Debug logging whenever colors prop changes
  $: {
    console.log('Grid - colors prop updated:', colors);
    console.log('Grid - colors keys:', Object.keys(colors));
    console.log('Grid - hideShips:', hideShips);
  }
  
  // Debug logging for grid data
  $: {
    if (grid && grid.tiles && grid.tiles.length > 0) {
      const sampleRow = grid.tiles[0];
      const nonEmptyCells = sampleRow.filter(cell => cell !== 'empty');
      console.log('Grid - sample row:', sampleRow);
      console.log('Grid - non-empty cells in row 0:', nonEmptyCells);
    }
  }
  
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
  
  const handleCellMouseEnter = (row: number, col: number) => {
    if (onCellMouseEnter) {
      onCellMouseEnter(row, col);
    }
  };

  const handleGridMouseLeave = () => {
    if (onGridMouseLeave) {
      onGridMouseLeave();
    }
  };
  
  function isPreviewCell(rowIndex: number, colIndex: number): boolean {
    if (previewRow === null || previewCol === null || !previewShip) {
      return false;
    }
    
    const size = previewShip.size;
    
    if (previewRotation === 0) {
      // Horizontal preview
      return rowIndex === previewRow && colIndex >= previewCol && colIndex < previewCol + size;
    } else {
      // Vertical preview
      return colIndex === previewCol && rowIndex >= previewRow && rowIndex < previewRow + size;
    }
  }

  function getPreviewColor(): string {
    if (!previewShip) return '';
    return previewValid ? 'rgba(0, 255, 0, 0.3)' : 'rgba(255, 0, 0, 0.3)';
  }
  
  $: getCellColor = (cellValue: string): string => {
    // Debug logging for color lookup
    if (cellValue !== 'empty') {
      const resolvedColor = colors[cellValue] || '#2C3E50';
      console.log(`Grid - getCellColor("${cellValue}"):`, resolvedColor, '| colors obj:', colors);
    }
    
    if (cellValue === 'empty' || hideShips) {
      return '#2C3E50';
    }
    return colors[cellValue] || '#2C3E50';
  };
  
  const getCellStatus = (cellValue: string): string => {
    if (cellValue === 'hit') return 'hit';
    if (cellValue === 'miss') return 'miss';
    return '';
  };
</script>

<div class="grid-container" role="region" on:mouseleave={handleGridMouseLeave}>
  <div class="grid" style="--grid-size: {grid.gridSize}">
    {#each grid.tiles as row, rowIndex}
      {#each row as cell, colIndex}
        <button
          class="cell {getCellStatus(cell)}"
          class:hoverable={showHoverEffect}
          class:active-ship={!hideShips && cell === activeShipName}
          class:preview={isPreviewCell(rowIndex, colIndex)}
          style="background-color: {isPreviewCell(rowIndex, colIndex) ? getPreviewColor() : getCellColor(cell)}"
          on:click={() => handleCellClick(rowIndex, colIndex)}
          on:contextmenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
          on:mouseenter={() => handleCellMouseEnter(rowIndex, colIndex)}
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

  .cell.active-ship {
    outline: 3px solid #FFFFFF;
    outline-offset: -3px;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    z-index: 10;
    position: relative;
  }

  .cell.preview {
    border: 2px dashed #FFFFFF;
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
    z-index: 5;
    position: relative;
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
