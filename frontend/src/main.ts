import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

async function initApp() {
  // Only invoke Tauri command if running in Tauri
  if (window.__TAURI__) {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      const result = await invoke('start_backend');
      console.log('Backend startup result:', result);
      
      // Wait a bit more to ensure backend is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Test if backend is responding
      try {
        const response = await fetch('http://localhost:5000/');
        if (!response.ok) {
          throw new Error('Backend not responding');
        }
        console.log('Backend is ready!');
      } catch (error) {
        console.error('Backend health check failed:', error);
        alert('Failed to connect to game backend. Please restart the application.');
      }
    } catch (error) {
      console.error('Failed to start backend:', error);
      alert(`Failed to start game backend: ${error}\n\nPlease restart the application.`);
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
