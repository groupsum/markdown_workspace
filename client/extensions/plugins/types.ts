import type React from 'react';
import type { ActionRailExtensionDefinition } from '../../services/actionRailExtensions';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
}

export interface AssistantBackgroundService {
  provider: 'openai' | 'gemini';
  panelTitle: string;
  sendPrompt: (prompt: string, history: AssistantMessage[]) => Promise<string>;
}

export interface ExtensionPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onToast: (message: string, tone: 'info' | 'success' | 'warning') => void;
  service: AssistantBackgroundService;
}

export interface ExtensionPlugin {
  id: string;
  actionRailExtension: ActionRailExtensionDefinition;
  service: AssistantBackgroundService;
  Panel: React.FC<ExtensionPanelProps>;
}
