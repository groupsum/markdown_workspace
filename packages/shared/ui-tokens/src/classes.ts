import {
  MARKDOWN_WORKSPACE_THEME_CLASS_NAMES,
  MARKDOWN_WORKSPACE_THEME_CLASSES,
  type MarkdownWorkspaceThemeClassName,
  type ThemeClassDefinition,
} from "@mdwrk/theme-contract/classes";

export {
  MARKDOWN_WORKSPACE_THEME_CLASS_NAMES,
  MARKDOWN_WORKSPACE_THEME_CLASSES,
  type MarkdownWorkspaceThemeClassName,
  type ThemeClassDefinition,
} from "@mdwrk/theme-contract/classes";

export const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASS_NAMES = Object.freeze(
  MARKDOWN_WORKSPACE_THEME_CLASSES
    .filter((definition) => definition.scope === "renderer")
    .map((definition) => definition.name),
) as readonly MarkdownWorkspaceThemeClassName[];

export type MarkdownWorkspaceRendererHelperClassName = typeof MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASS_NAMES[number];

export interface RendererHelperClassDefinition extends ThemeClassDefinition {
  readonly group: "scope" | "heading" | "text" | "list" | "table" | "code" | "form";
}

function resolveGroup(name: MarkdownWorkspaceThemeClassName): RendererHelperClassDefinition["group"] {
  if (name === "markdown-body") return "scope";
  if (name.startsWith("md-h")) return "heading";
  if (["md-p", "md-strong", "md-em", "md-hr", "md-blockquote", "md-link"].includes(name)) return "text";
  if (["md-ul", "md-ol", "md-li", "md-task-list-item"].includes(name)) return "list";
  if (["md-checkbox"].includes(name)) return "form";
  if (name.startsWith("md-table")) return "table";
  return "code";
}

export const MARKDOWN_WORKSPACE_RENDERER_HELPER_CLASSES = Object.freeze(
  MARKDOWN_WORKSPACE_THEME_CLASSES
    .filter((definition) => definition.scope === "renderer")
    .map((definition) => ({ ...definition, group: resolveGroup(definition.name) })),
) as readonly RendererHelperClassDefinition[];

export const MARKDOWN_WORKSPACE_STABLE_THEME_CLASS_NAMES = Object.freeze(
  MARKDOWN_WORKSPACE_THEME_CLASSES
    .filter((definition) => definition.stability === "stable")
    .map((definition) => definition.name),
) as readonly MarkdownWorkspaceThemeClassName[];

export const MARKDOWN_WORKSPACE_STABLE_THEME_CLASSES = Object.freeze(
  MARKDOWN_WORKSPACE_THEME_CLASSES.filter((definition) => definition.stability === "stable"),
) as readonly ThemeClassDefinition[];

export type MarkdownWorkspaceStableThemeClassName = typeof MARKDOWN_WORKSPACE_STABLE_THEME_CLASS_NAMES[number];
export type StableThemeClassDefinition = ThemeClassDefinition;
