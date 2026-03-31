import { createEditorThemeBridgeVariableRecord, } from "@mdwrk/ui-tokens/theme-map";
export function createMarkdownEditorThemeStyle(variables = {}) {
    return {
        ["--mwe-bg-surface"]: variables.background ?? "var(--bg-panel, #11151a)",
        ["--mwe-bg-gutter"]: variables.gutterBackground ?? "var(--bg-inset, #0d1117)",
        ["--mwe-border-color"]: variables.border ?? "var(--border-color, rgba(255,255,255,0.12))",
        ["--mwe-fg-primary"]: variables.foreground ?? "var(--fg-primary, #e9ecf1)",
        ["--mwe-fg-muted"]: variables.foregroundMuted ?? "var(--fg-muted, #94a3b8)",
        ["--mwe-accent"]: variables.accent ?? "var(--accent, #7c9cff)",
        ["--mwe-font-mono"]: variables.fontMono ?? 'var(--font-mono, "Fira Code", ui-monospace, monospace)',
        ["--mwe-editor-padding"]: variables.padding ?? "var(--editor-padding, 16px)",
        ["--mwe-line-height"]: variables.lineHeight ?? "var(--editor-line-rhythm, var(--editor-line-height, 1.5rem))",
        ["--mwe-font-size"]: variables.fontSize ?? "calc(13px * var(--ui-scale, 1))",
        ["--mwe-gutter-width"]: variables.gutterWidth ?? "var(--line-number-gutter-width, 48px)",
    };
}
export function createMarkdownEditorThemeVariablesFromThemeTokens(overrides = {}) {
    return createEditorThemeBridgeVariableRecord(overrides);
}
export function createMarkdownEditorThemeStyleFromThemeTokens(overrides = {}) {
    return {
        ...createMarkdownEditorThemeVariablesFromThemeTokens(overrides),
        ["--mwe-line-height"]: "var(--editor-line-rhythm, var(--editor-line-height, 1.5rem))",
        ["--mwe-font-size"]: "calc(13px * var(--ui-scale, 1))",
        ["--mwe-gutter-width"]: "var(--line-number-gutter-width, 48px)",
    };
}
export function useMarkdownSourceEditorTheme(variables = {}) {
    return createMarkdownEditorThemeStyle(variables);
}
//# sourceMappingURL=theme.js.map