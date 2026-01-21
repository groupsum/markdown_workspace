import React from 'react';
import { Tablet, Cpu, Layout, Sprout } from 'lucide-react';
import { vs, vscDarkPlus, coy, tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  syntaxTheme: {
    name: string;
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
      name: 'VSC Dark+',
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
      style: vs
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
      style: tomorrow
    }
  }
];
