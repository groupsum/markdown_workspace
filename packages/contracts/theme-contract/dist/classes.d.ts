export declare const MARKDOWN_WORKSPACE_THEME_CLASS_NAMES: readonly ["markdown-body", "md-h1", "md-h2", "md-h3", "md-h4", "md-h5", "md-h6", "md-p", "md-strong", "md-em", "md-hr", "md-blockquote", "md-ul", "md-ol", "md-li", "md-task-list-item", "md-checkbox", "md-link", "md-inline-code", "md-table", "md-table-head", "md-table-body", "md-table-row", "md-table-header", "md-table-cell", "md-table-caption", "md-table-columns", "md-table-column", "md-code-block", "md-code-header", "md-code-surface", "mw-editor", "mw-editor-layout", "mw-editor-gutter", "mw-editor-line-number", "mw-editor-textarea"];
export type MarkdownWorkspaceThemeClassName = typeof MARKDOWN_WORKSPACE_THEME_CLASS_NAMES[number];
export type ThemeClassScope = "renderer" | "editor" | "app";
export interface ThemeClassDefinition {
    readonly name: MarkdownWorkspaceThemeClassName;
    readonly selector: `.${string}`;
    readonly scope: ThemeClassScope;
    readonly description: string;
    readonly stability: "stable" | "provisional" | "experimental";
}
export declare const MARKDOWN_WORKSPACE_THEME_CLASSES: readonly [{
    readonly name: "markdown-body";
    readonly selector: ".markdown-body";
    readonly scope: "renderer";
    readonly description: "Root scope class for rendered markdown content.";
    readonly stability: "stable";
}, {
    readonly name: "md-h1";
    readonly selector: ".md-h1";
    readonly scope: "renderer";
    readonly description: "Level-1 heading helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-h2";
    readonly selector: ".md-h2";
    readonly scope: "renderer";
    readonly description: "Level-2 heading helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-h3";
    readonly selector: ".md-h3";
    readonly scope: "renderer";
    readonly description: "Level-3 heading helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-h4";
    readonly selector: ".md-h4";
    readonly scope: "renderer";
    readonly description: "Level-4 heading helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-h5";
    readonly selector: ".md-h5";
    readonly scope: "renderer";
    readonly description: "Level-5 heading helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-h6";
    readonly selector: ".md-h6";
    readonly scope: "renderer";
    readonly description: "Level-6 heading helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-p";
    readonly selector: ".md-p";
    readonly scope: "renderer";
    readonly description: "Paragraph helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-strong";
    readonly selector: ".md-strong";
    readonly scope: "renderer";
    readonly description: "Strong emphasis helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-em";
    readonly selector: ".md-em";
    readonly scope: "renderer";
    readonly description: "Emphasis helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-hr";
    readonly selector: ".md-hr";
    readonly scope: "renderer";
    readonly description: "Horizontal rule helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-blockquote";
    readonly selector: ".md-blockquote";
    readonly scope: "renderer";
    readonly description: "Blockquote helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-ul";
    readonly selector: ".md-ul";
    readonly scope: "renderer";
    readonly description: "Unordered-list helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-ol";
    readonly selector: ".md-ol";
    readonly scope: "renderer";
    readonly description: "Ordered-list helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-li";
    readonly selector: ".md-li";
    readonly scope: "renderer";
    readonly description: "List-item helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-task-list-item";
    readonly selector: ".md-task-list-item";
    readonly scope: "renderer";
    readonly description: "Task-list list-item helper class.";
    readonly stability: "stable";
}, {
    readonly name: "md-checkbox";
    readonly selector: ".md-checkbox";
    readonly scope: "renderer";
    readonly description: "Task-list checkbox helper class.";
    readonly stability: "stable";
}, {
    readonly name: "md-link";
    readonly selector: ".md-link";
    readonly scope: "renderer";
    readonly description: "Anchor helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-inline-code";
    readonly selector: ".md-inline-code";
    readonly scope: "renderer";
    readonly description: "Inline-code helper class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-table";
    readonly selector: ".md-table";
    readonly scope: "renderer";
    readonly description: "Portable markdown table root class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-head";
    readonly selector: ".md-table-head";
    readonly scope: "renderer";
    readonly description: "Portable markdown table head section class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-body";
    readonly selector: ".md-table-body";
    readonly scope: "renderer";
    readonly description: "Portable markdown table body section class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-row";
    readonly selector: ".md-table-row";
    readonly scope: "renderer";
    readonly description: "Portable markdown table row class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-header";
    readonly selector: ".md-table-header";
    readonly scope: "renderer";
    readonly description: "Portable markdown table header class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-cell";
    readonly selector: ".md-table-cell";
    readonly scope: "renderer";
    readonly description: "Portable markdown table cell class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-caption";
    readonly selector: ".md-table-caption";
    readonly scope: "renderer";
    readonly description: "Portable markdown table caption class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-columns";
    readonly selector: ".md-table-columns";
    readonly scope: "renderer";
    readonly description: "Portable markdown table colgroup class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-table-column";
    readonly selector: ".md-table-column";
    readonly scope: "renderer";
    readonly description: "Portable markdown table column class.";
    readonly stability: "provisional";
}, {
    readonly name: "md-code-block";
    readonly selector: ".md-code-block";
    readonly scope: "renderer";
    readonly description: "Portable fenced code block root class.";
    readonly stability: "stable";
}, {
    readonly name: "md-code-header";
    readonly selector: ".md-code-header";
    readonly scope: "renderer";
    readonly description: "Portable fenced code header class.";
    readonly stability: "stable";
}, {
    readonly name: "md-code-surface";
    readonly selector: ".md-code-surface";
    readonly scope: "renderer";
    readonly description: "Portable fenced code surface class.";
    readonly stability: "stable";
}, {
    readonly name: "mw-editor";
    readonly selector: ".mw-editor";
    readonly scope: "editor";
    readonly description: "Portable markdown source editor root class.";
    readonly stability: "stable";
}, {
    readonly name: "mw-editor-layout";
    readonly selector: ".mw-editor-layout";
    readonly scope: "editor";
    readonly description: "Portable markdown source editor layout class.";
    readonly stability: "stable";
}, {
    readonly name: "mw-editor-gutter";
    readonly selector: ".mw-editor-gutter";
    readonly scope: "editor";
    readonly description: "Portable markdown source editor gutter class.";
    readonly stability: "stable";
}, {
    readonly name: "mw-editor-line-number";
    readonly selector: ".mw-editor-line-number";
    readonly scope: "editor";
    readonly description: "Portable markdown source editor line-number class.";
    readonly stability: "stable";
}, {
    readonly name: "mw-editor-textarea";
    readonly selector: ".mw-editor-textarea";
    readonly scope: "editor";
    readonly description: "Portable markdown source editor textarea class.";
    readonly stability: "stable";
}];
//# sourceMappingURL=classes.d.ts.map