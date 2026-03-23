import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createHtmlDocument } from "@markdown-workspace/markdown-renderer-core/html";
import { MarkdownRenderer } from "./component.js";
import type { MarkdownRendererProps } from "./types.js";

export function renderMarkdownToStaticHtml(props: MarkdownRendererProps): string {
  return renderToStaticMarkup(<MarkdownRenderer {...props} />);
}

export function renderMarkdownToStaticHtmlDocument(
  props: MarkdownRendererProps & {
    readonly title: string;
    readonly lang?: string;
    readonly dataTheme?: string;
    readonly bodyClassName?: string;
    readonly htmlClassName?: string;
    readonly stylesheets?: readonly string[];
  },
): string {
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
