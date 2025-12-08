import { mount } from 'svelte'
import './app.css'
import App from './App.svelte'

import { invoke } from '@tauri-apps/api/core';
invoke('start_backend');

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
