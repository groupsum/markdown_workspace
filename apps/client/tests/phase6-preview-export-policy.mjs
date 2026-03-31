import assert from 'node:assert/strict';
import {
  normalizeEmptyListItemsForPreview,
  resolveInternalMarkdownHref,
  resolveMarkdownHtmlHandlingMode,
  rewriteRenderedMarkdownLinksForHtmlExport,
} from '../services/markdownPreviewPolicy.js';

const files = [
  { id: 'folder-docs', projectId: 'p1', parentId: null, name: 'docs', type: 'folder', lastModified: 0 },
  { id: 'folder-current', projectId: 'p1', parentId: 'folder-docs', name: 'current', type: 'folder', lastModified: 0 },
  { id: 'folder-guide', projectId: 'p1', parentId: 'folder-docs', name: 'guide', type: 'folder', lastModified: 0 },
  { id: 'current-readme', projectId: 'p1', parentId: 'folder-current', name: 'readme.md', type: 'file', lastModified: 0 },
  { id: 'guide-intro', projectId: 'p1', parentId: 'folder-guide', name: 'intro.md', type: 'file', lastModified: 0 },
];

const checks = [
  {
    id: 'normalize-empty-list-items',
    description: 'empty list items are normalized for preview while fenced code stays unchanged',
    test() {
      const markdown = ['- ', '1. ', '- [ ] ', '', '```md', '- ', '```'].join('\n');
      const normalized = normalizeEmptyListItemsForPreview(markdown);
      assert.match(normalized, /^- &nbsp;/m);
      assert.match(normalized, /^1\. &nbsp;/m);
      assert.match(normalized, /^- \[ \] &nbsp;/m);
      assert.match(normalized, /```md\n- \n```/m);
    },
  },
  {
    id: 'same-document-hash-resolution',
    description: 'same-document hash links resolve without file navigation',
    test() {
      const resolution = resolveInternalMarkdownHref('#usage', files, files[3]);
      assert.deepEqual(resolution, { kind: 'hash', hash: 'usage' });
    },
  },
  {
    id: 'relative-markdown-file-resolution',
    description: 'relative markdown file links resolve against the current file path',
    test() {
      const resolution = resolveInternalMarkdownHref('../guide/intro.md#examples', files, files[3]);
      assert.deepEqual(resolution, { kind: 'file', fileId: 'guide-intro', hash: 'examples' });
    },
  },
  {
    id: 'default-html-handling-policy',
    description: 'client preview/export policy defaults to sanitize unless trusted mode is enabled',
    test() {
      assert.equal(resolveMarkdownHtmlHandlingMode({ trustedHtmlPreview: false }), 'sanitize');
      assert.equal(resolveMarkdownHtmlHandlingMode({ trustedHtmlPreview: true }), 'allow-trusted');
    },
  },
  {
    id: 'export-markdown-link-rewrite',
    description: 'rendered markdown links are rewritten from .md to .html for HTML export',
    test() {
      const html = '<a href="guide.md#usage">Guide</a> <a href="#local">Local</a> <a href="https://example.com">External</a>';
      const rewritten = rewriteRenderedMarkdownLinksForHtmlExport(html);
      assert.match(rewritten, /href="guide\.html#usage"/);
      assert.match(rewritten, /href="#local"/);
      assert.match(rewritten, /href="https:\/\/example\.com"/);
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
  assert.equal(summary.failed, 0, `client preview/export policy failures: ${summary.failed}`);
  console.log('client preview/export policy tests passed');
}
