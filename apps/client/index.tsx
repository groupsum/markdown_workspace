import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initTheme } from './services/themeService';
import { THEME_STYLE_ELEMENT_ID } from './constants';
import { DEFAULT_THEME_STYLESHEET_TEXT } from './styles';

const ensureThemeStyleElement = (): void => {
  let themeStyle = document.getElementById(THEME_STYLE_ELEMENT_ID) as HTMLStyleElement | null;

  if (!themeStyle) {
    themeStyle = document.createElement('style');
    themeStyle.id = THEME_STYLE_ELEMENT_ID;
    document.head.appendChild(themeStyle);
  }

  if (!themeStyle.textContent) {
    themeStyle.textContent = DEFAULT_THEME_STYLESHEET_TEXT;
  }
};

ensureThemeStyleElement();

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
