import { writable, derived } from 'svelte/store';
import type { IShip, IPlacedShip, IGrid } from '../types/interfaces';

// Current screen state
export const currentScreen = writable<'menu' | 'planning' | 'game'>('menu');

// Game settings
export const boardSize = writable<string>('10x10');

// Planning state
export const playerGrid = writable<IGrid>({ gridSize: 10, tiles: [] });
export const availableShips = writable<IShip[] | null>(null);
export const placedShips = writable<IPlacedShip[] | null>(null);
export const activeShip = writable<IPlacedShip | null>(null);
export const selectedInventoryShip = writable<IShip | null>(null);
export const shipColors = writable<Record<string, string>>({});

// Game state
export const opponentGrid = writable<IGrid>({ gridSize: 10, tiles: [] });

// Loading states
export const isLoading = writable<boolean>(false);

// Derived stores
export const canConfirmPlacement = derived(
  availableShips,
  ($availableShips) => $availableShips !== null && $availableShips.length === 0
);
