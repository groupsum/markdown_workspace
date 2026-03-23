import type { ThemeClassBinding, ThemeContractCompatibility, ThemeTokenBinding } from "./compatibility.js";
import type { MarkdownWorkspaceThemeClassName } from "./classes.js";
import type { MarkdownWorkspaceThemeTokenMap, MarkdownWorkspaceThemeTokenName } from "./tokens.js";
import { THEME_CONTRACT_VERSION } from "./version.js";

export interface ThemePresetMetadata {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly author?: string;
  readonly version?: string;
}

export interface ThemePreset {
  readonly metadata: ThemePresetMetadata;
  readonly compatibility: ThemeContractCompatibility;
  readonly tokens: Partial<MarkdownWorkspaceThemeTokenMap>;
  readonly classBindings?: readonly ThemeClassBinding[];
  readonly tokenBindings?: readonly ThemeTokenBinding[];
}

export interface ThemeDraft {
  readonly tokens: Partial<Record<MarkdownWorkspaceThemeTokenName, string>>;
  readonly touchedClasses?: readonly MarkdownWorkspaceThemeClassName[];
}

export function createEmptyThemePreset(id: string, name: string): ThemePreset {
  return {
    metadata: { id, name },
    compatibility: { contract: THEME_CONTRACT_VERSION },
    tokens: {},
  };
}
