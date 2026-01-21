import { AppTheme } from '../types';
import { THEMES } from '../data/themes';
import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, THEME_STYLE_ELEMENT_ID } from '../constants';

export const getStoredTheme = (): AppTheme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return (stored as AppTheme) || DEFAULT_THEME_ID;
};

/**
 * Deterministically applies a theme by swapping the <link> tag's href.
 * Implements Strategy A: Zero runtime CSS injection.
 */
export const setTheme = async (themeId: AppTheme): Promise<void> => {
  const root = document.documentElement;
  const themeDef = THEMES.find(t => t.id === themeId) || THEMES.find(t => t.id === DEFAULT_THEME_ID) || THEMES[0];
  const defaultDef = THEMES.find(t => t.id === DEFAULT_THEME_ID) || THEMES[0];

  const linkEl = document.getElementById(THEME_STYLE_ELEMENT_ID) as HTMLLinkElement;
  
  if (linkEl) {
    const targetUrl = themeDef.url;
    
    // Deterministic swap
    if (linkEl.getAttribute('href') !== targetUrl) {
       // Clear previous error handlers
       linkEl.onerror = null;
       
       // Explicit failure behavior: 404 fallback
       linkEl.onerror = (e) => {
         console.error(`[ThemeService] Failed to load theme file: ${targetUrl}. Falling back to default.`);
         // Prevent infinite loops if default also fails
         linkEl.onerror = null; 
         linkEl.href = defaultDef.url;
         root.setAttribute('data-theme', DEFAULT_THEME_ID);
         localStorage.setItem(THEME_STORAGE_KEY, DEFAULT_THEME_ID);
       };
       
       linkEl.href = targetUrl;
    }
  } else {
    // Critical failure: Link element missing from DOM
    console.error(`[ThemeService] Critical Error: Link element #${THEME_STYLE_ELEMENT_ID} missing from index.html.`);
  }

  // Persistence & DOM State
  localStorage.setItem(THEME_STORAGE_KEY, themeId);
  root.setAttribute('data-theme', themeId);
  
  // Clean up old theme classes for class-based styling consistency
  const classesToRemove = Array.from(root.classList).filter(cls => cls.startsWith('theme-'));
  classesToRemove.forEach(cls => root.classList.remove(cls));
  root.classList.add(`theme-${themeId}`);

  // Dispatch systemic event for components that need to respond (e.g., Syntax Highlighters)
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: themeId }));
  console.debug(`[ThemeService] Applied: ${themeId} :: ${themeDef.url}`);
};

/**
 * Bootstraps the theme system from local storage on app start.
 */
export const initTheme = (): void => {
  const theme = getStoredTheme();
  setTheme(theme);
};