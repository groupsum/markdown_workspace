import React from "react";
import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import {
  getProjectedCaret,
  plaintextOffsetFromRenderedPoint,
  projectMarkdownState,
  type PlaintextSelection,
  type ProjectionRect,
  type RenderedCaret,
} from "./projection.js";
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
    const surfaceRef = React.useRef<HTMLDivElement>(null);
    const valueRef = React.useRef(draftValue);
    const selectionRef = React.useRef<PlaintextSelection>({ start: 0, end: 0 });
    const [caret, setCaret] = React.useState<RenderedCaret>(() => ({
      ...getProjectedCaret(initialValue, 0),
      visible: false,
      left: 0,
      top: 0,
      height: 16,
    }));

    const markdown = isControlled ? (value ?? "") : draftValue;
    const renderOptions = React.useMemo(
      () => ({
        htmlHandling,
        profile,
        extensions,
        sourcePositionAttributes: rendererProps?.sourcePositionAttributes,
        preserveSoftLineBreaks: rendererProps?.preserveSoftLineBreaks ?? true,
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

    const trackPlaintextSelection = React.useCallback((input: HTMLTextAreaElement) => {
      const length = input.value.length;
      selectionRef.current = {
        start: Math.max(0, Math.min(input.selectionStart ?? 0, length)),
        end: Math.max(0, Math.min(input.selectionEnd ?? input.selectionStart ?? 0, length)),
      };
    }, []);

    const restoreTrackedPlaintextSelection = React.useCallback((input: HTMLTextAreaElement) => {
      const length = input.value.length;
      const start = Math.max(0, Math.min(selectionRef.current.start, length));
      const end = Math.max(0, Math.min(selectionRef.current.end, length));
      selectionRef.current = { start, end };
      if (document.activeElement === input && (input.selectionStart !== start || input.selectionEnd !== end)) {
        input.setSelectionRange(start, end);
      }
      return selectionRef.current;
    }, []);

    const updateRenderedCaret = React.useCallback(() => {
      const input = inputRef.current;
      const surface = surfaceRef.current;
      if (!input || !surface) return;

      const selection = restoreTrackedPlaintextSelection(input);
      const projectedCaret = getProjectedCaret(input.value, selection.start);
      const contentRoot = surface.querySelector<HTMLElement>(".markdown-body") ?? surface;
      const renderedBlocks = Array.from(contentRoot.children).filter((child) => (
        child instanceof HTMLElement
          && !child.classList.contains("markdown-edit-in-renderer-blank-line")
      ));
      const blankLines = Array.from(contentRoot.querySelectorAll<HTMLElement>(".markdown-edit-in-renderer-blank-line"));
      const block = renderedBlocks[projectedCaret.blockIndex] as HTMLElement | undefined;
      const target = projectedCaret.isBlankLine ? blankLines[projectedCaret.blankLineIndex] : block;

      if (!target) {
        setCaret((previousCaret) => ({
          ...previousCaret,
          ...projectedCaret,
          visible: document.activeElement === input && !disabled,
        }));
        return;
      }

      const textTarget = findTextNode(target, projectedCaret.renderedLineInBlock, projectedCaret.renderedChar - 1);
      const range = document.createRange();

      if (textTarget) {
        const maxOffset = textTarget.node.nodeType === textTarget.node.ownerDocument?.defaultView?.Node.TEXT_NODE
          ? textTarget.node.textContent?.length ?? 0
          : textTarget.node.childNodes.length;
        range.setStart(
          textTarget.node,
          Math.min(textTarget.offset, maxOffset),
        );
      } else {
        range.selectNodeContents(target);
        range.collapse(false);
      }
      range.collapse(true);

      const surfaceRect = surface.getBoundingClientRect();
      const rangeRect = typeof range.getBoundingClientRect === "function"
        ? range.getBoundingClientRect()
        : { left: 0, top: 0, width: 0, height: 0 };
      const fallbackRect = target.getBoundingClientRect();
      const left = (rangeRect.width || rangeRect.height)
        ? rangeRect.left - surfaceRect.left + surface.scrollLeft
        : fallbackRect.left - surfaceRect.left + surface.scrollLeft;
      const top = (rangeRect.width || rangeRect.height)
        ? rangeRect.top - surfaceRect.top + surface.scrollTop
        : fallbackRect.top - surfaceRect.top + surface.scrollTop;
      const height = rangeRect.height || fallbackRect.height || 16;

      setCaret({
        ...projectedCaret,
        visible: document.activeElement === input && !disabled,
        left,
        top,
        height,
      });
    }, [disabled, restoreTrackedPlaintextSelection]);

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

    React.useLayoutEffect(() => {
      updateRenderedCaret();
    }, [markdown, renderedHtml, updateRenderedCaret]);

    return (
      <div
        className={mergeClassNames("markdown-edit-in-renderer-host", className)}
        style={mergedThemeStyle}
        data-document-key={documentKey}
        data-testid="markdown-edit-in-renderer"
      >
        <div
          ref={surfaceRef}
          className={mergeClassNames("markdown-edit-in-renderer-surface markdown-body", surfaceClassName)}
          aria-hidden="true"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
        <span
          className="markdown-edit-in-renderer-caret"
          data-visible={caret.visible ? "true" : "false"}
          data-plaintext-line={caret.plaintextLine}
          data-plaintext-char={caret.plaintextChar}
          data-rendered-line={caret.renderedLine}
          data-rendered-char={caret.renderedChar}
          data-rendered-line-in-block={caret.renderedLineInBlock}
          aria-hidden="true"
          style={{
            left: `${caret.left}px`,
            top: `${caret.top}px`,
            height: `${caret.height}px`,
          }}
        />
        <textarea
          ref={inputRef}
          className="markdown-edit-in-renderer-plaintext"
          value={markdown}
          onChange={(event) => {
            trackPlaintextSelection(event.currentTarget);
            commitValue(event.currentTarget.value);
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onFocus={() => {
            const input = inputRef.current;
            if (input) {
              trackPlaintextSelection(input);
            }
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onBlur={() => {
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onSelect={(event) => {
            trackPlaintextSelection(event.currentTarget);
            updateRenderedCaret();
          }}
          onKeyUp={(event) => {
            trackPlaintextSelection(event.currentTarget);
            updateRenderedCaret();
          }}
          onMouseUp={(event) => {
            trackPlaintextSelection(event.currentTarget);
            updateRenderedCaret();
          }}
          onScroll={updateRenderedCaret}
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
