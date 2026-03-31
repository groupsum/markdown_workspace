import React from "react";
import { renderMarkdownToHtmlSync } from "@mdwrk/markdown-renderer-core";
import { createMarkdownRendererThemeStyle } from "./theme.js";
import type { MarkdownRendererProps } from "./types.js";

const mergeClassNames = (...values: Array<string | undefined>) => values.filter(Boolean).join(" ");

function handleAnchorClickFactory(onLinkClick: MarkdownRendererProps["onLinkClick"]) {
  return function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (!onLinkClick) return;
    const target = event.target as HTMLElement | null;
    if (!target || typeof target.closest !== "function") return;
    const anchor = target.closest("a") as HTMLAnchorElement | null;
    if (!anchor) return;
    onLinkClick(event as unknown as React.MouseEvent<HTMLAnchorElement>, anchor.getAttribute("href") ?? undefined);
  };
}

export function MarkdownRenderer({
  markdown,
  className,
  style,
  themeStyle,
  onLinkClick,
  getLinkAttributes,
  components: _components,
  syntaxTheme: _syntaxTheme,
  htmlHandling = "escape",
  profile = "gfm-default",
  extensions,
  sourcePositionAttributes = false,
}: MarkdownRendererProps): React.JSX.Element {
  const rendererStyle = themeStyle ?? createMarkdownRendererThemeStyle();
  const html = React.useMemo(
    () => renderMarkdownToHtmlSync(markdown, {
      htmlHandling,
      profile,
      extensions,
      sourcePositionAttributes,
      getLinkAttributes,
    }),
    [markdown, htmlHandling, profile, extensions, sourcePositionAttributes, getLinkAttributes],
  );

  return React.createElement("div", {
    className: mergeClassNames("markdown-renderer-host", className),
    style: { ...rendererStyle, ...style },
    onClick: handleAnchorClickFactory(onLinkClick),
    dangerouslySetInnerHTML: { __html: html },
  });
}
