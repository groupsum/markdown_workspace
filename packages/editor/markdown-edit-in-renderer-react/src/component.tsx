import React from "react";
import { MarkdownRenderer } from "@mdwrk/markdown-renderer-react";
import { MarkdownSourceEditor } from "@mdwrk/markdown-editor-react";
import type { MarkdownSourceEditorHandle } from "@mdwrk/markdown-editor-react";
import {
  replaceMarkdownEditBlock,
  splitMarkdownEditBlocks,
} from "./blocks.js";
import type { MarkdownEditBlock } from "./blocks.js";
import { createMarkdownEditInRendererThemeStyle } from "./theme.js";
import type {
  MarkdownEditInRendererHandle,
  MarkdownEditInRendererProps,
} from "./types.js";

const mergeClassNames = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

export const MarkdownEditInRenderer = React.forwardRef<MarkdownEditInRendererHandle, MarkdownEditInRendererProps>(
  function MarkdownEditInRenderer(
    {
      value,
      defaultValue,
      documentKey,
      onChange,
      onActiveBlockChange,
      onRenderedBlockClick,
      className,
      style,
      themeStyle,
      themeVariables,
      blockClassName,
      activeBlockClassName,
      renderedBlockClassName,
      editorClassName,
      activation = "click",
      autoFocus = false,
      placeholder = "Start typing...",
      spellCheck = false,
      disabled = false,
      editorProps,
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
    const [activeOrdinal, setActiveOrdinal] = React.useState<number | null>(autoFocus ? 0 : null);
    const editorRef = React.useRef<MarkdownSourceEditorHandle>(null);
    const valueRef = React.useRef(draftValue);

    const markdown = isControlled ? (value ?? "") : draftValue;
    const blocks = React.useMemo(() => splitMarkdownEditBlocks(markdown), [markdown]);
    const activeBlock = activeOrdinal === null ? null : blocks[activeOrdinal] ?? null;

    React.useEffect(() => {
      valueRef.current = markdown;
    }, [markdown]);

    React.useEffect(() => {
      if (documentKey === undefined) return;
      setActiveOrdinal(autoFocus ? 0 : null);
    }, [autoFocus, documentKey]);

    React.useEffect(() => {
      onActiveBlockChange?.(activeBlock);
    }, [activeBlock, onActiveBlockChange]);

    const commitValue = React.useCallback((nextValue: string) => {
      valueRef.current = nextValue;
      if (!isControlled) {
        setDraftValue(nextValue);
      }
      onChange?.(nextValue);
    }, [isControlled, onChange]);

    const activateBlock = React.useCallback((blockOrdinal: number) => {
      if (disabled) return;
      setActiveOrdinal(Math.max(0, Math.min(blocks.length - 1, blockOrdinal)));
      requestAnimationFrame(() => editorRef.current?.focus());
    }, [blocks.length, disabled]);

    const deactivateBlock = React.useCallback(() => {
      setActiveOrdinal(null);
    }, []);

    React.useImperativeHandle(ref, () => ({
      focus(): void {
        if (activeOrdinal === null) {
          activateBlock(0);
          return;
        }
        editorRef.current?.focus();
      },
      activateBlock,
      deactivateBlock,
      getValue(): string {
        return valueRef.current;
      },
      getActiveBlock(): MarkdownEditBlock | null {
        return activeBlock;
      },
      getSourceEditor(): MarkdownSourceEditorHandle | null {
        return editorRef.current;
      },
    }), [activateBlock, activeBlock, activeOrdinal, deactivateBlock]);

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
        {blocks.map((block) => {
          const isActive = activeBlock?.ordinal === block.ordinal;
          const activate = (event: React.MouseEvent<HTMLDivElement>) => {
            onRenderedBlockClick?.(event, block);
            if (!event.defaultPrevented) {
              activateBlock(block.ordinal);
            }
          };

          return (
            <section
              key={block.id}
              className={mergeClassNames(
                "markdown-edit-in-renderer-block",
                blockClassName,
                isActive && "is-active",
                isActive && activeBlockClassName,
              )}
              data-block-ordinal={block.ordinal}
              data-active={isActive ? "true" : "false"}
            >
              {isActive ? (
                <MarkdownSourceEditor
                  ref={editorRef}
                  value={block.markdown}
                  documentKey={`${documentKey ?? "document"}:${block.ordinal}`}
                  onChange={(nextBlockMarkdown) => {
                    const nextValue = replaceMarkdownEditBlock(valueRef.current, block, nextBlockMarkdown);
                    commitValue(nextValue);
                  }}
                  className={mergeClassNames("markdown-edit-in-renderer-editor", editorClassName)}
                  placeholder={placeholder}
                  spellCheck={spellCheck}
                  disabled={disabled}
                  showLineNumbers={false}
                  {...editorProps}
                />
              ) : (
                <div
                  className={mergeClassNames("markdown-edit-in-renderer-rendered", renderedBlockClassName)}
                  role={disabled ? undefined : "button"}
                  tabIndex={disabled ? undefined : 0}
                  onClick={activation === "click" ? activate : undefined}
                  onDoubleClick={activation === "double-click" ? activate : undefined}
                  onFocus={activation === "focus" ? () => activateBlock(block.ordinal) : undefined}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      activateBlock(block.ordinal);
                    }
                  }}
                >
                  <MarkdownRenderer
                    markdown={block.markdown || "\u00a0"}
                    className="markdown-edit-in-renderer-renderer"
                    htmlHandling={htmlHandling}
                    profile={profile}
                    extensions={extensions}
                    {...rendererProps}
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>
    );
  },
);
