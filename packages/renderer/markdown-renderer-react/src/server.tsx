import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import { renderMarkdownToHtmlDocumentSync } from "@mdwrk/markdown-renderer-core/html";
import type { RenderMarkdownToStaticHtmlDocumentProps, RenderMarkdownToStaticHtmlProps } from "./types.js";

export function renderMarkdownToStaticHtml(props: RenderMarkdownToStaticHtmlProps): string {
  const { markdown, htmlHandling, profile = "gfm-default", extensions, sourcePositionAttributes, getLinkAttributes } = props;
  return renderMarkdownToHtmlSync(markdown, {
    htmlHandling,
    profile,
    extensions,
    sourcePositionAttributes,
    getLinkAttributes,
  });
}

export function renderMarkdownToStaticHtmlDocument(props: RenderMarkdownToStaticHtmlDocumentProps): string {
  const { title, lang, dataTheme, bodyClassName, htmlClassName, stylesheets, markdown, htmlHandling, profile = "gfm-default", extensions, sourcePositionAttributes, getLinkAttributes } = props;
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
    getLinkAttributes,
  });
}
