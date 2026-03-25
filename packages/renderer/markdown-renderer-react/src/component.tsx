import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkSupersub from "remark-supersub";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES } from "@mdwrk/markdown-renderer-core/class-names";
import { slugifyHeading } from "@mdwrk/markdown-renderer-core/slug";
import { createMarkdownRendererThemeStyle } from "./theme.js";
import type { MarkdownRendererProps } from "./types.js";

const mergeClassNames = (...values: Array<string | undefined>) => values.filter(Boolean).join(" ");

function getDefaultLinkAttributes(href?: string) {
  if (href && /^(https?:)?\/\//i.test(href)) {
    return { target: "_blank", rel: "noopener noreferrer" } as const;
  }
  return undefined;
}

export function MarkdownRenderer({
  markdown,
  className,
  style,
  themeStyle,
  onLinkClick,
  getLinkAttributes,
  components,
  syntaxTheme,
}: MarkdownRendererProps): React.JSX.Element {
  const rendererStyle = themeStyle ?? createMarkdownRendererThemeStyle();

  return (
    <div className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.root, className)} style={{ ...rendererStyle, ...style }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkSupersub]}
        components={{
          h1: ({ node, children, ...props }) => <h1 id={slugifyHeading(String(children))} className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading1} {...props}>{children}</h1>,
          h2: ({ node, children, ...props }) => <h2 id={slugifyHeading(String(children))} className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading2} {...props}>{children}</h2>,
          h3: ({ node, children, ...props }) => <h3 id={slugifyHeading(String(children))} className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading3} {...props}>{children}</h3>,
          h4: ({ node, children, ...props }) => <h4 id={slugifyHeading(String(children))} className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading4} {...props}>{children}</h4>,
          h5: ({ node, children, ...props }) => <h5 id={slugifyHeading(String(children))} className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading5} {...props}>{children}</h5>,
          h6: ({ node, children, ...props }) => <h6 id={slugifyHeading(String(children))} className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading6} {...props}>{children}</h6>,
          p: ({ node, ...props }) => <p className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.paragraph} {...props} />,
          strong: ({ node, ...props }) => <strong className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.strong} {...props} />,
          em: ({ node, ...props }) => <em className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.emphasis} {...props} />,
          hr: ({ node, ...props }) => <hr className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.hr} {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.blockquote} {...props} />,
          ul: ({ node, ...props }) => <ul className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.listUnordered} {...props} />,
          ol: ({ node, ...props }) => <ol className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.listOrdered} {...props} />,
          li: ({ node, ...props }: any) => {
            const isTask = typeof node?.checked === "boolean";
            return (
              <li
                className={mergeClassNames(
                  DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.listItem,
                  isTask ? DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.taskListItem : undefined,
                )}
                data-checked={isTask ? String(node.checked) : undefined}
                {...props}
              />
            );
          },
          table: ({ node, className, ...props }: any) => (
            <table className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.table, className)} {...props} />
          ),
          thead: ({ node, className, ...props }: any) => (
            <thead className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableHead, className)} {...props} />
          ),
          tbody: ({ node, className, ...props }: any) => (
            <tbody className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableBody, className)} {...props} />
          ),
          tr: ({ node, className, ...props }: any) => (
            <tr className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableRow, className)} {...props} />
          ),
          th: ({ node, className, ...props }: any) => (
            <th className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableHeader, className)} {...props} />
          ),
          td: ({ node, className, ...props }: any) => (
            <td className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableCell, className)} {...props} />
          ),
          caption: ({ node, className, ...props }: any) => (
            <caption className={mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableCaption, className)} {...props} />
          ),
          input: ({ node, ...props }: any) => {
            if (props.type === "checkbox") {
              return <input type="checkbox" className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.checkbox} {...props} />;
            }
            return <input {...props} />;
          },
          a: ({ node, href, ...props }) => {
            const attributes = getLinkAttributes?.(href) ?? getDefaultLinkAttributes(href);
            return (
              <a
                href={href}
                onClick={(event) => onLinkClick?.(event, href)}
                target={attributes?.target}
                rel={attributes?.rel}
                className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.link}
                {...props}
              />
            );
          },
          code: ({ node, inline, className, children, ...props }: any) => {
            const match = /language-([\w-]+)/.exec(className || "");
            if (!inline && match) {
              return (
                <div className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.codeBlock}>
                  <div className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.codeHeader}>{match[1]}</div>
                  <div className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.codeSurface}>
                    <SyntaxHighlighter
                      style={syntaxTheme ?? {}}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        borderRadius: 0,
                        border: "none",
                        background: "transparent",
                        padding: 0,
                      }}
                      {...props}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </div>
                </div>
              );
            }
            return (
              <code className={DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.inlineCode} {...props}>
                {children}
              </code>
            );
          },
          ...components,
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
