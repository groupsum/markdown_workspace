import React from "react";
import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import { createMarkdownEditInRendererThemeStyle } from "./theme.js";
import type {
  MarkdownEditInRendererHandle,
  MarkdownEditInRendererProps,
} from "./types.js";

const mergeClassNames = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

interface ProjectedCaret {
  readonly plaintextLine: number;
  readonly plaintextChar: number;
  readonly renderedLine: number;
  readonly renderedChar: number;
  readonly blockIndex: number;
}

interface RenderedCaret extends ProjectedCaret {
  readonly visible: boolean;
  readonly left: number;
  readonly top: number;
  readonly height: number;
}

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

function getLineStartOffsets(markdown: string): number[] {
  const offsets = [0];
  for (let index = 0; index < markdown.length; index += 1) {
    if (markdown[index] === "\n") {
      offsets.push(index + 1);
    }
  }
  return offsets;
}

function getRenderedCharForPlaintextLine(line: string, plaintextChar: number): number {
  const headingMatch = /^(#{1,6})([ \t]+)(.*)$/.exec(line);
  if (headingMatch) {
    return Math.max(0, plaintextChar - headingMatch[1].length - headingMatch[2].length);
  }

  const unorderedListMatch = /^([ \t]*)([-+*])([ \t]+)(.*)$/.exec(line);
  if (unorderedListMatch) {
    return Math.max(0, plaintextChar - unorderedListMatch[1].length - unorderedListMatch[2].length - unorderedListMatch[3].length);
  }

  const orderedListMatch = /^([ \t]*)(\d+\.)([ \t]+)(.*)$/.exec(line);
  if (orderedListMatch) {
    return Math.max(0, plaintextChar - orderedListMatch[1].length - orderedListMatch[2].length - orderedListMatch[3].length);
  }

  const blockquoteMatch = /^([ \t]*>)([ \t]?)(.*)$/.exec(line);
  if (blockquoteMatch) {
    return Math.max(0, plaintextChar - blockquoteMatch[1].length - blockquoteMatch[2].length);
  }

  return plaintextChar;
}

function getProjectedCaret(markdown: string, selectionStart: number): ProjectedCaret {
  const lines = markdown.split("\n");
  const lineStartOffsets = getLineStartOffsets(markdown);
  const offset = Math.max(0, Math.min(selectionStart, markdown.length));
  let lineIndex = lineStartOffsets.length - 1;

  for (let index = 0; index < lineStartOffsets.length; index += 1) {
    const nextStart = lineStartOffsets[index + 1] ?? Number.POSITIVE_INFINITY;
    if (offset >= lineStartOffsets[index] && offset < nextStart) {
      lineIndex = index;
      break;
    }
  }

  const line = lines[lineIndex] ?? "";
  const plaintextChar = offset - (lineStartOffsets[lineIndex] ?? 0);
  const blockIndex = lines.slice(0, lineIndex).filter((candidate) => candidate.trim() !== "").length;

  return {
    plaintextLine: lineIndex + 1,
    plaintextChar: plaintextChar + 1,
    renderedLine: line.trim() === "" ? lineIndex + 1 : blockIndex + 1,
    renderedChar: getRenderedCharForPlaintextLine(line, plaintextChar) + 1,
    blockIndex,
  };
}

function findTextNode(root: Node, offset: number): { node: Text; offset: number } | null {
  const ownerDocument = root.ownerDocument ?? document;
  const walker = ownerDocument.createTreeWalker(root, ownerDocument.defaultView?.NodeFilter.SHOW_TEXT ?? 4);
  let remaining = Math.max(0, offset);
  let current = walker.nextNode();
  let lastTextNode: Text | null = null;

  while (current) {
    const text = current.textContent ?? "";
    lastTextNode = current as Text;
    if (remaining <= text.length) {
      return { node: current as Text, offset: remaining };
    }
    remaining -= text.length;
    current = walker.nextNode();
  }

  if (lastTextNode) {
    return { node: lastTextNode, offset: lastTextNode.data.length };
  }

  return null;
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

    const updateRenderedCaret = React.useCallback(() => {
      const input = inputRef.current;
      const surface = surfaceRef.current;
      if (!input || !surface) return;

      const projectedCaret = getProjectedCaret(input.value, input.selectionStart ?? 0);
      const contentRoot = surface.querySelector<HTMLElement>(".markdown-body") ?? surface;
      const renderedBlocks = Array.from(contentRoot.children).filter((child) => (
        child instanceof HTMLElement
          && !child.classList.contains("markdown-edit-in-renderer-blank-line")
      ));
      const block = renderedBlocks[projectedCaret.blockIndex] as HTMLElement | undefined;
      const target = block ?? contentRoot.querySelector<HTMLElement>(".markdown-edit-in-renderer-blank-line") ?? contentRoot;
      const textTarget = findTextNode(target, projectedCaret.renderedChar - 1);
      const range = document.createRange();

      if (textTarget) {
        range.setStart(textTarget.node, Math.min(textTarget.offset, textTarget.node.data.length));
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
    }, [disabled]);

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
            commitValue(event.currentTarget.value);
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onFocus={() => {
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onBlur={() => {
            window.requestAnimationFrame(updateRenderedCaret);
          }}
          onSelect={updateRenderedCaret}
          onKeyUp={updateRenderedCaret}
          onMouseUp={updateRenderedCaret}
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
