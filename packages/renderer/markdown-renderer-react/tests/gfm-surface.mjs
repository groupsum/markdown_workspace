import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownRenderer, renderMarkdownToStaticHtmlDocument } from '../dist/index.js';

const markdown = [
  '~~done~~',
  '',
  '- [x] checked',
  '- [ ] todo',
  '',
  '| Left | Right |',
  '| :--- | ---: |',
  '| 1 | https://example.com |',
].join('\n');

const componentHtml = renderToStaticMarkup(React.createElement(MarkdownRenderer, { markdown, profile: 'gfm-default' }));
const exportHtml = renderMarkdownToStaticHtmlDocument({
  markdown,
  title: 'GFM Export',
  bodyClassName: 'markdown-export',
  profile: 'gfm-default',
});

const checks = [
  {
    id: 'component-strikethrough',
    description: 'MarkdownRenderer emits <del> for ~~text~~',
    test() {
      assert.match(componentHtml, /<del[^>]*>done<\/del>/);
    },
  },
  {
    id: 'component-task-checkbox',
    description: 'MarkdownRenderer emits task-list checkbox markup',
    test() {
      assert.match(componentHtml, /type="checkbox"/);
      assert.match(componentHtml, /data-task-list="true"/);
    },
  },
  {
    id: 'component-table',
    description: 'MarkdownRenderer emits tables with alignment metadata',
    test() {
      assert.match(componentHtml, /<table[^>]*>/);
      assert.match(componentHtml, /align="right"/);
    },
  },
  {
    id: 'component-literal-autolink',
    description: 'MarkdownRenderer turns literal URLs into anchors',
    test() {
      assert.match(componentHtml, /href="https:\/\/example.com"/);
    },
  },
  {
    id: 'document-export',
    description: 'Static HTML document export preserves default GFM rendering',
    test() {
      assert.match(exportHtml, /<!DOCTYPE html>/);
      assert.match(exportHtml, /markdown-export/);
      assert.match(exportHtml, /<del[^>]*>done<\/del>/);
      assert.match(exportHtml, /type="checkbox"/);
      assert.match(exportHtml, /<table[^>]*>/);
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
  assert.equal(summary.failed, 0, `renderer-react gfm surface failures: ${summary.failed}`);
  console.log('renderer-react gfm surface tests passed');
}
