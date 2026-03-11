import type { AssistantBackgroundService } from '../types';

export const geminiAssistService: AssistantBackgroundService = {
  provider: 'gemini',
  panelTitle: 'Gemini Assistant',
  async sendPrompt(prompt) {
    await new Promise((resolve) => setTimeout(resolve, 220));
    return `GEMINI SERVICE RESPONSE:\n${prompt.trim()}`;
  }
};
