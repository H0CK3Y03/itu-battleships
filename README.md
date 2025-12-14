# ITU Project - Battleships Game

**Author:** Adam Veselý (xvesela00)  
**Course:** ITU (User Interface Programming)  
**Academic Year:** 2024/2025  
**Institution:** Faculty of Information Technology, BUT

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Architecture](#-architecture)
- [Directory Structure](#-directory-structure)
- [API Documentation](#-api-documentation)
- [Key Features](#-key-features)
- [Installation & Setup](#-installation--setup)
- [Archive Creation Guide](#-archive-creation-guide)
- [Testing Results](#-testing-results)
- [Feedback Incorporation](#-feedback-incorporation)
- [Work Division](#-work-division)

---

## 🎯 Project Overview

A modern desktop **Battleships** game built with a full-stack architecture, featuring intelligent AI opponent, interactive ship placement, and real-time gameplay.

### Project Goals

1. **Interactive UI/UX** - Intuitive ship placement with visual preview system
2. **MVC Architecture** - Clear separation between Model, View, and Controller
3. **Reactive State Management** - Svelte stores for seamless component communication
4. **Desktop Experience** - Native desktop app using Tauri (Rust wrapper)
5. **RESTful API** - Complete backend with game logic and data persistence

### Core Features

- ✅ **Interactive Ship Placement** - Drag, rotate, and position ships with live preview
- ✅ **Smart AI Opponent** - Hunt/target mode AI with strategic attack patterns
- ✅ **Multiple Board Sizes** - 7×7, 10×10, 13×13 grid options
- ✅ **Real-time Feedback** - Instant visual updates using Svelte reactivity
- ✅ **Keyboard Shortcuts** - R to rotate, Delete to remove ships
- ✅ **Desktop Application** - Packaged with Tauri for native performance

### Technologies

- **Frontend:** Svelte 4 + TypeScript + Vite
- **Backend:** Node.js + Express + TypeScript
- **Desktop:** Tauri 2 (Rust)
- **State Management:** Svelte Stores (reactive)
- **Data Storage:** JSON files

---

## 🏗️ Architecture

The application follows the **Model-View-Controller (MVC)** pattern with reactive state management.

### MVC Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                           VIEW LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │ ShipPlacement│  │  GameScreen  │  │   MainMenu   │            │
│  │   .svelte    │  │   .svelte    │  │   .svelte    │            │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │
│         │                 │                 │                    │
│  ┌──────▼──────────────────▼──────────────────▼───────┐          │
│  │              Grid.svelte                           │          │
│  │         ShipInventory.svelte                       │          │
│  │              Button.svelte                         │          │
│  └───────────────────────┬────────────────────────────┘          │
└────────────────────────────┼─────────────────────────────────────┘
                             │ Reactive Binding ($stores)
┌────────────────────────────▼─────────────────────────────────────┐
│                      STATE MANAGEMENT                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              gameStore.ts (Svelte Stores)               │    │
│  │  • playerGrid  • availableShips  • activeShip           │    │
│  │  • opponentGrid • selectedInventoryShip • shipColors    │    │
│  └─────────────────────────┬───────────────────────────────┘    │
└────────────────────────────┼─────────────────────────────────────┘
                             │ API Calls
┌────────────────────────────▼─────────────────────────────────────┐
│                      CONTROLLER LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  api.ts (Service Layer)                 │    │
│  │  • planningApi  • gameApi  • settingsApi  • gridApi     │    │
│  └─────────────────────────┬───────────────────────────────┘    │
└────────────────────────────┼─────────────────────────────────────┘
                             │ HTTP (REST)
┌────────────────────────────▼─────────────────────────────────────┐
│                       BACKEND CONTROLLER                         │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              server.ts (Express Routes)                 │    │
│  │  POST /api/planning/placed-ships                        │    │
│  │  POST /api/game/attack                                  │    │
│  │  GET  /api/planning                                     │    │
│  └─────────────────────────┬───────────────────────────────┘    │
└────────────────────────────┼─────────────────────────────────────┘
                             │ Read/Write JSON
┌────────────────────────────▼─────────────────────────────────────┐
│                         MODEL LAYER                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │               JSON Data Files (backend/data/)           │    │
│  │  • planning.json  • game_state.json  • game_settings.json│   │
│  │  • pc_grid.json   • curr_screen.json                    │    │
│  └─────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow Example: Ship Placement

```
User clicks Grid cell
        ↓
Grid.svelte handleCellClick()
        ↓
planningApi.placeShip(ship, row, col)  [Controller]
        ↓
POST /api/planning/placed-ships  [HTTP]
        ↓
server.ts validates & updates planning.json  [Backend Controller + Model]
        ↓
Response: { success: true, ship: {...} }
        ↓
Update placedShips store  [State Management]
        ↓
Svelte reactivity triggers re-render  [View]
        ↓
Grid shows placed ship, inventory updates
```

---

## 📁 Directory Structure

```
itu-battleships/
│
├── backend/                          # Backend server (xvesela00)
│   ├── data/                        # JSON data storage
│   │   ├── curr_screen.json         # Current screen state
│   │   ├── game_settings.json       # Board size setting
│   │   ├── planning.json            # Ship placement data
│   │   ├── game_state.json          # Active game state
│   │   ├── pc_ships.json            # AI ship positions
│   │   └── pc_grid.json             # Opponent grid
│   ├── src/
│   │   ├── server.ts                # Express server (35+ endpoints)
│   │   └── data_interfaces.ts       # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # Frontend application (xvesela00)
│   ├── src/
│   │   ├── lib/                     # Svelte components
│   │   │   ├── ShipPlacement.svelte # Ship placement screen
│   │   │   ├── Grid.svelte          # Reusable grid component
│   │   │   ├── ShipInventory.svelte # Ship selection UI
│   │   │   ├── GameScreen.svelte    # Game interface
│   │   │   ├── MainMenu.svelte      # Menu and settings
│   │   │   ├── Button.svelte        # Reusable button
│   │   │   ├── VictoryScreen.svelte # Victory overlay
│   │   │   ├── DefeatScreen.svelte  # Defeat overlay
│   │   │   ├── SurrenderDialog.svelte
│   │   │   └── CloseConfirmDialog.svelte
│   │   ├── stores/
│   │   │   └── gameStore.ts         # Svelte stores
│   │   ├── services/
│   │   │   └── api.ts               # API service layer
│   │   ├── types/
│   │   │   └── interfaces.ts        # TypeScript interfaces
│   │   ├── App.svelte               # Root component
│   │   ├── main.ts                  # Entry point
│   │   └── app.css                  # Global styles
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── src-tauri/                        # Tauri desktop wrapper (xvesela00)
│   ├── src/
│   │   ├── main.rs                  # Tauri entry point
│   │   └── lib.rs                   # Library config
│   ├── icons/                       # App icons
│   ├── Cargo.toml                   # Rust dependencies
│   └── tauri.conf.json              # Tauri config
│
├── package.json                      # Root package.json (Tauri CLI)
├── README.md                         # This file
└── readme.txt                        # Plain text documentation
```

---

## 🔌 API Documentation

**Base URL:** `http://localhost:5000/api`

### Settings & Navigation

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| GET | `/settings` | - | `{ selectedBoard: string }` | Get board size setting |
| POST | `/settings` | `{ selectedBoard: "7x7"\|"10x10"\|"13x13" }` | `{ selectedBoard: string }` | Update board size |
| GET | `/screen` | - | `{ current_screen: string }` | Get current screen |
| POST | `/screen` | `{ current_screen: "menu"\|"planning"\|"game" }` | `{ success: boolean }` | Navigate to screen |

### Planning (Ship Placement)

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| GET | `/planning` | - | `IPlanningData` | Get all planning data |
| GET | `/planning/available-ships` | - | `{ available_ships: IShip[] }` | Get unplaced ships |
| POST | `/planning/placed-ships` | `{ ship: IShip, row: number, col: number }` | `{ message: string, ship: IShip }` | Place ship on grid |
| POST | `/planning/handle-active-ship` | `{ row: number, col: number }` | `{ message: string, active_ship: IPlacedShip\|null }` | Select/deselect ship |
| POST | `/planning/remove-active-ship` | - | `{ message: string }` | Remove active ship |
| POST | `/planning/rotate-active-ship` | - | `{ message: string, active_ship: IPlacedShip }` | Rotate active ship 90° |
| POST | `/planning/move-active-ship` | `{ row: number, col: number }` | `{ message: string, active_ship: IPlacedShip }` | Move active ship |
| GET | `/planning/colors` | - | `Record<string, string>` | Get ship color mapping |
| POST | `/clear-grid` | - | `{ message: string }` | Clear all ships |
| POST | `/set-available-ships` | - | `{ message: string }` | Initialize ship inventory |

### Grids

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| GET | `/player-grid` | - | `IGrid` | Get player grid |
| POST | `/player-grid` | `{ player_grid: IGrid, mode?: "reset" }` | `{ message: string, planningData: IPlanningData }` | Update player grid |
| GET | `/pc-grid` | - | `IGrid` | Get opponent grid |
| POST | `/pc-grid` | `{ gridSize?: number, tiles?: string[][] }` | `{ message: string, updatedGrid: IGrid }` | Update opponent grid |

### Game Mechanics

| Method | Endpoint | Body | Response | Description |
|--------|----------|------|----------|-------------|
| POST | `/game/init` | - | `{ message: string }` | Initialize game, place AI ships |
| POST | `/game/attack` | `{ row: number, col: number }` | `{ result: "hit"\|"miss"\|"sunk", shipSunk?: string, gameOver: boolean, winner?: string }` | Player attacks opponent |
| POST | `/game/ai-attack` | - | `{ row: number, col: number, result: string, shipSunk?: string, gameOver: boolean, winner?: string }` | AI attacks player |
| GET | `/game/status` | - | `{ playerShipsRemaining: number, pcShipsRemaining: number, isPlayerTurn: boolean, gameOver: boolean, winner?: string }` | Get game status |

---

## ✨ Key Features

### 1. Ship Placement System (xvesela00)

Interactive ship placement with real-time preview and validation.

**Code Example - ShipPlacement.svelte:**

```typescript
// Preview generation on mouse hover
function handleCellMouseEnter(row: number, col: number) {
  const shipToPlace = $selectedInventoryShip || $activeShip;
  if (!shipToPlace) return;
  
  previewRow = row;
  previewCol = col;
  previewRotation = shipToPlace.rotation;
}

// Ship placement with API call
async function handleCellClick(row: number, col: number) {
  if ($selectedInventoryShip && !$activeShip) {
    // Place new ship from inventory
    await planningApi.placeShip($selectedInventoryShip, row, col);
    
    // Reload data and update stores
    const data = await planningApi.getPlanningData();
    availableShips.set(data.available_ships);
    placedShips.set(data.placed_ships);
    
    // Auto-select next ship
    if (data.available_ships && data.available_ships.length > 0) {
      selectedInventoryShip.set(data.available_ships[0]);
    }
  }
}
```

### 2. Grid Component (xvesela00)

Reusable grid with preview overlay and ship visualization.

**Code Example - Grid.svelte:**

```svelte
<script lang="ts">
  export let grid: IGrid;
  export let colors: Record<string, string> = {};
  export let previewRow: number | null = null;
  export let previewCol: number | null = null;
  export let previewShip: IShip | IPlacedShip | null = null;
  export let previewRotation: number = 0;
  
  function isPreviewCell(rowIndex: number, colIndex: number): boolean {
    if (!previewShip || previewRow === null || previewCol === null) {
      return false;
    }
    
    const size = previewShip.size;
    
    if (previewRotation === 0) {
      // Horizontal
      return rowIndex === previewRow && 
             colIndex >= previewCol && 
             colIndex < previewCol + size;
    } else {
      // Vertical
      return colIndex === previewCol && 
             rowIndex >= previewRow && 
             rowIndex < previewRow + size;
    }
  }
</script>

<div class="grid">
  {#each grid.tiles as row, rowIndex}
    {#each row as cell, colIndex}
      <div 
        class="cell"
        class:preview={isPreviewCell(rowIndex, colIndex)}
        style="background-color: {getCellColor(cell)}"
      >
        {#if isPreviewCell(rowIndex, colIndex)}
          <div class="preview-overlay" 
               style="background-color: {previewShip.color}66; 
                      border: 2px dashed {previewShip.color}">
          </div>
        {/if}
      </div>
    {/each}
  {/each}
</div>
```

### 3. Ship Inventory (xvesela00)

Visual ship inventory with selection state management.

**Code Example - ShipInventory.svelte:**

```svelte
<script lang="ts">
  import { availableShips, selectedInventoryShip, activeShip } from '../stores/gameStore';
  
  function selectShip(ship: IShip) {
    // Mutual exclusivity: clear placed ship selection
    activeShip.set(null);
    
    // Toggle selection
    if ($selectedInventoryShip?.id === ship.id) {
      selectedInventoryShip.set(null);
    } else {
      selectedInventoryShip.set(ship);
    }
  }
</script>

<div class="inventory">
  {#if $availableShips && $availableShips.length > 0}
    {#each $availableShips as ship}
      <div 
        class="ship-item"
        class:selected={$selectedInventoryShip?.id === ship.id}
        on:click={() => selectShip(ship)}
      >
        <div class="ship-preview" style="background-color: {ship.color}">
          Size: {ship.size}
        </div>
      </div>
    {/each}
  {:else}
    <p>All ships placed! ✓</p>
  {/if}
</div>
```

### 4. Settings Management (xvesela00)

Dynamic board size configuration with grid reset.

**Code Example - MainMenu.svelte:**

```typescript
async function handleBoardSizeChange(size: string) {
  loading = true;
  try {
    // Update settings on backend
    await settingsApi.updateSettings(size);
    
    // Update local store
    boardSize.set(size);
    
    // Reset planning data for new board size
    await planningApi.resetPlanning();
    
    // Reload grids
    const playerGridData = await gridApi.getPlayerGrid();
    playerGrid.set(playerGridData);
  } finally {
    loading = false;
  }
}
```

### 5. State Management - Svelte Stores (xvesela00)

Centralized reactive state for component interconnection.

**Code Example - gameStore.ts:**

```typescript
import { writable, derived } from 'svelte/store';

// Core stores
export const currentScreen = writable<'menu' | 'planning' | 'game'>('menu');
export const playerGrid = writable<IGrid>({ gridSize: 10, tiles: [] });
export const availableShips = writable<IShip[] | null>(null);
export const placedShips = writable<IPlacedShip[] | null>(null);
export const activeShip = writable<IPlacedShip | null>(null);
export const selectedInventoryShip = writable<IShip | null>(null);
export const shipColors = writable<Record<string, string>>({});
export const opponentGrid = writable<IGrid>({ gridSize: 10, tiles: [] });

// Derived store - automatically updates when availableShips changes
export const canConfirmPlacement = derived(
  availableShips,
  ($availableShips) => $availableShips !== null && $availableShips.length === 0
);

// Usage in components:
// $canConfirmPlacement automatically recomputes when ships are placed
```

**Reactivity Example:**

```svelte
<!-- ShipPlacement.svelte -->
<script>
  import { canConfirmPlacement } from '../stores/gameStore';
</script>

<!-- Button automatically enables/disables based on store -->
<Button 
  disabled={!$canConfirmPlacement} 
  on:click={confirmPlacement}
>
  Confirm Placement
</Button>
```

### 6. API Service Layer (xvesela00)

Abstraction layer for backend communication with error handling.

**Code Example - api.ts:**

```typescript
const API_BASE = 'http://localhost:5000/api';

// Helper function with error handling
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

// Planning API group
export const planningApi = {
  getPlanningData: () => fetchApi<IPlanningData>('/planning'),
  
  placeShip: (ship: IShip, row: number, col: number) =>
    fetchApi<{ message: string; ship: IShip }>('/planning/placed-ships', {
      method: 'POST',
      body: JSON.stringify({ ship, row, col }),
    }),
  
  rotateActiveShip: () =>
    fetchApi<{ message: string; active_ship: IPlacedShip | null }>('/planning/rotate-active-ship', {
      method: 'POST',
    }),
};
```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18+ and **npm** 8+ ([Download](https://nodejs.org/))
- **Rust** 1.77.2+ ([Install via rustup](https://rustup.rs/))
- **Git** ([Download](https://git-scm.com/))

### Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd itu-battleships

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..

# 4. Install Tauri CLI (root directory)
npm install
```

### Development Mode

**Option A: Web Development (Frontend + Backend)**

```bash
# Terminal 1: Start backend
cd backend
npm run build    # Compile TypeScript
npm start        # Server runs on http://localhost:5000

# Terminal 2: Start frontend
cd frontend
npm run dev      # Vite dev server on http://localhost:5173
```

**Option B: Desktop Development (Recommended)**

```bash
# Terminal 1: Start backend
cd backend
npm run build
npm start

# Terminal 2: Start Tauri desktop app (auto-starts frontend)
npx tauri dev    # Opens desktop window
```

### Production Build

```bash
# 1. Build backend
cd backend
npm run build    # Output: backend/dist/server.js

# 2. Build frontend
cd frontend
npm run build    # Output: frontend/dist/

# 3. Build desktop application
# (from root directory)
npx tauri build --target x86_64-pc-windows-gnu
```

**Build Outputs:**
- **Executable:** `src-tauri/target/x86_64-pc-windows-gnu/release/app.exe`
- **Installer:** `src-tauri/target/x86_64-pc-windows-gnu/release/bundle/`

### Running Production Build

```bash
# 1. Start backend server
cd backend
node dist/server.js

# 2. Run desktop application
# Execute: src-tauri/target/x86_64-pc-windows-gnu/release/app.exe
```

---

## 📦 Archive Creation Guide

Create the submission archive `01_xvesela00_source.zip` with **source code only** (no dependencies or build artifacts).

### What to Include ✅

**Source Code:**
```
backend/src/**/*.ts
frontend/src/**/*.svelte
frontend/src/**/*.ts
frontend/src/**/*.css
src-tauri/src/**/*.rs
src-tauri/build.rs
```

**Configuration Files:**
```
package.json                    # Root
backend/package.json
backend/tsconfig.json
frontend/package.json
frontend/tsconfig*.json
frontend/vite.config.ts
frontend/svelte.config.js
src-tauri/Cargo.toml
src-tauri/tauri.conf.json
```

**Documentation & Assets:**
```
README.md
readme.txt
src-tauri/icons/*
frontend/public/*
frontend/index.html
```

### What to Exclude ❌

```
node_modules/             # All NPM packages
*/node_modules/
dist/                     # Build outputs
*/dist/
target/                   # Rust build artifacts
*/target/
backend/data/*.json       # Runtime data files
package-lock.json         # Lock files
*/package-lock.json
Cargo.lock
yarn.lock
.git/                     # Version control
*.log                     # Log files
.env                      # Environment files
```

### Archive Creation Commands

**Option 1: Using zip (Recommended)**

```bash
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
```

**Option 2: Using Git Archive**

```bash
# Only exports tracked files (respects .gitignore)
git archive -o 01_xvesela00_source.zip HEAD
```

**Option 3: Manual Selection**

`zip -r 01_xvesela00_source.zip backend/data backend/src backend/package.json backend/package-lock.json backend/tsconfig.json frontend/public/ frontend/src/ frontend/index.html frontend/package.json frontend/package-lock.json frontend/svelte.config.js frontend/tsconfig.app.json frontend/tsconfig.json frontend/tsconfig.node.json frontend/vite.config.ts src-tauri/capabilities/ src-tauri/icons/ src-tauri/src/ src-tauri/build.rs src-tauri/Cargo.lock src-tauri/Cargo.toml src-tauri/tauri.conf.json package.json package-lock.json readme.txt`

---

## 🧪 Testing Results

### User Profile

| Attribute | Value |
|-----------|-------|
| **Age** | 22 |
| **Gender** | Male |
| **Background** | Computer Science student |
| **Technical Proficiency** | High |
| **Gaming Experience** | Regular gamer |
| **Platform** | Windows 11, Desktop PC |

### Testing Methodology

1. User asked to complete ship placement without guidance
2. Observed interaction patterns and noted confusion points
3. Collected verbal feedback during testing
4. Fixed issues based on feedback
5. Retested with same user to confirm improvements

---

### Key Finding #1: Preview Color Confusion (xvesela00)

#### Problem Description

Initial implementation used solid green for valid placement preview and red for invalid placement. User reported confusion:

> "The green preview blends with the green ship. I can't tell if I'm placing the green ship or a purple ship. The colors overlap and it's confusing."

**Root Cause:** Preview color system (green/red) overlapped with actual ship colors (green, purple, orange, blue, grey), making it difficult to identify which ship was being placed.

#### Solution Implemented

Changed preview to use the **ship's actual color** at 40% opacity with a **dashed outline**. Invalid placements show in red with low opacity.

**Code Changes in Grid.svelte:**

```css
.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Use ship's color with transparency */
  background-color: {previewShip.color}66;  /* 66 = 40% opacity in hex */
  border: 2px dashed {previewShip.color};
  pointer-events: none;
}

.preview-overlay.invalid {
  background-color: rgba(255, 0, 0, 0.3);
  border: 2px dashed #ff0000;
}
```

**User Feedback After Fix:**

> "Much better! Now I can see which ship I'm placing because the preview uses the ship's actual color. The dashed outline makes it clear it's just a preview."

---

### Key Finding #2: Selection State Ambiguity (xvesela00)

#### Problem Description

User could simultaneously:
1. Select a ship from the inventory (for placement)
2. Select a placed ship on the grid (for moving/rotating)

This caused unexpected behavior:
- Clicking grid would place inventory ship instead of moving the selected placed ship
- Preview showed wrong ship
- User reported confusion about which action would occur

**User Quote:**

> "I clicked a ship on the grid to move it, but when I hover over cells, the preview shows a different ship from my inventory. Why is that happening?"

**Root Cause:** No mutual exclusivity between `selectedInventoryShip` and `activeShip` stores. Both could be set simultaneously.

#### Solution Implemented

Implemented **mutual exclusivity** - only one selection mode can be active at a time:
- Selecting inventory ship → clears placed ship selection
- Selecting placed ship → clears inventory selection

**Code Changes in ShipPlacement.svelte:**

```typescript
// Inventory ship selection
function handleInventoryShipSelect(ship: IShip) {
  activeShip.set(null);  // Clear placed ship selection
  selectedInventoryShip.set(ship);
}

// Grid click handler
async function handleGridClick(row: number, col: number) {
  const cellValue = $playerGrid.tiles[row][col];
  
  if (cellValue !== 'empty') {
    // Clicking placed ship - entering move mode
    selectedInventoryShip.set(null);  // Clear inventory selection
    await planningApi.handleActiveShip(row, col);
    // ... activate ship for moving
  } else if ($selectedInventoryShip && !$activeShip) {
    // Placing new ship from inventory
    await planningApi.placeShip($selectedInventoryShip, row, col);
  }
}
```

**Visual Indicators Added:**

```svelte
<!-- Show current mode to user -->
{#if $activeShip}
  <p class="mode-indicator">
    Moving: {$activeShip.name} (Press R to rotate, Delete to remove)
  </p>
{:else if $selectedInventoryShip}
  <p class="mode-indicator">
    Placing: {$selectedInventoryShip.name} (Size: {$selectedInventoryShip.size})
  </p>
{/if}
```

**User Feedback After Fix:**

> "Now it's perfectly clear. I'm either placing a new ship or moving an existing one, not both at the same time. The mode indicator helps too."

---

### Additional Observations

✅ **Positive Feedback:**
- Keyboard shortcuts (R for rotate, Delete for remove) were well-received
- Auto-selection of next ship after placement was intuitive
- Grid hover preview system felt responsive
- User completed ship placement in under 2 minutes on second attempt

⚠️ **Minor Issues (Not Critical):**
- User initially didn't notice keyboard shortcuts (added on-screen hints)
- Requested larger grid cells on smaller screens (noted for future improvement)

---

## 🔄 Feedback Incorporation

Feedback from control presentation was incorporated into the final implementation:

### Feedback #1: Improve Visual Clarity ✅

**Issue:** Preview colors blending with ship colors  
**Action:** Changed to semi-transparent ship color with dashed outline  
**Status:** **IMPLEMENTED** (See Testing Summary - Finding #1)  
**Code:** `Grid.svelte` - Preview overlay styling

### Feedback #2: Prevent Dual Selection ✅

**Issue:** Ambiguous selection state (inventory + placed ship)  
**Action:** Implemented mutual exclusivity between selection modes  
**Status:** **IMPLEMENTED** (See Testing Summary - Finding #2)  
**Code:** `ShipPlacement.svelte` - Selection handlers

### Feedback #3: Add Keyboard Shortcuts ✅

**Issue:** Ship rotation required multiple clicks  
**Action:** Added 'R' key for rotation, Delete for removal  
**Status:** **IMPLEMENTED**  
**Code:** `ShipPlacement.svelte` - `handleKeyDown()` function

```typescript
function handleKeyDown(event: KeyboardEvent) {
  if (!$activeShip) return;
  
  if (event.key === 'r' || event.key === 'R') {
    event.preventDefault();
    handleRotateShip();
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault();
    handleRemoveShip();
  }
}
```

### Feedback #4: Auto-select Next Ship ✅

**Issue:** After placing ship, user must manually select next  
**Action:** Automatically select first available ship after placement  
**Status:** **IMPLEMENTED**  
**Code:** Reactive statement in `ShipPlacement.svelte`

```typescript
$: if ($availableShips && $availableShips.length > 0 && !$selectedInventoryShip && !$activeShip) {
  selectedInventoryShip.set($availableShips[0]);
}
```

### Feedback #5: Clearer MVC Separation ✅

**Issue:** Business logic mixed with view components  
**Action:** Moved all API calls to `api.ts` service layer  
**Status:** **IMPLEMENTED**  
**Result:** Clean separation between View (components) and Controller (API)

### Feedback #6: Comprehensive Documentation ✅

**Issue:** Missing architecture documentation  
**Action:** Created detailed `README.md` and `readme.txt` with:
- MVC architecture explanation and diagram
- Component interconnection details (Svelte reactivity)
- Interactive data manipulation flow
- Complete API documentation
- Testing results with specific findings  
**Status:** **IMPLEMENTED** (This document)

---

## 👨‍💻 Work Division

**Developer:** Adam Veselý (xvesela00)  
**Role:** Sole Developer (100% of implementation)

### Contribution Breakdown

#### Frontend Development (xvesela00)
- ✅ All Svelte components (10 components)
- ✅ Svelte store architecture and state management
- ✅ API service layer with TypeScript types
- ✅ Interactive ship placement system with preview
- ✅ Game mechanics UI (attack system, turn management)
- ✅ Responsive grid component with hover effects
- ✅ Ship inventory with selection management
- ✅ Keyboard shortcuts implementation
- ✅ Styling and CSS for all components

#### Backend Development (xvesela00)
- ✅ Complete REST API (35+ endpoints)
- ✅ Ship placement validation logic
- ✅ Game mechanics implementation
- ✅ AI opponent with hunt/target mode strategy
- ✅ JSON-based data persistence
- ✅ TypeScript interfaces and type safety
- ✅ Error handling and validation

#### Desktop Integration (xvesela00)
- ✅ Tauri configuration and setup
- ✅ Rust wrapper implementation
- ✅ Application packaging for Windows
- ✅ Icon and asset integration

#### Testing & Refinement (xvesela00)
- ✅ User testing coordination
- ✅ Issue identification and resolution
- ✅ Preview color system redesign (Finding #1)
- ✅ Selection state mutual exclusivity (Finding #2)
- ✅ Feedback incorporation from presentation

#### Documentation (xvesela00)
- ✅ `README.md` with technical details and examples
- ✅ `readme.txt` with comprehensive guide
- ✅ Code comments and inline documentation
- ✅ Complete API documentation
- ✅ MVC architecture diagrams

### Time Investment

| Category | Hours |
|----------|-------|
| Frontend Development | 50 |
| Backend Development | 40 |
| Tauri Integration | 15 |
| Testing & Debugging | 10 |
| Documentation | 5 |
| **Total** | **~120 hours** |

---

## 📄 License

Academic project for ITU course at FIT BUT.

---

**Author:** Adam Veselý (xvesela00)  
**Last Updated:** December 2024
