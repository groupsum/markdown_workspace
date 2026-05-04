import type React from "react";
import type {
  MarkdownHtmlHandlingMode,
  MarkdownOptionalProfileId,
  MarkdownProfileId,
} from "@mdwrk/markdown-renderer-core";
import type { MarkdownRendererProps } from "@mdwrk/markdown-renderer-react";
import type { MarkdownEditInRendererThemeVariables } from "./theme.js";

export interface MarkdownEditInRendererHandle {
  focus(): void;
  getValue(): string;
  getInputElement(): HTMLTextAreaElement | null;
  setValue(value: string): void;
}

export interface MarkdownEditInRendererProps {
  readonly value?: string;
  readonly defaultValue?: string;
  readonly documentKey?: string | number;
  readonly onChange?: (value: string) => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly themeStyle?: React.CSSProperties;
  readonly themeVariables?: MarkdownEditInRendererThemeVariables;
  readonly surfaceClassName?: string;
  readonly autoFocus?: boolean;
  readonly placeholder?: string;
  readonly spellCheck?: boolean;
  readonly disabled?: boolean;
  readonly rendererProps?: Omit<MarkdownRendererProps, "markdown" | "className" | "htmlHandling" | "profile" | "extensions">;
  readonly htmlHandling?: MarkdownHtmlHandlingMode;
  readonly profile?: MarkdownProfileId;
  readonly extensions?: readonly MarkdownOptionalProfileId[];
}
