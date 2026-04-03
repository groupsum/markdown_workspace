import { type ThemeClassDefinition } from "@mdwrk/theme-contract/classes";
export { MARKDOWN_WORKSPACE_THEME_CLASS_NAMES, MARKDOWN_WORKSPACE_THEME_CLASSES, type MarkdownWorkspaceThemeClassName, type ThemeClassDefinition, } from "@mdwrk/theme-contract/classes";
export declare const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASS_NAMES: readonly ("markdown-body" | "md-h1" | "md-h2" | "md-h3" | "md-h4" | "md-h5" | "md-h6" | "md-p" | "md-strong" | "md-em" | "md-hr" | "md-blockquote" | "md-ul" | "md-ol" | "md-li" | "md-task-list-item" | "md-checkbox" | "md-link" | "md-inline-code" | "md-table" | "md-table-head" | "md-table-body" | "md-table-row" | "md-table-header" | "md-table-cell" | "md-table-caption" | "md-table-columns" | "md-table-column" | "md-code-block" | "md-code-header" | "md-code-surface" | "mw-editor" | "mw-editor-layout" | "mw-editor-gutter" | "mw-editor-line-number" | "mw-editor-textarea")[];
export declare type MarkdownWorkspaceRendererHelperClassName = typeof MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASS_NAMES[number];
export interface RendererHelperClassDefinition extends ThemeClassDefinition {
    readonly group: "scope" | "heading" | "text" | "list" | "table" | "code" | "form";
}
export declare const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASSES: readonly RendererHelperClassDefinition[];
export declare const MARKDOWN_WORKSPACE_STABLE_THEME_CLASS_NAMES: readonly ("markdown-body" | "md-h1" | "md-h2" | "md-h3" | "md-h4" | "md-h5" | "md-h6" | "md-p" | "md-strong" | "md-em" | "md-hr" | "md-blockquote" | "md-ul" | "md-ol" | "md-li" | "md-task-list-item" | "md-checkbox" | "md-link" | "md-inline-code" | "md-table" | "md-table-head" | "md-table-body" | "md-table-row" | "md-table-header" | "md-table-cell" | "md-table-caption" | "md-table-columns" | "md-table-column" | "md-code-block" | "md-code-header" | "md-code-surface" | "mw-editor" | "mw-editor-layout" | "mw-editor-gutter" | "mw-editor-line-number" | "mw-editor-textarea")[];
export declare const MARKDOWN_WORKSPACE_STABLE_THEME_CLASSES: readonly ThemeClassDefinition[];
export declare type MarkdownWorkspaceStableThemeClassName = typeof MARKDOWN_WORKSPACE_STABLE_THEME_CLASS_NAMES[number];
export declare type StableThemeClassDefinition = ThemeClassDefinition;
//# sourceMappingURL=classes.d.ts.map