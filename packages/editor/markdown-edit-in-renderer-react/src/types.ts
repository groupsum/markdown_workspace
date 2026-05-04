import type React from "react";
import type {
  MarkdownHtmlHandlingMode,
  MarkdownOptionalProfileId,
  MarkdownProfileId,
} from "@mdwrk/markdown-renderer-core";
import type { MarkdownRendererProps } from "@mdwrk/markdown-renderer-react";
import type { MarkdownSourceEditorHandle, MarkdownSourceEditorProps } from "@mdwrk/markdown-editor-react";
import type { MarkdownEditBlock } from "./blocks.js";
import type { MarkdownEditInRendererThemeVariables } from "./theme.js";

export type MarkdownEditInRendererActivation = "click" | "double-click" | "focus";

export interface MarkdownEditInRendererHandle {
  focus(): void;
  activateBlock(blockOrdinal: number): void;
  deactivateBlock(): void;
  getValue(): string;
  getActiveBlock(): MarkdownEditBlock | null;
  getSourceEditor(): MarkdownSourceEditorHandle | null;
}

export interface MarkdownEditInRendererProps {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly documentKey?: string | number;
  readonly onChange?: (value: string) => void;
  readonly onActiveBlockChange?: (block: MarkdownEditBlock | null) => void;
  readonly onRenderedBlockClick?: (event: React.MouseEvent<HTMLDivElement>, block: MarkdownEditBlock) => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly themeStyle?: React.CSSProperties;
  readonly themeVariables?: MarkdownEditInRendererThemeVariables;
  readonly blockClassName?: string;
  readonly activeBlockClassName?: string;
  readonly renderedBlockClassName?: string;
  readonly editorClassName?: string;
  readonly activation?: MarkdownEditInRendererActivation;
  readonly autoFocus?: boolean;
  readonly placeholder?: string;
  readonly spellCheck?: boolean;
  readonly disabled?: boolean;
  readonly editorProps?: Omit<
    MarkdownSourceEditorProps,
    "value" | "defaultValue" | "documentKey" | "onChange" | "className" | "placeholder" | "spellCheck" | "disabled" | "showLineNumbers"
  >;
  readonly rendererProps?: Omit<MarkdownRendererProps, "markdown" | "className" | "htmlHandling" | "profile" | "extensions">;
  readonly htmlHandling?: MarkdownHtmlHandlingMode;
  readonly profile?: MarkdownProfileId;
  readonly extensions?: readonly MarkdownOptionalProfileId[];
}
