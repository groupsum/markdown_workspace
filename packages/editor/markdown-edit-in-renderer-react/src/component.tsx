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
    const isComposingRef = React.useRef(false);
    const [caret, setCaret] = React.useState<RenderedCaret>(() => ({
      ...getProjectedCaret(initialValue, 0),
      visible: false,
      left: 0,
      top: 0,
      height: 16,
      confidence: "nearest",
    }));
    const [selectionRects, setSelectionRects] = React.useState<readonly ProjectionRect[]>([]);
    const [compositionRects, setCompositionRects] = React.useState<readonly ProjectionRect[]>([]);
    const [isComposing, setIsComposing] = React.useState(false);

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
      if (!isComposingRef.current && document.activeElement === input && (input.selectionStart !== start || input.selectionEnd !== end)) {
        input.setSelectionRange(start, end);
      }
      return selectionRef.current;
    }, []);

    const updateRenderedCaret = React.useCallback(() => {
      const input = inputRef.current;
      const surface = surfaceRef.current;
      if (!input || !surface) return;

      const selection = restoreTrackedPlaintextSelection(input);
      const visible = document.activeElement === input && !disabled;
      setCaret((previousCaret) => {
        const projection = projectMarkdownState(surface, input.value, selection, previousCaret, visible);
        setSelectionRects(projection.selectionRects);
        if (isComposingRef.current) {
          setCompositionRects(projection.selectionRects.length > 0 ? projection.selectionRects : [{
            left: projection.caret.left,
            top: projection.caret.top + projection.caret.height - 2,
            width: 8,
            height: 2,
          }]);
        } else {
          setCompositionRects([]);
        }
        return projection.caret;
      });
    }, [disabled, restoreTrackedPlaintextSelection]);

    const setTextareaSelection = React.useCallback((start: number, end = start) => {
      const input = inputRef.current;
      if (!input) return;
      const length = input.value.length;
      const nextSelection = {
        start: Math.max(0, Math.min(start, length)),
        end: Math.max(0, Math.min(end, length)),
      };
      selectionRef.current = nextSelection;
      input.focus();
      input.setSelectionRange(nextSelection.start, nextSelection.end);
      window.requestAnimationFrame(updateRenderedCaret);
    }, [updateRenderedCaret]);

    const updateSelectionFromPointer = React.useCallback((event: React.PointerEvent<HTMLTextAreaElement>, extendSelection: boolean) => {
      const surface = surfaceRef.current;
      const input = inputRef.current;
      if (!surface || !input || disabled) return;
      const offset = plaintextOffsetFromRenderedPoint(surface, input.value, event.clientX, event.clientY);
      if (extendSelection) {
        setTextareaSelection(selectionRef.current.start, offset);
      } else {
        setTextareaSelection(offset);
      }
    }, [disabled, setTextareaSelection]);

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
        <div className="markdown-edit-in-renderer-selection-layer" aria-hidden="true">
          {selectionRects.map((rect, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={`selection-${index}`}
              className="markdown-edit-in-renderer-selection"
              style={{
                left: `${rect.left}px`,
                top: `${rect.top}px`,
                width: `${rect.width}px`,
                height: `${rect.height}px`,
              }}
            />
          ))}
        </div>
        <div
          className="markdown-edit-in-renderer-composition-layer"
          data-active={isComposing ? "true" : "false"}
          aria-hidden="true"
        >
          {compositionRects.map((rect, index) => (
            <span
              // eslint-disable-next-line react/no-array-index-key
              key={`composition-${index}`}
              className="markdown-edit-in-renderer-composition"
              style={{
                left: `${rect.left}px`,
                top: `${rect.top + Math.max(0, rect.height - 2)}px`,
                width: `${Math.max(8, rect.width)}px`,
                height: "2px",
              }}
            />
          ))}
        </div>
        <span
          className="markdown-edit-in-renderer-caret"
          data-visible={caret.visible ? "true" : "false"}
          data-plaintext-line={caret.plaintextLine}
          data-plaintext-char={caret.plaintextChar}
          data-rendered-line={caret.renderedLine}
          data-rendered-char={caret.renderedChar}
          data-rendered-line-in-block={caret.renderedLineInBlock}
          data-projection-confidence={caret.confidence}
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
          onPointerDown={(event) => {
            updateSelectionFromPointer(event, event.shiftKey);
          }}
          onPointerMove={(event) => {
            if (event.buttons !== 1) return;
            updateSelectionFromPointer(event, true);
          }}
          onScroll={updateRenderedCaret}
          onCompositionStart={(event) => {
            isComposingRef.current = true;
            setIsComposing(true);
            trackPlaintextSelection(event.currentTarget);
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onCompositionUpdate={(event) => {
            isComposingRef.current = true;
            setIsComposing(true);
            trackPlaintextSelection(event.currentTarget);
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onCompositionEnd={(event) => {
            isComposingRef.current = false;
            setIsComposing(false);
            trackPlaintextSelection(event.currentTarget);
            window.requestAnimationFrame(updateRenderedCaret);
          }}
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
