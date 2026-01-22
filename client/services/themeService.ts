import { AppTheme } from '../types';
import { THEMES } from '../data/themes';
import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, THEME_STYLE_ELEMENT_ID } from '../constants';
import { storage } from './storage';

export const getStoredTheme = (): AppTheme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return (stored as AppTheme) || DEFAULT_THEME_ID;
};

const getStoredThemeFromDb = async (): Promise<AppTheme | null> => {
  try {
    const stored = await storage.getSetting<AppTheme>(THEME_STORAGE_KEY);
    return stored || null;
  } catch (error) {
    console.warn('[ThemeService] Failed to read theme from IndexedDB.', error);
    return null;
  }
};

const buildFaviconSvg = (accentColor: string, backgroundColor: string): string => `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Lattice Architect">
    <rect width="512" height="512" rx="96" fill="${backgroundColor}"/>
    <rect x="96" y="96" width="320" height="320" rx="48" fill="${accentColor}" opacity="0.12"/>
    <g stroke="${accentColor}" stroke-width="22" stroke-linecap="square">
      <path d="M128 176h256"/>
      <path d="M128 256h256"/>
      <path d="M128 336h256"/>
      <path d="M176 128v256"/>
      <path d="M256 128v256"/>
      <path d="M336 128v256"/>
    </g>
    <path d="M178 196h156v120h-68v-52h-88z" fill="${accentColor}"/>
  </svg>
`;

const toFaviconDataUrl = (svg: string): string => `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

const updateThemeMeta = (themeId: AppTheme): void => {
  const themeDef = THEMES.find(t => t.id === themeId) || THEMES.find(t => t.id === DEFAULT_THEME_ID) || THEMES[0];
  const themeColorMeta = document.querySelector('meta[name="theme-color"]');
  const faviconLink = document.getElementById('app-favicon') as HTMLLinkElement | null;
  const maskIconLink = document.getElementById('app-mask-icon') as HTMLLinkElement | null;

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', themeDef.themeColor);
  }

  if (faviconLink) {
    const svgMarkup = buildFaviconSvg(themeDef.themeColor, themeDef.backgroundColor);
    faviconLink.href = toFaviconDataUrl(svgMarkup);
  }

  if (maskIconLink) {
    maskIconLink.setAttribute('color', themeDef.themeColor);
  }
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
  storage.setSetting(THEME_STORAGE_KEY, themeId).catch((error) => {
    console.warn('[ThemeService] Failed to persist theme to IndexedDB.', error);
  });
  root.setAttribute('data-theme', themeId);
  
  // Clean up old theme classes for class-based styling consistency
  const classesToRemove = Array.from(root.classList).filter(cls => cls.startsWith('theme-'));
  classesToRemove.forEach(cls => root.classList.remove(cls));
  root.classList.add(`theme-${themeId}`);

  updateThemeMeta(themeId);

  // Dispatch systemic event for components that need to respond (e.g., Syntax Highlighters)
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: themeId }));
  console.debug(`[ThemeService] Applied: ${themeId} :: ${themeDef.url}`);
};

/**
 * Bootstraps the theme system from local storage on app start.
 */
export const initTheme = async (): Promise<AppTheme> => {
  const storedTheme = await getStoredThemeFromDb();
  const theme = storedTheme || getStoredTheme();
  await setTheme(theme);
  return theme;
};
