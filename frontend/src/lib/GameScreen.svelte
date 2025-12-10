<script lang="ts">
  import { onMount } from 'svelte';
  import Grid from './Grid.svelte';
  import Button from './Button.svelte';
  import SurrenderDialog from './SurrenderDialog.svelte';
  import DefeatScreen from './DefeatScreen.svelte';
  import VictoryScreen from './VictoryScreen.svelte';
  import { gridApi, screenApi, planningApi, gameApi } from '../services/api';
  import { playerGrid, opponentGrid, shipColors, currentScreen } from '../stores/gameStore';
  
  let loading = false;
  let showSurrenderDialog = false;
  let showDefeatScreen = false;
  let showVictoryScreen = false;
  let isAttacking = false;
  let gameOver = false;
  
  onMount(async () => {
    loading = true;
    try {
      // Initialize game - place PC ships
      await gameApi.initGame();
      
      const playerGridData = await gridApi.getPlayerGrid();
      playerGrid.set(playerGridData);
      console.log('GameScreen - playerGrid loaded:', playerGridData);
      
      const pcGridData = await gridApi.getPcGrid();
      opponentGrid.set(pcGridData);
      
      // Load ship colors
      const colors = await planningApi.getColors();
      console.log('GameScreen - colors loaded:', colors);
      shipColors.set(colors);
      console.log('GameScreen - shipColors store updated');
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
    if (isAttacking || gameOver) return;
    
    const cellValue = $opponentGrid.tiles[row][col];
    if (cellValue === 'hit' || cellValue === 'miss') {
      return; // Already attacked
    }
    
    isAttacking = true;
    
    try {
      // Player attacks
      const attackResult = await gameApi.playerAttack(row, col);
      console.log('Player attack result:', attackResult);
      
      // Update opponent grid
      const updatedPcGrid = await gridApi.getPcGrid();
      opponentGrid.set(updatedPcGrid);
      
      if (attackResult.gameOver) {
        gameOver = true;
        if (attackResult.winner === 'player') {
          showVictoryScreen = true;
        }
        return;
      }
      
      // AI counter-attacks
      await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay
      const aiResult = await gameApi.aiAttack();
      console.log('AI attack result:', aiResult);
      
      // Update player grid
      const updatedPlayerGrid = await gridApi.getPlayerGrid();
      playerGrid.set(updatedPlayerGrid);
      
      if (aiResult.gameOver) {
        gameOver = true;
        showDefeatScreen = true;
      }
    } catch (error) {
      console.error('Failed to attack:', error);
    } finally {
      isAttacking = false;
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
      // Reset planning data before going back to menu
      await planningApi.resetPlanning();
      await screenApi.updateScreen('menu');
      currentScreen.set('menu');
    } catch (error) {
      console.error('Failed to return to menu:', error);
    } finally {
      showDefeatScreen = false;
    }
  };
  
  const handleVictoryScreenOk = async () => {
    try {
      // Reset planning data before going back to menu
      await planningApi.resetPlanning();
      await screenApi.updateScreen('menu');
      currentScreen.set('menu');
    } catch (error) {
      console.error('Failed to return to menu:', error);
    } finally {
      showVictoryScreen = false;
    }
  };
  
  const handleClose = async () => {
    try {
      // Reset planning data before going back to menu
      await planningApi.resetPlanning();
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
  
  <VictoryScreen 
    show={showVictoryScreen}
    onOk={handleVictoryScreenOk}
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
