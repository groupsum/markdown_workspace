import type { CSSProperties } from "react";
import {
  createEditorThemeBridgeVariableRecord,
  type ThemeTokenOverrides,
} from "@markdown-workspace/ui-tokens/theme-map";

export interface MarkdownEditorThemeVariables {
  readonly background?: string;
  readonly gutterBackground?: string;
  readonly border?: string;
  readonly foreground?: string;
  readonly foregroundMuted?: string;
  readonly accent?: string;
  readonly fontMono?: string;
  readonly padding?: string;
  readonly lineHeight?: string;
  readonly fontSize?: string;
}

export function createMarkdownEditorThemeStyle(
  variables: MarkdownEditorThemeVariables = {},
): CSSProperties {
  return {
    ["--mwe-bg-surface" as any]: variables.background ?? "var(--bg-panel, #11151a)",
    ["--mwe-bg-gutter" as any]: variables.gutterBackground ?? "var(--bg-inset, #0d1117)",
    ["--mwe-border-color" as any]: variables.border ?? "var(--border-color, rgba(255,255,255,0.12))",
    ["--mwe-fg-primary" as any]: variables.foreground ?? "var(--fg-primary, #e9ecf1)",
    ["--mwe-fg-muted" as any]: variables.foregroundMuted ?? "var(--fg-muted, #94a3b8)",
    ["--mwe-accent" as any]: variables.accent ?? "var(--accent, #7c9cff)",
    ["--mwe-font-mono" as any]: variables.fontMono ?? 'var(--font-mono, "Fira Code", ui-monospace, monospace)',
    ["--mwe-editor-padding" as any]: variables.padding ?? "var(--editor-padding, 16px)",
    ["--mwe-line-height" as any]: variables.lineHeight ?? "1.5rem",
    ["--mwe-font-size" as any]: variables.fontSize ?? "calc(13px * var(--ui-scale, 1))",
  };
}

export function createMarkdownEditorThemeVariablesFromThemeTokens(
  overrides: ThemeTokenOverrides = {},
): Readonly<Record<`--${string}`, string>> {
  return createEditorThemeBridgeVariableRecord(overrides);
}

export function createMarkdownEditorThemeStyleFromThemeTokens(
  overrides: ThemeTokenOverrides = {},
): CSSProperties {
  return {
    ...createMarkdownEditorThemeVariablesFromThemeTokens(overrides),
    ["--mwe-line-height" as any]: "1.5rem",
    ["--mwe-font-size" as any]: "calc(13px * var(--ui-scale, 1))",
  };
}

export function useMarkdownSourceEditorTheme(
  variables: MarkdownEditorThemeVariables = {},
): CSSProperties {
  return createMarkdownEditorThemeStyle(variables);
}
