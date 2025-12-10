<script lang="ts">
  import { onMount } from 'svelte';
  import Grid from './Grid.svelte';
  import Button from './Button.svelte';
  import SurrenderDialog from './SurrenderDialog.svelte';
  import DefeatScreen from './DefeatScreen.svelte';
  import { gridApi, screenApi, planningApi } from '../services/api';
  import { playerGrid, opponentGrid, shipColors, currentScreen } from '../stores/gameStore';
  
  let loading = false;
  let showSurrenderDialog = false;
  let showDefeatScreen = false;
  
  onMount(async () => {
    loading = true;
    try {
      const playerGridData = await gridApi.getPlayerGrid();
      playerGrid.set(playerGridData);
      
      const pcGridData = await gridApi.getPcGrid();
      opponentGrid.set(pcGridData);
      
      // Load ship colors
      const colors = await planningApi.getColors();
      shipColors.set(colors);
    } catch (error) {
      console.error('Failed to load game data:', error);
    } finally {
      loading = false;
    }
  });
  
  const handlePlayerCellClick = (row: number, col: number) => {
    // Player's own grid - no action needed during game
    console.log('Player grid clicked:', row, col);
  };
  
  const handleOpponentCellClick = async (row: number, col: number) => {
    try {
      // Attack opponent's grid
      console.log('Attacking opponent at:', row, col);
      
      // TODO: Implement attack logic with backend
      // This would involve:
      // 1. Send attack to backend
      // 2. Get response (hit/miss)
      // 3. Update opponent grid
      // 4. AI makes counter-attack
      // 5. Update player grid
      
    } catch (error) {
      console.error('Failed to attack:', error);
    }
  };
  
  const handleSurrender = () => {
    showSurrenderDialog = true;
  };
  
  const handleSurrenderConfirm = async () => {
    showSurrenderDialog = false;
    showDefeatScreen = true;
  };
  
  const handleSurrenderCancel = () => {
    showSurrenderDialog = false;
  };
  
  const handleDefeatScreenOk = async () => {
    try {
      await screenApi.updateScreen('menu');
      currentScreen.set('menu');
    } catch (error) {
      console.error('Failed to return to menu:', error);
    } finally {
      showDefeatScreen = false;
    }
  };
  
  const handleClose = async () => {
    try {
      await screenApi.updateScreen('menu');
      currentScreen.set('menu');
    } catch (error) {
      console.error('Failed to close game:', error);
    }
  };
</script>

<div class="game-screen">
  <button class="close-button" on:click={handleClose}>✕</button>
  
  <div class="game-content">
    {#if loading}
      <p>Loading game...</p>
    {:else}
      <div class="grid-container">
        <div class="player-grid">
          <h2 class="grid-title player">YOU</h2>
          <Grid 
            grid={$playerGrid}
            colors={$shipColors}
            onCellClick={handlePlayerCellClick}
            hideShips={false}
            showHoverEffect={false}
          />
        </div>
        
        <div class="opponent-grid">
          <h2 class="grid-title opponent">OPPONENT</h2>
          <Grid 
            grid={$opponentGrid}
            colors={$shipColors}
            onCellClick={handleOpponentCellClick}
            hideShips={true}
            showHoverEffect={true}
          />
        </div>
      </div>
    {/if}
  </div>
  
  <div class="game-controls">
    <Button variant="danger" onclick={handleSurrender}>
      Surrender
    </Button>
  </div>
  
  <SurrenderDialog 
    show={showSurrenderDialog}
    onConfirm={handleSurrenderConfirm}
    onCancel={handleSurrenderCancel}
  />
  
  <DefeatScreen 
    show={showDefeatScreen}
    onOk={handleDefeatScreenOk}
  />
</div>

<style>
  .game-screen {
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

  .game-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .grid-container {
    display: flex;
    gap: 60px;
    align-items: flex-start;
  }

  .player-grid,
  .opponent-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .grid-title {
    text-align: center;
    font-size: 28px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin: 0;
  }

  .grid-title.player {
    color: #5DADE2;
  }

  .grid-title.opponent {
    color: #FF6B6B;
  }

  .game-controls {
    margin-top: 40px;
  }
</style>
