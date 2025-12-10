import express, { Request, Response } from 'express';
import fs from 'fs';
import cors from 'cors';
import path from 'path';
import { IPlanningData, IPlacedShip, IShip } from './data_interfaces';

const app = express();
const PORT = 5000;

// Get directories from environment variables set by Tauri
const TAURI_RESOURCE_DIR = process.env.TAURI_RESOURCE_DIR;
const TAURI_LOGS_DIR = process.env.TAURI_LOGS_DIR;

// Determine if we're running from bundled exe
const isPackaged = (process as any).pkg !== undefined || TAURI_RESOURCE_DIR !== undefined;

// Get the base directory for data files
const getDataDir = () => {
  if (isPackaged && TAURI_LOGS_DIR) {
    // When bundled with Tauri, use logs directory for writable data
    const logsPath = path.resolve(TAURI_LOGS_DIR);
    const parentDir = path.dirname(logsPath);
    return path.join(parentDir, '_up_', 'backend', 'data'); // data folder
  } else if (isPackaged) {
    // Fallback for other packaged scenarios
    return path.join(process.cwd(), '_up_', 'backend', 'data');
  } else {
    // In development
    return path.join(__dirname, '..', 'backend', 'data');
  }
};

const dataDir = getDataDir();

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize data files from bundled resources if they don't exist
const initializeDataFiles = () => {
  const DEFAULT_GRID_SIZE = 10;
  const dataFiles = [
    'game_settings.json',
    'curr_screen.json',
    'player_grid.json',
    'pc_grid.json',
    'planning.json'
  ];

  dataFiles.forEach(file => {
    const targetPath = path.join(dataDir, file);
    
    if (!fs.existsSync(targetPath)) {
      console.log(`Initializing ${file}...`);
      
      // Try to copy from bundled resources
      if (TAURI_RESOURCE_DIR) {
        const sourcePath = path.join(TAURI_RESOURCE_DIR, '_up_', 'backend', 'data', file);
        console.log('Trying to copy from:', sourcePath);
        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, targetPath);
          console.log(`Copied ${file} from resources`);
          return;
        }
      }
      
      // Create default file if can't copy from resources
      const defaults: Record<string, any> = {
        'game_settings.json': { selectedBoard: '10x10' },
        'curr_screen.json': { current_screen: 'menu' },
        'player_grid.json': { gridSize: DEFAULT_GRID_SIZE, tiles: Array(DEFAULT_GRID_SIZE).fill(null).map(() => Array(DEFAULT_GRID_SIZE).fill('empty')) },
        'pc_grid.json': { gridSize: DEFAULT_GRID_SIZE, tiles: Array(DEFAULT_GRID_SIZE).fill(null).map(() => Array(DEFAULT_GRID_SIZE).fill('empty')) },
        'planning.json': {
          player_grid: { gridSize: DEFAULT_GRID_SIZE, tiles: Array(DEFAULT_GRID_SIZE).fill(null).map(() => Array(DEFAULT_GRID_SIZE).fill('empty')) },
          all_ships: [
            { id: "1", size: 2, color: "purple", rotation: 0, name: "ship1" },
            { id: "2", size: 2, color: "orange", rotation: 0, name: "ship2" },
            { id: "3", size: 3, color: "green", rotation: 0, name: "ship3" },
            { id: "4", size: 3, color: "blue", rotation: 0, name: "ship4" },
            { id: "5", size: 4, color: "grey", rotation: 0, name: "ship5" }
          ],
          available_ships: null,
          placed_ships: null,
          active_ship: null
        }
      };
      
      if (defaults[file]) {
        fs.writeFileSync(targetPath, JSON.stringify(defaults[file], null, 2));
        console.log(`Created default ${file}`);
      }
    }
  });
};

// Initialize data files before starting server
console.log('='.repeat(50));
console.log('Battleships Backend Starting...');
console.log('Environment:', isPackaged ? 'PACKAGED' : 'DEVELOPMENT');
console.log('TAURI_RESOURCE_DIR:', TAURI_RESOURCE_DIR || 'not set');
console.log('TAURI_LOGS_DIR:', TAURI_LOGS_DIR || 'not set');
console.log('Data directory:', dataDir);
console.log('='.repeat(50));

try {
  initializeDataFiles();
  console.log('Data files initialized successfully');
} catch (error) {
  console.error('Error initializing data files:', error);
}

// path for json for settings
const settingsPath = path.join(dataDir, 'game_settings.json');

// path for json for screen
const screenPath = path.join(dataDir, 'curr_screen.json');

// path for json for player grid
const playerGridPath = path.join(dataDir, 'player_grid.json');

// path for json for pc grid (or 2nd player)
const pcGridPath = path.join(dataDir, 'pc_grid.json');

// path for json for ships
const planningPath = path.join(dataDir, 'planning.json');

// Log paths for debugging
console.log('Data directory:', dataDir);
console.log('Settings path:', settingsPath);

app.use(cors());
app.use(express.json());

// ------ GRID PLAYER START

// Endpoint to get actual grid for player
app.get("/api/player-grid", (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.log('Error reading ships:', err);
      return res.status(500).json({ success: false, message: 'Error reading ships data' });
    }

    const planningData: IPlanningData = JSON.parse(data);
    return res.json(planningData.player_grid);
  });
});

// Endpoint to change players grid
app.post("/api/player-grid", (req: Request, res: Response) => {
  const { player_grid, mode } = req.body;

  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    planningData.player_grid = player_grid || planningData.player_grid;

    if (mode === "reset") {
      planningData.placed_ships = null; // Reset placed ships
      planningData.active_ship = null; // Reset active ships
    }

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error saving grid data:", writeErr);
        return res.status(500).json({ error: "Could not save grid data" });
      }
      res.status(200).json({ message: "Grid updated successfully", planningData });
    });

  })
});

// ------ GRID PLAYER END

// ------ GRID PC START

// Endpoint to get actual PC grid (or 2nd player)
app.get("/api/pc-grid", (req: Request, res: Response) => {
  fs.readFile(pcGridPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Could not read grid data" });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to change pc grid
app.post("/api/pc-grid", (req: Request, res: Response) => {
  const { gridSize, tiles } = req.body;

  // Fetch data from file
  fs.readFile(pcGridPath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading grid data:", err);
      return res.status(500).json({ error: "Could not read grid data" });
    }

    let currentGrid;
    try {
      currentGrid = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing grid data:", parseError);
      return res.status(500).json({ error: "Invalid grid data format" });
    }

    // Actualize only sended parts
    const updatedGrid = {
      gridSize: gridSize || currentGrid.gridSize,
      tiles: tiles || currentGrid.tiles
    };

    // Write new data to file
    fs.writeFile(pcGridPath, JSON.stringify(updatedGrid, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error saving grid data:", writeErr);
        return res.status(500).json({ error: "Could not save grid data" });
      }
      res.status(200).json({ message: "Grid updated successfully", updatedGrid });
    });
  });
});

// ------ GRID PC END

// ------ SCREEN START

// Endpoint to get actual screen
app.get('/api/screen', (req: Request, res: Response) => {
  fs.readFile(screenPath, 'utf8',  (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.log('Error reading screen:', err);
      return res.status(500).json({ success: false, message: 'Error reading screen data' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to update actual screen
app.post('/api/screen', (req: Request, res: Response) => {
  const { current_screen } = req.body;

  fs.writeFile(screenPath, JSON.stringify({ current_screen }, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error updating screen data' });
    }
    res.json({ success: true });
  });
});

// ------ SCREEN END

// ------ SETTINGS START

// Endpoint to get settings
app.get('/api/settings', (req: Request, res: Response) => {
  fs.readFile(settingsPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.log('Error reading settings:', err);
      return res.status(500).json({ success: false, message: 'Error reading settings' });
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to update settings
app.post('/api/settings', (req: Request, res: Response) => {
  const { selectedBoard } = req.body;

  fs.readFile(settingsPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error reading settings' });
    }

    let settings: {
      selectedBoard: string;
    } = JSON.parse(data);

    settings.selectedBoard = selectedBoard || settings.selectedBoard;

    fs.writeFile(settingsPath, JSON.stringify(settings, null, 2), (err: NodeJS.ErrnoException | null) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error updating settings' });
      }
      res.json(settings);
    });
  });
});

// Endpoint to set available ships
app.post('/api/set-available-ships', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf-8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error reading planning data' });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    // Initialize all_ships if it's null
    if (!planningData.all_ships || planningData.all_ships.length === 0) {
      planningData.all_ships = [
        { id: "1", size: 2, color: "purple", rotation: 0, name: "ship1" },
        { id: "2", size: 2, color: "orange", rotation: 0, name: "ship2" },
        { id: "3", size: 3, color: "green", rotation: 0, name: "ship3" },
        { id: "4", size: 3, color: "blue", rotation: 0, name: "ship4" },
        { id: "5", size: 4, color: "grey", rotation: 0, name: "ship5" }
      ];
    }

    planningData.available_ships = [];
    planningData.all_ships?.forEach((ship) => {
      const newAvailableShip: IShip = {
        id: ship.id,
        size: ship.size,
        color: ship.color,
        rotation: ship.rotation,
        name: ship.name
      }
      planningData.available_ships?.push(newAvailableShip);
    })

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error setting available ships:", writeErr);
        return res.status(500).json({ error: "Could not set available ships" });
      }
      res.status(200).json({ message: "Available ships set successfully" });
    });
  })
});

// ------ SETTINGS END

// ------ PLANNING START


// Endpoint to get planning data
app.get('/api/planning', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.log('Error reading ships:', err);
      return res.status(500).json({ success: false, message: 'Error reading ships data' });
    }

    const planningData: IPlanningData = JSON.parse(data);
    return res.json(planningData);
  });
});

// Endpoint to get available ships
app.get('/api/planning/available-ships', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
      return res.json({ available_ships: planningData.available_ships });
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }
  });
});

// Endpoint to add placed ship
app.post('/api/planning/placed-ships', (req: Request, res: Response) => {
  const { ship, row, col } = req.body;

  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    if (!planningData.placed_ships) {
      planningData.placed_ships = [];
    }
    
    // create new placed ship object
    const newPlacingShip: IPlacedShip = {
      id: ship.id,
      size: ship.size,
      color: ship.color,
      rotation: ship.rotation,
      name: ship.name,
      row: row,
      col: col
    }

    // Validate bounds before modifying state
    if (newPlacingShip.rotation === 0) {
      if (col + newPlacingShip.size > planningData.player_grid.gridSize) {
        return res.status(400).json({ error: "Ship placement exceeds grid boundaries" });
      }
      // Check for collisions with existing ships
      for (let i = col; i < col + newPlacingShip.size; i++) {
        if (planningData.player_grid.tiles[row][i] !== "empty") {
          return res.status(400).json({ error: "Ship placement overlaps with existing ship" });
        }
      }
    } else {
      if (row + newPlacingShip.size > planningData.player_grid.gridSize) {
        return res.status(400).json({ error: "Ship placement exceeds grid boundaries" });
      }
      // Check for collisions with existing ships
      for (let i = row; i < row + newPlacingShip.size; i++) {
        if (planningData.player_grid.tiles[i][col] !== "empty") {
          return res.status(400).json({ error: "Ship placement overlaps with existing ship" });
        }
      }
    }

    planningData.placed_ships.push(newPlacingShip);

    // get and remove ship from available ships
    if (planningData.available_ships) {
      planningData.available_ships = planningData.available_ships.filter((s) => s.id !== ship.id);
    }

    // Update the grid tiles with the ship name
    if (newPlacingShip.rotation === 0) {
      // Horizontal placement
      for (let i = col; i < col + newPlacingShip.size; i++) {
        planningData.player_grid.tiles[row][i] = newPlacingShip.name;
      }
    } else {
      // Vertical placement (rotation === 90)
      for (let i = row; i < row + newPlacingShip.size; i++) {
        planningData.player_grid.tiles[i][col] = newPlacingShip.name;
      }
    }

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error saving placed ship:", writeErr);
        return res.status(500).json({ error: "Could not save placed ship" });
      }
      res.status(200).json({ message: "Placed ship added successfully", ship });
    });
  });
});

// Endpoint to set active ship
app.post('/api/planning/handle-active-ship', (req: Request, res: Response) => {
  const { row, col } = req.body;

  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    if (planningData.player_grid.tiles[row][col] !== "empty") {
      const shipName = planningData.player_grid.tiles[row][col];
      const activeShip = planningData.active_ship;

      if (shipName === activeShip?.name) {
        // Unset active ship if clicked on the same ship
        planningData.active_ship = null;
      } else {
        planningData.active_ship = planningData.placed_ships?.find(ship => ship.name === shipName) || null;
        console.log(`active ship: ${planningData.active_ship?.name}`);
      }
      
      // Update info about active ship
      fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
        if (writeErr) {
          console.error("Error saving active ship:", writeErr);
          return res.status(500).json({ error: "Could not save active ship" });
        }
        res.status(200).json({ message: "Active ship set successfully", active_ship: activeShip });
      });
    }
  });
});

// Endpoint to remove ships from Grid
app.post('/api/clear-grid', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    // Clear the grid
    for (let i = 0; i < planningData.player_grid.tiles.length; i++) {
      for (let j = 0; j < planningData.player_grid.tiles[i].length; j++) {
        planningData.player_grid.tiles[i][j] = "empty";
      }
    }

    // return ships from grid to available ships
    if (planningData.placed_ships) {
      planningData.available_ships = planningData.available_ships || [];
      planningData.placed_ships.forEach((ship: IPlacedShip) => {
        const availableShip: IShip = {
          id: ship.id,
          size: ship.size,
          color: ship.color,
          rotation: 0, // was ship.rotation
          name: ship.name
        };
        planningData.available_ships?.push(availableShip);
      });
    }
    
    planningData.active_ship = null; // Reset active ship
    planningData.placed_ships = null; // Clear placed ships

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error clearing grid:", writeErr);
        return res.status(500).json({ error: "Could not clear grid" });
      }
      res.status(200).json({ message: "Grid cleared successfully" });
    });
  });
})

// Endpoint that returns active ship
app.get('/api/planning/active-ship', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }
    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
      return res.json({ active_ship: planningData.active_ship });
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }
  });
});

// ENdpoint to remove active ship
app.post('/api/planning/remove-active-ship', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    if (planningData.active_ship === null) {
      return res.status(400).json({ error: "No active ship to remove" });
    }

    // Remove active ship grid
    if (planningData.active_ship !== null) {
      if (planningData.active_ship.rotation === 0) {
        for (let j = planningData.active_ship.col; j < planningData.active_ship.col + planningData.active_ship.size; j++) {
          planningData.player_grid.tiles[planningData.active_ship.row][j] = "empty";
        }
      } else {
        // If vertical rotation
        for (let i = planningData.active_ship?.row; i < planningData.active_ship.row + planningData.active_ship.size; i++) {
          planningData.player_grid.tiles[i][planningData.active_ship.col] = "empty";
        }
      }
    }

    const newAvailableShip: IShip = {
      id: planningData.active_ship?.id || "",
      size: planningData.active_ship?.size || 0,
      color: planningData.active_ship?.color || "",
      rotation: 0,
      name: planningData.active_ship?.name || ""
    }
    planningData.available_ships?.push(newAvailableShip); // Add active ship to available ships

    planningData.placed_ships = planningData.placed_ships?.filter((ship: IPlacedShip) => ship.id !== planningData.active_ship?.id) || null; // Remove active ship from placed ships
    planningData.active_ship = null; // Clear active ship

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error removing active ship:", writeErr);
        return res.status(500).json({ error: "Could not remove active ship" });
      }
      res.status(200).json({ message: "Active ship removed successfully" });
    });
  });
});

// Endpoint to rotate active ship
app.post('/api/planning/rotate-active-ship', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    if (!planningData.active_ship) {
      return;
    }

    const direction = planningData.active_ship.rotation === 0 ? 90 : 0;
    let canBePlaced = true;

    // check if ship can be placed
    if (direction === 0) {
      if (planningData.active_ship.col + planningData.active_ship.size > planningData.player_grid.gridSize) {
        return;
      }

      for (let i = planningData.active_ship.col + 1; i < planningData.active_ship.col + planningData.active_ship.size; i++) {
        if (planningData.player_grid.tiles[planningData.active_ship.row][i] !== "empty") {
          canBePlaced = false;
          break;
        }
      }
    } else {
      if (planningData.active_ship.row + planningData.active_ship.size > planningData.player_grid.gridSize) {
        return;
      }

      for (let j = planningData.active_ship.row + 1; j < planningData.active_ship.row + planningData.active_ship.size; j++) {
        if (planningData.player_grid.tiles[j][planningData.active_ship.col] !== "empty") {
          canBePlaced = false;
          break;
        }
      }
    }

    if (!canBePlaced) {
      return;
    }

    // Remove old ship from grid
    if (planningData.active_ship.rotation === 0) {
      for (let j = planningData.active_ship.col; j < planningData.active_ship.col + planningData.active_ship.size; j++) {
        planningData.player_grid.tiles[planningData.active_ship.row][j] = "empty";
      }
    } else {
      for (let i = planningData.active_ship.row; i < planningData.active_ship.row + planningData.active_ship.size; i++) {
        planningData.player_grid.tiles[i][planningData.active_ship.col] = "empty";
      }
    }

    // Put new (rotated) ship
    if (direction === 0) {
      for (let i = planningData.active_ship.col; i < planningData.active_ship.col + planningData.active_ship.size; i++) {
        planningData.player_grid.tiles[planningData.active_ship.row][i] = planningData.active_ship.name;
      }
    } else {
      for (let j = planningData.active_ship.row; j < planningData.active_ship.row + planningData.active_ship.size; j++) {
        planningData.player_grid.tiles[j][planningData.active_ship.col] = planningData.active_ship.name;
      }
    }

    // set rotation in active ship
    planningData.active_ship.rotation = direction;
    
    // change direction in placed_ships
    if (planningData.placed_ships !== null) {
      for (let i = 0; i < planningData.placed_ships?.length; i++) {
        if (planningData.placed_ships[i].name === planningData.active_ship.name) {
          planningData.placed_ships[i].rotation = direction;
          break;
        }
      }
    }

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error rotating active ship:", writeErr);
        return res.status(500).json({ error: "Could not rotate active ship" });
      }
      res.status(200).json({ message: "Active ship rotated successfully", active_ship: planningData.active_ship });
    })
  });
});

// Endpoint to get colors from available ships
app.get('/api/planning/colors', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    let colors: Record<string, string> = {};
    planningData.all_ships?.forEach((ship) => {
      colors[ship.name] = ship.color;
    });

    return res.json(colors);
  });
});

// Endpoint to restore available ships
app.post('/api/planning/restore-available-ships', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    planningData.placed_ships?.forEach((ship) => {
      const newShip: IShip = {
        id: ship.id,
        size: ship.size,
        color: ship.color,
        rotation: ship.rotation,
        name: ship.name,
      }
      planningData.available_ships?.push(newShip);
    })

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error rotating active ship:", writeErr);
        return res.status(500).json({ error: "Could not rotate active ship" });
      }
      res.status(200).json({ message: "Available ships restored successfully" });
    })
  });
});

// Endpoint to reset planning data (clear grid and restore all ships)
app.post('/api/planning/reset', (req: Request, res: Response) => {
  fs.readFile(planningPath, 'utf8', (err: NodeJS.ErrnoException | null, data: string) => {
    if (err) {
      console.error("Error reading planning data:", err);
      return res.status(500).json({ error: "Could not read planning data" });
    }

    let planningData: IPlanningData;
    try {
      planningData = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing planning data:", parseError);
      return res.status(500).json({ error: "Invalid planning data format" });
    }

    // Clear the grid
    for (let i = 0; i < planningData.player_grid.tiles.length; i++) {
      for (let j = 0; j < planningData.player_grid.tiles[i].length; j++) {
        planningData.player_grid.tiles[i][j] = "empty";
      }
    }

    // Restore all ships to available_ships from all_ships
    planningData.available_ships = [];
    planningData.all_ships?.forEach((ship) => {
      const availableShip: IShip = {
        id: ship.id,
        size: ship.size,
        color: ship.color,
        rotation: 0,
        name: ship.name
      };
      planningData.available_ships?.push(availableShip);
    });

    // Clear placed ships and active ship
    planningData.placed_ships = null;
    planningData.active_ship = null;

    fs.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error resetting planning data:", writeErr);
        return res.status(500).json({ error: "Could not reset planning data" });
      }
      res.status(200).json({ message: "Planning data reset successfully" });
    });
  });
});

// ------ PLANNING END

// Endpoint for '/'
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Battleships Game Backend!');
});

// Health check/status endpoint for debugging
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'running',
    version: '1.0.0',
    dataDir: dataDir,
    files: {
      settings: fs.existsSync(settingsPath),
      screen: fs.existsSync(screenPath),
      planning: fs.existsSync(planningPath),
      playerGrid: fs.existsSync(playerGridPath),
      pcGrid: fs.existsSync(pcGridPath),
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
