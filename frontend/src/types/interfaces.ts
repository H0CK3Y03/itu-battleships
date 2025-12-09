export interface IShip {
  id: string;
  size: number;
  color: string;
  rotation: number; // 0 or 90
  name: string;
}

export interface IPlacedShip extends IShip {
  row: number;
  col: number;
}

export interface IGrid {
  gridSize: number;
  tiles: string[][];
}

export interface IPlanningData {
  player_grid: IGrid;
  all_ships: IShip[] | null;
  available_ships: IShip[] | null;
  placed_ships: IPlacedShip[] | null;
  active_ship: IPlacedShip | null;
}

export interface ISettings {
  selectedBoard: string;
}

export interface IScreenState {
  current_screen: 'menu' | 'planning' | 'game';
}
