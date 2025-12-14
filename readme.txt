===============================================================================
ITU - Battleships
===============================================================================

Frontend Components (Svelte) (xvesela00):
  - ShipPlacement.svelte - Interactive ship placement screen
  - Grid.svelte - Reusable grid component with preview system
  - ShipInventory.svelte - Ship selection and inventory management
  - GameScreen.svelte - Main game interface
  - MainMenu.svelte - Menu screen with settings
  - Button.svelte - Reusable button component
  - VictoryScreen.svelte - Victory screen UI
  - DefeatScreen.svelte - Defeat screen UI
  - SurrenderDialog.svelte - Surrender confirmation dialog
  - CloseConfirmDialog.svelte - Close confirmation dialog

State Management (xvesela00):
  - gameStore.ts - Svelte stores for state management

API Service Layer (xvesela00):
  - api.ts - API service with fetch wrappers

Type Definitions (xvesela00):
  - interfaces.ts - TypeScript interfaces

Backend (Node.js + Express) (some changes, otherwise shared):
  - server.ts - Complete REST API implementation
  - data_interfaces.ts - Backend type definitions

Desktop Wrapper (Tauri) (xvesela00):
  - main.rs - Tauri application entry point
  - lib.rs - Tauri library configuration

===============================================================================
DIRECTORY STRUCTURE
===============================================================================

itu-battleships/
│
├── backend/                                     Backend server (Node.js + Express)
│   ├── data/                                    JSON data storage for game state
│   │   ├── curr_screen.json                     Current screen state (menu/planning/game)
│   │   ├── game_settings.json                   Game settings (board size)
│   │   ├── pc_grid.json                         Opponent's grid state
│   │   ├── player_grid.json                     Player's grid state (legacy)
│   │   ├── planning.json                        Ship placement data (grids, ships, colors)
│   │   ├── game_state.json                      Active game state (health, turns, AI data)
│   │   ├── pc_ships.json                        Opponent's ship positions
│   │   └── zaloha_data.json                     Initialized ships
│   ├── src/                                     TypeScript source files
│   │   ├── server.ts                            Express server with all API endpoints
│   │   └── data_interfaces.ts                   TypeScript interfaces for backend
│   ├── package.json                             Backend dependencies
│   ├── package-lock.json                        Exact backend dependencies
│   └── tsconfig.json                            TypeScript configuration
│
├── frontend/                                    Frontend application (Svelte + TypeScript)
│   ├── src/
│   │   ├── lib/                                 Svelte components
│   │   │   ├── ShipPlacement.svelte             Ship placement screen
│   │   │   ├── Grid.svelte                      Reusable grid component
│   │   │   ├── ShipInventory.svelte             Ship inventory UI
│   │   │   ├── GameScreen.svelte                Game play screen
│   │   │   ├── MainMenu.svelte                  Main menu and settings
│   │   │   ├── Button.svelte                    Reusable button component
│   │   │   ├── VictoryScreen.svelte             Victory overlay
│   │   │   ├── DefeatScreen.svelte              Defeat overlay
│   │   │   ├── SurrenderDialog.svelte           Surrender dialog
│   │   │   └── CloseConfirmDialog.svelte        Exit confirmation
│   │   ├── stores/                              Svelte store for state management
│   │   │   └── gameStore.ts                     Global state stores
│   │   ├── services/                            API communication layer
│   │   │   └── api.ts                           API service functions
│   │   ├── types/                               TypeScript type definitions
│   │   │   └── interfaces.ts                    Interface definitions
│   │   ├── assets/                              Static assets (images, fonts)
│   │   ├── App.svelte                           Root Svelte component
│   │   ├── main.ts                              Application entry point
│   │   ├── vite-env.d.ts                        Vite + TypeScript environment declarations
│   │   └── app.css                              Global styles
│   ├── index.html                               Vite HTML entry point
│   ├── package.json                             Frontend dependencies
│   ├── package-lock.json                        Exact frontend dependencies
│   ├── vite.config.ts                           Vite build configuration
│   ├── svelte.config.ts                         Svelte compiler and preprocessing configuration
│   ├── tsconfig.node.json                       TypeScript config for Node/build tooling
│   ├── tsconfig.app.json                        TypeScript config for browser application
│   └── tsconfig.json                            Shared base TypeScript config
│
├── src-tauri/                                   Tauri desktop wrapper (Rust)
│   ├── src/
│   │   ├── main.rs                              Tauri entry point
│   │   └── lib.rs                               Tauri library configuration
│   ├── icons/                                   Application icons
│   ├── capabilities/                            Tauri capabilities configuration
│   ├── build.rs                                 Rust build script (executed by Cargo)
│   ├── Cargo.toml                               Rust dependency declarations
│   ├── Cargo.lock                               Exact resolved dependency versions
│   └── tauri.conf.json                          Tauri configuration
│
├── package.json                                 Root package.json for Tauri
├── package-lock.json                            Root package-lock.json for Tauri
└── readme.txt                                   Project structure