export interface IShip {
  id: string;
  size: number;
  color: string;
  rotation: number;
  name: string;
}

export interface IPlacedShip {
  id: string;
  size: number;
  color: string;
  rotation: number;
  name: string;
  // Additional properties for placed ships
  row: number;
  col: number;
}

export interface IPlanningData {
  player_grid: {
    gridSize: number;
    tiles: string[][];
  };
  all_ships: IShip[] | null,
  available_ships: IShip[] | null;
  placed_ships: IPlacedShip[] | null;
  active_ship: IPlacedShip | null;
}

export interface IGameState {
  playerShipsRemaining: number;
  pcShipsRemaining: number;
  isPlayerTurn: boolean;
  gameOver: boolean;
  winner: 'player' | 'pc' | null;
  aiMode: 'hunt' | 'target';
  aiLastHit: { row: number; col: number } | null;
  aiTargets: { row: number; col: number }[];
  playerShipHealth: Record<string, number>; // ship name -> remaining health
  pcShipHealth: Record<string, number>; // ship name -> remaining health
}

export interface IPcShipsData {
  gridSize: number;
  ships: IPlacedShip[];
}
