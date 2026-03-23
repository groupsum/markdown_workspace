import { type MarkdownWorkspaceThemeClassName, type ThemeClassDefinition } from "@markdown-workspace/theme-contract/classes";
export { MARKDOWN_WORKSPACE_THEME_CLASS_NAMES, MARKDOWN_WORKSPACE_THEME_CLASSES, type MarkdownWorkspaceThemeClassName, type ThemeClassDefinition, } from "@markdown-workspace/theme-contract/classes";
export declare const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASS_NAMES: readonly MarkdownWorkspaceThemeClassName[];
export type MarkdownWorkspaceRendererHelperClassName = typeof MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASS_NAMES[number];
export interface RendererHelperClassDefinition extends ThemeClassDefinition {
    readonly group: "scope" | "heading" | "text" | "list" | "table" | "code" | "form";
}
export declare const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASSES: readonly RendererHelperClassDefinition[];
export declare const MARKDOWN_WORKSPACE_STABLE_THEME_CLASS_NAMES: readonly MarkdownWorkspaceThemeClassName[];
export declare const MARKDOWN_WORKSPACE_STABLE_THEME_CLASSES: readonly ThemeClassDefinition[];
export type MarkdownWorkspaceStableThemeClassName = typeof MARKDOWN_WORKSPACE_STABLE_THEME_CLASS_NAMES[number];
export type StableThemeClassDefinition = ThemeClassDefinition;
//# sourceMappingURL=classes.d.ts.map