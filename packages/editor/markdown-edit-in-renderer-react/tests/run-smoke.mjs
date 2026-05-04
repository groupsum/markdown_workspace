import assert from "node:assert/strict";
import fs from "node:fs";
import { JSDOM } from "jsdom";
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
const defaultCss = fs.readFileSync(
  new URL("../src/styles/default.css", import.meta.url),
  "utf8",
);

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
globalThis.Event = dom.window.Event;
globalThis.InputEvent = dom.window.InputEvent;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.getComputedStyle = dom.window.getComputedStyle;
dom.window.HTMLElement.prototype.attachEvent ??= () => undefined;
dom.window.HTMLElement.prototype.detachEvent ??= () => undefined;
Object.defineProperty(globalThis, "navigator", {
  value: dom.window.navigator,
  configurable: true,
});
const { cleanup, fireEvent, render } = await import("@testing-library/react");

function setupRenderedEditor(markdown = sample) {
  let lastChange = markdown;
  const view = render(
    React.createElement(MarkdownEditInRenderer, {
      defaultValue: markdown,
      onChange(nextValue) {
        lastChange = nextValue;
      },
    }),
  );
  const textarea = view.container.querySelector("textarea.markdown-edit-in-renderer-plaintext");
  const projection = view.container.querySelector(".markdown-edit-in-renderer-surface");
  assert.ok(textarea instanceof HTMLTextAreaElement, "expected hidden plaintext textarea");
  assert.ok(projection instanceof HTMLElement, "expected rendered projection");
  return {
    ...view,
    textarea,
    projection,
    getLastChange: () => lastChange,
  };
}

function replaceText(textarea, start, end, text) {
  const nextValue = `${textarea.value.slice(0, start)}${text}${textarea.value.slice(end)}`;
  const nextOffset = start + text.length;
  const valueSetter = Object.getOwnPropertyDescriptor(
    dom.window.HTMLTextAreaElement.prototype,
    "value",
  )?.set;
  valueSetter?.call(textarea, nextValue);
  fireEvent.input(textarea, {
    target: {
      value: nextValue,
      selectionStart: nextOffset,
      selectionEnd: nextOffset,
    },
  });
  textarea.selectionStart = nextOffset;
  textarea.selectionEnd = nextOffset;
  return nextValue;
}

function lineCharForOffset(markdown, offset) {
  const beforeCursor = markdown.slice(0, offset);
  const lines = beforeCursor.split("\n");
  return {
    line: lines.length,
    char: lines.at(-1).length + 1,
  };
}

function waitForFrame() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

async function placeCaret(view, offset) {
  view.textarea.focus();
  view.textarea.selectionStart = offset;
  view.textarea.selectionEnd = offset;
  fireEvent.select(view.textarea);
  await waitForFrame();
}

function getRenderedCaret(view) {
  const caret = view.container.querySelector(".markdown-edit-in-renderer-caret");
  assert.ok(caret instanceof HTMLElement, "expected rendered caret element");
  return caret;
}

async function assertProjectedCaret(view, offset, expected) {
  await placeCaret(view, offset);
  const caret = getRenderedCaret(view);
  assert.equal(view.textarea.selectionStart, offset);
  assert.equal(view.textarea.selectionEnd, offset);
  assert.equal(caret.dataset.visible, "true");
  assert.equal(caret.dataset.plaintextLine, String(expected.plaintextLine));
  assert.equal(caret.dataset.plaintextChar, String(expected.plaintextChar));
  assert.equal(caret.dataset.renderedLine, String(expected.renderedLine));
  assert.equal(caret.dataset.renderedChar, String(expected.renderedChar));
}

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
    description: "MarkdownEditInRenderer renders one source-backed projected markdown surface",
    test() {
      assert.match(html, /markdown-edit-in-renderer-host/);
      assert.match(html, /markdown-edit-in-renderer-surface/);
      assert.match(html, /markdown-edit-in-renderer-plaintext/);
      assert.doesNotMatch(html, /markdown-source-editor/);
    },
  },
  {
    id: "rendered-markdown",
    description: "MarkdownEditInRenderer uses hidden plaintext markdown as the only editable source",
    test() {
      assert.match(html, /<textarea/);
      assert.match(html, /aria-label="Markdown source"/);
      assert.doesNotMatch(html, /markdown-edit-in-renderer-rendered/);
    },
  },
  {
    id: "blank-document-renders-blank",
    description: "Empty plaintext markdown stays an empty document instead of rendering placeholder text",
    test() {
      const view = render(
        React.createElement(MarkdownEditInRenderer, {
          value: "",
          placeholder: "Placeholder must not become source content",
        }),
      );
      try {
        const textarea = view.container.querySelector("textarea.markdown-edit-in-renderer-plaintext");
        const projection = view.container.querySelector(".markdown-edit-in-renderer-surface");
        assert.ok(textarea instanceof HTMLTextAreaElement);
        assert.ok(projection instanceof HTMLElement);
        assert.equal(textarea.value, "");
        assert.equal(textarea.placeholder, "Placeholder must not become source content");
        assert.equal(projection.textContent, "");
        assert.equal(projection.children.length, 0);
      } finally {
        cleanup();
      }
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
  {
    id: "plaintext-source-is-only-editable-control",
    description: "Rendered markdown is inert and plaintext markdown is the only editable control",
    test() {
      const view = setupRenderedEditor("# Title\n\nBody");
      try {
        assert.equal(view.container.querySelectorAll("textarea.markdown-edit-in-renderer-plaintext").length, 1);
        assert.equal(view.projection.getAttribute("aria-hidden"), "true");
        assert.match(defaultCss, /\.markdown-edit-in-renderer-surface\s*\{[\s\S]*pointer-events:\s*none;/);
        assert.equal(view.textarea.value, "# Title\n\nBody");
        assert.equal(view.projection.querySelector("h1")?.textContent, "Title");
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "hidden-plaintext-suppresses-native-cursor",
    description: "Hidden plaintext layer suppresses browser-native caret and pointer cursor affordances",
    test() {
      assert.match(defaultCss, /\.markdown-edit-in-renderer-plaintext\s*\{[\s\S]*caret-color:\s*transparent;/);
      assert.match(defaultCss, /\.markdown-edit-in-renderer-plaintext\s*\{[\s\S]*-webkit-text-fill-color:\s*transparent;/);
      assert.match(defaultCss, /\.markdown-edit-in-renderer-plaintext\s*\{[\s\S]*cursor:\s*none;/);
      assert.match(defaultCss, /\.markdown-edit-in-renderer-caret\s*\{[\s\S]*background:\s*var\(--mwir-accent\);/);
      assert.match(defaultCss, /\.markdown-edit-in-renderer-caret\[data-visible="true"\]\s*\{[\s\S]*display:\s*block;/);
    },
  },
  {
    id: "typing-preserves-cursor-and-source-integrity",
    description: "Editing in the hidden plaintext source preserves selection and exact markdown text",
    test() {
      const view = setupRenderedEditor("# Title\n\nParagraph text.\n\nTail");
      try {
        const insertAt = "# Title\n\nParagraph".length;
        view.textarea.focus();
        view.textarea.selectionStart = insertAt;
        view.textarea.selectionEnd = insertAt;

        const nextValue = replaceText(view.textarea, insertAt, insertAt, " inserted");
        const nextCursor = insertAt + " inserted".length;

        assert.equal(view.textarea.selectionStart, nextCursor);
        assert.equal(view.textarea.selectionEnd, nextCursor);
        assert.equal(view.textarea.value, "# Title\n\nParagraph inserted text.\n\nTail");
        assert.equal(view.getLastChange(), nextValue);
        assert.deepEqual(lineCharForOffset(view.textarea.value, view.textarea.selectionStart), {
          line: 3,
          char: 19,
        });
        assert.equal(view.projection.textContent?.includes("Paragraph inserted text."), true);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "rendering-follows-plaintext-without-writing-back",
    description: "Rendered projection updates from plaintext markdown without becoming the source copy",
    test() {
      const initial = "# Title\n\nParagraph";
      const view = setupRenderedEditor(initial);
      try {
        const appendAt = view.textarea.value.length;
        const nextValue = replaceText(view.textarea, appendAt, appendAt, "\n\n## Rendered From Source");

        assert.equal(view.textarea.value, `${initial}\n\n## Rendered From Source`);
        assert.equal(view.getLastChange(), nextValue);
        assert.equal(view.projection.querySelectorAll("h2").length, 1);
        assert.equal(view.projection.querySelector("h2")?.textContent, "Rendered From Source");
        assert.equal(view.textarea.value.includes("<h2"), false);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "single-enter-soft-break-renders-visible-line-break",
    description: "Single Enter inside paragraph source remains plaintext and renders as a visible soft break",
    test() {
      const initial = "First line";
      const view = setupRenderedEditor(initial);
      try {
        const appendAt = view.textarea.value.length;
        view.textarea.focus();
        view.textarea.selectionStart = appendAt;
        view.textarea.selectionEnd = appendAt;

        const nextValue = replaceText(view.textarea, appendAt, appendAt, "\nSecond line");

        assert.equal(nextValue, "First line\nSecond line");
        assert.equal(view.textarea.value, "First line\nSecond line");
        assert.equal(view.getLastChange(), "First line\nSecond line");
        assert.equal(view.textarea.selectionStart, "First line\nSecond line".length);
        assert.equal(view.projection.querySelectorAll("br").length, 1);
        assert.equal(view.projection.querySelector("p")?.innerHTML, "First line<br>Second line");
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "rendered-caret-aligns-heading-marker-offset",
    description: "Visible caret preserves plaintext line/char while projecting heading markers out of rendered coordinates",
    async test() {
      const markdown = "# title test ";
      const view = setupRenderedEditor(markdown);
      try {
        const caret = view.container.querySelector(".markdown-edit-in-renderer-caret");
        assert.ok(caret instanceof HTMLElement);
        view.textarea.focus();
        view.textarea.selectionStart = markdown.length;
        view.textarea.selectionEnd = markdown.length;
        fireEvent.select(view.textarea);
        await new Promise((resolve) => window.requestAnimationFrame(resolve));

        assert.equal(view.textarea.selectionStart, markdown.length);
        assert.equal(caret.dataset.visible, "true");
        assert.equal(caret.dataset.plaintextLine, "1");
        assert.equal(caret.dataset.plaintextChar, String(markdown.length + 1));
        assert.equal(caret.dataset.renderedLine, "1");
        assert.equal(caret.dataset.renderedChar, String("title test ".length + 1));
        assert.equal(view.projection.querySelector("h1")?.textContent, "title test");
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "projected-caret-is-character-addressable-in-plain-paragraphs",
    description: "Plain paragraph caret projection is stable at every plaintext character offset",
    async test() {
      const markdown = "Alpha";
      const view = setupRenderedEditor(markdown);
      try {
        for (let offset = 0; offset <= markdown.length; offset += 1) {
          await assertProjectedCaret(view, offset, {
            plaintextLine: 1,
            plaintextChar: offset + 1,
            renderedLine: 1,
            renderedChar: offset + 1,
          });
        }
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "projected-caret-is-character-addressable-across-soft-line-breaks",
    description: "Soft line break caret projection preserves per-character line and character coordinates",
    async test() {
      const markdown = "Alpha\nBeta";
      const view = setupRenderedEditor(markdown);
      try {
        assert.equal(view.projection.querySelectorAll("br").length, 1);
        const cases = [
          { offset: 0, plaintextLine: 1, plaintextChar: 1, renderedLine: 1, renderedChar: 1 },
          { offset: 1, plaintextLine: 1, plaintextChar: 2, renderedLine: 1, renderedChar: 2 },
          { offset: 5, plaintextLine: 1, plaintextChar: 6, renderedLine: 1, renderedChar: 6 },
          { offset: 6, plaintextLine: 2, plaintextChar: 1, renderedLine: 2, renderedChar: 1 },
          { offset: 7, plaintextLine: 2, plaintextChar: 2, renderedLine: 2, renderedChar: 2 },
          { offset: markdown.length, plaintextLine: 2, plaintextChar: 5, renderedLine: 2, renderedChar: 5 },
        ];

        for (const expected of cases) {
          await assertProjectedCaret(view, expected.offset, expected);
        }
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "projected-caret-collapses-heading-marker-per-character",
    description: "Heading marker characters remain addressable in plaintext and collapse to the rendered heading start",
    async test() {
      const markdown = "# Alpha";
      const view = setupRenderedEditor(markdown);
      try {
        for (let offset = 0; offset <= markdown.length; offset += 1) {
          await assertProjectedCaret(view, offset, {
            plaintextLine: 1,
            plaintextChar: offset + 1,
            renderedLine: 1,
            renderedChar: Math.max(1, offset - 2 + 1),
          });
        }
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "projected-caret-collapses-list-markers-per-character",
    description: "List marker characters remain addressable in plaintext and collapse to the rendered item start",
    async test() {
      const markdown = "- Alpha";
      const view = setupRenderedEditor(markdown);
      try {
        for (let offset = 0; offset <= markdown.length; offset += 1) {
          await assertProjectedCaret(view, offset, {
            plaintextLine: 1,
            plaintextChar: offset + 1,
            renderedLine: 1,
            renderedChar: Math.max(1, offset - 2 + 1),
          });
        }
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "projected-caret-collapses-ordered-list-markers-per-character",
    description: "Ordered-list marker characters remain addressable in plaintext and collapse to the rendered item start",
    async test() {
      const markdown = "12. Alpha";
      const view = setupRenderedEditor(markdown);
      try {
        for (let offset = 0; offset <= markdown.length; offset += 1) {
          await assertProjectedCaret(view, offset, {
            plaintextLine: 1,
            plaintextChar: offset + 1,
            renderedLine: 1,
            renderedChar: Math.max(1, offset - 4 + 1),
          });
        }
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "projected-caret-collapses-blockquote-marker-per-character",
    description: "Blockquote marker characters remain addressable in plaintext and collapse to the rendered quote start",
    async test() {
      const markdown = "> Alpha";
      const view = setupRenderedEditor(markdown);
      try {
        for (let offset = 0; offset <= markdown.length; offset += 1) {
          await assertProjectedCaret(view, offset, {
            plaintextLine: 1,
            plaintextChar: offset + 1,
            renderedLine: 1,
            renderedChar: Math.max(1, offset - 2 + 1),
          });
        }
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "projected-caret-survives-controlled-rerender-at-each-character",
    description: "Controlled re-renders preserve per-character plaintext selection and rendered caret projection",
    async test() {
      function Harness() {
        const [value, setValue] = React.useState("# Alpha");
        const [renderCount, setRenderCount] = React.useState(0);
        return React.createElement(
          React.Fragment,
          null,
          React.createElement(MarkdownEditInRenderer, {
            value,
            onChange: setValue,
          }),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setRenderCount((count) => count + 1),
            },
            `rerender ${renderCount}`,
          ),
        );
      }

      const view = render(React.createElement(Harness));
      try {
        const textarea = view.container.querySelector("textarea.markdown-edit-in-renderer-plaintext");
        const button = view.container.querySelector("button");
        assert.ok(textarea instanceof HTMLTextAreaElement);
        assert.ok(button instanceof HTMLElement);
        const controlledView = { ...view, textarea };

        for (let offset = 0; offset <= textarea.value.length; offset += 1) {
          await assertProjectedCaret(controlledView, offset, {
            plaintextLine: 1,
            plaintextChar: offset + 1,
            renderedLine: 1,
            renderedChar: Math.max(1, offset - 2 + 1),
          });
          fireEvent.click(button);
          await waitForFrame();
          assert.equal(textarea.selectionStart, offset);
          assert.equal(textarea.selectionEnd, offset);
          const caret = getRenderedCaret(view);
          assert.equal(caret.dataset.renderedChar, String(Math.max(1, offset - 2 + 1)));
        }
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "delete-all-content-preserves-empty-source",
    description: "Deleting the full document leaves a blank plaintext source and blank rendered projection",
    test() {
      const initial = "# Title\n\nParagraph\n\n- item";
      const view = setupRenderedEditor(initial);
      try {
        view.textarea.focus();
        view.textarea.selectionStart = 0;
        view.textarea.selectionEnd = initial.length;

        const nextValue = replaceText(view.textarea, 0, initial.length, "");

        assert.equal(nextValue, "");
        assert.equal(view.textarea.value, "");
        assert.equal(view.getLastChange(), "");
        assert.equal(view.textarea.selectionStart, 0);
        assert.equal(view.textarea.selectionEnd, 0);
        assert.equal(view.projection.textContent, "");
        assert.equal(view.projection.children.length, 0);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "blank-enter-and-type-enter-do-not-restore-default-content",
    description: "Blank documents remain source-authored after Enter and typed Enter edits",
    test() {
      const initial = "# Default sample\n\nMust not repopulate";
      const view = setupRenderedEditor(initial);
      try {
        view.textarea.focus();
        view.textarea.selectionStart = 0;
        view.textarea.selectionEnd = initial.length;

        const blankValue = replaceText(view.textarea, 0, initial.length, "");
        assert.equal(blankValue, "");
        assert.equal(view.textarea.value, "");
        assert.equal(view.projection.textContent, "");
        assert.equal(view.projection.children.length, 0);

        const enterValue = replaceText(view.textarea, 0, 0, "\n");
        assert.equal(enterValue, "\n");
        assert.equal(view.textarea.value, "\n");
        assert.equal(view.getLastChange(), "\n");
        assert.equal(view.textarea.selectionStart, 1);
        assert.equal(view.projection.textContent, "");
        assert.equal(view.projection.querySelectorAll(".markdown-edit-in-renderer-blank-line").length, 2);
        assert.equal(view.projection.textContent?.includes("Default sample"), false);

        const typedValue = replaceText(view.textarea, 1, 1, "alpha\n");
        assert.equal(typedValue, "\nalpha\n");
        assert.equal(view.textarea.value, "\nalpha\n");
        assert.equal(view.getLastChange(), "\nalpha\n");
        assert.equal(view.textarea.selectionStart, "\nalpha\n".length);
        assert.equal(view.projection.textContent?.includes("alpha"), true);
        assert.equal(view.projection.textContent?.includes("Default sample"), false);
        assert.equal(view.textarea.value.includes("Default sample"), false);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "whitespace-only-source-stays-authoritative",
    description: "Whitespace-only plaintext remains exact source and renders only blank-line projection spacers",
    test() {
      const initial = "# Default sample\n\nMust not repopulate";
      const whitespaceOnly = "   \n\t\n  ";
      const view = setupRenderedEditor(initial);
      try {
        view.textarea.focus();
        view.textarea.selectionStart = 0;
        view.textarea.selectionEnd = initial.length;

        const nextValue = replaceText(view.textarea, 0, initial.length, whitespaceOnly);

        assert.equal(nextValue, whitespaceOnly);
        assert.equal(view.textarea.value, whitespaceOnly);
        assert.equal(view.getLastChange(), whitespaceOnly);
        assert.equal(view.textarea.selectionStart, whitespaceOnly.length);
        assert.equal(view.projection.textContent, "");
        assert.equal(view.projection.querySelectorAll(".markdown-edit-in-renderer-blank-line").length, 3);
        assert.equal(view.projection.textContent?.includes("Default sample"), false);
        assert.equal(view.textarea.value.includes("Default sample"), false);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "controlled-blank-survives-parent-rerender",
    description: "Controlled blank source survives unrelated parent re-renders without restoring default content",
    test() {
      const initial = "# Default sample\n\nMust not repopulate";
      function Harness() {
        const [value, setValue] = React.useState(initial);
        const [renderCount, setRenderCount] = React.useState(0);
        return React.createElement(
          React.Fragment,
          null,
          React.createElement(MarkdownEditInRenderer, {
            value,
            onChange: setValue,
          }),
          React.createElement(
            "button",
            {
              type: "button",
              onClick: () => setRenderCount((count) => count + 1),
            },
            `rerender ${renderCount}`,
          ),
        );
      }

      const view = render(React.createElement(Harness));
      try {
        const textarea = view.container.querySelector("textarea.markdown-edit-in-renderer-plaintext");
        const projection = view.container.querySelector(".markdown-edit-in-renderer-surface");
        const button = view.container.querySelector("button");
        assert.ok(textarea instanceof HTMLTextAreaElement);
        assert.ok(projection instanceof HTMLElement);
        assert.ok(button instanceof HTMLElement);

        textarea.focus();
        textarea.selectionStart = 0;
        textarea.selectionEnd = initial.length;
        replaceText(textarea, 0, initial.length, "");
        fireEvent.click(button);

        assert.equal(textarea.value, "");
        assert.equal(textarea.selectionStart, 0);
        assert.equal(projection.textContent, "");
        assert.equal(projection.children.length, 0);
        assert.equal(projection.textContent?.includes("Default sample"), false);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "blank-then-new-markdown-does-not-restore-sample",
    description: "A blank document can become new markdown after Enter without restoring sample content",
    test() {
      const initial = "# Default sample\n\nMust not repopulate";
      const view = setupRenderedEditor(initial);
      try {
        view.textarea.focus();
        view.textarea.selectionStart = 0;
        view.textarea.selectionEnd = initial.length;
        replaceText(view.textarea, 0, initial.length, "");
        replaceText(view.textarea, 0, 0, "\n");
        const nextValue = replaceText(view.textarea, 1, 1, "# Fresh\n\nNew paragraph");

        assert.equal(nextValue, "\n# Fresh\n\nNew paragraph");
        assert.equal(view.textarea.value, "\n# Fresh\n\nNew paragraph");
        assert.equal(view.getLastChange(), "\n# Fresh\n\nNew paragraph");
        assert.equal(view.projection.querySelector("h1")?.textContent, "Fresh");
        assert.equal(view.projection.textContent?.includes("New paragraph"), true);
        assert.equal(view.projection.textContent?.includes("Default sample"), false);
        assert.equal(view.textarea.value.includes("Default sample"), false);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "double-and-triple-enter-preserve-source-and-projection-lines",
    description: "Repeated trailing Enter edits preserve plaintext newlines, caret offset, and rendered blank line boxes",
    test() {
      const initial = "# Title\n\nParagraph";
      const view = setupRenderedEditor(initial);
      try {
        const appendAt = view.textarea.value.length;
        view.textarea.focus();
        view.textarea.selectionStart = appendAt;
        view.textarea.selectionEnd = appendAt;

        const doubleEnterValue = replaceText(view.textarea, appendAt, appendAt, "\n\n");
        const doubleEnterCursor = initial.length + 2;

        assert.equal(doubleEnterValue, `${initial}\n\n`);
        assert.equal(view.textarea.value, `${initial}\n\n`);
        assert.equal(view.getLastChange(), `${initial}\n\n`);
        assert.equal(view.textarea.selectionStart, doubleEnterCursor);
        assert.equal(view.textarea.selectionEnd, doubleEnterCursor);
        assert.deepEqual(lineCharForOffset(view.textarea.value, view.textarea.selectionStart), {
          line: 5,
          char: 1,
        });
        assert.equal(view.projection.querySelectorAll(".markdown-edit-in-renderer-blank-line").length, 2);

        const tripleEnterValue = replaceText(view.textarea, doubleEnterCursor, doubleEnterCursor, "\n");
        const tripleEnterCursor = initial.length + 3;

        assert.equal(tripleEnterValue, `${initial}\n\n\n`);
        assert.equal(view.textarea.value, `${initial}\n\n\n`);
        assert.equal(view.getLastChange(), `${initial}\n\n\n`);
        assert.equal(view.textarea.selectionStart, tripleEnterCursor);
        assert.equal(view.textarea.selectionEnd, tripleEnterCursor);
        assert.deepEqual(lineCharForOffset(view.textarea.value, view.textarea.selectionStart), {
          line: 6,
          char: 1,
        });
        assert.equal(view.projection.querySelectorAll(".markdown-edit-in-renderer-blank-line").length, 3);
      } finally {
        cleanup();
      }
    },
  },
  {
    id: "external-render-updates-do-not-move-plaintext-caret",
    description: "Controlled render updates preserve plaintext textarea cursor coordinates",
    test() {
      function Harness() {
        const [value, setValue] = React.useState("# Title\n\nParagraph text.");
        return React.createElement(MarkdownEditInRenderer, {
          value,
          onChange: setValue,
        });
      }

      const view = render(React.createElement(Harness));
      try {
        const textarea = view.container.querySelector("textarea.markdown-edit-in-renderer-plaintext");
        const projection = view.container.querySelector(".markdown-edit-in-renderer-surface");
        assert.ok(textarea instanceof HTMLTextAreaElement);
        assert.ok(projection instanceof HTMLElement);

        const insertAt = "# Title\n\nParagraph".length;
        textarea.focus();
        textarea.selectionStart = insertAt;
        textarea.selectionEnd = insertAt;
        replaceText(textarea, insertAt, insertAt, " stable");

        assert.equal(textarea.selectionStart, insertAt + " stable".length);
        assert.equal(textarea.selectionEnd, insertAt + " stable".length);
        assert.equal(textarea.value, "# Title\n\nParagraph stable text.");
        assert.equal(projection.textContent?.includes("Paragraph stable text."), true);
      } finally {
        cleanup();
      }
    },
  },
];

const results = [];
let passed = 0;
for (const check of checks) {
  try {
    await check.test();
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
