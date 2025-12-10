<script lang="ts">
  import { onMount } from 'svelte';
  import Button from './Button.svelte';
  import { settingsApi, screenApi, planningApi } from '../services/api';
  import { boardSize, currentScreen } from '../stores/gameStore';
  import { invoke } from '@tauri-apps/api/core';
  
  let selectedSize = '10x10';
  let loading = false;
  
  onMount(async () => {
    try {
      // Reset planning data on app start
      await planningApi.resetPlanning();
      
      const settings = await settingsApi.getSettings();
      selectedSize = settings.selectedBoard;
      boardSize.set(selectedSize);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  });
  
  const handlePlay = async () => {
    loading = true;
    try {
      await settingsApi.updateSettings(selectedSize);
      await screenApi.updateScreen('planning');
      currentScreen.set('planning');
    } catch (error) {
      console.error('Failed to start game:', error);
    } finally {
      loading = false;
    }
  };
  
  const handleExit = async () => {
    try {
      // If Tauri APIs exist, use them; else fallback
      const isTauri = '__TAURI_INTERNALS__' in window || '__TAURI_METADATA__' in window;

      if (isTauri) {
        await invoke('exit_app');
      } else {
        window.close();
      }
    } catch (error) {
      console.error('Failed to exit:', error);
    }
};
</script>

<div class="main-menu">
  <h1 class="title">Sink Simulator</h1>
  
  <div class="menu-content">
    <div class="setting-group">
      <label for="board-size">Battlefield Size</label>
      <select id="board-size" bind:value={selectedSize}>
        <option value="10x10">10×10</option>
      </select>
    </div>
    
    <div class="button-group">
      <Button variant="primary" onclick={handlePlay} disabled={loading}>
        Play
      </Button>
      <Button variant="danger" onclick={handleExit}>
        Exit
      </Button>
    </div>
  </div>
</div>

<style>
  .main-menu {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 40px;
  }

  .title {
    font-size: 64px;
    font-weight: bold;
    color: #5DADE2;
    text-transform: uppercase;
    letter-spacing: 4px;
    margin-bottom: 60px;
    text-shadow: 0 0 20px rgba(93, 173, 226, 0.5);
  }

  .menu-content {
    display: flex;
    flex-direction: column;
    gap: 40px;
    align-items: center;
  }

  .setting-group {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }

  label {
    color: #FFFFFF;
    font-size: 18px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  select {
    padding: 12px 24px;
    font-size: 16px;
    background-color: #2C3E50;
    color: #FFFFFF;
    border: 2px solid #5DADE2;
    border-radius: 8px;
    cursor: pointer;
    min-width: 200px;
  }

  select:focus {
    outline: none;
    border-color: #3498DB;
    box-shadow: 0 0 10px rgba(93, 173, 226, 0.3);
  }

  .button-group {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-top: 20px;
  }
</style>
