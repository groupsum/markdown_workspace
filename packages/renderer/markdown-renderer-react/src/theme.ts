import type React from "react";
import {
  createRendererThemeBridgeVariableRecord,
  type ThemeTokenOverrides,
} from "@markdown-workspace/ui-tokens/theme-map";
import type { MarkdownRendererThemeVariables } from "./types.js";

export function createMarkdownRendererThemeStyle(
  variables: MarkdownRendererThemeVariables = {},
): React.CSSProperties {
  return {
    ["--mw-fg-primary" as any]: variables.foreground ?? "var(--fg-primary, #e9ecf1)",
    ["--mw-fg-secondary" as any]: variables.foregroundMuted ?? "var(--fg-secondary, #9aa3af)",
    ["--mw-bg-surface" as any]: variables.background ?? "var(--bg-panel, #11151a)",
    ["--mw-border-color" as any]: variables.border ?? "var(--border-color, rgba(255,255,255,0.12))",
    ["--mw-accent" as any]: variables.accent ?? "var(--accent, #7c9cff)",
    ["--mw-code-bg" as any]: variables.codeBackground ?? "var(--bg-inset, rgba(255,255,255,0.04))",
    ["--mw-code-fg" as any]: variables.codeForeground ?? "var(--fg-primary, #e9ecf1)",
    ["--mw-code-border" as any]: variables.codeBorder ?? "var(--border-color, rgba(255,255,255,0.12))",
    ["--mw-font-ui" as any]: variables.fontUi ?? 'var(--font-ui, "Inter", "Segoe UI", system-ui, sans-serif)',
    ["--mw-font-mono" as any]: variables.fontMono ?? 'var(--font-mono, "Fira Code", ui-monospace, monospace)',
  };
}

export function createMarkdownRendererThemeVariablesFromThemeTokens(
  overrides: ThemeTokenOverrides = {},
): Readonly<Record<`--${string}`, string>> {
  return createRendererThemeBridgeVariableRecord(overrides);
}

export function createMarkdownRendererThemeStyleFromThemeTokens(
  overrides: ThemeTokenOverrides = {},
): React.CSSProperties {
  return createMarkdownRendererThemeVariablesFromThemeTokens(overrides) as React.CSSProperties;
}
