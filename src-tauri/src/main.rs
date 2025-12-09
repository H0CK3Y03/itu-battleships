// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{AppHandle, Manager};
use std::process::{Command, Stdio};
use std::time::Duration;
use std::thread;
use std::fs::{self, File, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons, MessageDialogKind};

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

fn show_error_dialog(app: &AppHandle, title: &str, message: &str) {
    app.dialog()
        .message(message)
        .title(title)
        .kind(MessageDialogKind::Error)
        .buttons(MessageDialogButtons::Ok)
        .show(|_| {});
}

fn show_info_dialog(app: &AppHandle, title: &str, message: &str) {
    app.dialog()
        .message(message)
        .title(title)
        .kind(MessageDialogKind::Info)
        .buttons(MessageDialogButtons::Ok)
        .show(|_| {});
}

#[tauri::command]
async fn start_backend(app: AppHandle) -> Result<String, String> {
    let logs_dir = match get_logs_dir() {
        Ok(dir) => dir,
        Err(e) => {
            let err_msg = format!("Failed to create logs directory:\n{}", e);
            show_error_dialog(&app, "Backend Startup Error", &err_msg);
            return Err(e);
        }
    };
    
    log_to_file(&logs_dir, "tauri_startup.log", "=== Backend Startup Attempt ===");
    
    // Resolve backend.exe path
    let backend_path = match app
        .path()
        .resolve("_up_/backend/dist/backend.exe", tauri::path::BaseDirectory::Resource)
    {
        Ok(path) => path,
        Err(e) => {
            let err_msg = format!("Failed to find backend.exe in bundle:\n{}\n\nLogs location: {:?}", e, logs_dir);
            log_to_file(&logs_dir, "tauri_startup.log", &format!("Failed to resolve backend.exe: {}", e));
            show_error_dialog(&app, "Backend Not Found", &err_msg);
            return Err(format!("Failed to resolve backend.exe: {}", e));
        }
    };
    
    log_to_file(&logs_dir, "tauri_startup.log", &format!("Backend path: {:?}", backend_path));
    
    // Check if backend.exe actually exists
    if !backend_path.exists() {
        let err_msg = format!(
            "Backend.exe does not exist at:\n{:?}\n\nPlease rebuild the application.\n\nLogs location: {:?}",
            backend_path, logs_dir
        );
        log_to_file(&logs_dir, "tauri_startup.log", "Backend.exe does not exist");
        show_error_dialog(&app, "Backend Missing", &err_msg);
        return Err(format!("Backend.exe does not exist at path: {:?}", backend_path));
    }
    
    log_to_file(&logs_dir, "tauri_startup.log", "Backend.exe exists, attempting to spawn...");
    
    // Get resource directory
    let resource_dir = match app.path().resource_dir() {
        Ok(dir) => dir,
        Err(e) => {
            let err_msg = format!("Failed to get resource directory:\n{}\n\nLogs location: {:?}", e, logs_dir);
            log_to_file(&logs_dir, "tauri_startup.log", &format!("Failed to get resource directory: {}", e));
            show_error_dialog(&app, "Path Resolution Error", &err_msg);
            return Err(format!("Failed to get resource directory: {}", e));
        }
    };
    
    log_to_file(&logs_dir, "tauri_startup.log", &format!("Resource directory: {:?}", resource_dir));
    
    // Create log files for backend output
    let backend_log_path = logs_dir.join("backend.log");
    let backend_err_path = logs_dir.join("backend_error.log");
    
    log_to_file(&logs_dir, "tauri_startup.log", &format!("Backend log: {:?}", backend_log_path));
    
    // Create fresh log files
    let stdout_file = match File::create(&backend_log_path) {
        Ok(file) => file,
        Err(e) => {
            let err_msg = format!("Failed to create backend.log:\n{}\n\nLogs location: {:?}", e, logs_dir);
            log_to_file(&logs_dir, "tauri_startup.log", &format!("Failed to create backend.log: {}", e));
            show_error_dialog(&app, "Log File Error", &err_msg);
            return Err(format!("Failed to create backend.log: {}", e));
        }
    };
    
    let stderr_file = match File::create(&backend_err_path) {
        Ok(file) => file,
        Err(e) => {
            let err_msg = format!("Failed to create backend_error.log:\n{}\n\nLogs location: {:?}", e, logs_dir);
            log_to_file(&logs_dir, "tauri_startup.log", &format!("Failed to create backend_error.log: {}", e));
            show_error_dialog(&app, "Log File Error", &err_msg);
            return Err(format!("Failed to create backend_error.log: {}", e));
        }
    };
    
    log_to_file(&logs_dir, "tauri_startup.log", "Log files created, spawning process...");
    
    // Spawn the backend process
    let spawn_result;
    
    #[cfg(target_os = "windows")]
    {
        spawn_result = Command::new(&backend_path)
            .env("TAURI_RESOURCE_DIR", resource_dir.to_string_lossy().to_string())
            .env("TAURI_LOGS_DIR", logs_dir.to_string_lossy().to_string())
            .stdout(Stdio::from(stdout_file))
            .stderr(Stdio::from(stderr_file))
            .spawn();
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
        
        spawn_result = Command::new(path_str)
            .env("TAURI_RESOURCE_DIR", resource_dir.to_string_lossy().to_string())
            .env("TAURI_LOGS_DIR", logs_dir.to_string_lossy().to_string())
            .stdout(Stdio::from(stdout_file))
            .stderr(Stdio::from(stderr_file))
            .spawn();
    }
    
    match spawn_result {
        Ok(_) => {
            log_to_file(&logs_dir, "tauri_startup.log", "Process spawned successfully");
            
            // Show success info
            let success_msg = format!(
                "Backend process started successfully!\n\nBackend path: {:?}\nLogs location: {:?}\n\nWaiting 3 seconds for initialization...",
                backend_path, logs_dir
            );
            show_info_dialog(&app, "Backend Starting", &success_msg);
        }
        Err(e) => {
            let err_msg = format!(
                "Failed to spawn backend process:\n{}\n\nBackend path: {:?}\nLogs location: {:?}\n\nCheck backend_error.log for details.",
                e, backend_path, logs_dir
            );
            log_to_file(&logs_dir, "tauri_startup.log", &format!("Failed to spawn: {}", e));
            show_error_dialog(&app, "Backend Spawn Failed", &err_msg);
            return Err(format!("Failed to spawn backend: {}", e));
        }
    }
    
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
        .plugin(tauri_plugin_dialog::init())
        // auto-start backend when Tauri is setting up
        .setup(|app| {
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                // Optionally ignore or log the result
                let _ = start_backend(app_handle).await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![start_backend, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}