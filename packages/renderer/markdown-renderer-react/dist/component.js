import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkSupersub from "remark-supersub";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES } from "@mdwrk/markdown-renderer-core/class-names";
import { slugifyHeading } from "@mdwrk/markdown-renderer-core/slug";
import { createMarkdownRendererThemeStyle } from "./theme.js";
const mergeClassNames = (...values) => values.filter(Boolean).join(" ");
function getDefaultLinkAttributes(href) {
    if (href && /^(https?:)?\/\//i.test(href)) {
        return { target: "_blank", rel: "noopener noreferrer" };
    }
    return undefined;
}
export function MarkdownRenderer({ markdown, className, style, themeStyle, onLinkClick, getLinkAttributes, components, syntaxTheme, }) {
    const rendererStyle = themeStyle ?? createMarkdownRendererThemeStyle();
    return (_jsx("div", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.root, className), style: { ...rendererStyle, ...style }, children: _jsx(ReactMarkdown, { remarkPlugins: [remarkGfm, remarkSupersub], components: {
                h1: ({ node, children, ...props }) => _jsx("h1", { id: slugifyHeading(String(children)), className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading1, ...props, children: children }),
                h2: ({ node, children, ...props }) => _jsx("h2", { id: slugifyHeading(String(children)), className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading2, ...props, children: children }),
                h3: ({ node, children, ...props }) => _jsx("h3", { id: slugifyHeading(String(children)), className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading3, ...props, children: children }),
                h4: ({ node, children, ...props }) => _jsx("h4", { id: slugifyHeading(String(children)), className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading4, ...props, children: children }),
                h5: ({ node, children, ...props }) => _jsx("h5", { id: slugifyHeading(String(children)), className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading5, ...props, children: children }),
                h6: ({ node, children, ...props }) => _jsx("h6", { id: slugifyHeading(String(children)), className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.heading6, ...props, children: children }),
                p: ({ node, ...props }) => _jsx("p", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.paragraph, ...props }),
                strong: ({ node, ...props }) => _jsx("strong", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.strong, ...props }),
                em: ({ node, ...props }) => _jsx("em", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.emphasis, ...props }),
                hr: ({ node, ...props }) => _jsx("hr", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.hr, ...props }),
                blockquote: ({ node, ...props }) => _jsx("blockquote", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.blockquote, ...props }),
                ul: ({ node, ...props }) => _jsx("ul", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.listUnordered, ...props }),
                ol: ({ node, ...props }) => _jsx("ol", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.listOrdered, ...props }),
                li: ({ node, ...props }) => {
                    const isTask = typeof node?.checked === "boolean";
                    return (_jsx("li", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.listItem, isTask ? DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.taskListItem : undefined), "data-checked": isTask ? String(node.checked) : undefined, ...props }));
                },
                table: ({ node, className, ...props }) => (_jsx("table", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.table, className), ...props })),
                thead: ({ node, className, ...props }) => (_jsx("thead", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableHead, className), ...props })),
                tbody: ({ node, className, ...props }) => (_jsx("tbody", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableBody, className), ...props })),
                tr: ({ node, className, ...props }) => (_jsx("tr", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableRow, className), ...props })),
                th: ({ node, className, ...props }) => (_jsx("th", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableHeader, className), ...props })),
                td: ({ node, className, ...props }) => (_jsx("td", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableCell, className), ...props })),
                caption: ({ node, className, ...props }) => (_jsx("caption", { className: mergeClassNames(DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.tableCaption, className), ...props })),
                input: ({ node, ...props }) => {
                    if (props.type === "checkbox") {
                        return _jsx("input", { type: "checkbox", className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.checkbox, ...props });
                    }
                    return _jsx("input", { ...props });
                },
                a: ({ node, href, ...props }) => {
                    const attributes = getLinkAttributes?.(href) ?? getDefaultLinkAttributes(href);
                    return (_jsx("a", { href: href, onClick: (event) => onLinkClick?.(event, href), target: attributes?.target, rel: attributes?.rel, className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.link, ...props }));
                },
                code: ({ node, inline, className, children, ...props }) => {
                    const match = /language-([\w-]+)/.exec(className || "");
                    if (!inline && match) {
                        return (_jsxs("div", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.codeBlock, children: [_jsx("div", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.codeHeader, children: match[1] }), _jsx("div", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.codeSurface, children: _jsx(SyntaxHighlighter, { style: syntaxTheme ?? {}, language: match[1], PreTag: "div", customStyle: {
                                            margin: 0,
                                            borderRadius: 0,
                                            border: "none",
                                            background: "transparent",
                                            padding: 0,
                                        }, ...props, children: String(children).replace(/\n$/, "") }) })] }));
                    }
                    return (_jsx("code", { className: DEFAULT_MARKDOWN_RENDERER_CLASS_NAMES.inlineCode, ...props, children: children }));
                },
                ...components,
            }, children: markdown }) }));
}
//# sourceMappingURL=component.js.map