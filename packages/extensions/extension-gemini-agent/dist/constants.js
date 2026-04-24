export const GEMINI_AGENT_EXTENSION_ID = "core.gemini-agent";
export const GEMINI_AGENT_VIEW_ID = `${GEMINI_AGENT_EXTENSION_ID}.view`;
export const GEMINI_AGENT_EXPLORER_VIEW_ID = `${GEMINI_AGENT_EXTENSION_ID}.explorer`;
export const GEMINI_AGENT_MODULE_ID = `${GEMINI_AGENT_EXTENSION_ID}.module`;
export const GEMINI_AGENT_RAIL_ID = `${GEMINI_AGENT_EXTENSION_ID}.rail`;
export const GEMINI_AGENT_SERVICE_TOKEN = `${GEMINI_AGENT_EXTENSION_ID}.service`;
export const GEMINI_AGENT_COMMAND_OPEN_ID = `${GEMINI_AGENT_EXTENSION_ID}.open`;
export const GEMINI_AGENT_COMMAND_SUMMARIZE_FILE_ID = `${GEMINI_AGENT_EXTENSION_ID}.summarize-current-file`;
export const GEMINI_AGENT_COMMAND_REWRITE_SELECTION_ID = `${GEMINI_AGENT_EXTENSION_ID}.rewrite-selection`;
export const GEMINI_AGENT_COMMAND_APPLY_DRAFT_TO_SELECTION_ID = `${GEMINI_AGENT_EXTENSION_ID}.apply-draft-to-selection`;
export const GEMINI_AGENT_COMMAND_REPLACE_DOCUMENT_WITH_DRAFT_ID = `${GEMINI_AGENT_EXTENSION_ID}.replace-document-with-draft`;
export const GEMINI_AGENT_SETTINGS_SECTION_GENERAL = `${GEMINI_AGENT_EXTENSION_ID}.settings.general`;
export const GEMINI_AGENT_SETTINGS_SECTION_CONTEXT = `${GEMINI_AGENT_EXTENSION_ID}.settings.context`;
export const GEMINI_AGENT_SETTINGS_SECTION_WRITEBACK = `${GEMINI_AGENT_EXTENSION_ID}.settings.writeback`;
export const GEMINI_AGENT_SETTING_ENDPOINT = "endpoint";
export const GEMINI_AGENT_SETTING_MODEL = "model";
export const GEMINI_AGENT_SETTING_AUTH_MODE = "authMode";
export const GEMINI_AGENT_SETTING_API_KEY = "apiKey";
export const GEMINI_AGENT_SETTING_SYSTEM_PROMPT = "systemPrompt";
export const GEMINI_AGENT_SETTING_TEMPERATURE = "temperature";
export const GEMINI_AGENT_SETTING_TIMEOUT_MS = "requestTimeoutMs";
export const GEMINI_AGENT_SETTING_AUTO_ATTACH_DOCUMENT = "autoAttachDocument";
export const GEMINI_AGENT_SETTING_AUTO_ATTACH_SELECTION = "autoAttachSelection";
export const GEMINI_AGENT_SETTING_ALLOW_WRITEBACK = "allowWriteBack";
export const GEMINI_AGENT_DEFAULT_SETTINGS = {
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    model: "gemini-2.5-flash",
    authMode: "api-key",
    apiKey: "",
    systemPrompt: "You are an expert markdown copilot. Preserve markdown structure unless the user explicitly asks for a format change.",
    temperature: 0.2,
    requestTimeoutMs: 30000,
    autoAttachDocument: true,
    autoAttachSelection: true,
    allowWriteBack: false,
};
export const GEMINI_AGENT_INTENTS = [
    "idle",
    "summarize-current-file",
    "rewrite-selection",
    "custom-prompt",
];
//# sourceMappingURL=constants.js.map