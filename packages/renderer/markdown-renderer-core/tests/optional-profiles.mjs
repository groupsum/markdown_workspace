import assert from 'node:assert/strict';
import { parseMarkdownDocument, parseMarkdownToAst, renderMarkdownToHtmlSync } from '../dist/index.js';

const checks = [
  {
    id: 'front-matter-metadata',
    description: 'front matter metadata is extracted while YAML is omitted from rendered output',
    test() {
      const markdown = '---\ntitle: Demo\nauthor: Test\n---\n\n# Demo';
      const parsed = parseMarkdownDocument(markdown, { extensions: ['front-matter'] });
      const ast = parseMarkdownToAst(markdown, { profile: 'gfm-default', extensions: ['front-matter'] });
      const html = renderMarkdownToHtmlSync(markdown, { profile: 'gfm-default', extensions: ['front-matter'] });
      assert.equal(parsed.metadata.title, 'Demo');
      assert.equal(ast.metadata.title, 'Demo');
      assert.doesNotMatch(html, /title:\s*Demo/);
      assert.match(html, /<h1[^>]*>Demo<\/h1>/);
    },
  },
  {
    id: 'footnotes',
    description: 'footnote references and definitions render into a linked footnotes section',
    test() {
      const html = renderMarkdownToHtmlSync('Statement[^1]\n\n[^1]: Footnote body', {
        profile: 'gfm-default',
        extensions: ['footnotes'],
      });
      assert.match(html, /md-footnote-reference/);
      assert.match(html, /id="fn-1"/);
      assert.match(html, /Footnote body/);
    },
  },
  {
    id: 'definition-lists',
    description: 'definition lists render to dl/dt/dd structures',
    test() {
      const html = renderMarkdownToHtmlSync('Term\n: Meaning', {
        profile: 'gfm-default',
        extensions: ['definition-lists'],
      });
      assert.match(html, /<dl[^>]*md-definition-list/);
      assert.match(html, /<dt[^>]*>Term<\/dt>/);
      assert.match(html, /<dd[^>]*><p[^>]*>Meaning<\/p><\/dd>/);
    },
  },
  {
    id: 'math-inline-and-block',
    description: 'math profile renders inline and block math wrappers',
    test() {
      const html = renderMarkdownToHtmlSync('Inline $E=mc^2$\n\n$$\na^2+b^2=c^2\n$$', {
        profile: 'gfm-default',
        extensions: ['math'],
      });
      assert.match(html, /md-math-inline/);
      assert.match(html, /md-math-block/);
      assert.match(html, /E=mc\^2/);
      assert.match(html, /a\^2\+b\^2=c\^2/);
    },
  },
  {
    id: 'superscript-subscript',
    description: 'superscript and subscript extensions render semantic sup/sub tags',
    test() {
      const html = renderMarkdownToHtmlSync('x^2^ and H~2~O', {
        profile: 'gfm-default',
        extensions: ['superscript', 'subscript'],
      });
      assert.match(html, /<sup[^>]*>2<\/sup>/);
      assert.match(html, /<sub[^>]*>2<\/sub>/);
    },
  },
  {
    id: 'smart-punctuation',
    description: 'smart punctuation transforms quotes, dashes, and ellipses in text nodes',
    test() {
      const html = renderMarkdownToHtmlSync('"Quote" -- test ...', {
        profile: 'gfm-default',
        extensions: ['smart-punctuation'],
      });
      assert.match(html, /“Quote”/);
      assert.match(html, /– test …/);
    },
  },
  {
    id: 'citations-experimental',
    description: 'citations render structurally while remaining outside the certified optional boundary',
    test() {
      const ast = parseMarkdownToAst('See [@smith2024].', {
        profile: 'gfm-default',
        extensions: ['citations'],
      });
      const html = renderMarkdownToHtmlSync('See [@smith2024].', {
        profile: 'gfm-default',
        extensions: ['citations'],
      });
      assert.match(html, /<cite[^>]*md-citation/);
      assert.ok(ast.warnings.some((warning) => warning.code === 'citations-experimental'));
    },
  },
  {
    id: 'markdown-in-html-experimental',
    description: 'markdown-in-html requires trusted HTML and renders marked containers experimentally',
    test() {
      const trustedHtml = renderMarkdownToHtmlSync('<div data-markdown="1">**bold**</div>', {
        profile: 'gfm-default',
        extensions: ['markdown-in-html'],
        htmlHandling: 'allow-trusted',
      });
      const untrustedAst = parseMarkdownToAst('<div data-markdown="1">**bold**</div>', {
        profile: 'gfm-default',
        extensions: ['markdown-in-html'],
        htmlHandling: 'escape',
      });
      assert.match(trustedHtml, /<div><p[^>]*><strong[^>]*>bold<\/strong><\/p><\/div>/);
      assert.ok(untrustedAst.warnings.some((warning) => warning.code === 'markdown-in-html-requires-trusted-html'));
      assert.ok(untrustedAst.warnings.some((warning) => warning.code === 'markdown-in-html-experimental'));
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
  assert.equal(summary.failed, 0, `renderer-core optional profile failures: ${summary.failed}`);
  console.log('renderer-core optional profile tests passed');
}
