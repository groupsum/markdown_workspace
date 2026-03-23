export const MARKDOWN_WORKSPACE_THEME_CLASS_NAMES = [
  "markdown-body",
  "md-h1",
  "md-h2",
  "md-h3",
  "md-h4",
  "md-h5",
  "md-h6",
  "md-p",
  "md-strong",
  "md-em",
  "md-hr",
  "md-blockquote",
  "md-ul",
  "md-ol",
  "md-li",
  "md-task-list-item",
  "md-checkbox",
  "md-link",
  "md-inline-code",
  "md-table",
  "md-table-head",
  "md-table-body",
  "md-table-row",
  "md-table-header",
  "md-table-cell",
  "md-table-caption",
  "md-table-columns",
  "md-table-column",
  "md-code-block",
  "md-code-header",
  "md-code-surface",
  "mw-editor",
  "mw-editor-layout",
  "mw-editor-gutter",
  "mw-editor-line-number",
  "mw-editor-textarea",
] as const;

export type MarkdownWorkspaceThemeClassName = typeof MARKDOWN_WORKSPACE_THEME_CLASS_NAMES[number];

export type ThemeClassScope = "renderer" | "editor" | "app";

export interface ThemeClassDefinition {
  readonly name: MarkdownWorkspaceThemeClassName;
  readonly selector: `.${string}`;
  readonly scope: ThemeClassScope;
  readonly description: string;
  readonly stability: "stable" | "provisional" | "experimental";
}

export const MARKDOWN_WORKSPACE_THEME_CLASSES = [
  { name: "markdown-body", selector: ".markdown-body", scope: "renderer", description: "Root scope class for rendered markdown content.", stability: "stable" },
  { name: "md-h1", selector: ".md-h1", scope: "renderer", description: "Level-1 heading helper class.", stability: "provisional" },
  { name: "md-h2", selector: ".md-h2", scope: "renderer", description: "Level-2 heading helper class.", stability: "provisional" },
  { name: "md-h3", selector: ".md-h3", scope: "renderer", description: "Level-3 heading helper class.", stability: "provisional" },
  { name: "md-h4", selector: ".md-h4", scope: "renderer", description: "Level-4 heading helper class.", stability: "provisional" },
  { name: "md-h5", selector: ".md-h5", scope: "renderer", description: "Level-5 heading helper class.", stability: "provisional" },
  { name: "md-h6", selector: ".md-h6", scope: "renderer", description: "Level-6 heading helper class.", stability: "provisional" },
  { name: "md-p", selector: ".md-p", scope: "renderer", description: "Paragraph helper class.", stability: "provisional" },
  { name: "md-strong", selector: ".md-strong", scope: "renderer", description: "Strong emphasis helper class.", stability: "provisional" },
  { name: "md-em", selector: ".md-em", scope: "renderer", description: "Emphasis helper class.", stability: "provisional" },
  { name: "md-hr", selector: ".md-hr", scope: "renderer", description: "Horizontal rule helper class.", stability: "provisional" },
  { name: "md-blockquote", selector: ".md-blockquote", scope: "renderer", description: "Blockquote helper class.", stability: "provisional" },
  { name: "md-ul", selector: ".md-ul", scope: "renderer", description: "Unordered-list helper class.", stability: "provisional" },
  { name: "md-ol", selector: ".md-ol", scope: "renderer", description: "Ordered-list helper class.", stability: "provisional" },
  { name: "md-li", selector: ".md-li", scope: "renderer", description: "List-item helper class.", stability: "provisional" },
  { name: "md-task-list-item", selector: ".md-task-list-item", scope: "renderer", description: "Task-list list-item helper class.", stability: "stable" },
  { name: "md-checkbox", selector: ".md-checkbox", scope: "renderer", description: "Task-list checkbox helper class.", stability: "stable" },
  { name: "md-link", selector: ".md-link", scope: "renderer", description: "Anchor helper class.", stability: "provisional" },
  { name: "md-inline-code", selector: ".md-inline-code", scope: "renderer", description: "Inline-code helper class.", stability: "provisional" },
  { name: "md-table", selector: ".md-table", scope: "renderer", description: "Portable markdown table root class.", stability: "stable" },
  { name: "md-table-head", selector: ".md-table-head", scope: "renderer", description: "Portable markdown table head section class.", stability: "stable" },
  { name: "md-table-body", selector: ".md-table-body", scope: "renderer", description: "Portable markdown table body section class.", stability: "stable" },
  { name: "md-table-row", selector: ".md-table-row", scope: "renderer", description: "Portable markdown table row class.", stability: "stable" },
  { name: "md-table-header", selector: ".md-table-header", scope: "renderer", description: "Portable markdown table header class.", stability: "stable" },
  { name: "md-table-cell", selector: ".md-table-cell", scope: "renderer", description: "Portable markdown table cell class.", stability: "stable" },
  { name: "md-table-caption", selector: ".md-table-caption", scope: "renderer", description: "Portable markdown table caption class.", stability: "stable" },
  { name: "md-table-columns", selector: ".md-table-columns", scope: "renderer", description: "Portable markdown table colgroup class.", stability: "provisional" },
  { name: "md-table-column", selector: ".md-table-column", scope: "renderer", description: "Portable markdown table column class.", stability: "provisional" },
  { name: "md-code-block", selector: ".md-code-block", scope: "renderer", description: "Portable fenced code block root class.", stability: "stable" },
  { name: "md-code-header", selector: ".md-code-header", scope: "renderer", description: "Portable fenced code header class.", stability: "stable" },
  { name: "md-code-surface", selector: ".md-code-surface", scope: "renderer", description: "Portable fenced code surface class.", stability: "stable" },
  { name: "mw-editor", selector: ".mw-editor", scope: "editor", description: "Portable markdown source editor root class.", stability: "stable" },
  { name: "mw-editor-layout", selector: ".mw-editor-layout", scope: "editor", description: "Portable markdown source editor layout class.", stability: "stable" },
  { name: "mw-editor-gutter", selector: ".mw-editor-gutter", scope: "editor", description: "Portable markdown source editor gutter class.", stability: "stable" },
  { name: "mw-editor-line-number", selector: ".mw-editor-line-number", scope: "editor", description: "Portable markdown source editor line-number class.", stability: "stable" },
  { name: "mw-editor-textarea", selector: ".mw-editor-textarea", scope: "editor", description: "Portable markdown source editor textarea class.", stability: "stable" },
] as const satisfies readonly ThemeClassDefinition[];
