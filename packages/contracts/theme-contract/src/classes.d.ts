export declare const MARKDOWN_WORKSPACE_THEME_CLASS_NAMES: readonly ["markdown-body", "md-task-list-item", "md-checkbox", "md-table", "md-table-header", "md-table-cell", "md-table-caption", "md-table-head", "md-table-body", "md-table-row", "md-code-block", "md-code-header", "md-code-surface"];
export type MarkdownWorkspaceThemeClassName = typeof MARKDOWN_WORKSPACE_THEME_CLASS_NAMES[number];
export type ThemeClassScope = "renderer" | "editor" | "app";
export interface ThemeClassDefinition {
    readonly name: MarkdownWorkspaceThemeClassName;
    readonly selector: `.${string}`;
    readonly scope: ThemeClassScope;
    readonly description: string;
    readonly stability: "stable" | "experimental";
}
export declare const MARKDOWN_WORKSPACE_THEME_CLASSES: readonly [{
    readonly name: "markdown-body";
    readonly selector: ".markdown-body";
    readonly scope: "renderer";
    readonly description: "Root scope class for rendered markdown content.";
    readonly stability: "stable";
}, {
    readonly name: "md-task-list-item";
    readonly selector: ".md-task-list-item";
    readonly scope: "renderer";
    readonly description: "Task list item wrapper.";
    readonly stability: "stable";
}, {
    readonly name: "md-checkbox";
    readonly selector: ".md-checkbox";
    readonly scope: "renderer";
    readonly description: "Task list checkbox element.";
    readonly stability: "stable";
}, {
    readonly name: "md-table";
    readonly selector: ".md-table";
    readonly scope: "renderer";
    readonly description: "Portable markdown table root class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-header";
    readonly selector: ".md-table-header";
    readonly scope: "renderer";
    readonly description: "Portable markdown table header cell class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-cell";
    readonly selector: ".md-table-cell";
    readonly scope: "renderer";
    readonly description: "Portable markdown table body cell class.";
    readonly stability: "stable";
}, {
    readonly name: "md-table-caption";
    readonly selector: ".md-table-caption";
    readonly scope: "renderer";
    readonly description: "Portable markdown table caption class.";
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
    readonly name: "md-code-block";
    readonly selector: ".md-code-block";
    readonly scope: "renderer";
    readonly description: "Portable fenced code block container.";
    readonly stability: "stable";
}, {
    readonly name: "md-code-header";
    readonly selector: ".md-code-header";
    readonly scope: "renderer";
    readonly description: "Portable fenced code header.";
    readonly stability: "stable";
}, {
    readonly name: "md-code-surface";
    readonly selector: ".md-code-surface";
    readonly scope: "renderer";
    readonly description: "Portable fenced code surface.";
    readonly stability: "stable";
}];
//# sourceMappingURL=classes.d.ts.map