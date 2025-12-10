"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 5000;
// Get directories from environment variables set by Tauri
const TAURI_RESOURCE_DIR = process.env.TAURI_RESOURCE_DIR;
const TAURI_LOGS_DIR = process.env.TAURI_LOGS_DIR;
// Determine if we're running from bundled exe
const isPackaged = process.pkg !== undefined || TAURI_RESOURCE_DIR !== undefined;
// Get the base directory for data files
const getDataDir = () => {
    if (isPackaged && TAURI_LOGS_DIR) {
        // When bundled with Tauri, use logs directory for writable data
        const logsPath = path_1.default.resolve(TAURI_LOGS_DIR);
        const parentDir = path_1.default.dirname(logsPath);
        return path_1.default.join(parentDir, '_up_', 'backend', 'data'); // data folder
    }
    else if (isPackaged) {
        // Fallback for other packaged scenarios
        return path_1.default.join(process.cwd(), '_up_', 'backend', 'data');
    }
    else {
        // In development
        return path_1.default.join(__dirname, '..', 'backend', 'data');
    }
};
const dataDir = getDataDir();
// Ensure data directory exists
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
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
        const targetPath = path_1.default.join(dataDir, file);
        if (!fs_1.default.existsSync(targetPath)) {
            console.log(`Initializing ${file}...`);
            // Try to copy from bundled resources
            if (TAURI_RESOURCE_DIR) {
                const sourcePath = path_1.default.join(TAURI_RESOURCE_DIR, '_up_', 'backend', 'data', file);
                console.log('Trying to copy from:', sourcePath);
                if (fs_1.default.existsSync(sourcePath)) {
                    fs_1.default.copyFileSync(sourcePath, targetPath);
                    console.log(`Copied ${file} from resources`);
                    return;
                }
            }
            // Create default file if can't copy from resources
            const defaults = {
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
                fs_1.default.writeFileSync(targetPath, JSON.stringify(defaults[file], null, 2));
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
}
catch (error) {
    console.error('Error initializing data files:', error);
}
// path for json for settings
const settingsPath = path_1.default.join(dataDir, 'game_settings.json');
// path for json for screen
const screenPath = path_1.default.join(dataDir, 'curr_screen.json');
// path for json for player grid
const playerGridPath = path_1.default.join(dataDir, 'player_grid.json');
// path for json for pc grid (or 2nd player)
const pcGridPath = path_1.default.join(dataDir, 'pc_grid.json');
// path for json for ships
const planningPath = path_1.default.join(dataDir, 'planning.json');
// Log paths for debugging
console.log('Data directory:', dataDir);
console.log('Settings path:', settingsPath);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ------ GRID PLAYER START
// Endpoint to get actual grid for player
app.get("/api/player-grid", (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading ships:', err);
            return res.status(500).json({ success: false, message: 'Error reading ships data' });
        }
        const planningData = JSON.parse(data);
        return res.json(planningData.player_grid);
    });
});
// Endpoint to change players grid
app.post("/api/player-grid", (req, res) => {
    const { player_grid, mode } = req.body;
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
        planningData.player_grid = player_grid || planningData.player_grid;
        if (mode === "reset") {
            planningData.placed_ships = null; // Reset placed ships
            planningData.active_ship = null; // Reset active ships
        }
        fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error saving grid data:", writeErr);
                return res.status(500).json({ error: "Could not save grid data" });
            }
            res.status(200).json({ message: "Grid updated successfully", planningData });
        });
    });
});
// ------ GRID PLAYER END
// ------ GRID PC START
// Endpoint to get actual PC grid (or 2nd player)
app.get("/api/pc-grid", (req, res) => {
    fs_1.default.readFile(pcGridPath, "utf8", (err, data) => {
        if (err) {
            return res.status(500).json({ error: "Could not read grid data" });
        }
        res.json(JSON.parse(data));
    });
});
// Endpoint to change pc grid
app.post("/api/pc-grid", (req, res) => {
    const { gridSize, tiles } = req.body;
    // Fetch data from file
    fs_1.default.readFile(pcGridPath, "utf8", (err, data) => {
        if (err) {
            console.error("Error reading grid data:", err);
            return res.status(500).json({ error: "Could not read grid data" });
        }
        let currentGrid;
        try {
            currentGrid = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error parsing grid data:", parseError);
            return res.status(500).json({ error: "Invalid grid data format" });
        }
        // Actualize only sended parts
        const updatedGrid = {
            gridSize: gridSize || currentGrid.gridSize,
            tiles: tiles || currentGrid.tiles
        };
        // Write new data to file
        fs_1.default.writeFile(pcGridPath, JSON.stringify(updatedGrid, null, 2), (writeErr) => {
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
app.get('/api/screen', (req, res) => {
    fs_1.default.readFile(screenPath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading screen:', err);
            return res.status(500).json({ success: false, message: 'Error reading screen data' });
        }
        res.json(JSON.parse(data));
    });
});
// Endpoint to update actual screen
app.post('/api/screen', (req, res) => {
    const { current_screen } = req.body;
    fs_1.default.writeFile(screenPath, JSON.stringify({ current_screen }, null, 2), (err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error updating screen data' });
        }
        res.json({ success: true });
    });
});
// ------ SCREEN END
// ------ SETTINGS START
// Endpoint to get settings
app.get('/api/settings', (req, res) => {
    fs_1.default.readFile(settingsPath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading settings:', err);
            return res.status(500).json({ success: false, message: 'Error reading settings' });
        }
        res.json(JSON.parse(data));
    });
});
// Endpoint to update settings
app.post('/api/settings', (req, res) => {
    const { selectedBoard } = req.body;
    fs_1.default.readFile(settingsPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error reading settings' });
        }
        let settings = JSON.parse(data);
        settings.selectedBoard = selectedBoard || settings.selectedBoard;
        fs_1.default.writeFile(settingsPath, JSON.stringify(settings, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Error updating settings' });
            }
            res.json(settings);
        });
    });
});
// Endpoint to set available ships
app.post('/api/set-available-ships', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf-8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Error reading planning data' });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
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
            const newAvailableShip = {
                id: ship.id,
                size: ship.size,
                color: ship.color,
                rotation: ship.rotation,
                name: ship.name
            };
            planningData.available_ships?.push(newAvailableShip);
        });
        fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error setting available ships:", writeErr);
                return res.status(500).json({ error: "Could not set available ships" });
            }
            res.status(200).json({ message: "Available ships set successfully" });
        });
    });
});
// ------ SETTINGS END
// ------ PLANNING START
// Endpoint to get planning data
app.get('/api/planning', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.log('Error reading ships:', err);
            return res.status(500).json({ success: false, message: 'Error reading ships data' });
        }
        const planningData = JSON.parse(data);
        return res.json(planningData);
    });
});
// Endpoint to get available ships
app.get('/api/planning/available-ships', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
            return res.json({ available_ships: planningData.available_ships });
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
    });
});
// Endpoint to add placed ship
app.post('/api/planning/placed-ships', (req, res) => {
    const { ship, row, col } = req.body;
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
        if (!planningData.placed_ships) {
            planningData.placed_ships = [];
        }
        // create new placed ship object
        const newPlacingShip = {
            id: ship.id,
            size: ship.size,
            color: ship.color,
            rotation: ship.rotation,
            name: ship.name,
            row: row,
            col: col
        };
        planningData.placed_ships.push(newPlacingShip);
        // get and remove ship from available ships
        if (planningData.available_ships) {
            planningData.available_ships = planningData.available_ships.filter((s) => s.id !== ship.id);
        }
        fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error saving placed ship:", writeErr);
                return res.status(500).json({ error: "Could not save placed ship" });
            }
            res.status(200).json({ message: "Placed ship added successfully", ship });
        });
    });
});
// Endpoint to set active ship
app.post('/api/planning/handle-active-ship', (req, res) => {
    const { row, col } = req.body;
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
        if (planningData.player_grid.tiles[row][col] !== "empty") {
            const shipName = planningData.player_grid.tiles[row][col];
            const activeShip = planningData.active_ship;
            if (shipName === activeShip?.name) {
                // Unset active ship if clicked on the same ship
                planningData.active_ship = null;
            }
            else {
                planningData.active_ship = planningData.placed_ships?.find(ship => ship.name === shipName) || null;
                console.log(`active ship: ${planningData.active_ship?.name}`);
            }
            // Update info about active ship
            fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
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
app.post('/api/clear-grid', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
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
            planningData.placed_ships.forEach((ship) => {
                const availableShip = {
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
        fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error clearing grid:", writeErr);
                return res.status(500).json({ error: "Could not clear grid" });
            }
            res.status(200).json({ message: "Grid cleared successfully" });
        });
    });
});
// Endpoint that returns active ship
app.get('/api/planning/active-ship', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
            return res.json({ active_ship: planningData.active_ship });
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
    });
});
// ENdpoint to remove active ship
app.post('/api/planning/remove-active-ship', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
        if (planningData.active_ship === null) {
            return false;
        }
        // Remove active ship grid
        if (planningData.active_ship !== null) {
            if (planningData.active_ship.rotation === 0) {
                for (let j = planningData.active_ship.col; j < planningData.active_ship.col + planningData.active_ship.size; j++) {
                    planningData.player_grid.tiles[planningData.active_ship.row][j] = "empty";
                }
            }
            else {
                // If vertical rotation
                for (let i = planningData.active_ship?.row; i < planningData.active_ship.row + planningData.active_ship.size; i++) {
                    planningData.player_grid.tiles[i][planningData.active_ship.col] = "empty";
                }
            }
        }
        const newAvailableShip = {
            id: planningData.active_ship?.id || "",
            size: planningData.active_ship?.size || 0,
            color: planningData.active_ship?.color || "",
            rotation: 0,
            name: planningData.active_ship?.name || ""
        };
        planningData.available_ships?.push(newAvailableShip); // Add active ship to available ships
        planningData.placed_ships = planningData.placed_ships?.filter((ship) => ship.id !== planningData.active_ship?.id) || null; // Remove active ship from placed ships
        planningData.active_ship = null; // Clear active ship
        fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error removing active ship:", writeErr);
                return res.status(500).json({ error: "Could not remove active ship" });
            }
            res.status(200).json({ message: "Active ship removed successfully" });
        });
    });
});
// Endpoint to rotate active ship
app.post('/api/planning/rotate-active-ship', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
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
        }
        else {
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
        }
        else {
            for (let i = planningData.active_ship.row; i < planningData.active_ship.row + planningData.active_ship.size; i++) {
                planningData.player_grid.tiles[i][planningData.active_ship.col] = "empty";
            }
        }
        // Put new (rotated) ship
        if (direction === 0) {
            for (let i = planningData.active_ship.col; i < planningData.active_ship.col + planningData.active_ship.size; i++) {
                planningData.player_grid.tiles[planningData.active_ship.row][i] = planningData.active_ship.name;
            }
        }
        else {
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
        fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error rotating active ship:", writeErr);
                return res.status(500).json({ error: "Could not rotate active ship" });
            }
            res.status(200).json({ message: "Active ship rotated successfully", active_ship: planningData.active_ship });
        });
    });
});
// Endpoint to get colors from available ships
app.get('/api/planning/colors', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
        let colors = {};
        planningData.all_ships?.forEach((ship) => {
            colors[ship.name] = ship.color;
        });
        return res.json(colors);
    });
});
// Endpoint to restore available ships
app.post('/api/planning/restore-available-ships', (req, res) => {
    fs_1.default.readFile(planningPath, 'utf8', (err, data) => {
        if (err) {
            console.error("Error reading planning data:", err);
            return res.status(500).json({ error: "Could not read planning data" });
        }
        let planningData;
        try {
            planningData = JSON.parse(data);
        }
        catch (parseError) {
            console.error("Error parsing planning data:", parseError);
            return res.status(500).json({ error: "Invalid planning data format" });
        }
        planningData.placed_ships?.forEach((ship) => {
            const newShip = {
                id: ship.id,
                size: ship.size,
                color: ship.color,
                rotation: ship.rotation,
                name: ship.name,
            };
            planningData.available_ships?.push(newShip);
        });
        fs_1.default.writeFile(planningPath, JSON.stringify(planningData, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Error rotating active ship:", writeErr);
                return res.status(500).json({ error: "Could not rotate active ship" });
            }
            res.status(200).json({ message: "Available ships restored successfully" });
        });
    });
});
// ------ PLANNING END
// Endpoint for '/'
app.get('/', (req, res) => {
    res.send('Welcome to the Battleships Game Backend!');
});
// Health check/status endpoint for debugging
app.get('/api/status', (req, res) => {
    res.json({
        status: 'running',
        version: '1.0.0',
        dataDir: dataDir,
        files: {
            settings: fs_1.default.existsSync(settingsPath),
            screen: fs_1.default.existsSync(screenPath),
            planning: fs_1.default.existsSync(planningPath),
            playerGrid: fs_1.default.existsSync(playerGridPath),
            pcGrid: fs_1.default.existsSync(pcGridPath),
        }
    });
});
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
