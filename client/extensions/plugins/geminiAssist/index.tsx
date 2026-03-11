import { Sparkles } from 'lucide-react';
import type { ExtensionPlugin } from '../types';
import { GeminiAssistPanel } from './panel';
import { geminiAssistService } from './service';
import './styles.css';

export const geminiAssistPlugin: ExtensionPlugin = {
  id: 'gemini-assist',
  service: geminiAssistService,
  Panel: GeminiAssistPanel,
  actionRailExtension: {
    id: 'gemini-assist',
    title: 'Gemini Assist',
    icon: <Sparkles />,
    className: 'rail-btn--status',
    order: 110,
    isEnabled: () => import.meta.env.VITE_ENABLE_GEMINI_EXTENSION !== 'false',
    onClick: ({ dispatchEvent, addToast }) => {
      dispatchEvent('lattice:extension:open-panel', { extensionId: 'gemini-assist' });
      addToast('GEMINI EXTENSION LAUNCHED', 'info');
    }
  }
};
