import React from 'react';
import {
  Tablet,
  Cpu,
  Layout,
  Layers,
  Sprout,
  Disc3,
  Hexagon,
  Factory,
  PanelTop,
  FlaskConical,
} from 'lucide-react';
import { vs, coy, tomorrow, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { THEME_CATALOG } from './themeCatalog.js';

export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  themeColor: string;
  backgroundColor: string;
  syntaxTheme: {
    name: string;
    palette: string;
    style: any;
  };
}

const ICON_MAP = {
  Tablet,
  Cpu,
  Layout,
  Layers,
  Sprout,
  Disc3,
  Hexagon,
  Factory,
  PanelTop,
  FlaskConical,
} as const;

const SYNTAX_STYLE_MAP = {
  vs,
  coy,
  tomorrow,
  vscDarkPlus,
} as const;

export const THEMES: ThemeDef[] = THEME_CATALOG.map((theme) => {
  const IconComponent = ICON_MAP[theme.iconName as keyof typeof ICON_MAP] ?? Layout;
  const syntaxStyle = SYNTAX_STYLE_MAP[theme.syntaxStyleKey as keyof typeof SYNTAX_STYLE_MAP] ?? tomorrow;

  return {
    id: theme.id,
    name: theme.name,
    description: theme.description,
    icon: <IconComponent size={20} />,
    themeColor: theme.themeColor,
    backgroundColor: theme.backgroundColor,
    syntaxTheme: {
      name: theme.syntaxThemeName,
      palette: theme.syntaxPalette,
      style: syntaxStyle,
    },
  };
});

export const getThemeDef = (themeId: string) => THEMES.find((theme) => theme.id === themeId) || THEMES[0];

export const getSyntaxTheme = (themeId: string) => getThemeDef(themeId).syntaxTheme;
export const getSyntaxThemeStyle = (themeId: string) => getSyntaxTheme(themeId).style;
