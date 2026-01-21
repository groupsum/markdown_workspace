import React from 'react';
import { Tablet, Cpu, Layout, Layers, Sprout } from 'lucide-react';
import { vs, coy, tomorrow, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  syntaxTheme: {
    name: string;
    palette: string;
    style: any;
  };
}

export const THEMES: ThemeDef[] = [
  {
    id: 'acid-etched',
    name: 'Acid Etched Tectonic',
    description: 'Pickle-bright tectonic surfaces with high-contrast industrial borders.',
    icon: <Sprout size={20} />,
    url: '/css/themes/theme-acid-etched.css',
    syntaxTheme: {
      name: 'VS Code Dark Plus',
      palette: 'Electric green, neon cyan, deep slate on dark graphite.',
      style: vscDarkPlus
    }
  },
  {
    id: 'zinc',
    name: 'Milled Zinc',
    description: 'Precision industrial chassis. High density, low chrome, blue accents.',
    icon: <Cpu size={20} />,
    url: '/css/themes/theme-zinc.css',
    syntaxTheme: {
      name: 'VS',
      palette: 'Low-contrast graphite, zinc gray, cobalt-blue accents.',
      style: vs
    }
  },
  {
    id: 'anodized-billet',
    name: 'Anodized Billet',
    description: 'Brushed aluminum chassis with anodized blue signal accents.',
    icon: <Layers size={20} />,
    url: '/css/themes/theme-anodized-billet.css',
    syntaxTheme: {
      name: 'Coy',
      palette: 'Cool aluminum neutrals with anodized azure highlights.',
      style: coy
    }
  },
  {
    id: 'micropress',
    name: 'Optical Micro Press',
    description: 'High contrast optical interface with safety orange accents.',
    icon: <Tablet size={20} />,
    url: '/css/themes/theme-micropress.css',
    syntaxTheme: {
      name: 'Coy',
      palette: 'Optical white base with safety orange and slate ink.',
      style: coy
    }
  },
  {
    id: 'default',
    name: 'Factory Default',
    description: 'The standard blueprint. Balanced, structural, gray tones.',
    icon: <Layout size={20} />,
    url: '/css/themes/theme-default.css',
    syntaxTheme: {
      name: 'Tomorrow',
      palette: 'Balanced charcoal, soft graphite, and industrial teal.',
      style: tomorrow
    }
  }
];

export const getThemeDef = (themeId: string) => THEMES.find((theme) => theme.id === themeId) || THEMES[0];

export const getSyntaxTheme = (themeId: string) => getThemeDef(themeId).syntaxTheme;
export const getSyntaxThemeStyle = (themeId: string) => getSyntaxTheme(themeId).style;
