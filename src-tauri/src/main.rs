// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager};
use std::process::{Command, Stdio};
use std::time::Duration;
use std::thread;

#[tauri::command]
async fn start_backend(app: AppHandle) -> Result<String, String> {
    // In Tauri v2 just use the string directly — it automatically looks in resources
    let backend_path = app
        .path()
        .resolve("backend.exe", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve backend.exe: {}", e))?;

    println!("Backend path: {:?}", backend_path);

    #[cfg(target_os = "windows")]
    {
        Command::new(&backend_path)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to start backend.exe: {}\nPath: {:?}", e, backend_path))?;
    }

    #[cfg(target_os = "linux")]
    {
        // On Linux you might need to chmod +x first if bundled
        let path_str = backend_path.to_str().ok_or("Invalid path")?;
        std::process::Command::new("chmod")
            .arg("+x")
            .arg(path_str)
            .status()
            .ok();

        Command::new(path_str)
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .map_err(|e| format!("Failed to start backend: {}\nPath: {}", e, path_str))?;
    }

    // Wait a bit for backend to start
    thread::sleep(Duration::from_secs(2));
    
    Ok(format!("Backend started from: {:?}", backend_path))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_backend])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}