import { Bot } from 'lucide-react';
import type { ExtensionPlugin } from '../types';
import { OpenAIAssistPanel } from './panel';
import { openaiAssistService } from './service';
import './styles.css';

export const openaiAssistPlugin: ExtensionPlugin = {
  id: 'openai-assist',
  service: openaiAssistService,
  Panel: OpenAIAssistPanel,
  actionRailExtension: {
    id: 'openai-assist',
    title: 'OpenAI Assist',
    icon: <Bot />,
    className: 'rail-btn--status',
    order: 100,
    isEnabled: () => import.meta.env.VITE_ENABLE_OPENAI_EXTENSION !== 'false',
    onClick: ({ dispatchEvent, addToast }) => {
      dispatchEvent('lattice:extension:open-panel', { extensionId: 'openai-assist' });
      addToast('OPENAI EXTENSION LAUNCHED', 'info');
    }
  }
};
