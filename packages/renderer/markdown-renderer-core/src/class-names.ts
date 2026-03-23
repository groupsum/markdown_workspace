import type { MarkdownRendererClassNames } from "./types.js";

const DEFAULT_MARKDOWN_RENDERER_CLASS_NAME_LITERAL = {
  root: "markdown-body",
  heading1: "md-h1",
  heading2: "md-h2",
  heading3: "md-h3",
  heading4: "md-h4",
  heading5: "md-h5",
  heading6: "md-h6",
  paragraph: "md-p",
  strong: "md-strong",
  emphasis: "md-em",
  hr: "md-hr",
  blockquote: "md-blockquote",
  listUnordered: "md-ul",
  listOrdered: "md-ol",
  listItem: "md-li",
  taskListItem: "md-task-list-item",
  checkbox: "md-checkbox",
  link: "md-link",
  inlineCode: "md-inline-code",
  table: "md-table",
  tableHead: "md-table-head",
  tableBody: "md-table-body",
  tableRow: "md-table-row",
  tableHeader: "md-table-header",
  tableCell: "md-table-cell",
  tableCaption: "md-table-caption",
  tableColumns: "md-table-columns",
  tableColumn: "md-table-column",
  codeBlock: "md-code-block",
  codeHeader: "md-code-header",
  codeSurface: "md-code-surface"
} as const satisfies MarkdownRendererClassNames;

export const DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES: MarkdownRendererClassNames = Object.freeze(
  DEFAULT_MARKDOWN_RENDERER_CLASS_NAME_LITERAL,
);

export const MARKDOWN_RENDERER_CLASS_NAME_VALUES = Object.freeze(
  Object.values(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES),
);

export function resolveMarkdownRendererClassNames(
  overrides: Partial<MarkdownRendererClassNames> = {},
): MarkdownRendererClassNames {
  return Object.freeze({
    ...DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES,
    ...overrides,
  });
}
