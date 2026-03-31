import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MarkdownRenderer, renderMarkdownToStaticHtmlDocument } from '../dist/index.js';

const checks = [
  {
    id: 'component-sanitize-html-policy',
    description: 'MarkdownRenderer sanitizes dangerous HTML when requested',
    test() {
      const html = renderToStaticMarkup(React.createElement(MarkdownRenderer, {
        markdown: '<div onclick="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">x</a></div>',
        htmlHandling: 'sanitize',
        profile: 'gfm-default',
      }));
      assert.doesNotMatch(html, /<script/i);
      assert.doesNotMatch(html, /alert\(1\)/);
      assert.doesNotMatch(html, /onclick=/i);
      assert.match(html, /data-markdown-html-handling="sanitize"/);
      assert.match(html, /href="#"/);
    },
  },
  {
    id: 'component-task-accessibility',
    description: 'MarkdownRenderer preserves task accessibility semantics from the core renderer',
    test() {
      const html = renderToStaticMarkup(React.createElement(MarkdownRenderer, {
        markdown: '- [x] done\n- [ ] todo',
        profile: 'gfm-default',
      }));
      assert.match(html, /aria-label="Task completed"/);
      assert.match(html, /aria-label="Task not completed"/);
      assert.match(html, /aria-checked="true"/);
      assert.match(html, /aria-checked="false"/);
    },
  },
  {
    id: 'document-export-policy-corpus',
    description: 'Static HTML document export preserves tables, tasks, footnotes, math, citations, and sanitized HTML policy',
    test() {
      const markdown = [
        '| Name | Value |',
        '| --- | ---: |',
        '| Alpha | 1 |',
        '',
        '- [x] done',
        '',
        'Inline $E=mc^2$ and See [@smith2024].',
        '',
        'Statement[^1]',
        '',
        '[^1]: Footnote body',
        '',
        '<div onclick="alert(1)">unsafe</div>',
      ].join('\n');
      const html = renderMarkdownToStaticHtmlDocument({
        markdown,
        title: 'Phase 6 Export',
        profile: 'gfm-default',
        extensions: ['footnotes', 'math', 'citations'],
        htmlHandling: 'sanitize',
        bodyClassName: 'markdown-export',
      });
      assert.match(html, /<!DOCTYPE html>/);
      assert.match(html, /markdown-export/);
      assert.match(html, /<table/);
      assert.match(html, /type="checkbox"/);
      assert.match(html, /md-footnotes/);
      assert.match(html, /md-math-inline/);
      assert.match(html, /md-citation/);
      assert.doesNotMatch(html, /onclick=/i);
    },
  },
  {
    id: 'sanitize-markdown-url-surfaces',
    description: 'MarkdownRenderer sanitizes unsafe markdown link and image destinations',
    test() {
      const html = renderToStaticMarkup(React.createElement(MarkdownRenderer, {
        markdown: '[click](javascript:alert(1)) ![alt](data:text/plain,boom)',
        htmlHandling: 'sanitize',
        profile: 'gfm-default',
      }));
      assert.match(html, /href="#"/);
      assert.doesNotMatch(html, /javascript:/i);
      assert.doesNotMatch(html, /data:text/i);
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
  assert.equal(summary.failed, 0, `renderer-react preview/export policy failures: ${summary.failed}`);
  console.log('renderer-react preview/export policy tests passed');
}
