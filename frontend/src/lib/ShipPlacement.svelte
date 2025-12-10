<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Grid from './Grid.svelte';
  import ShipInventory from './ShipInventory.svelte';
  import Button from './Button.svelte';
  import { planningApi, screenApi } from '../services/api';
  import { 
    playerGrid, 
    availableShips, 
    placedShips, 
    activeShip,
    shipColors,
    currentScreen,
    canConfirmPlacement
  } from '../stores/gameStore';
  import type { IShip } from '../types/interfaces';
  
  let loading = false;
  
  onMount(async () => {
    loading = true;
    try {
      const data = await planningApi.getPlanningData();
      playerGrid.set(data.player_grid);
      
      // If available_ships or all_ships is null/empty, initialize them
      if (!data.available_ships || data.available_ships.length === 0) {
        if (!data.all_ships || data.all_ships.length === 0) {
          // Call set-available-ships to initialize ships
          await planningApi.setAvailableShips();
          // Reload data after initialization
          const updatedData = await planningApi.getPlanningData();
          availableShips.set(updatedData.available_ships);
          placedShips.set(updatedData.placed_ships);
          activeShip.set(updatedData.active_ship);
          
          const colors = await planningApi.getColors();
          console.log('ShipPlacement - colors loaded:', colors);
          shipColors.set(colors);
          console.log('ShipPlacement - shipColors store updated');
        } else {
          // We have all_ships but not available_ships, initialize from all_ships
          await planningApi.setAvailableShips();
          const updatedData = await planningApi.getPlanningData();
          availableShips.set(updatedData.available_ships);
          placedShips.set(updatedData.placed_ships);
          activeShip.set(updatedData.active_ship);
          
          const colors = await planningApi.getColors();
          console.log('ShipPlacement - colors loaded:', colors);
          shipColors.set(colors);
          console.log('ShipPlacement - shipColors store updated');
        }
      } else {
        availableShips.set(data.available_ships);
        placedShips.set(data.placed_ships);
        activeShip.set(data.active_ship);
        
        const colors = await planningApi.getColors();
        console.log('ShipPlacement - colors loaded:', colors);
        shipColors.set(colors);
        console.log('ShipPlacement - shipColors store updated');
      }
    } catch (error) {
      console.error('Failed to load planning data:', error);
    } finally {
      loading = false;
    }
    
    // Add keyboard event listeners
    window.addEventListener('keydown', handleKeyDown);
  });
  
  onDestroy(() => {
    // Remove keyboard event listeners
    window.removeEventListener('keydown', handleKeyDown);
  });
  
  const handleKeyDown = async (event: KeyboardEvent) => {
    // R key for rotate
    if (event.key === 'r' || event.key === 'R') {
      event.preventDefault();
      if ($activeShip) {
        await handleCellRightClick(0, 0); // Trigger rotation
      }
    }
    // Delete key for remove ship
    else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      if ($activeShip) {
        await handleUndo();
      }
    }
  };
  
  const handleCellClick = async (row: number, col: number) => {
    try {
      const currentGrid = $playerGrid;
      const cellValue = currentGrid.tiles[row][col];
      
      // If clicking on empty cell
      if (cellValue === 'empty') {
        // If we have available ships, place the first one
        if ($availableShips && $availableShips.length > 0) {
          const shipToPlace = $availableShips[0];
          await planningApi.placeShip(shipToPlace, row, col);
          
          // Refresh data
          const data = await planningApi.getPlanningData();
          playerGrid.set(data.player_grid);
          availableShips.set(data.available_ships);
          placedShips.set(data.placed_ships);
          activeShip.set(data.active_ship);
        }
      } else if (cellValue !== 'empty') {
        // Clicking on a placed ship - select/deselect it
        await planningApi.handleActiveShip(row, col);
        
        // Refresh data
        const data = await planningApi.getPlanningData();
        activeShip.set(data.active_ship);
        playerGrid.set(data.player_grid);
      }
    } catch (error) {
      console.error('Failed to handle cell click:', error);
    }
  };
  
  const handleCellRightClick = async (row: number, col: number) => {
    try {
      // Right click to rotate active ship
      if ($activeShip) {
        await planningApi.rotateActiveShip();
        
        // Refresh data
        const data = await planningApi.getPlanningData();
        playerGrid.set(data.player_grid);
        activeShip.set(data.active_ship);
        placedShips.set(data.placed_ships);
      }
    } catch (error) {
      console.error('Failed to rotate ship:', error);
    }
  };
  
  const handleUndo = async () => {
    // Remove the last placed ship (or active ship if selected)
    try {
      if ($activeShip) {
        await planningApi.removeActiveShip();
      } else if ($placedShips && $placedShips.length > 0) {
        // Select the last placed ship and remove it
        const lastShip = $placedShips[$placedShips.length - 1];
        await planningApi.handleActiveShip(lastShip.row, lastShip.col);
        await planningApi.removeActiveShip();
      }
      
      // Refresh data
      const data = await planningApi.getPlanningData();
      playerGrid.set(data.player_grid);
      availableShips.set(data.available_ships);
      placedShips.set(data.placed_ships);
      activeShip.set(data.active_ship);
    } catch (error) {
      console.error('Failed to undo:', error);
    }
  };
  
  const handleClear = async () => {
    try {
      await planningApi.clearGrid();
      
      // Refresh data
      const data = await planningApi.getPlanningData();
      playerGrid.set(data.player_grid);
      availableShips.set(data.available_ships);
      placedShips.set(data.placed_ships);
      activeShip.set(data.active_ship);
    } catch (error) {
      console.error('Failed to clear grid:', error);
    }
  };
  
  const handleConfirm = async () => {
    if (!$canConfirmPlacement) {
      alert('Please place all ships before confirming!');
      return;
    }
    
    try {
      await screenApi.updateScreen('game');
      currentScreen.set('game');
    } catch (error) {
      console.error('Failed to confirm placement:', error);
    }
  };
  
  const handleClose = async () => {
    try {
      // Reset planning data before going back to menu
      await planningApi.resetPlanning();
      await screenApi.updateScreen('menu');
      currentScreen.set('menu');
    } catch (error) {
      console.error('Failed to go back:', error);
    }
  };
</script>

<div class="ship-placement">
  <button class="close-button" on:click={handleClose}>✕</button>
  
  <div class="placement-content">
    <div class="grid-section">
      {#if loading}
        <p>Loading...</p>
      {:else}
        <Grid 
          grid={$playerGrid} 
          colors={$shipColors}
          onCellClick={handleCellClick}
          onCellRightClick={handleCellRightClick}
          hideShips={false}
          showHoverEffect={true}
        />
      {/if}
    </div>
    
    <div class="inventory-section">
      <ShipInventory ships={$availableShips} />
    </div>
  </div>
  
  <div class="controls">
    <button class="icon-button" on:click={handleUndo} title="Undo">
      ←
    </button>
    
    <Button 
      variant="primary" 
      onclick={handleConfirm}
      disabled={!$canConfirmPlacement}
    >
      Confirm
    </Button>
    
    <button class="icon-button danger" on:click={handleClear} title="Clear all">
      🗑
    </button>
  </div>
</div>

<style>
  .ship-placement {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px;
    position: relative;
  }

  .close-button {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    color: #FFFFFF;
    font-size: 32px;
    cursor: pointer;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-button:hover {
    color: #FF6B6B;
    transform: scale(1.2);
  }

  .placement-content {
    display: flex;
    gap: 40px;
    align-items: flex-start;
    margin-bottom: 40px;
  }

  .grid-section {
    flex: 1;
  }

  .inventory-section {
    flex-shrink: 0;
  }

  .controls {
    display: flex;
    gap: 40px;
    align-items: center;
    justify-content: center;
  }

  .icon-button {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #34495E;
    color: #FFFFFF;
    border: none;
    font-size: 24px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .icon-button:hover {
    background-color: #2C3E50;
    transform: scale(1.1);
  }

  .icon-button.danger {
    background-color: #E74C3C;
  }

  .icon-button.danger:hover {
    background-color: #C0392B;
  }
</style>
