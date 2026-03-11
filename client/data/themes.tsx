import React from 'react';
import { Tablet, Cpu, Layout, Layers, Sprout, Disc3, Hexagon, Factory, PanelTop } from 'lucide-react';
import { vs, coy, tomorrow, vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

export const THEMES: ThemeDef[] = [

  {
    id: 'tensioned-technical-skeleton',
    name: 'Tensioned Technical Skeleton',
    description: 'Monochrome technical frame with tensioned structure and restrained signal color.',
    icon: <Layout size={20} />,
    themeColor: '#000000',
    backgroundColor: '#ffffff',
    syntaxTheme: {
      name: 'VS',
      palette: 'White drafting field, black frame lines, orange and blue utility signals.',
      style: vs
    }
  },

  {
    id: 'optical-vellum-drafting-grid',
    name: 'Optical Vellum Drafting Grid',
    description: 'Vellum drafting substrate with optical grid lines and bright pickle-green accents.',
    icon: <Tablet size={20} />,
    themeColor: '#00ff41',
    backgroundColor: '#fdfdf5',
    syntaxTheme: {
      name: 'Coy',
      palette: 'Vellum cream, technical ink, translucent green guidance grid.',
      style: coy
    }
  },

  {
    id: 'heavy-gauge-tectonic',
    name: 'Heavy Gauge Tectonic',
    description: 'High-contrast tectonic slab partitioning with bold orange signal accents.',
    icon: <PanelTop size={20} />,
    themeColor: '#ff4d00',
    backgroundColor: '#dddddd',
    syntaxTheme: {
      name: 'VS',
      palette: 'Stamped neutral plates, graphite seams, and safety-orange highlights.',
      style: vs
    }
  },

  {
    id: 'ferrous-monolith',
    name: 'Machined Ferrous Monolith',
    description: 'Dark ferrous slab chassis with cyan instrumentation and oxide highlights.',
    icon: <Hexagon size={20} />,
    themeColor: '#00f3ff',
    backgroundColor: '#0a0a0a',
    syntaxTheme: {
      name: 'VS Code Dark Plus',
      palette: 'Near-black iron, cyan signal accents, and oxide warning highlights.',
      style: vscDarkPlus
    }
  },

  {
    id: 'galvanized-cellular',
    name: 'Galvanized Cellular Monolith',
    description: 'Brutalist galvanized workbench with high-contrast structure and olive signal accents.',
    icon: <Factory size={20} />,
    themeColor: '#3b6b2a',
    backgroundColor: '#f5f7f2',
    syntaxTheme: {
      name: 'Coy',
      palette: 'Pale galvanized surfaces, dark structure, olive accents.',
      style: coy
    }
  },

  {
    id: 'pressed-chromium',
    name: 'Pressed Chromium',
    description: 'Rack-mounted chrome segmentation with pressed controls and cobalt signal accents.',
    icon: <Disc3 size={20} />,
    themeColor: '#0033ff',
    backgroundColor: '#d8dbe0',
    syntaxTheme: {
      name: 'VS',
      palette: 'Chromed neutrals with cobalt-blue signal highlights.',
      style: vs
    }
  },
  {
    id: 'acid-etched',
    name: 'Acid Etched Tectonic',
    description: 'Pickle-bright tectonic surfaces with high-contrast industrial borders.',
    icon: <Sprout size={20} />,
    themeColor: '#ccff00',
    backgroundColor: '#f4f6f0',
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
    themeColor: '#0ea5e9',
    backgroundColor: '#09090b',
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
    themeColor: '#0044cc',
    backgroundColor: '#d1d3d6',
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
    themeColor: '#ff3c00',
    backgroundColor: '#000000',
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
    themeColor: '#ff3e00',
    backgroundColor: '#c0c0c0',
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
