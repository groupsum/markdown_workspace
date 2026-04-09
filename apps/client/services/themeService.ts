import { AppTheme } from '../types';
import { THEMES } from '../data/themes';
import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, THEME_STYLE_ELEMENT_ID } from '../constants';
import { storage } from './storage';
import { THEME_STYLESHEET_TEXT } from '../styles';

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
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="MdWork">
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

export const setTheme = async (themeId: AppTheme): Promise<void> => {
  const root = document.documentElement;
  const nextTheme = THEME_STYLESHEET_TEXT[themeId] ? themeId : DEFAULT_THEME_ID;

  const themeStyleEl = document.getElementById(THEME_STYLE_ELEMENT_ID) as HTMLStyleElement | null;
  if (themeStyleEl) {
    themeStyleEl.textContent = THEME_STYLESHEET_TEXT[nextTheme] || THEME_STYLESHEET_TEXT.default;
  } else {
    console.error(`[ThemeService] Critical Error: Style element #${THEME_STYLE_ELEMENT_ID} missing from index.html.`);
  }

  localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  storage.setSetting(THEME_STORAGE_KEY, nextTheme).catch((error) => {
    console.warn('[ThemeService] Failed to persist theme to IndexedDB.', error);
  });
  root.setAttribute('data-theme', nextTheme);

  const classesToRemove = Array.from(root.classList).filter(cls => cls.startsWith('theme-'));
  classesToRemove.forEach(cls => root.classList.remove(cls));
  root.classList.add(`theme-${nextTheme}`);

  updateThemeMeta(nextTheme);

  window.dispatchEvent(new CustomEvent('theme-changed', { detail: nextTheme }));
  console.debug(`[ThemeService] Applied: ${nextTheme}`);
};

export const initTheme = async (): Promise<AppTheme> => {
  const storedTheme = await getStoredThemeFromDb();
  const theme = storedTheme || getStoredTheme();
  await setTheme(theme);
  return theme;
};
