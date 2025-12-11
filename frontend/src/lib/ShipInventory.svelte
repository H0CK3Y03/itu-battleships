<script lang="ts">
  import type { IShip } from '../types/interfaces';
  import { selectedInventoryShip, activeShip, playerGrid } from '../stores/gameStore';
  import { planningApi } from '../services/api';
  
  export let ships: IShip[] | null;
  
  // Auto-select first ship if nothing selected and ships available
  // BUT only if there's no active placed ship
  $: if (!$selectedInventoryShip && !$activeShip && ships && ships.length > 0) {
    selectedInventoryShip.set(ships[0]);
  }
  
  // Safety: If active ship exists, clear inventory selection
  $: if ($activeShip && $selectedInventoryShip) {
    selectedInventoryShip.set(null);
  }
  
  const handleShipClick = async (ship: IShip) => {
    // If there's an active placed ship, deselect it on the backend
    if ($activeShip) {
      try {
        // Call the backend to deselect the active ship
        await planningApi.handleActiveShip($activeShip.row, $activeShip.col);
        
        // Refresh grid state to ensure it's deselected
        const data = await planningApi.getPlanningData();
        activeShip.set(data.active_ship);
        playerGrid.set(data.player_grid);
      } catch (error) {
        console.error('Failed to deselect active ship:', error);
        return; // Don't proceed with inventory selection if deselection failed
      }
    }
    
    // Toggle selection
    selectedInventoryShip.update(current => {
      if (current?.id === ship.id) {
        return null; // Deselect if clicking same ship
      }
      return ship;
    });
  };
  
  const groupShipsBySize = (ships: IShip[] | null): Map<number, IShip[]> => {
    const grouped = new Map<number, IShip[]>();
    if (!ships) return grouped;
    
    ships.forEach(ship => {
      const existing = grouped.get(ship.size) || [];
      existing.push(ship);
      grouped.set(ship.size, existing);
    });
    
    return grouped;
  };
  
  $: groupedShips = groupShipsBySize(ships);
  $: sortedSizes = Array.from(groupedShips.keys()).sort((a, b) => b - a);
</script>

<div class="inventory">
  <h3>Ships</h3>
  <div class="ships-container">
    {#if ships && ships.length > 0}
      {#each sortedSizes as size}
        <div 
          class="ship-group"
          class:selected={groupedShips.get(size)?.some(s => s.id === $selectedInventoryShip?.id)}
          on:click={() => groupedShips.get(size)?.[0] && handleShipClick(groupedShips.get(size)![0])}
          on:keydown={(e) => e.key === 'Enter' && groupedShips.get(size)?.[0] && handleShipClick(groupedShips.get(size)![0])}
          role="button"
          tabindex="0"
        >
          <span class="ship-count">{groupedShips.get(size)?.length}×</span>
          <div class="ship-preview">
            {#each Array(size) as _, i}
              <div class="ship-cell" style="background-color: {groupedShips.get(size)?.[0]?.color || '#FFFFFF'}"></div>
            {/each}
          </div>
        </div>
      {/each}
    {:else}
      <p class="empty-message">All ships placed!</p>
    {/if}
  </div>
</div>

<style>
  .inventory {
    background-color: rgba(0, 0, 0, 0.5);
    padding: 20px;
    border-radius: 8px;
    min-width: 200px;
  }

  h3 {
    color: #FFFFFF;
    margin: 0 0 16px 0;
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 2px;
  }

  .ships-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .ship-group {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid transparent;
  }

  .ship-group:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  .ship-group.selected {
    border: 2px solid #FFFFFF;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.1);
  }

  .ship-count {
    color: #FFFFFF;
    font-size: 18px;
    font-weight: bold;
    min-width: 30px;
  }

  .ship-preview {
    display: flex;
    gap: 2px;
  }

  .ship-cell {
    width: 20px;
    height: 20px;
    border-radius: 2px;
    background-color: #FFFFFF;
  }

  .empty-message {
    color: #5DADE2;
    font-style: italic;
    margin: 20px 0;
    text-align: center;
  }
</style>
