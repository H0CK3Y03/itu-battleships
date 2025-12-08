Aplikacia je implementovana pomocou komponentov v adresari frontend/src/components, ktore manipuluju s datami (backend/data) prostrednictvom funkcii v adresari frontend/src/api. Tie vyuzivaju kniznicu axios na posielanie poziadavkov na endpointy definovane v subore backend/src/server.ts

Spustenie aplikacie:
1. v 1 terminali - cd backend, nasledne npm install a npm start
2. v 2 terminali - cd frontend, zadaj 'npm install typescript@4.9.5 --save-dev', nasledne npm install a npm start (aplikacia pobezi na localhoste na porte 3000)


Adresárová štruktúra: (len zdrojové súbory + json)
backend
    data
        curr_screen.json
        game_settings.json
        pc_grid.json
        player_grid.json
    src
        server.ts

frontend
    src
        api
            api_grid.ts
            api_pc.ts
            api_settings.ts
        components
            screens
                GameScreen.tsx
                MainScreen.tsx
                PlanningScreen.tsx
            ClearScreenBtn.tsx
            GameBoard.tsx
            Grid.tsx
            InteractiveGrid.tsx
            MainTitle.tsx
            MenuSettingBtn.tsx
            MenuSettings.tsx
            MenuSettingsTitle.tsx
            PlayBtn.tsx
            Ship.tsx
            Title.tsx
        App.css
        App.js



to run:
dev:
npx tauri dev     in root
production:
to build: (npm run build      in frontend first)
cargo build --release --target x86_64-pc-windows-gnu     in src-tauri
or:
npx tauri build --target x86_64-pc-windows-gnu           in root

executable:
src-tauri/target/x86../release/app.exe

server:
dev:
npm run start
production:
build:
npm run build       in backend
run:
node dist/server.js      in backend

http://localhost:xxxx/
server: port 5000
frontend: port 5173



to run app:
    npm run build                                     (in backend and frontend)
    npx tauri build --target x86_64-pc-windows-gnu    (in root)
executable:
    src-tauri/target/x86../release/app.exe
installer:
    src-tauri/target/x86../release/bundle/Battleships...