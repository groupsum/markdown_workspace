import {
  MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES,
  MARKDOWN_WORKSPACE_THEME_TOKENS,
  type MarkdownWorkspaceThemeTokenMap,
  type MarkdownWorkspaceThemeTokenName,
  type ThemeTokenDefinition,
} from "@mdwrk/theme-contract/tokens";

export {
  MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES,
  MARKDOWN_WORKSPACE_THEME_TOKENS,
  type MarkdownWorkspaceThemeTokenMap,
  type MarkdownWorkspaceThemeTokenName,
  type ThemeTokenDefinition,
} from "@mdwrk/theme-contract/tokens";

export type MarkdownWorkspaceUiTokenName = MarkdownWorkspaceThemeTokenName;
export type MarkdownWorkspaceUiTokenMap = MarkdownWorkspaceThemeTokenMap;
export type UiTokenDefinition = ThemeTokenDefinition;

export const MARKDOWN_WORKSPACE_UI_TOKEN_NAMES = MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES;
export const MARKDOWN_WORKSPACE_UI_TOKENS = MARKDOWN_WORKSPACE_THEME_TOKENS;

export const MARKDOWN_WORKSPACE_TOKEN_DEFAULTS = Object.freeze(
  Object.fromEntries(
    MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => [definition.name, definition.defaultValue]),
  ) as MarkdownWorkspaceThemeTokenMap,
);

export const MARKDOWN_WORKSPACE_TOKEN_CSS_CUSTOM_PROPERTIES = Object.freeze(
  MARKDOWN_WORKSPACE_THEME_TOKENS.map((definition) => definition.cssCustomProperty),
) as readonly ThemeTokenDefinition["cssCustomProperty"][];
