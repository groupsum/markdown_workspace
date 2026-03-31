import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownSourceEditor } from '../dist/index.js';

const html = renderToStaticMarkup(
  React.createElement(MarkdownSourceEditor, {
    defaultValue: 'alpha\nbeta',
    showLineNumbers: true,
    placeholder: 'Start typing...',
  }),
);

const htmlWithoutGutter = renderToStaticMarkup(
  React.createElement(MarkdownSourceEditor, {
    defaultValue: 'alpha',
    showLineNumbers: false,
  }),
);

const checks = [
  {
    id: 'editor-root',
    description: 'MarkdownSourceEditor renders the root editor container',
    test() {
      assert.match(html, /markdown-source-editor/);
    },
  },
  {
    id: 'gutter',
    description: 'MarkdownSourceEditor renders the gutter when line numbers are enabled',
    test() {
      assert.match(html, /editor-gutter/);
      assert.match(html, />1<\/div>/);
      assert.match(html, />2<\/div>/);
    },
  },
  {
    id: 'gutter-optional',
    description: 'MarkdownSourceEditor can suppress the gutter when line numbers are disabled',
    test() {
      assert.doesNotMatch(htmlWithoutGutter, /editor-gutter/);
    },
  },
  {
    id: 'textarea-value',
    description: 'MarkdownSourceEditor preserves the initial markdown value',
    test() {
      assert.match(html, />alpha\nbeta<\/textarea>/);
    },
  },
  {
    id: 'textarea-wrap-off',
    description: 'MarkdownSourceEditor disables soft wrapping so gutter rhythm matches logical lines',
    test() {
      assert.match(html, /wrap="off"/);
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

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(summary, null, 2));
} else {
  assert.equal(summary.failed, 0, `editor-react smoke failures: ${summary.failed}`);
  console.log('editor-react smoke tests passed');
}
