import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import { renderMarkdownToHtmlDocumentSync } from "@mdwrk/markdown-renderer-core/html";
export function renderMarkdownToStaticHtml(props) {
    const { markdown, htmlHandling, profile = "gfm-default", extensions, sourcePositionAttributes, preserveSoftLineBreaks, getLinkAttributes } = props;
    return renderMarkdownToHtmlSync(markdown, {
        htmlHandling,
        profile,
        extensions,
        sourcePositionAttributes,
        preserveSoftLineBreaks,
        getLinkAttributes,
    });
}
export function renderMarkdownToStaticHtmlDocument(props) {
    const { title, lang, dataTheme, bodyClassName, htmlClassName, stylesheets, markdown, htmlHandling, profile = "gfm-default", extensions, sourcePositionAttributes, preserveSoftLineBreaks, getLinkAttributes } = props;
    return renderMarkdownToHtmlDocumentSync(markdown, {
        title,
        lang,
        dataTheme,
        bodyClassName,
        htmlClassName,
        stylesheets,
        htmlHandling,
        profile,
        extensions,
        sourcePositionAttributes,
        preserveSoftLineBreaks,
        getLinkAttributes,
    });
}
//# sourceMappingURL=server.js.map
