#!/bin/bash
cd "$(dirname "$0")"

# Build frontend + backend
npm run build --prefix ./frontend
npm run build --prefix ./backend

# Patch tauri.conf.json to include backend.exe
cp src-tauri/tauri.conf.json src-tauri/tauri.conf.json.bak
sed -i 's/"resources": \[\]/"resources": ["..\/backend\/dist\/backend.exe"]/' src-tauri/tauri.conf.json

# Build Windows exe
npx tauri build --target x86_64-pc-windows-gnu

# Restore clean config
mv src-tauri/tauri.conf.json.bak src-tauri/tauri.conf.json

echo "Windows .exe created successfully!"