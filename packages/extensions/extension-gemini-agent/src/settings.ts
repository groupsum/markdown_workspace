import type { ExtensionConfigurationStore } from "@mdwrk/extension-host";
import {
  GEMINI_AGENT_DEFAULT_SETTINGS,
  GEMINI_AGENT_SETTING_ALLOW_WRITEBACK,
  GEMINI_AGENT_SETTING_API_KEY,
  GEMINI_AGENT_SETTING_AUTH_MODE,
  GEMINI_AGENT_SETTING_AUTO_ATTACH_DOCUMENT,
  GEMINI_AGENT_SETTING_AUTO_ATTACH_SELECTION,
  GEMINI_AGENT_SETTING_ENDPOINT,
  GEMINI_AGENT_SETTING_MODEL,
  GEMINI_AGENT_SETTING_OIDC_PROVIDER,
  GEMINI_AGENT_SETTING_SYSTEM_PROMPT,
  GEMINI_AGENT_SETTING_TEMPERATURE,
  GEMINI_AGENT_SETTING_TIMEOUT_MS,
} from "./constants.js";
import type { GeminiAgentResolvedSettings } from "./types.js";

const asString = (value: unknown, fallback: string): string => typeof value === "string" ? value : fallback;
const asBoolean = (value: unknown, fallback: boolean): boolean => typeof value === "boolean" ? value : fallback;
const asNumber = (value: unknown, fallback: number): number => typeof value === "number" && !Number.isNaN(value) ? value : fallback;

export async function readGeminiAgentSettings(config: ExtensionConfigurationStore): Promise<GeminiAgentResolvedSettings> {
  const [
    endpoint,
    model,
    authMode,
    apiKey,
    oidcProvider,
    systemPrompt,
    temperature,
    requestTimeoutMs,
    autoAttachDocument,
    autoAttachSelection,
    allowWriteBack,
  ] = await Promise.all([
    config.get<string>(GEMINI_AGENT_SETTING_ENDPOINT),
    config.get<string>(GEMINI_AGENT_SETTING_MODEL),
    config.get<string>(GEMINI_AGENT_SETTING_AUTH_MODE),
    config.get<string>(GEMINI_AGENT_SETTING_API_KEY),
    config.get<string>(GEMINI_AGENT_SETTING_OIDC_PROVIDER),
    config.get<string>(GEMINI_AGENT_SETTING_SYSTEM_PROMPT),
    config.get<number>(GEMINI_AGENT_SETTING_TEMPERATURE),
    config.get<number>(GEMINI_AGENT_SETTING_TIMEOUT_MS),
    config.get<boolean>(GEMINI_AGENT_SETTING_AUTO_ATTACH_DOCUMENT),
    config.get<boolean>(GEMINI_AGENT_SETTING_AUTO_ATTACH_SELECTION),
    config.get<boolean>(GEMINI_AGENT_SETTING_ALLOW_WRITEBACK),
  ]);

  return {
    endpoint: asString(endpoint, GEMINI_AGENT_DEFAULT_SETTINGS.endpoint).trim() || GEMINI_AGENT_DEFAULT_SETTINGS.endpoint,
    model: asString(model, GEMINI_AGENT_DEFAULT_SETTINGS.model).trim() || GEMINI_AGENT_DEFAULT_SETTINGS.model,
    authMode: (authMode === "none" || authMode === "oidc" ? authMode : GEMINI_AGENT_DEFAULT_SETTINGS.authMode),
    apiKey: asString(apiKey, GEMINI_AGENT_DEFAULT_SETTINGS.apiKey),
    oidcProvider: (oidcProvider === "gitlab" || oidcProvider === "gitea" ? oidcProvider : GEMINI_AGENT_DEFAULT_SETTINGS.oidcProvider),
    systemPrompt: asString(systemPrompt, GEMINI_AGENT_DEFAULT_SETTINGS.systemPrompt),
    temperature: asNumber(temperature, GEMINI_AGENT_DEFAULT_SETTINGS.temperature),
    requestTimeoutMs: Math.max(1000, asNumber(requestTimeoutMs, GEMINI_AGENT_DEFAULT_SETTINGS.requestTimeoutMs)),
    autoAttachDocument: asBoolean(autoAttachDocument, GEMINI_AGENT_DEFAULT_SETTINGS.autoAttachDocument),
    autoAttachSelection: asBoolean(autoAttachSelection, GEMINI_AGENT_DEFAULT_SETTINGS.autoAttachSelection),
    allowWriteBack: asBoolean(allowWriteBack, GEMINI_AGENT_DEFAULT_SETTINGS.allowWriteBack),
  };
}
