import type { IShip, IPlacedShip, IPlanningData, ISettings, IScreenState, IGrid } from '../types/interfaces';

const API_BASE = 'http://localhost:5000/api';

// Helper function for fetch with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

// Settings & Navigation
export const settingsApi = {
  getSettings: () => fetchApi<ISettings>('/settings'),
  updateSettings: (selectedBoard: string) => 
    fetchApi<ISettings>('/settings', {
      method: 'POST',
      body: JSON.stringify({ selectedBoard }),
    }),
};

export const screenApi = {
  getScreen: () => fetchApi<IScreenState>('/screen'),
  updateScreen: (current_screen: 'menu' | 'planning' | 'game') =>
    fetchApi<{ success: boolean }>('/screen', {
      method: 'POST',
      body: JSON.stringify({ current_screen }),
    }),
};

// Planning (Ship Placement)
export const planningApi = {
  getPlanningData: () => fetchApi<IPlanningData>('/planning'),
  getAvailableShips: () => fetchApi<{ available_ships: IShip[] | null }>('/planning/available-ships'),
  placeShip: (ship: IShip, row: number, col: number) =>
    fetchApi<{ message: string; ship: IShip }>('/planning/placed-ships', {
      method: 'POST',
      body: JSON.stringify({ ship, row, col }),
    }),
  handleActiveShip: (row: number, col: number) =>
    fetchApi<{ message: string; active_ship: IPlacedShip | null }>('/planning/handle-active-ship', {
      method: 'POST',
      body: JSON.stringify({ row, col }),
    }),
  removeActiveShip: () =>
    fetchApi<{ message: string }>('/planning/remove-active-ship', {
      method: 'POST',
    }),
  rotateActiveShip: () =>
    fetchApi<{ message: string; active_ship: IPlacedShip | null }>('/planning/rotate-active-ship', {
      method: 'POST',
    }),
  clearGrid: () =>
    fetchApi<{ message: string }>('/clear-grid', {
      method: 'POST',
    }),
  getColors: () => fetchApi<Record<string, string>>('/planning/colors'),
  setAvailableShips: () =>
    fetchApi<{ message: string }>('/set-available-ships', {
      method: 'POST',
    }),
  resetPlanning: () =>
    fetchApi<{ message: string }>('/planning/reset', {
      method: 'POST',
    }),
};

// Grids
export const gridApi = {
  getPlayerGrid: () => fetchApi<IGrid>('/player-grid'),
  updatePlayerGrid: (player_grid: IGrid, mode?: 'reset') =>
    fetchApi<{ message: string; planningData: IPlanningData }>('/player-grid', {
      method: 'POST',
      body: JSON.stringify({ player_grid, mode }),
    }),
  getPcGrid: () => fetchApi<IGrid>('/pc-grid'),
  updatePcGrid: (gridSize?: number, tiles?: string[][]) =>
    fetchApi<{ message: string; updatedGrid: IGrid }>('/pc-grid', {
      method: 'POST',
      body: JSON.stringify({ gridSize, tiles }),
    }),
};

// Game Mechanics
export const gameApi = {
  initGame: () => fetchApi<{ message: string }>('/game/init', { method: 'POST' }),
  playerAttack: (row: number, col: number) => 
    fetchApi<{ result: string; shipSunk?: string; gameOver: boolean; winner?: string }>('/game/attack', {
      method: 'POST',
      body: JSON.stringify({ row, col })
    }),
  aiAttack: () => 
    fetchApi<{ row: number; col: number; result: string; shipSunk?: string; gameOver: boolean; winner?: string }>('/game/ai-attack', {
      method: 'POST'
    }),
  getGameStatus: () => 
    fetchApi<{ playerShipsRemaining: number; pcShipsRemaining: number; isPlayerTurn: boolean; gameOver: boolean; winner?: string }>('/game/status')
};
