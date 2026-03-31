import assert from 'node:assert/strict';
import { renderMarkdownToHtmlDocumentSync } from '../dist/html.js';
import { renderMarkdownToHtmlSync } from '../dist/index.js';

const checks = [
  {
    id: 'sanitize-inline-html-and-unsafe-urls',
    description: 'sanitize mode strips active inline HTML, blocks blocked tags, and rewrites unsafe URLs',
    test() {
      const html = renderMarkdownToHtmlSync('<div onclick="alert(1)"><script>alert(1)</script><a href="javascript:alert(1)">x</a><img src="javascript:alert(1)"/></div>', {
        htmlHandling: 'sanitize',
        profile: 'gfm-default',
      });
      assert.doesNotMatch(html, /<script/i);
      assert.doesNotMatch(html, /alert\(1\)/);
      assert.doesNotMatch(html, /onclick=/i);
      assert.doesNotMatch(html, /javascript:/i);
      assert.match(html, /<a href="#"/);
      assert.match(html, /<img\b[^>]*\/>/);
    },
  },
  {
    id: 'sanitize-markdown-link-and-image-destinations',
    description: 'sanitize mode rewrites unsafe markdown link and image destinations',
    test() {
      const html = renderMarkdownToHtmlSync('[click](javascript:alert(1)) ![alt](data:text/plain,boom)', {
        htmlHandling: 'sanitize',
        profile: 'gfm-default',
      });
      assert.match(html, /<a href="#"/);
      assert.doesNotMatch(html, /javascript:/i);
      assert.doesNotMatch(html, /data:text/i);
    },
  },
  {
    id: 'root-carries-html-handling-attribute',
    description: 'rendered root wrapper records the resolved html handling mode',
    test() {
      const html = renderMarkdownToHtmlSync('Paragraph', {
        htmlHandling: 'sanitize',
        profile: 'gfm-default',
      });
      assert.match(html, /data-markdown-html-handling="sanitize"/);
    },
  },
  {
    id: 'task-checkbox-accessibility-semantics',
    description: 'task checkboxes expose aria semantics in preview markup',
    test() {
      const html = renderMarkdownToHtmlSync('- [x] done\n- [ ] todo', {
        profile: 'gfm-default',
      });
      assert.match(html, /aria-label="Task completed"/);
      assert.match(html, /aria-label="Task not completed"/);
      assert.match(html, /aria-checked="true"/);
      assert.match(html, /aria-checked="false"/);
    },
  },
  {
    id: 'document-export-corpus-coverage',
    description: 'HTML document export preserves raw-html policy plus tables, tasks, footnotes, math, and citations',
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
      const html = renderMarkdownToHtmlDocumentSync(markdown, {
        title: 'Preview Export',
        profile: 'gfm-default',
        extensions: ['footnotes', 'math', 'citations'],
        htmlHandling: 'sanitize',
      });
      assert.match(html, /<!DOCTYPE html>/);
      assert.match(html, /<table/);
      assert.match(html, /type="checkbox"/);
      assert.match(html, /md-footnotes/);
      assert.match(html, /md-math-inline/);
      assert.match(html, /md-citation/);
      assert.doesNotMatch(html, /onclick=/i);
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
  assert.equal(summary.failed, 0, `renderer-core preview/export policy failures: ${summary.failed}`);
  console.log('renderer-core preview/export policy tests passed');
}
