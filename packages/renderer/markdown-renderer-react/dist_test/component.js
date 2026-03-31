import React from "react";
import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import { createMarkdownRendererThemeStyle } from "./theme.js";
const mergeClassNames = (...values) => values.filter(Boolean).join(" ");
function handleAnchorClickFactory(onLinkClick) {
    return function handleClick(event) {
        if (!onLinkClick)
            return;
        const target = event.target;
        if (!target || typeof target.closest !== "function")
            return;
        const anchor = target.closest("a");
        if (!anchor)
            return;
        onLinkClick(event, anchor.getAttribute("href") ?? undefined);
    };
}
export function MarkdownRenderer({ markdown, className, style, themeStyle, onLinkClick, getLinkAttributes, components: _components, syntaxTheme: _syntaxTheme, htmlHandling = "escape", profile = "gfm-default", extensions, sourcePositionAttributes = false, }) {
    const rendererStyle = themeStyle ?? createMarkdownRendererThemeStyle();
    const html = React.useMemo(() => renderMarkdownToHtmlSync(markdown, {
        htmlHandling,
        profile,
        extensions,
        sourcePositionAttributes,
        getLinkAttributes,
    }), [markdown, htmlHandling, profile, extensions, sourcePositionAttributes, getLinkAttributes]);
    return React.createElement("div", {
        className: mergeClassNames("markdown-renderer-host", className),
        style: { ...rendererStyle, ...style },
        onClick: handleAnchorClickFactory(onLinkClick),
        dangerouslySetInnerHTML: { __html: html },
    });
}
//# sourceMappingURL=component.js.map