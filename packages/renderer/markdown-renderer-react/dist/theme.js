import { createRendererThemeBridgeVariableRecord, } from "@mdwrk/ui-tokens/theme-map";
export function createMarkdownRendererThemeStyle(variables = {}) {
    return {
        ["--mw-fg-primary"]: variables.foreground ?? "var(--fg-primary, #e9ecf1)",
        ["--mw-fg-secondary"]: variables.foregroundMuted ?? "var(--fg-secondary, #9aa3af)",
        ["--mw-bg-surface"]: variables.background ?? "var(--bg-panel, #11151a)",
        ["--mw-border-color"]: variables.border ?? "var(--border-color, rgba(255,255,255,0.12))",
        ["--mw-accent"]: variables.accent ?? "var(--accent, #7c9cff)",
        ["--mw-code-bg"]: variables.codeBackground ?? "var(--bg-inset, rgba(255,255,255,0.04))",
        ["--mw-code-fg"]: variables.codeForeground ?? "var(--fg-primary, #e9ecf1)",
        ["--mw-code-border"]: variables.codeBorder ?? "var(--border-color, rgba(255,255,255,0.12))",
        ["--mw-font-ui"]: variables.fontUi ?? 'var(--font-ui, "Inter", "Segoe UI", system-ui, sans-serif)',
        ["--mw-font-mono"]: variables.fontMono ?? 'var(--font-mono, "Fira Code", ui-monospace, monospace)',
        ["--mw-line-height"]: variables.lineHeight ?? "var(--markdown-line-height, 1.6)",
        ["--mw-heading-line-height"]: variables.headingLineHeight ?? "var(--markdown-heading-line-height, 1.1)",
    };
}
export function createMarkdownRendererThemeVariablesFromThemeTokens(overrides = {}) {
    return createRendererThemeBridgeVariableRecord(overrides);
}
export function createMarkdownRendererThemeStyleFromThemeTokens(overrides = {}) {
    return createMarkdownRendererThemeVariablesFromThemeTokens(overrides);
}
//# sourceMappingURL=theme.js.map