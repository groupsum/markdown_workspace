import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initTheme } from './services/themeService';

// Initialize Theme System (Syncs LocalStorage with Link Tag)
initTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Target container 'root' not found. Check index.html for <div id='root'></div>.");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);