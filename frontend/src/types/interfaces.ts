// Author: Adam Vesely (xvesela00)

// Defines the structure of a ship
export interface IShip {
  id: string;
  size: number;
  color: string;
  rotation: number; // 0 or 90
  name: string;
}
// Extends IShip to include placement information
export interface IPlacedShip extends IShip {
  row: number;
  col: number;
}
// Defines the structure of the grid
export interface IGrid {
  gridSize: number;
  tiles: string[][];
}
// Defines the planning data
export interface IPlanningData {
  player_grid: IGrid;
  all_ships: IShip[] | null;
  available_ships: IShip[] | null;
  placed_ships: IPlacedShip[] | null;
  active_ship: IPlacedShip | null;
}
// Defines the settings structure
export interface ISettings {
  selectedBoard: string;
}
// Defines the screen state structure
export interface IScreenState {
  current_screen: 'menu' | 'planning' | 'game';
}
