import { describe, expect, it } from "vitest";
import {
  createHtmlDocument,
  extractMarkdownHeadings,
  parseMarkdownDocument,
  renderMarkdownToHtml,
  renderMarkdownToHtmlDocument,
} from "../src/index.js";

describe("@mdwrk/markdown-renderer-core", () => {
  it("parses frontmatter and headings", () => {
    const parsed = parseMarkdownDocument(`---\ntitle: Test\n---\n\n# Alpha\n\n## Beta\n\nParagraph`);
    expect(parsed.metadata.title).toBe("Test");
    expect(parsed.headings.map((heading) => heading.text)).toEqual(["Alpha", "Beta"]);
  });

  it("extracts headings with depth filtering", () => {
    const headings = extractMarkdownHeadings(`# Root\n\n## Section\n\n### Detail`, { minimumDepth: 2 });
    expect(headings.map((heading) => heading.text)).toEqual(["Section", "Detail"]);
  });

  it("renders gfm features and fenced code to semantic html", async () => {
    const html = await renderMarkdownToHtml([
      "# Title",
      "",
      "- [x] done",
      "",
      "| A | B |",
      "| - | - |",
      "| 1 | 2 |",
      "",
      "```ts",
      "const value = 1;",
      "```",
    ].join("\n"));

    expect(html).toContain('class="markdown-body"');
    expect(html).toContain('class="md-task-list-item"');
    expect(html).toContain('class="md-table"');
    expect(html).toContain('class="md-code-block"');
    expect(html).toContain('class="language-ts"');
    expect(html).toContain('class="token keyword"');
    expect(html).toContain('class="token number"');
  });

  it("emits syntax token spans for published docs code languages", async () => {
    const fixtures = [
      ["ts", "const value = 1;"],
      ["json", "{\"name\": \"MdWrk\", \"private\": true}"],
      ["bash", "npm run build # ship"],
      ["css", ".lander { color: #fff; }"],
      ["html", "<main class=\"lander\">Docs</main>"],
      ["md", "## Heading\n\n- item"],
      ["yaml", "title: MdWrk\nstatus: published"],
    ];

    for (const [language, source] of fixtures) {
      const html = await renderMarkdownToHtml(`\`\`\`${language}\n${source}\n\`\`\``);
      expect(html).toContain(`class="language-${language}"`);
      expect(html).toMatch(/class="token (?:attr-name|boolean|comment|function|keyword|number|operator|property|punctuation|selector|string|tag)"/);
    }
  });

  it("serializes html documents", async () => {
    const html = await renderMarkdownToHtmlDocument("# Hello", {
      title: "Hello",
      bodyClassName: "markdown-export",
      stylesheets: [":root { --example: 1; }"]
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("markdown-export");
    expect(html).toContain("--example: 1");
  });

  it("creates html documents from body fragments", () => {
    const html = createHtmlDocument({
      title: "Fragment",
      bodyHtml: '<main id="content">Fragment</main>',
      bodyClassName: "markdown-export",
    });
    expect(html).toContain("<main id=\"content\">Fragment</main>");
  });
});
