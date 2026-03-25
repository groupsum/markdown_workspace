import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createHtmlDocument } from "@mdwrk/markdown-renderer-core/html";
import { MarkdownRenderer } from "./component.js";
export function renderMarkdownToStaticHtml(props) {
    return renderToStaticMarkup(_jsx(MarkdownRenderer, { ...props }));
}
export function renderMarkdownToStaticHtmlDocument(props) {
    const { title, lang, dataTheme, bodyClassName, htmlClassName, stylesheets, ...rendererProps } = props;
    return createHtmlDocument({
        title,
        bodyHtml: renderMarkdownToStaticHtml(rendererProps),
        lang,
        dataTheme,
        bodyClassName,
        htmlClassName,
        stylesheets,
    });
}
//# sourceMappingURL=server.js.map