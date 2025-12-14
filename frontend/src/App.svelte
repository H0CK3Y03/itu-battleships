<!-- Author: Adam Vesely (xvesela00) -->

<script lang="ts">
  import MainMenu from './lib/MainMenu.svelte';
  import ShipPlacement from './lib/ShipPlacement.svelte';
  import GameScreen from './lib/GameScreen.svelte';
  import { currentScreen } from './stores/gameStore';
</script>
<!-- Main application component that switches between different screens based on the current state -->
<main>
  {#if $currentScreen === 'menu'}
    <MainMenu />
  {:else if $currentScreen === 'planning'}
    <ShipPlacement />
  {:else if $currentScreen === 'game'}
    <GameScreen />
  {/if}
</main>

<style>
  main {
    width: 100%;
    min-height: 100vh;
  }
</style>
