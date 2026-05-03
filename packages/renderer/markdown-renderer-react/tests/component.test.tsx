// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MarkdownRenderer } from "../src/component.js";
import { createMarkdownRendererThemeStyle } from "../src/theme.js";
import { renderMarkdownToStaticHtml, renderMarkdownToStaticHtmlDocument } from "../src/server.js";

describe("@mdwrk/markdown-renderer-react", () => {
  it("renders markdown headings and paragraphs", () => {
    render(<MarkdownRenderer markdown={`# Title\n\nParagraph`} />);
    expect(screen.getByText("Title")).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
  });

  it("supports link interception", () => {
    let clicked = "";
    render(
      <MarkdownRenderer
        markdown="[Doc](README.md)"
        onLinkClick={(_, href) => {
          clicked = href ?? "";
        }}
      />,
    );
    screen.getByRole("link", { name: "Doc" }).click();
    expect(clicked).toBe("README.md");
  });

  it("creates a theme style bridge", () => {
    const style = createMarkdownRendererThemeStyle({ foreground: "#fff", accent: "#09f" });
    expect(style["--mw-fg-primary" as any]).toBe("#fff");
    expect(style["--mw-accent" as any]).toBe("#09f");
  });

  it("renders static html", () => {
    const html = renderMarkdownToStaticHtml({ markdown: "# Static" });
    expect(html).toContain("markdown-body");
    expect(html).toContain("Static");
  });

  it("renders static html documents", () => {
    const html = renderMarkdownToStaticHtmlDocument({
      markdown: "# Export",
      title: "Export",
      bodyClassName: "markdown-export",
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("markdown-export");
  });

  it("renders default GFM features in the React surface", () => {
    render(
      <MarkdownRenderer
        markdown={[
          "~~done~~",
          "",
          "- [x] checked",
          "",
          "| A | B |",
          "| --- | --- |",
          "| 1 | https://example.com |",
        ].join("\n")}
      />,
    );

    expect(screen.getByText("done").tagName.toLowerCase()).toBe("del");
    expect(screen.getByRole("checkbox")).toBeDisabled();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "https://example.com" })).toHaveAttribute("href", "https://example.com");
  });

  it("renders syntax token markup for fenced code blocks", () => {
    const { container } = render(<MarkdownRenderer markdown={"```ts\nconst value = 1;\n```"} />);

    expect(container.querySelector("code.language-ts")).toBeInTheDocument();
    expect(container.querySelector(".token.keyword")).toHaveTextContent("const");
    expect(container.querySelector(".token.number")).toHaveTextContent("1");
  });

});
