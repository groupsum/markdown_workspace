import type { MarkdownWorkspaceThemeClassName } from "./classes.js";
import type { MarkdownWorkspaceThemeTokenName } from "./tokens.js";

export interface ThemeContractCompatibility {
  readonly contract: string;
  readonly minClientVersion?: string;
  readonly minRendererVersion?: string;
  readonly minEditorVersion?: string;
}

export interface ThemeTokenBinding {
  readonly token: MarkdownWorkspaceThemeTokenName;
  readonly cssCustomProperty: `--${string}`;
}

export interface ThemeClassBinding {
  readonly className: MarkdownWorkspaceThemeClassName;
  readonly selector: `.${string}`;
}
