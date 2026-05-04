import React from "react";
import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import { createMarkdownEditInRendererThemeStyle } from "./theme.js";
import type {
  MarkdownEditInRendererHandle,
  MarkdownEditInRendererProps,
} from "./types.js";

const mergeClassNames = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

function createTrailingBlankLineSpacers(markdown: string): string {
  const trailingNewlines = markdown.match(/\n+$/)?.[0].length ?? 0;
  return Array.from({ length: trailingNewlines }, () => (
    '<div class="markdown-edit-in-renderer-blank-line" aria-hidden="true"></div>'
  )).join("");
}

function createBlankMarkdownSpacers(markdown: string): string {
  const blankLineCount = markdown.length === 0 ? 0 : markdown.split("\n").length;
  return Array.from({ length: blankLineCount }, () => (
    '<div class="markdown-edit-in-renderer-blank-line" aria-hidden="true"></div>'
  )).join("");
}

export const MarkdownEditInRenderer = React.forwardRef<MarkdownEditInRendererHandle, MarkdownEditInRendererProps>(
  function MarkdownEditInRenderer(
    {
      value,
      defaultValue,
      documentKey,
      onChange,
      className,
      style,
      themeStyle,
      themeVariables,
      surfaceClassName,
      autoFocus = false,
      placeholder = "Start typing...",
      spellCheck = false,
      disabled = false,
      rendererProps,
      htmlHandling = "escape",
      profile = "gfm-default",
      extensions,
    },
    ref,
  ) {
    const isControlled = value !== undefined;
    const initialValue = React.useMemo(() => value ?? defaultValue ?? "", []);
    const [draftValue, setDraftValue] = React.useState(initialValue);
    const inputRef = React.useRef<HTMLTextAreaElement>(null);
    const valueRef = React.useRef(draftValue);

    const markdown = isControlled ? (value ?? "") : draftValue;
    const renderOptions = React.useMemo(
      () => ({
        htmlHandling,
        profile,
        extensions,
        sourcePositionAttributes: rendererProps?.sourcePositionAttributes,
        preserveSoftLineBreaks: rendererProps?.preserveSoftLineBreaks,
        getLinkAttributes: rendererProps?.getLinkAttributes,
      }),
      [
        htmlHandling,
        profile,
        extensions,
        rendererProps?.sourcePositionAttributes,
        rendererProps?.preserveSoftLineBreaks,
        rendererProps?.getLinkAttributes,
      ],
    );
    const renderedHtml = React.useMemo(
      () => (
        markdown.trim() === ""
          ? createBlankMarkdownSpacers(markdown)
          : `${renderMarkdownToHtmlSync(markdown, renderOptions)}${createTrailingBlankLineSpacers(markdown)}`
      ),
      [markdown, renderOptions],
    );

    React.useEffect(() => {
      valueRef.current = markdown;
    }, [markdown]);

    const commitValue = React.useCallback((nextValue: string) => {
      valueRef.current = nextValue;
      if (!isControlled) {
        setDraftValue(nextValue);
      }
      onChange?.(nextValue);
    }, [isControlled, onChange]);

    React.useEffect(() => {
      if (!autoFocus || disabled) return;
      inputRef.current?.focus();
    }, [autoFocus, disabled]);

    React.useImperativeHandle(ref, () => ({
      focus(): void {
        inputRef.current?.focus();
      },
      getValue(): string {
        return valueRef.current;
      },
      getInputElement(): HTMLTextAreaElement | null {
        return inputRef.current;
      },
      setValue(nextValue: string): void {
        commitValue(nextValue);
      },
    }), [commitValue]);

    const mergedThemeStyle = React.useMemo(
      () => ({
        ...createMarkdownEditInRendererThemeStyle(themeVariables),
        ...themeStyle,
        ...style,
      }),
      [style, themeStyle, themeVariables],
    );

    return (
      <div
        className={mergeClassNames("markdown-edit-in-renderer-host", className)}
        style={mergedThemeStyle}
        data-document-key={documentKey}
        data-testid="markdown-edit-in-renderer"
      >
        <div
          className={mergeClassNames("markdown-edit-in-renderer-surface markdown-body", surfaceClassName)}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
        <textarea
          ref={inputRef}
          className="markdown-edit-in-renderer-plaintext"
          value={markdown}
          onChange={(event) => commitValue(event.currentTarget.value)}
          aria-label="Markdown source"
          aria-multiline="true"
          data-placeholder={placeholder}
          spellCheck={spellCheck}
          disabled={disabled}
          placeholder={placeholder}
        />
      </div>
    );
  },
);
