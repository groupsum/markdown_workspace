import { type MarkdownWorkspaceThemeTokenMap, type MarkdownWorkspaceThemeTokenName, type ThemeTokenDefinition } from "@markdown-workspace/theme-contract/tokens";
export { MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES, MARKDOWN_WORKSPACE_THEME_TOKENS, type MarkdownWorkspaceThemeTokenMap, type MarkdownWorkspaceThemeTokenName, type ThemeTokenDefinition, } from "@markdown-workspace/theme-contract/tokens";
export type MarkdownWorkspaceUiTokenName = MarkdownWorkspaceThemeTokenName;
export type MarkdownWorkspaceUiTokenMap = MarkdownWorkspaceThemeTokenMap;
export type UiTokenDefinition = ThemeTokenDefinition;
export declare const MARKDOWN_WORKSPACE_UI_TOKEN_NAMES: readonly ["ui-scale", "header-height", "rail-width", "rail-height", "sidebar-width", "status-height", "tab-height", "panel-header-height", "rail-btn-size", "bg-app", "bg-panel", "bg-inset", "border-color", "border-width", "fg-primary", "fg-secondary", "fg-muted", "accent", "table-header-bg", "table-header-fg", "table-row-primary-bg", "table-row-secondary-bg", "status-ok", "status-warn", "status-error", "app-gap", "texture-opacity", "editor-padding", "file-indent-base", "file-indent-unit", "c-explorer-hover", "c-explorer-selected", "c-explorer-selected-text", "c-explorer-drag-bg", "font-ui", "font-mono", "font-head"];
export declare const MARKDOWN_WORKSPACE_UI_TOKENS: readonly [{
    readonly name: "ui-scale";
    readonly cssCustomProperty: "--ui-scale";
    readonly category: "layout";
    readonly description: "Global UI scale multiplier.";
    readonly defaultValue: "1";
    readonly stability: "stable";
}, {
    readonly name: "header-height";
    readonly cssCustomProperty: "--header-height";
    readonly category: "layout";
    readonly description: "Header height for the application shell.";
    readonly defaultValue: "calc(32px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "rail-width";
    readonly cssCustomProperty: "--rail-width";
    readonly category: "layout";
    readonly description: "Action rail width.";
    readonly defaultValue: "calc(44px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "rail-height";
    readonly cssCustomProperty: "--rail-height";
    readonly category: "layout";
    readonly description: "Action rail row height.";
    readonly defaultValue: "calc(44px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "sidebar-width";
    readonly cssCustomProperty: "--sidebar-width";
    readonly category: "layout";
    readonly description: "Sidebar width.";
    readonly defaultValue: "calc(200px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "status-height";
    readonly cssCustomProperty: "--status-height";
    readonly category: "layout";
    readonly description: "Status bar height.";
    readonly defaultValue: "calc(20px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "tab-height";
    readonly cssCustomProperty: "--tab-height";
    readonly category: "layout";
    readonly description: "Tab strip height.";
    readonly defaultValue: "var(--header-height)";
    readonly stability: "stable";
}, {
    readonly name: "panel-header-height";
    readonly cssCustomProperty: "--panel-header-height";
    readonly category: "layout";
    readonly description: "Panel header height.";
    readonly defaultValue: "calc(30px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "rail-btn-size";
    readonly cssCustomProperty: "--rail-btn-size";
    readonly category: "layout";
    readonly description: "Action rail button size.";
    readonly defaultValue: "calc(30px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "bg-app";
    readonly cssCustomProperty: "--bg-app";
    readonly category: "color";
    readonly description: "Top-level application background.";
    readonly defaultValue: "#c0c0c0";
    readonly stability: "stable";
}, {
    readonly name: "bg-panel";
    readonly cssCustomProperty: "--bg-panel";
    readonly category: "color";
    readonly description: "Panel background.";
    readonly defaultValue: "#ececec";
    readonly stability: "stable";
}, {
    readonly name: "bg-inset";
    readonly cssCustomProperty: "--bg-inset";
    readonly category: "color";
    readonly description: "Inset surface background.";
    readonly defaultValue: "#dcdcdc";
    readonly stability: "stable";
}, {
    readonly name: "border-color";
    readonly cssCustomProperty: "--border-color";
    readonly category: "color";
    readonly description: "Primary border color.";
    readonly defaultValue: "#000000";
    readonly stability: "stable";
}, {
    readonly name: "border-width";
    readonly cssCustomProperty: "--border-width";
    readonly category: "layout";
    readonly description: "Primary border width.";
    readonly defaultValue: "2px";
    readonly stability: "stable";
}, {
    readonly name: "fg-primary";
    readonly cssCustomProperty: "--fg-primary";
    readonly category: "color";
    readonly description: "Primary foreground color.";
    readonly defaultValue: "#000000";
    readonly stability: "stable";
}, {
    readonly name: "fg-secondary";
    readonly cssCustomProperty: "--fg-secondary";
    readonly category: "color";
    readonly description: "Secondary foreground color.";
    readonly defaultValue: "#333333";
    readonly stability: "stable";
}, {
    readonly name: "fg-muted";
    readonly cssCustomProperty: "--fg-muted";
    readonly category: "color";
    readonly description: "Muted foreground color.";
    readonly defaultValue: "#666666";
    readonly stability: "stable";
}, {
    readonly name: "accent";
    readonly cssCustomProperty: "--accent";
    readonly category: "color";
    readonly description: "Accent color.";
    readonly defaultValue: "#ff3e00";
    readonly stability: "stable";
}, {
    readonly name: "table-header-bg";
    readonly cssCustomProperty: "--table-header-bg";
    readonly category: "color";
    readonly description: "Markdown table header background.";
    readonly defaultValue: "var(--bg-inset)";
    readonly stability: "stable";
}, {
    readonly name: "table-header-fg";
    readonly cssCustomProperty: "--table-header-fg";
    readonly category: "color";
    readonly description: "Markdown table header foreground.";
    readonly defaultValue: "var(--fg-primary)";
    readonly stability: "stable";
}, {
    readonly name: "table-row-primary-bg";
    readonly cssCustomProperty: "--table-row-primary-bg";
    readonly category: "color";
    readonly description: "Odd markdown table row background.";
    readonly defaultValue: "var(--bg-panel)";
    readonly stability: "stable";
}, {
    readonly name: "table-row-secondary-bg";
    readonly cssCustomProperty: "--table-row-secondary-bg";
    readonly category: "color";
    readonly description: "Even markdown table row background.";
    readonly defaultValue: "var(--bg-inset)";
    readonly stability: "stable";
}, {
    readonly name: "status-ok";
    readonly cssCustomProperty: "--status-ok";
    readonly category: "status";
    readonly description: "Success status color.";
    readonly defaultValue: "#00cc00";
    readonly stability: "stable";
}, {
    readonly name: "status-warn";
    readonly cssCustomProperty: "--status-warn";
    readonly category: "status";
    readonly description: "Warning status color.";
    readonly defaultValue: "#ff8800";
    readonly stability: "stable";
}, {
    readonly name: "status-error";
    readonly cssCustomProperty: "--status-error";
    readonly category: "status";
    readonly description: "Error status color.";
    readonly defaultValue: "#cc0000";
    readonly stability: "stable";
}, {
    readonly name: "app-gap";
    readonly cssCustomProperty: "--app-gap";
    readonly category: "spacing";
    readonly description: "Primary gap between shell regions.";
    readonly defaultValue: "calc(4px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "texture-opacity";
    readonly cssCustomProperty: "--texture-opacity";
    readonly category: "interaction";
    readonly description: "Texture overlay opacity.";
    readonly defaultValue: "0.05";
    readonly stability: "stable";
}, {
    readonly name: "editor-padding";
    readonly cssCustomProperty: "--editor-padding";
    readonly category: "spacing";
    readonly description: "Editor inner padding.";
    readonly defaultValue: "calc(24px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "file-indent-base";
    readonly cssCustomProperty: "--file-indent-base";
    readonly category: "spacing";
    readonly description: "Base indentation for file tree items.";
    readonly defaultValue: "calc(12px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "file-indent-unit";
    readonly cssCustomProperty: "--file-indent-unit";
    readonly category: "spacing";
    readonly description: "Incremental indentation for nested file tree items.";
    readonly defaultValue: "calc(12px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "c-explorer-hover";
    readonly cssCustomProperty: "--c-explorer-hover";
    readonly category: "interaction";
    readonly description: "Explorer hover background.";
    readonly defaultValue: "rgba(0, 0, 0, 0.06)";
    readonly stability: "stable";
}, {
    readonly name: "c-explorer-selected";
    readonly cssCustomProperty: "--c-explorer-selected";
    readonly category: "interaction";
    readonly description: "Explorer selected background.";
    readonly defaultValue: "var(--accent)";
    readonly stability: "stable";
}, {
    readonly name: "c-explorer-selected-text";
    readonly cssCustomProperty: "--c-explorer-selected-text";
    readonly category: "interaction";
    readonly description: "Explorer selected foreground.";
    readonly defaultValue: "#ffffff";
    readonly stability: "stable";
}, {
    readonly name: "c-explorer-drag-bg";
    readonly cssCustomProperty: "--c-explorer-drag-bg";
    readonly category: "interaction";
    readonly description: "Explorer drag surface background.";
    readonly defaultValue: "rgba(255, 255, 255, 0.08)";
    readonly stability: "stable";
}, {
    readonly name: "font-ui";
    readonly cssCustomProperty: "--font-ui";
    readonly category: "typography";
    readonly description: "UI font stack.";
    readonly defaultValue: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    readonly stability: "stable";
}, {
    readonly name: "font-mono";
    readonly cssCustomProperty: "--font-mono";
    readonly category: "typography";
    readonly description: "Monospace font stack.";
    readonly defaultValue: "'JetBrains Mono', 'IBM Plex Mono', Menlo, monospace";
    readonly stability: "stable";
}, {
    readonly name: "font-head";
    readonly cssCustomProperty: "--font-head";
    readonly category: "typography";
    readonly description: "Heading font stack.";
    readonly defaultValue: "'Inter', sans-serif";
    readonly stability: "stable";
}];
export declare const MARKDOWN_WORKSPACE_TOKEN_DEFAULTS: Readonly<Readonly<Record<"ui-scale" | "header-height" | "rail-width" | "rail-height" | "sidebar-width" | "status-height" | "tab-height" | "panel-header-height" | "rail-btn-size" | "bg-app" | "bg-panel" | "bg-inset" | "border-color" | "border-width" | "fg-primary" | "fg-secondary" | "fg-muted" | "accent" | "table-header-bg" | "table-header-fg" | "table-row-primary-bg" | "table-row-secondary-bg" | "status-ok" | "status-warn" | "status-error" | "app-gap" | "texture-opacity" | "editor-padding" | "file-indent-base" | "file-indent-unit" | "c-explorer-hover" | "c-explorer-selected" | "c-explorer-selected-text" | "c-explorer-drag-bg" | "font-ui" | "font-mono" | "font-head", string>>>;
export declare const MARKDOWN_WORKSPACE_TOKEN_CSS_CUSTOM_PROPERTIES: readonly ThemeTokenDefinition["cssCustomProperty"][];
//# sourceMappingURL=tokens.d.ts.map