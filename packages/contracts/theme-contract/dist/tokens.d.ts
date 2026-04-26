export declare const MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES: readonly ["ui-scale", "header-height", "rail-width", "rail-height", "sidebar-width", "status-height", "tab-height", "panel-header-height", "rail-btn-size", "bg-app", "bg-panel", "bg-inset", "border-color", "border-width", "fg-primary", "fg-secondary", "fg-muted", "accent", "table-header-bg", "table-header-fg", "table-row-primary-bg", "table-row-secondary-bg", "status-ok", "status-warn", "status-error", "app-gap", "texture-opacity", "editor-padding", "editor-line-height", "editor-line-rhythm", "markdown-line-height", "markdown-heading-line-height", "pdf-page-size", "pdf-page-margin-block", "pdf-page-margin-inline", "pdf-content-font-size", "pdf-content-line-height", "pdf-heading-keep-with-next", "line-number-gutter-width", "mobile-rail-expanded-width", "mobile-expandable-rail-width", "file-indent-base", "file-indent-unit", "c-explorer-hover", "c-explorer-selected", "c-explorer-selected-text", "c-explorer-drag-bg", "font-ui", "font-mono", "font-head"];
export type MarkdownWorkspaceThemeTokenName = typeof MARKDOWN_WORKSPACE_THEME_TOKEN_NAMES[number];
export type ThemeTokenCategory = "layout" | "color" | "status" | "spacing" | "interaction" | "typography";
export interface ThemeTokenDefinition {
    readonly name: MarkdownWorkspaceThemeTokenName;
    readonly cssCustomProperty: `--${string}`;
    readonly category: ThemeTokenCategory;
    readonly description: string;
    readonly defaultValue: string;
    readonly stability: "stable" | "experimental";
}
export declare const MARKDOWN_WORKSPACE_THEME_TOKENS: readonly [{
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
    readonly name: "editor-line-height";
    readonly cssCustomProperty: "--editor-line-height";
    readonly category: "typography";
    readonly description: "Base editor line height.";
    readonly defaultValue: "calc(1.5rem * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "editor-line-rhythm";
    readonly cssCustomProperty: "--editor-line-rhythm";
    readonly category: "typography";
    readonly description: "Shared editor line rhythm used by the textarea and gutter.";
    readonly defaultValue: "var(--editor-line-height)";
    readonly stability: "stable";
}, {
    readonly name: "markdown-line-height";
    readonly cssCustomProperty: "--markdown-line-height";
    readonly category: "typography";
    readonly description: "Base Markdown body line height.";
    readonly defaultValue: "var(--editor-line-rhythm)";
    readonly stability: "stable";
}, {
    readonly name: "markdown-heading-line-height";
    readonly cssCustomProperty: "--markdown-heading-line-height";
    readonly category: "typography";
    readonly description: "Markdown heading line height.";
    readonly defaultValue: "calc(1.1 + ((var(--ui-scale) - 1) * 0.35))";
    readonly stability: "stable";
}, {
    readonly name: "pdf-page-size";
    readonly cssCustomProperty: "--pdf-page-size";
    readonly category: "layout";
    readonly description: "Default PDF page size used by print/export styles.";
    readonly defaultValue: "A4";
    readonly stability: "stable";
}, {
    readonly name: "pdf-page-margin-block";
    readonly cssCustomProperty: "--pdf-page-margin-block";
    readonly category: "spacing";
    readonly description: "Top and bottom PDF page margin.";
    readonly defaultValue: "14mm";
    readonly stability: "stable";
}, {
    readonly name: "pdf-page-margin-inline";
    readonly cssCustomProperty: "--pdf-page-margin-inline";
    readonly category: "spacing";
    readonly description: "Left and right PDF page margin.";
    readonly defaultValue: "16mm";
    readonly stability: "stable";
}, {
    readonly name: "pdf-content-font-size";
    readonly cssCustomProperty: "--pdf-content-font-size";
    readonly category: "typography";
    readonly description: "Base Markdown font size for PDF output.";
    readonly defaultValue: "10.5pt";
    readonly stability: "stable";
}, {
    readonly name: "pdf-content-line-height";
    readonly cssCustomProperty: "--pdf-content-line-height";
    readonly category: "typography";
    readonly description: "Base Markdown line height for PDF output.";
    readonly defaultValue: "1.5";
    readonly stability: "stable";
}, {
    readonly name: "pdf-heading-keep-with-next";
    readonly cssCustomProperty: "--pdf-heading-keep-with-next";
    readonly category: "layout";
    readonly description: "Heading page-break behavior for PDF output.";
    readonly defaultValue: "avoid";
    readonly stability: "stable";
}, {
    readonly name: "line-number-gutter-width";
    readonly cssCustomProperty: "--line-number-gutter-width";
    readonly category: "layout";
    readonly description: "Width of the editor line-number gutter.";
    readonly defaultValue: "calc(30px * var(--ui-scale))";
    readonly stability: "stable";
}, {
    readonly name: "mobile-rail-expanded-width";
    readonly cssCustomProperty: "--mobile-rail-expanded-width";
    readonly category: "layout";
    readonly description: "Expanded width for the rail on narrow mobile layouts.";
    readonly defaultValue: "100vw";
    readonly stability: "stable";
}, {
    readonly name: "mobile-expandable-rail-width";
    readonly cssCustomProperty: "--mobile-expandable-rail-width";
    readonly category: "layout";
    readonly description: "Token used by responsive layouts for expandable rail width.";
    readonly defaultValue: "var(--mobile-rail-expanded-width)";
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
export type MarkdownWorkspaceThemeTokenMap = Readonly<Record<MarkdownWorkspaceThemeTokenName, string>>;
//# sourceMappingURL=tokens.d.ts.map