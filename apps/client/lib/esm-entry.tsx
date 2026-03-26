import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { initTheme } from '../services/themeService';

export const mountMdWrkSpace = (root: HTMLElement) => {
  if (!root) {
    throw new Error('MdWrkSpace mount failed: target root element not found.');
  }

  initTheme();
  const appRoot = ReactDOM.createRoot(root);
  appRoot.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  return () => appRoot.unmount();
};

export { App };
