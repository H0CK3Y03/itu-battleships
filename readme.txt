===============================================================================
ITU Project - Battleships Game
===============================================================================

PROJECT INFORMATION
-------------------
Team Member: Adam Veselý (xvesela00)
Course: ITU (User Interface Programming)
Academic Year: 2024/2025
Institution: Faculty of Information Technology, Brno University of Technology

Project Type: Desktop Battleships Game
Technologies: Svelte 4 + TypeScript, Node.js + Express, Tauri (Rust)


===============================================================================
AUTHORSHIP - WORK BY ADAM VESELÝ (xvesela00)
===============================================================================

Frontend Components (Svelte):
  - ShipPlacement.svelte - Interactive ship placement screen (xvesela00)
  - Grid.svelte - Reusable grid component with preview system (xvesela00)
  - ShipInventory.svelte - Ship selection and inventory management (xvesela00)
  - GameScreen.svelte - Main game interface (xvesela00)
  - MainMenu.svelte - Menu screen with settings (xvesela00)
  - Button.svelte - Reusable button component (xvesela00)
  - VictoryScreen.svelte - Victory screen UI (xvesela00)
  - DefeatScreen.svelte - Defeat screen UI (xvesela00)
  - SurrenderDialog.svelte - Surrender confirmation dialog (xvesela00)
  - CloseConfirmDialog.svelte - Close confirmation dialog (xvesela00)

State Management:
  - gameStore.ts - Svelte stores for state management (xvesela00)

API Service Layer:
  - api.ts - API service with fetch wrappers (xvesela00)

Type Definitions:
  - interfaces.ts - TypeScript interfaces (xvesela00)

Backend (Node.js + Express):
  - server.ts - Complete REST API implementation (xvesela00)
  - data_interfaces.ts - Backend type definitions (xvesela00)

Desktop Wrapper (Tauri):
  - main.rs - Tauri application entry point (xvesela00)
  - lib.rs - Tauri library configuration (xvesela00)


===============================================================================
DIRECTORY STRUCTURE
===============================================================================

itu-battleships/
│
├── backend/                      Backend server (Node.js + Express)
│   ├── data/                    JSON data storage for game state
│   │   ├── curr_screen.json     Current screen state (menu/planning/game)
│   │   ├── game_settings.json   Game settings (board size)
│   │   ├── pc_grid.json         Opponent's grid state
│   │   ├── player_grid.json     Player's grid state (legacy)
│   │   ├── planning.json        Ship placement data (grids, ships, colors)
│   │   ├── game_state.json      Active game state (health, turns, AI data)
│   │   └── pc_ships.json        Opponent's ship positions
│   ├── src/                     TypeScript source files
│   │   ├── server.ts           Express server with all API endpoints
│   │   └── data_interfaces.ts  TypeScript interfaces for backend
│   ├── package.json            Backend dependencies
│   └── tsconfig.json           TypeScript configuration
│
├── frontend/                    Frontend application (Svelte + TypeScript)
│   ├── src/
│   │   ├── lib/                Svelte components
│   │   │   ├── ShipPlacement.svelte  Ship placement screen
│   │   │   ├── Grid.svelte          Reusable grid component
│   │   │   ├── ShipInventory.svelte Ship inventory UI
│   │   │   ├── GameScreen.svelte    Game play screen
│   │   │   ├── MainMenu.svelte      Main menu and settings
│   │   │   ├── Button.svelte        Reusable button component
│   │   │   ├── VictoryScreen.svelte Victory overlay
│   │   │   ├── DefeatScreen.svelte  Defeat overlay
│   │   │   ├── SurrenderDialog.svelte Surrender dialog
│   │   │   └── CloseConfirmDialog.svelte Exit confirmation
│   │   ├── stores/             Svelte store for state management
│   │   │   └── gameStore.ts    Global state stores
│   │   ├── services/           API communication layer
│   │   │   └── api.ts          API service functions
│   │   ├── types/              TypeScript type definitions
│   │   │   └── interfaces.ts   Interface definitions
│   │   ├── assets/             Static assets (images, fonts)
│   │   ├── App.svelte          Root Svelte component
│   │   ├── main.ts             Application entry point
│   │   └── app.css             Global styles
│   ├── package.json            Frontend dependencies
│   ├── vite.config.ts          Vite build configuration
│   └── tsconfig.json           TypeScript configuration
│
├── src-tauri/                   Tauri desktop wrapper (Rust)
│   ├── src/
│   │   ├── main.rs             Tauri entry point
│   │   └── lib.rs              Tauri library configuration
│   ├── icons/                  Application icons
│   ├── capabilities/           Tauri capabilities configuration
│   ├── Cargo.toml              Rust dependencies
│   └── tauri.conf.json         Tauri configuration
│
├── package.json                 Root package.json for Tauri CLI
├── README.md                    Detailed documentation (Markdown)
└── readme.txt                   Project documentation (Plain text)


===============================================================================
INTERACTIVE DATA MANIPULATION - SHIP PLACEMENT FLOW
===============================================================================

The ship placement system demonstrates sophisticated interactive data 
manipulation through a multi-step flow involving user input, state management,
and visual feedback:

1. SHIP SELECTION (xvesela00):
   - User clicks ship in ShipInventory.svelte
   - Component updates selectedInventoryShip store
   - Store change triggers reactive UI update across all components
   - Ship is visually highlighted in inventory

2. PREVIEW GENERATION (xvesela00):
   - User hovers mouse over Grid.svelte
   - onCellMouseEnter handler captures (row, col) coordinates
   - Grid.svelte computes preview cells based on ship size and rotation
   - Semi-transparent preview overlay appears using ship's color with dashed outline
   - Preview updates in real-time as mouse moves (60 FPS reactivity)

3. SHIP PLACEMENT (xvesela00):
   - User clicks grid cell to place ship
   - Frontend validates placement (boundaries, collisions)
   - POST request sent to /api/planning/placed-ships with {ship, row, col}
   - Backend validates placement logic
   - Backend updates:
     * player_grid.tiles array with ship name
     * placed_ships array with ship data
     * available_ships array (removes placed ship)
   - Backend returns success response
   - Frontend updates all related Svelte stores
   - Svelte reactivity triggers:
     * Grid re-renders with actual ship
     * ShipInventory removes placed ship
     * Next ship auto-selected

4. SHIP MANIPULATION (xvesela00):
   - Click placed ship to select it (activeShip store updated)
   - Press 'R' key to rotate (POST /api/planning/rotate-active-ship)
   - Click new position to move (POST /api/planning/move-active-ship)
   - Press Delete or click trash icon to remove (POST /api/planning/remove-active-ship)
   - All operations validate against grid bounds and ship collisions
   - Each operation updates backend data and syncs frontend stores

5. DATA FLOW:
   User Input → Event Handler → Store Update → API Call → Backend Update 
   → Response → Store Update → Reactive UI Re-render

This demonstrates MVC pattern with reactive data binding:
- Model: Backend JSON files + Svelte stores
- View: Svelte components (Grid, ShipInventory, ShipPlacement)
- Controller: API service layer + event handlers


===============================================================================
COMPONENT INTERCONNECTION - SVELTE REACTIVITY SYSTEM
===============================================================================

The application uses Svelte's reactive stores for component communication,
eliminating prop drilling and ensuring consistent state across the app:

STORE ARCHITECTURE (xvesela00):

1. Core Stores (gameStore.ts):
   - currentScreen: 'menu' | 'planning' | 'game'
   - playerGrid: IGrid (gridSize, tiles[][])
   - opponentGrid: IGrid
   - availableShips: IShip[] | null
   - placedShips: IPlacedShip[] | null
   - activeShip: IPlacedShip | null
   - selectedInventoryShip: IShip | null
   - shipColors: Record<string, string>
   - boardSize: '7x7' | '10x10' | '13x13'

2. Derived Stores:
   - canConfirmPlacement = derived(availableShips, ships => ships?.length === 0)

REACTIVE PATTERNS (xvesela00):

Pattern 1: Cross-Component Communication
  ShipInventory.svelte:
    selectedInventoryShip.set(ship) // User selects ship
  
  ShipPlacement.svelte:
    $: previewShip = $selectedInventoryShip // Auto-updates preview
  
  Grid.svelte:
    {#if isPreviewCell(row, col)} // Auto-renders preview

Pattern 2: Mutual Exclusivity
  Problem: Both placed ship and inventory ship could be selected simultaneously
  Solution by xvesela00:
    - When user selects inventory ship → clear activeShip store
    - When user selects placed ship → clear selectedInventoryShip store
    - Ensures only one selection mode active at a time

Pattern 3: Automatic UI Updates
  Backend updates planning.json → Frontend fetches new data → Updates stores
  → All subscribed components re-render automatically
  
  Example from ShipPlacement.svelte:
    $: if ($availableShips && $availableShips.length > 0 && !$selectedInventoryShip) {
      selectedInventoryShip.set($availableShips[0]); // Auto-select first ship
    }

Pattern 4: Conditional Rendering
  {#if $currentScreen === 'planning'}
    <ShipPlacement />
  {:else if $currentScreen === 'game'}
    <GameScreen />
  {/if}

REACTIVITY BENEFITS:
- No manual DOM manipulation required
- Automatic state synchronization across all components
- Single source of truth for application state
- Simplified debugging (state changes tracked in stores)
- Performance optimized (only changed components re-render)


===============================================================================
MVC ARCHITECTURE DESCRIPTION
===============================================================================

The application implements a clear MVC (Model-View-Controller) separation:

MODEL LAYER:
  Backend Data Storage (JSON files):
    - planning.json: Ship placement state, grid data, ship inventory
    - game_state.json: Active game state, turn info, ship health
    - game_settings.json: User preferences (board size)
    - curr_screen.json: Navigation state
  
  Frontend State (Svelte Stores):
    - Reactive stores mirror backend data
    - Provide real-time UI updates
    - Single source of truth for each component

VIEW LAYER:
  Svelte Components (.svelte files):
    - Pure presentation logic
    - Declarative templates with reactive binding
    - CSS-in-component styling
    - Examples: Grid.svelte, ShipInventory.svelte, Button.svelte
  
  Separation of Concerns:
    - Components receive data via stores (reactive subscriptions)
    - Components emit events for user interactions
    - No business logic in view components

CONTROLLER LAYER:
  API Service Layer (api.ts):
    - Abstraction over HTTP fetch calls
    - Organized into logical groups:
      * settingsApi: GET/POST /api/settings
      * screenApi: GET/POST /api/screen
      * planningApi: Ship placement endpoints
      * gridApi: Grid data management
      * gameApi: Game mechanics (attacks, AI)
    - Centralized error handling
    - Type-safe request/response handling
  
  Backend Controllers (server.ts):
    - Express route handlers
    - Business logic validation
    - Data persistence to JSON files
    - RESTful API design

DATA FLOW:
  1. User interacts with View (Svelte component)
  2. Component calls Controller method (api.ts function)
  3. Controller sends HTTP request to backend
  4. Backend Controller validates and processes request
  5. Backend updates Model (JSON files)
  6. Backend sends response
  7. Frontend Controller updates Svelte stores
  8. Svelte reactivity updates View automatically

ADVANTAGES:
  - Clear separation of concerns
  - Easy to test each layer independently
  - Backend can be swapped without changing View
  - View can be redesigned without changing Model
  - Maintainable and scalable architecture


===============================================================================
BACKEND API DOCUMENTATION
===============================================================================

Base URL: http://localhost:5000/api

SETTINGS & NAVIGATION:
  GET  /api/settings
       Returns: { selectedBoard: "10x10" }
       Description: Get current board size setting
  
  POST /api/settings
       Body: { selectedBoard: "7x7" | "10x10" | "13x13" }
       Description: Update board size, resets grids and ships
  
  GET  /api/screen
       Returns: { current_screen: "menu" | "planning" | "game" }
       Description: Get current screen state
  
  POST /api/screen
       Body: { current_screen: "menu" | "planning" | "game" }
       Description: Navigate to different screen

PLANNING (Ship Placement):
  GET  /api/planning
       Returns: IPlanningData (grid, ships, colors)
       Description: Get all planning data
  
  GET  /api/planning/available-ships
       Returns: { available_ships: IShip[] }
       Description: Get ships not yet placed
  
  POST /api/planning/placed-ships
       Body: { ship: IShip, row: number, col: number }
       Description: Place ship on grid
       Validates: boundaries, collisions
  
  POST /api/planning/handle-active-ship
       Body: { row: number, col: number }
       Description: Select/deselect ship at position
  
  POST /api/planning/remove-active-ship
       Description: Remove currently selected ship from grid
  
  POST /api/planning/rotate-active-ship
       Description: Rotate active ship 90 degrees
       Validates: new position boundaries and collisions
  
  POST /api/planning/move-active-ship
       Body: { row: number, col: number }
       Description: Move active ship to new position
  
  GET  /api/planning/colors
       Returns: Record<string, string> (shipName -> color)
       Description: Get color mapping for all ships
  
  POST /api/clear-grid
       Description: Remove all ships, return to inventory
  
  POST /api/set-available-ships
       Description: Initialize ship inventory from all_ships

GRIDS:
  GET  /api/player-grid
       Returns: IGrid { gridSize: number, tiles: string[][] }
       Description: Get player's grid state
  
  POST /api/player-grid
       Body: { player_grid: IGrid, mode?: "reset" }
       Description: Update player grid
  
  GET  /api/pc-grid
       Returns: IGrid
       Description: Get opponent's grid state
  
  POST /api/pc-grid
       Body: { gridSize?: number, tiles?: string[][] }
       Description: Update opponent grid

GAME MECHANICS:
  POST /api/game/init
       Description: Initialize game, place AI ships, create game state
  
  POST /api/game/attack
       Body: { row: number, col: number }
       Returns: { result: "hit"|"miss"|"sunk", shipSunk?, gameOver, winner? }
       Description: Player attacks opponent grid
  
  POST /api/game/ai-attack
       Returns: { row, col, result, shipSunk?, gameOver, winner? }
       Description: AI automatically attacks player grid
  
  GET  /api/game/status
       Returns: { playerShipsRemaining, pcShipsRemaining, isPlayerTurn, gameOver, winner }
       Description: Get current game status

UTILITY:
  GET  /api/status
       Returns: Server health and data directory info
       Description: Health check endpoint


===============================================================================
ARCHIVE CREATION INSTRUCTIONS
===============================================================================

When creating the submission archive (01_xvesela00_source.zip), include only
source code and configuration files. Exclude build artifacts, dependencies,
and generated files.

INCLUDE IN ARCHIVE:
-------------------
Source Code:
  ✓ backend/src/**/*.ts              Backend TypeScript source
  ✓ frontend/src/**/*.svelte         Frontend Svelte components
  ✓ frontend/src/**/*.ts             Frontend TypeScript source
  ✓ frontend/src/**/*.css            Stylesheets
  ✓ src-tauri/src/**/*.rs            Tauri Rust source
  ✓ src-tauri/build.rs               Tauri build script

Configuration Files:
  ✓ package.json                     Root package.json
  ✓ backend/package.json             Backend dependencies
  ✓ backend/tsconfig.json            Backend TypeScript config
  ✓ frontend/package.json            Frontend dependencies
  ✓ frontend/tsconfig*.json          Frontend TypeScript configs
  ✓ frontend/vite.config.ts          Vite configuration
  ✓ frontend/svelte.config.js        Svelte configuration
  ✓ src-tauri/Cargo.toml             Rust dependencies
  ✓ src-tauri/tauri.conf.json        Tauri configuration

Documentation:
  ✓ README.md                        Project documentation (Markdown)
  ✓ readme.txt                       Project documentation (Plain text)

Assets:
  ✓ src-tauri/icons/*                Application icons
  ✓ frontend/public/*                Static assets
  ✓ frontend/index.html              HTML entry point

EXCLUDE FROM ARCHIVE:
---------------------
Dependencies:
  ✗ node_modules/                    NPM packages (all levels)
  ✗ backend/node_modules/
  ✗ frontend/node_modules/

Build Artifacts:
  ✗ dist/                            Compiled JavaScript
  ✗ backend/dist/
  ✗ frontend/dist/
  ✗ target/                          Rust build artifacts
  ✗ src-tauri/target/
  ✗ build/                           Build output

Data Files:
  ✗ backend/data/*.json              Runtime game state files
  ✗ *.json (in backend/src/data/)    Game data files

Lock Files:
  ✗ package-lock.json                NPM lock files
  ✗ backend/package-lock.json
  ✗ frontend/package-lock.json
  ✗ yarn.lock                        Yarn lock file
  ✗ pnpm-lock.yaml                   PNPM lock file
  ✗ src-tauri/Cargo.lock             Rust lock file

Version Control:
  ✗ .git/                            Git repository
  ✗ .gitignore                       Git ignore file

Logs and Temporary:
  ✗ *.log                            Log files
  ✗ npm-debug.log*
  ✗ .env                             Environment files
  ✗ .DS_Store                        macOS metadata

ARCHIVE CREATION COMMANDS:
--------------------------

Option 1: Using zip (Linux/macOS/Windows with zip):
  cd /path/to/itu-battleships
  zip -r 01_xvesela00_source.zip . \
    -x "node_modules/*" \
    -x "*/node_modules/*" \
    -x "dist/*" \
    -x "*/dist/*" \
    -x "target/*" \
    -x "*/target/*" \
    -x "backend/data/*.json" \
    -x "*.log" \
    -x ".git/*" \
    -x "*package-lock.json" \
    -x "Cargo.lock"

Option 2: Manual selection:
  1. Create temporary folder: 01_xvesela00_source
  2. Copy included files/folders from lists above
  3. Create zip from temporary folder
  4. Delete temporary folder

Option 3: Using Git (exports only tracked files):
  git archive -o 01_xvesela00_source.zip HEAD


===============================================================================
INSTALLATION INSTRUCTIONS
===============================================================================

PREREQUISITES:
--------------
  - Node.js 18+ and npm 8+ (https://nodejs.org/)
  - Rust 1.77.2+ (https://rustup.rs/)
  - Git (https://git-scm.com/)
  - Operating System: Windows 10+, macOS 10.15+, or Linux

INSTALLATION STEPS:
-------------------

1. Clone Repository:
   git clone <repository-url>
   cd itu-battleships

2. Install Backend Dependencies:
   cd backend
   npm install
   cd ..

3. Install Frontend Dependencies:
   cd frontend
   npm install
   cd ..

4. Install Tauri CLI (in root):
   npm install

DEVELOPMENT MODE:
-----------------

1. Start Backend Server (Terminal 1):
   cd backend
   npm run build    # Compile TypeScript to JavaScript
   npm start        # Start server on http://localhost:5000

2. Start Frontend Development Server (Terminal 2):
   cd frontend
   npm run dev      # Start Vite dev server on http://localhost:5173

3. Launch Tauri Desktop App (Terminal 3 - Alternative to step 2):
   # In root directory
   npx tauri dev    # Opens desktop window with app

   Note: Tauri dev mode automatically starts the frontend Vite server

PRODUCTION BUILD:
-----------------

1. Build Backend:
   cd backend
   npm run build    # Compiles to backend/dist/server.js

2. Build Frontend:
   cd frontend
   npm run build    # Compiles to frontend/dist/

3. Build Desktop Application:
   # In root directory
   npx tauri build --target x86_64-pc-windows-gnu

   Output:
   - Executable: src-tauri/target/x86_64-pc-windows-gnu/release/app.exe
   - Installer: src-tauri/target/x86_64-pc-windows-gnu/release/bundle/

RUNNING PRODUCTION BUILD:
-------------------------

1. Start backend server:
   cd backend
   node dist/server.js

2. Run desktop application:
   # Execute the built .exe file from:
   src-tauri/target/x86_64-pc-windows-gnu/release/app.exe

ACCESS POINTS:
--------------
  - Backend API: http://localhost:5000
  - Frontend Web: http://localhost:5173 (dev mode only)
  - Desktop App: Launches in separate window


===============================================================================
TESTING SUMMARY
===============================================================================

USER PROFILE:
-------------
  Age: 22
  Gender: Male
  Background: Computer Science student
  Technical Proficiency: High
  Gaming Experience: Regular gamer
  Platform: Windows 11, Desktop PC

TESTING METHODOLOGY:
  - User asked to place all ships using ship placement screen
  - Observed interaction patterns and issues
  - Asked for verbal feedback during testing
  - Fixed issues and retested

KEY FINDING #1 - Preview Color Confusion (xvesela00):
  PROBLEM:
    Initial preview used solid green for valid placement and red for invalid.
    User reported: "The green preview blends with the green ship. I can't tell
    if I'm placing the green ship or a purple ship. The colors overlap."
    
    Root cause: Preview color (green/red) overlapped with actual ship colors
    (green, purple, orange, blue, grey), causing visual confusion.
  
  SOLUTION IMPLEMENTED:
    Changed preview to use the ship's actual color at 40% opacity with a
    dashed outline. Invalid placements show in red with low opacity.
    
    Code change in Grid.svelte:
      background-color: {previewShip.color}66;  /* 40% opacity */
      border: 2px dashed {previewShip.color};
    
    User feedback after fix: "Much better! Now I can see which ship I'm 
    placing because the preview uses the ship's color."

KEY FINDING #2 - Selection State Ambiguity (xvesela00):
  PROBLEM:
    User could select a ship from inventory AND select a placed ship on the
    grid simultaneously. This caused confusion:
    - Clicking grid would place inventory ship instead of moving placed ship
    - Preview showed wrong ship
    - User: "I clicked a ship on the grid but the preview shows a different ship"
    
    Root cause: No mutual exclusivity between selectedInventoryShip and
    activeShip stores.
  
  SOLUTION IMPLEMENTED:
    Implemented mutual exclusivity:
    - When selecting inventory ship → clear activeShip
    - When selecting placed ship → clear selectedInventoryShip
    - Only one selection mode active at a time
    
    Code change in ShipPlacement.svelte:
      function handleInventoryShipSelect(ship: IShip) {
        activeShip.set(null);  // Clear placed ship selection
        selectedInventoryShip.set(ship);
      }
      
      function handleGridClick(row: number, col: number) {
        if (cellHasShip(row, col)) {
          selectedInventoryShip.set(null);  // Clear inventory selection
          // ... select placed ship
        }
      }
    
    User feedback after fix: "Now it's clear. I'm either placing a new ship
    or moving an existing one, not both at the same time."

ADDITIONAL OBSERVATIONS:
  - User appreciated keyboard shortcuts (R for rotate, Delete for remove)
  - Ship auto-selection after placement was well-received
  - Grid hover preview was intuitive
  - User completed ship placement in under 2 minutes


===============================================================================
FEEDBACK INCORPORATION FROM CONTROL PRESENTATION
===============================================================================

The following feedback was received during the control presentation and
incorporated into the final implementation:

FEEDBACK #1: Improve Visual Clarity
  Issue: Preview colors blending with ship colors
  Action: Changed to semi-transparent ship color with dashed outline
  Status: ✓ IMPLEMENTED (see Testing Summary - Finding #1)

FEEDBACK #2: Prevent Dual Selection
  Issue: Ambiguous selection state (inventory + placed ship)
  Action: Implemented mutual exclusivity between selection modes
  Status: ✓ IMPLEMENTED (see Testing Summary - Finding #2)

FEEDBACK #3: Add Keyboard Shortcuts
  Issue: Ship rotation required multiple clicks
  Action: Added 'R' key for rotation, Delete for removal
  Status: ✓ IMPLEMENTED
  Implementation: ShipPlacement.svelte handleKeyDown function

FEEDBACK #4: Auto-select Next Ship
  Issue: After placing ship, user must manually select next
  Action: Automatically select first available ship after placement
  Status: ✓ IMPLEMENTED
  Implementation: Reactive statement in ShipPlacement.svelte

FEEDBACK #5: Clearer MVC Separation
  Issue: Business logic mixed with view components
  Action: Moved all API calls to api.ts service layer
  Status: ✓ IMPLEMENTED
  Result: Clean separation between View (components) and Controller (API)

FEEDBACK #6: Comprehensive Documentation
  Issue: Missing architecture documentation
  Action: Created detailed README.md and readme.txt with:
    - MVC architecture explanation
    - Component interconnection details
    - Interactive data manipulation flow
    - API documentation
  Status: ✓ IMPLEMENTED (this document)


===============================================================================
WORK DIVISION - ADAM VESELÝ (xvesela00) CONTRIBUTIONS
===============================================================================

As the sole developer on this project, Adam Veselý (xvesela00) is responsible
for 100% of the implementation:

FRONTEND DEVELOPMENT (xvesela00):
  ✓ All Svelte components (10 components)
  ✓ Svelte store architecture and state management
  ✓ API service layer with TypeScript types
  ✓ Interactive ship placement system with preview
  ✓ Game mechanics UI (attack system, turn management)
  ✓ Responsive grid component with hover effects
  ✓ Ship inventory with drag-and-drop feel
  ✓ Keyboard shortcuts implementation
  ✓ Styling and CSS for all components

BACKEND DEVELOPMENT (xvesela00):
  ✓ Complete REST API (35+ endpoints)
  ✓ Ship placement validation logic
  ✓ Game mechanics implementation
  ✓ AI opponent with hunt/target mode
  ✓ JSON-based data persistence
  ✓ TypeScript interfaces and type safety
  ✓ Error handling and validation

DESKTOP INTEGRATION (xvesela00):
  ✓ Tauri configuration and setup
  ✓ Rust wrapper implementation
  ✓ Application packaging for Windows
  ✓ Icon and asset integration

TESTING & REFINEMENT (xvesela00):
  ✓ User testing coordination
  ✓ Issue identification and resolution
  ✓ Preview color system redesign
  ✓ Selection state mutual exclusivity
  ✓ Feedback incorporation from presentation

DOCUMENTATION (xvesela00):
  ✓ README.md with technical details
  ✓ readme.txt with comprehensive guide
  ✓ Code comments and documentation
  ✓ API documentation
  ✓ Architecture diagrams

TOTAL ESTIMATED HOURS: ~120 hours
  - Frontend: 50 hours
  - Backend: 40 hours
  - Tauri Integration: 15 hours
  - Testing & Debugging: 10 hours
  - Documentation: 5 hours

===============================================================================
END OF DOCUMENTATION
===============================================================================