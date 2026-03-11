import type { ActionRailExtensionDefinition } from '../../services/actionRailExtensions';
import { geminiAssistPlugin } from './geminiAssist';
import { openaiAssistPlugin } from './openaiAssist';
import type { ExtensionPlugin } from './types';

const plugins: ExtensionPlugin[] = [openaiAssistPlugin, geminiAssistPlugin];

const pluginMap = new Map<string, ExtensionPlugin>(plugins.map((plugin) => [plugin.id, plugin]));

export const getBuiltInActionRailExtensions = (): ActionRailExtensionDefinition[] =>
  plugins.map((plugin) => plugin.actionRailExtension);

export const getExtensionPlugin = (id: string): ExtensionPlugin | null => pluginMap.get(id) ?? null;
