import React from "react";
import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import { createMarkdownEditInRendererThemeStyle } from "./theme.js";
import type {
  MarkdownEditInRendererHandle,
  MarkdownEditInRendererProps,
} from "./types.js";

const mergeClassNames = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

function normalizeEditableText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd();
}

function normalizeMarkdownBlock(value: string): string {
  return normalizeEditableText(value)
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trim();
}

function childText(element: Element): string {
  return normalizeMarkdownBlock(element.textContent ?? "");
}

function tableToMarkdown(table: HTMLTableElement): string {
  const rows = Array.from(table.querySelectorAll("tr"))
    .map((row) => Array.from(row.querySelectorAll("th, td")).map((cell) => childText(cell)))
    .filter((cells) => cells.length > 0);

  if (rows.length === 0) return "";

  const header = rows[0];
  const divider = header.map(() => "---");
  const body = rows.slice(1);
  return [header, divider, ...body]
    .map((cells) => `| ${cells.join(" | ")} |`)
    .join("\n");
}

function listToMarkdown(list: HTMLOListElement | HTMLUListElement): string {
  const ordered = list.tagName.toLowerCase() === "ol";
  return Array.from(list.children)
    .filter((child): child is HTMLLIElement => child.tagName.toLowerCase() === "li")
    .map((item, index) => `${ordered ? `${index + 1}.` : "-"} ${childText(item)}`)
    .join("\n");
}

function blockquoteToMarkdown(element: Element): string {
  return childText(element)
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");
}

function elementToMarkdown(element: Element): string {
  const tagName = element.tagName.toLowerCase();
  const text = childText(element);

  switch (tagName) {
    case "h1":
      return text ? `# ${text}` : "";
    case "h2":
      return text ? `## ${text}` : "";
    case "h3":
      return text ? `### ${text}` : "";
    case "h4":
      return text ? `#### ${text}` : "";
    case "h5":
      return text ? `##### ${text}` : "";
    case "h6":
      return text ? `###### ${text}` : "";
    case "blockquote":
      return blockquoteToMarkdown(element);
    case "pre": {
      const code = element.querySelector("code")?.textContent ?? element.textContent ?? "";
      return `\`\`\`\n${normalizeEditableText(code)}\n\`\`\``;
    }
    case "ul":
    case "ol":
      return listToMarkdown(element as HTMLOListElement | HTMLUListElement);
    case "table":
      return tableToMarkdown(element as HTMLTableElement);
    case "hr":
      return "---";
    case "p":
    case "div":
      return text;
    default:
      return text;
  }
}

function editableDomToMarkdown(root: HTMLElement): string {
  const renderedRoot = root.classList.contains("markdown-body")
    ? root
    : root.querySelector<HTMLElement>(".markdown-body") ?? root;
  const blocks = Array.from(renderedRoot.children)
    .map((child) => elementToMarkdown(child))
    .filter(Boolean);

  return normalizeEditableText(blocks.length > 0 ? blocks.join("\n\n") : renderedRoot.innerText);
}

function focusEditableEnd(element: HTMLElement): void {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
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
    const surfaceRef = React.useRef<HTMLDivElement>(null);
    const valueRef = React.useRef(draftValue);
    const lastInputValueRef = React.useRef<string | null>(null);

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
      () => renderMarkdownToHtmlSync(markdown || placeholder, renderOptions),
      [markdown, placeholder, renderOptions],
    );

    React.useEffect(() => {
      valueRef.current = markdown;
    }, [markdown]);

    React.useLayoutEffect(() => {
      const surface = surfaceRef.current;
      if (!surface) return;
      if (surface.innerHTML !== renderedHtml) {
        surface.innerHTML = renderedHtml;
      }
    }, [documentKey, markdown, renderedHtml]);

    const commitValue = React.useCallback((nextValue: string) => {
      valueRef.current = nextValue;
      lastInputValueRef.current = nextValue;
      if (!isControlled) {
        setDraftValue(nextValue);
      }
      onChange?.(nextValue);
    }, [isControlled, onChange]);

    React.useEffect(() => {
      if (!autoFocus || disabled) return;
      surfaceRef.current?.focus();
    }, [autoFocus, disabled]);

    React.useImperativeHandle(ref, () => ({
      focus(): void {
        surfaceRef.current?.focus();
      },
      getValue(): string {
        return valueRef.current;
      },
      getInputElement(): HTMLDivElement | null {
        return surfaceRef.current;
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
        data-testid="markdown-edit-in-renderer"
      >
        <div
          ref={surfaceRef}
          className={mergeClassNames("markdown-edit-in-renderer-surface markdown-body", surfaceClassName)}
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-disabled={disabled ? "true" : undefined}
          data-placeholder={placeholder}
          spellCheck={spellCheck}
          tabIndex={disabled ? undefined : 0}
          onInput={(event) => {
            const nextValue = editableDomToMarkdown(event.currentTarget);
            commitValue(nextValue);
            const nextHtml = renderMarkdownToHtmlSync(nextValue || placeholder, renderOptions);
            if (event.currentTarget.innerHTML !== nextHtml) {
              event.currentTarget.innerHTML = nextHtml;
              focusEditableEnd(event.currentTarget);
            }
          }}
          onPaste={(event) => {
            event.preventDefault();
            const text = event.clipboardData.getData("text/plain");
            document.execCommand("insertText", false, text);
          }}
        />
      </div>
    );
  },
);
