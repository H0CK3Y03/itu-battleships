import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

const BACKEND_URL = 'http://localhost:5000';

async function checkBackendHealth(maxAttempts = 20, intervalMs = 500): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${BACKEND_URL}/api/status`);
      if (response.ok) {
        const data = await response.json();
        console.log('Backend health check passed:', data);
        return true;
      }
    } catch (error) {
      console.log(`Health check attempt ${i + 1}/${maxAttempts} failed, retrying...`);
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return false;
}

async function initApp() {
  if (window.__TAURI__) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      console.log('Starting backend...');
      
      // The Rust code will now show dialogs, but we still handle errors
      const result = await invoke('start_backend');
      console.log('Backend startup result:', result);
      
      // Poll for backend health
      console.log('Waiting for backend to be ready...');
      const isHealthy = await checkBackendHealth();
      
      if (!isHealthy) {
        throw new Error('Backend failed to respond to health checks within 10 seconds.\n\nCheck the logs folder next to the app executable for details.');
      }
      
      console.log('Backend is ready!');
    } catch (error) {
      console.error('Failed to start backend:', error);
      // The Rust side already showed a dialog, but show frontend error too
      alert(`Failed to start game backend:\n\n${error}\n\nThe application may not function correctly.`);
    }
  } else {
    console.log('Running in browser mode - expecting external backend on port 5000');
  }

  const app = mount(App, {
    target: document.getElementById('app')!,
  });

  return app;
}

initApp();

export default undefined;
