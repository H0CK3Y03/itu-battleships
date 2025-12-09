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
      const result = await invoke('start_backend');
      console.log('Backend startup command result:', result);
      
      // Poll for backend health
      console.log('Waiting for backend to be ready...');
      const isHealthy = await checkBackendHealth();
      
      if (!isHealthy) {
        throw new Error('Backend failed to start within 10 seconds');
      }
      
      console.log('Backend is ready!');
    } catch (error) {
      console.error('Failed to start backend:', error);
      alert(`Failed to start game backend: ${error}\n\nPlease check the logs and restart the application.`);
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
