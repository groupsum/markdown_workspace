import type { CSSProperties } from "react";

export interface MarkdownEditInRendererThemeVariables {
  readonly foreground?: string;
  readonly foregroundMuted?: string;
  readonly background?: string;
  readonly backgroundActive?: string;
  readonly border?: string;
  readonly borderActive?: string;
  readonly accent?: string;
  readonly shadow?: string;
  readonly fontUi?: string;
  readonly fontMono?: string;
}

export function createMarkdownEditInRendererThemeStyle(
  variables: MarkdownEditInRendererThemeVariables = {},
): CSSProperties {
  return {
    "--mwir-fg": variables.foreground ?? "var(--mw-fg-primary, #172033)",
    "--mwir-fg-muted": variables.foregroundMuted ?? "var(--mw-fg-muted, #667085)",
    "--mwir-bg": variables.background ?? "var(--mw-surface, #ffffff)",
    "--mwir-bg-active": variables.backgroundActive ?? "var(--mw-surface-raised, #fbfcfe)",
    "--mwir-border": variables.border ?? "var(--mw-border-subtle, #d9e0ea)",
    "--mwir-border-active": variables.borderActive ?? variables.accent ?? "var(--mw-accent, #2563eb)",
    "--mwir-accent": variables.accent ?? "var(--mw-accent, #2563eb)",
    "--mwir-shadow": variables.shadow ?? "0 14px 32px rgba(15, 23, 42, 0.12)",
    "--mwir-font-ui": variables.fontUi ?? "var(--mw-font-ui, system-ui, sans-serif)",
    "--mwir-font-mono": variables.fontMono ?? "var(--mw-font-mono, ui-monospace, SFMono-Regular, Consolas, monospace)",
  } as CSSProperties;
}
