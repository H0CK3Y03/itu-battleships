<script lang="ts">
  import MainMenu from './lib/MainMenu.svelte';
  import ShipPlacement from './lib/ShipPlacement.svelte';
  import GameScreen from './lib/GameScreen.svelte';
  import { currentScreen } from './stores/gameStore';
</script>

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
