
import { renderMarkdownToHtml, renderMarkdownToHtmlSync } from "./pipeline.js";

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function createHtmlDocument(options) {
  const title = escapeHtml(options.title);
  const lang = options.lang ?? "en";
  const htmlClassName = options.htmlClassName ? ` class="${escapeHtml(options.htmlClassName)}"` : "";
  const dataTheme = options.dataTheme ? ` data-theme="${escapeHtml(options.dataTheme)}"` : "";
  const bodyClassName = options.bodyClassName ? ` class="${escapeHtml(options.bodyClassName)}"` : "";
  const stylesheets = options.stylesheets?.length
    ? `<style>\n${options.stylesheets.join("\n")}\n</style>`
    : "";

  return [
    "<!DOCTYPE html>",
    `<html lang="${escapeHtml(lang)}"${dataTheme}${htmlClassName}>`,
    "<head>",
    "  <meta charset=\"UTF-8\" />",
    "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />",
    `  <title>${title}</title>`,
    stylesheets,
    "</head>",
    `<body${bodyClassName}>`,
    options.bodyHtml,
    "</body>",
    "</html>",
  ].filter(Boolean).join("\n");
}

export async function renderMarkdownToHtmlDocument(markdown, options) {
  const bodyHtml = await renderMarkdownToHtml(markdown, options);
  return createHtmlDocument({
    title: options.title,
    bodyHtml,
    lang: options.lang,
    dataTheme: options.dataTheme,
    htmlClassName: options.htmlClassName,
    bodyClassName: options.bodyClassName,
    stylesheets: options.stylesheets,
  });
}

export function renderMarkdownToHtmlDocumentSync(markdown, options) {
  const bodyHtml = renderMarkdownToHtmlSync(markdown, options);
  return createHtmlDocument({
    title: options.title,
    bodyHtml,
    lang: options.lang,
    dataTheme: options.dataTheme,
    htmlClassName: options.htmlClassName,
    bodyClassName: options.bodyClassName,
    stylesheets: options.stylesheets,
  });
}
