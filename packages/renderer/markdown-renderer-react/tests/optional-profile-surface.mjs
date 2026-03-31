import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownRenderer, renderMarkdownToStaticHtmlDocument } from '../dist/index.js';

const markdown = [
  'Term',
  ': Meaning',
  '',
  'Math $E=mc^2$',
  '',
  'Statement[^1]',
  '',
  '[^1]: Footnote body',
].join('\n');

const extensions = ['definition-lists', 'math', 'footnotes'];

const componentHtml = renderToStaticMarkup(React.createElement(MarkdownRenderer, {
  markdown,
  profile: 'gfm-default',
  extensions,
}));

const exportHtml = renderMarkdownToStaticHtmlDocument({
  markdown,
  title: 'Optional Profiles Export',
  profile: 'gfm-default',
  extensions,
});

const checks = [
  {
    id: 'component-definition-list',
    description: 'MarkdownRenderer emits definition list markup',
    test() {
      assert.match(componentHtml, /<dl[^>]*md-definition-list/);
    },
  },
  {
    id: 'component-math-inline',
    description: 'MarkdownRenderer emits inline math wrappers',
    test() {
      assert.match(componentHtml, /md-math-inline/);
    },
  },
  {
    id: 'component-footnotes',
    description: 'MarkdownRenderer emits footnote references and footnote sections',
    test() {
      assert.match(componentHtml, /md-footnote-reference/);
      assert.match(componentHtml, /md-footnotes/);
    },
  },
  {
    id: 'document-export-extensions',
    description: 'Static HTML document export preserves optional profile rendering',
    test() {
      assert.match(exportHtml, /<!DOCTYPE html>/);
      assert.match(exportHtml, /md-definition-list/);
      assert.match(exportHtml, /md-math-inline/);
      assert.match(exportHtml, /md-footnotes/);
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
  assert.equal(summary.failed, 0, `renderer-react optional profile failures: ${summary.failed}`);
  console.log('renderer-react optional profile surface tests passed');
}
