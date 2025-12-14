// Author: Adam Vesely (xvesela00)

/// <reference types="vite/client" />

interface Window {
  __TAURI__?: Record<string, unknown>;
}
