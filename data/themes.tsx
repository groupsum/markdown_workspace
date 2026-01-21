import React from 'react';
import { Tablet, Cpu, Layout } from 'lucide-react';

export interface ThemeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  url: string;
}

export const THEMES: ThemeDef[] = [
  {
    id: 'zinc',
    name: 'Milled Zinc',
    description: 'Precision industrial chassis. High density, low chrome, blue accents.',
    icon: <Cpu size={20} />,
    url: '/css/themes/theme-zinc.css'
  },
  {
    id: 'micropress',
    name: 'Optical Micro Press',
    description: 'High contrast optical interface with safety orange accents.',
    icon: <Tablet size={20} />,
    url: '/css/themes/theme-micropress.css'
  },
  {
    id: 'default',
    name: 'Factory Default',
    description: 'The standard blueprint. Balanced, structural, gray tones.',
    icon: <Layout size={20} />,
    url: '/css/themes/theme-default.css'
  }
];