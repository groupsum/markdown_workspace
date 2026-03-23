import { MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES, MARKDOWN_WORKSPACE_THEME_TOKENS, } from "@markdown-workspace/theme-contract/tokens";
export { MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES, MARKDOWN_WORKSPACE_THEME_TOKENS, } from "@markdown-workspace/theme-contract/tokens";
export const MARKDOWN_WORKSPACE_UI_TOKEN_NAMES = MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES;
export const MARKDOWN_WORKSPACE_UI_TOKENS = MARKDOWN_WORKSPACE_THEME_TOKENS;
export const MARKDOWN_WORKSPACE_TOKEN_DEFAULTS = Object.freeze(Object.fromEntries(MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [definition.name, definition.defaultValue])));
export const MARKDOWN_WORKSPACE_TOKEN_CSS_CUSTOM_PROPERTIES = Object.freeze(MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => definition.cssCustomProperty));
//# sourceMappingURL=tokens.js.map