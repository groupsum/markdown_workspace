import type { AssistantBackgroundService } from '../types';

export const openaiAssistService: AssistantBackgroundService = {
  provider: 'openai',
  panelTitle: 'OpenAI Assistant',
  async sendPrompt(prompt) {
    await new Promise((resolve) => setTimeout(resolve, 220));
    return `OPENAI SERVICE RESPONSE:\n${prompt.trim()}`;
  }
};
