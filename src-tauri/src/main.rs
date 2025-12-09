// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager};
use std::process::{Command, Stdio};
use std::time::Duration;
use std::thread;
use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;

fn get_logs_dir() -> Result<PathBuf, String> {
    // Get the directory where the exe is running
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;
    
    let exe_dir = exe_path.parent()
        .ok_or("Failed to get exe directory")?;
    
    let logs_dir = exe_dir.join("logs");
    
    // Create logs directory if it doesn't exist
    fs::create_dir_all(&logs_dir)
        .map_err(|e| format!("Failed to create logs directory: {}", e))?;
    
    Ok(logs_dir)
}

fn log_to_file(logs_dir: &PathBuf, filename: &str, message: &str) {
    let log_path = logs_dir.join(filename);
    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open(&log_path)
    {
        let timestamp = chrono::Local::now().format("%Y-%m-%d %H:%M:%S");
        let _ = writeln!(file, "[{}] {}", timestamp, message);
    }
}

#[tauri::command]
async fn start_backend(app: AppHandle) -> Result<String, String> {
    let logs_dir = get_logs_dir()?;
    
    log_to_file(&logs_dir, "tauri_startup.log", "=== Backend Startup Attempt ===");
    
    // Resolve backend.exe path
    let backend_path = app
        .path()
        .resolve("backend.exe", tauri::path::BaseDirectory::Resource)
        .map_err(|e| {
            let err_msg = format!("Failed to resolve backend.exe: {}", e);
            log_to_file(&logs_dir, "tauri_startup.log", &err_msg);
            err_msg
        })?;
    
    log_to_file(&logs_dir, "tauri_startup.log", &format!("Backend path: {:?}", backend_path));
    
    // Check if backend.exe actually exists
    if !backend_path.exists() {
        let err_msg = format!("Backend.exe does not exist at path: {:?}", backend_path);
        log_to_file(&logs_dir, "tauri_startup.log", &err_msg);
        return Err(err_msg);
    }
    
    log_to_file(&logs_dir, "tauri_startup.log", "Backend.exe exists, attempting to spawn...");
    
    // Get resource and app data directories
    let resource_dir = app
        .path()
        .resource_dir()
        .map_err(|e| format!("Failed to get resource directory: {}", e))?;
    
    log_to_file(&logs_dir, "tauri_startup.log", &format!("Resource directory: {:?}", resource_dir));
    
    // Create log files for backend output
    let backend_log_path = logs_dir.join("backend.log");
    let backend_err_path = logs_dir.join("backend_error.log");
    
    log_to_file(&logs_dir, "tauri_startup.log", &format!("Backend log will be at: {:?}", backend_log_path));
    
    // Create fresh log files
    let stdout_file = File::create(&backend_log_path)
        .map_err(|e| {
            let err_msg = format!("Failed to create backend.log: {}", e);
            log_to_file(&logs_dir, "tauri_startup.log", &err_msg);
            err_msg
        })?;
    
    let stderr_file = File::create(&backend_err_path)
        .map_err(|e| {
            let err_msg = format!("Failed to create backend_error.log: {}", e);
            log_to_file(&logs_dir, "tauri_startup.log", &err_msg);
            err_msg
        })?;
    
    log_to_file(&logs_dir, "tauri_startup.log", "Log files created, spawning process...");
    
    #[cfg(target_os = "windows")]
    {
        Command::new(&backend_path)
            .env("TAURI_RESOURCE_DIR", resource_dir.to_string_lossy().to_string())
            .env("TAURI_LOGS_DIR", logs_dir.to_string_lossy().to_string())
            .stdout(Stdio::from(stdout_file))
            .stderr(Stdio::from(stderr_file))
            .spawn()
            .map_err(|e| {
                let err_msg = format!("Failed to spawn backend.exe: {}\nPath: {:?}", e, backend_path);
                log_to_file(&logs_dir, "tauri_startup.log", &err_msg);
                err_msg
            })?;
    }
    
    #[cfg(target_os = "linux")]
    {
        let path_str = backend_path.to_str().ok_or("Invalid path")?;
        
        // Make executable
        std::process::Command::new("chmod")
            .arg("+x")
            .arg(path_str)
            .status()
            .ok();
        
        log_to_file(&logs_dir, "tauri_startup.log", "Made backend executable (chmod +x)");
        
        Command::new(path_str)
            .env("TAURI_RESOURCE_DIR", resource_dir.to_string_lossy().to_string())
            .env("TAURI_LOGS_DIR", logs_dir.to_string_lossy().to_string())
            .stdout(Stdio::from(stdout_file))
            .stderr(Stdio::from(stderr_file))
            .spawn()
            .map_err(|e| {
                let err_msg = format!("Failed to spawn backend: {}\nPath: {}", e, path_str);
                log_to_file(&logs_dir, "tauri_startup.log", &err_msg);
                err_msg
            })?;
    }
    
    log_to_file(&logs_dir, "tauri_startup.log", "Process spawned successfully, waiting 3 seconds...");
    
    // Wait for backend to start
    thread::sleep(Duration::from_secs(3));
    
    log_to_file(&logs_dir, "tauri_startup.log", "Startup complete");
    
    Ok(format!("Backend started from: {:?}\nLogs: {:?}", backend_path, logs_dir))
}

#[tauri::command]
fn exit_app() {
    std::process::exit(0);
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![start_backend, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}