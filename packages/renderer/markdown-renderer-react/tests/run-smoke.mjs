
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MarkdownRenderer,
  createMarkdownRendererThemeStyle,
  renderMarkdownToStaticHtml,
  renderMarkdownToStaticHtmlDocument,
} from "../dist/index.js";

const themeStyle = createMarkdownRendererThemeStyle({ foreground: "#fff", accent: "#09f" });
const elementHtml = renderToStaticMarkup(React.createElement(MarkdownRenderer, { markdown: "# Hello\n\n[Doc](README.md)" }));
const html = renderMarkdownToStaticHtml({ markdown: "# Hello\n\n[Doc](README.md)" });
const documentHtml = renderMarkdownToStaticHtmlDocument({
  markdown: "# Export",
  title: "Export",
  bodyClassName: "markdown-export",
});

const checks = [
  {
    id: "theme-style",
    description: "Theme bridge maps foreground and accent tokens",
    test() {
      assert.equal(themeStyle["--mw-fg-primary"], "#fff");
      assert.equal(themeStyle["--mw-accent"], "#09f");
    },
  },
  {
    id: "component-render",
    description: "MarkdownRenderer renders semantic wrapper markup",
    test() {
      assert.match(elementHtml, /markdown-renderer-host/);
      assert.match(elementHtml, /markdown-body/);
      assert.match(elementHtml, /README.md/);
    },
  },
  {
    id: "static-html-render",
    description: "renderMarkdownToStaticHtml returns HTML with rendered links",
    test() {
      assert.match(html, /markdown-body/);
      assert.match(html, /Hello/);
      assert.match(html, /README.md/);
    },
  },
  {
    id: "document-render",
    description: "renderMarkdownToStaticHtmlDocument returns a complete HTML document",
    test() {
      assert.match(documentHtml, /<!DOCTYPE html>/);
      assert.match(documentHtml, /markdown-export/);
    },
  },
];

const results = [];
let passed = 0;
for (const check of checks) {
  try {
    check.test();
    results.push({ id: check.id, description: check.description, passed: true });
    passed += 1;
  } catch (error) {
    results.push({ id: check.id, description: check.description, passed: false, message: error.message });
  }
}

const summary = {
  total: results.length,
  passed,
  failed: results.length - passed,
  results,
};

if (process.argv.includes("--json")) {
  process.stdout.write(JSON.stringify(summary, null, 2));
} else {
  assert.equal(summary.failed, 0, `renderer-react smoke failures: ${summary.failed}`);
  console.log("renderer-react smoke tests passed");
}
