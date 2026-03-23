export interface MarkdownEditorClassNames {
  readonly root: string;
  readonly layout: string;
  readonly gutter: string;
  readonly lineNumber: string;
  readonly textarea: string;
}

export const DEFAULT_MARKDOWN_EDITOR_CLASS_NAMES: MarkdownEditorClassNames = {
  root: "mw-editor",
  layout: "mw-editor-layout",
  gutter: "mw-editor-gutter",
  lineNumber: "mw-editor-line-number",
  textarea: "mw-editor-textarea",
};
