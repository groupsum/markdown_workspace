import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  MarkdownEditInRenderer,
  createMarkdownEditInRendererThemeStyle,
  replaceMarkdownEditBlock,
  splitMarkdownEditBlocks,
} from "../dist/index.js";

const sample = "# Title\n\nParagraph text.\n\n```ts\nconst value = 1;\n```\n";
const blocks = splitMarkdownEditBlocks(sample);
const html = renderToStaticMarkup(
  React.createElement(MarkdownEditInRenderer, {
    defaultValue: "# Title\n\nParagraph text.",
  }),
);
const themeStyle = createMarkdownEditInRendererThemeStyle({ accent: "#0a66ff" });

const checks = [
  {
    id: "block-splitting",
    description: "splitMarkdownEditBlocks preserves paragraph and fenced-code block boundaries",
    test() {
      assert.equal(blocks.length, 3);
      assert.match(blocks[2].markdown, /```ts/);
      assert.match(blocks[2].markdown, /const value = 1/);
    },
  },
  {
    id: "block-replacement",
    description: "replaceMarkdownEditBlock updates one block without rewriting the rest of the document",
    test() {
      const nextValue = replaceMarkdownEditBlock(sample, blocks[1], "Updated paragraph.\n\n");
      assert.match(nextValue, /^# Title/);
      assert.match(nextValue, /Updated paragraph/);
      assert.match(nextValue, /```ts/);
    },
  },
  {
    id: "unified-rendered-input",
    description: "MarkdownEditInRenderer renders one editable markdown display surface",
    test() {
      assert.match(html, /markdown-edit-in-renderer-host/);
      assert.match(html, /markdown-edit-in-renderer-surface/);
      assert.match(html, /contentEditable="true"/);
      assert.doesNotMatch(html, /markdown-source-editor/);
    },
  },
  {
    id: "rendered-markdown",
    description: "MarkdownEditInRenderer does not render a separate textarea or preview surface",
    test() {
      assert.match(html, /role="textbox"/);
      assert.doesNotMatch(html, /<textarea/);
      assert.doesNotMatch(html, /markdown-edit-in-renderer-rendered/);
    },
  },
  {
    id: "theme-style",
    description: "Theme bridge exposes edit-in-renderer accent tokens",
    test() {
      assert.equal(themeStyle["--mwir-accent"], "#0a66ff");
      assert.equal(themeStyle["--mwir-border-active"], "#0a66ff");
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
  assert.equal(summary.failed, 0, `edit-in-renderer-react smoke failures: ${summary.failed}`);
  console.log("edit-in-renderer-react smoke tests passed");
}
