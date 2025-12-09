// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager};
use std::process::{Command, Stdio};
use std::time::Duration;
use std::thread;
use std::fs::OpenOptions;
use std::io::Write;

#[tauri::command]
async fn start_backend(app: AppHandle) -> Result<String, String> {
    let backend_path = app
        .path()
        .resolve("backend.exe", tauri::path::BaseDirectory::Resource)
        .map_err(|e| format!("Failed to resolve backend.exe: {}", e))?;

    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;

    // Create app data directory if it doesn't exist
    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create app data directory: {}", e))?;

    println!("Backend path: {:?}", backend_path);
    println!("Resource directory: {:?}", resource_dir);
    println!("App data directory: {:?}", app_data_dir);

    // Create log file for backend output
    let log_path = app_data_dir.join("backend.log");
    let log_file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
        .map_err(|e| format!("Failed to create log file: {}", e))?;

    #[cfg(target_os = "windows")]
    {
        Command::new(&backend_path)
            .env("TAURI_RESOURCE_DIR", resource_dir.to_string_lossy().to_string())
            .env("TAURI_APP_DATA_DIR", app_data_dir.to_string_lossy().to_string())
            .stdout(Stdio::from(log_file.try_clone().map_err(|e| format!("Failed to clone log file handle: {}", e))?))
            .stderr(Stdio::from(log_file))
            .spawn()
            .map_err(|e| format!("Failed to start backend.exe: {}\nPath: {:?}", e, backend_path))?;
    }

    #[cfg(target_os = "linux")]
    {
        let path_str = backend_path.to_str().ok_or("Invalid path")?;
        std::process::Command::new("chmod")
            .arg("+x")
            .arg(path_str)
            .status()
            .ok();

        Command::new(path_str)
            .env("TAURI_RESOURCE_DIR", resource_dir.to_string_lossy().to_string())
            .env("TAURI_APP_DATA_DIR", app_data_dir.to_string_lossy().to_string())
            .stdout(Stdio::from(log_file.try_clone().map_err(|e| format!("Failed to clone log file handle: {}", e))?))
            .stderr(Stdio::from(log_file))
            .spawn()
            .map_err(|e| format!("Failed to start backend: {}\nPath: {}", e, path_str))?;
    }

    // Wait longer and check if backend is responsive
    thread::sleep(Duration::from_secs(3));
    
    Ok(format!("Backend started from: {:?}\nLogs: {:?}", backend_path, log_path))
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_backend])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}