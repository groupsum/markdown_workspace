import assert from 'node:assert/strict';
import {
  createHtmlDocument,
  extractMarkdownHeadings,
  parseMarkdownDocument,
  parseMarkdownToAst,
  renderMarkdownToHtml,
  renderMarkdownToHtmlSync,
} from '../dist/index.js';
import { renderMarkdownToHtmlDocumentSync } from '../dist/html.js';

const checks = [
  {
    id: 'frontmatter-parse',
    description: 'parseMarkdownDocument extracts metadata and headings',
    async test() {
      const parsed = parseMarkdownDocument('---\ntitle: Test\n---\n\n# Alpha\n\n## Beta');
      assert.equal(parsed.metadata.title, 'Test');
      assert.deepEqual(parsed.headings.map((heading) => heading.text), ['Alpha', 'Beta']);
    },
  },
  {
    id: 'heading-extraction',
    description: 'extractMarkdownHeadings honors minimum depth filters',
    async test() {
      const headings = extractMarkdownHeadings('# Root\n\n## Child', { minimumDepth: 2 });
      assert.deepEqual(headings.map((heading) => heading.text), ['Child']);
    },
  },
  {
    id: 'ast-shape',
    description: 'parseMarkdownToAst returns a root with heading and paragraph nodes',
    async test() {
      const ast = parseMarkdownToAst('# Title\n\nParagraph');
      assert.equal(ast.type, 'root');
      assert.equal(ast.children[0].type, 'heading');
      assert.equal(ast.children[1].type, 'paragraph');
    },
  },
  {
    id: 'render-sourcepos-and-gfm-features',
    description: 'renderMarkdownToHtmlSync emits source positions, task markup, and code-block markup',
    async test() {
      const html = renderMarkdownToHtmlSync('# Title\n\n- [x] done\n\n```ts\nconst value = 1;\n```', {
        sourcePositionAttributes: true,
      });
      assert.match(html, /markdown-body/);
      assert.match(html, /md-task-list-item/);
      assert.match(html, /md-code-block/);
      assert.match(html, /language-ts/);
      assert.match(html, /token keyword/);
      assert.match(html, /token number/);
      assert.match(html, /data-sourcepos/);
    },
  },
  {
    id: 'syntax-token-languages',
    description: 'renderMarkdownToHtmlSync emits token spans for docs code languages',
    async test() {
      const fixtures = [
        ['ts', 'const value = 1;'],
        ['json', '{"name": "MdWrk", "private": true}'],
        ['bash', 'npm run build # ship'],
        ['css', '.lander { color: #fff; }'],
        ['html', '<main class="lander">Docs</main>'],
        ['md', '## Heading\n\n- item'],
        ['yaml', 'title: MdWrk\nstatus: published'],
      ];

      for (const [language, source] of fixtures) {
        const html = renderMarkdownToHtmlSync(`\`\`\`${language}\n${source}\n\`\`\``);
        assert.match(html, new RegExp(`class="language-${language}"`));
        assert.match(html, /class="token (?:attr-name|boolean|comment|function|keyword|number|operator|property|punctuation|selector|string|tag)"/);
      }
    },
  },
  {
    id: 'escape-html-mode',
    description: 'escape mode emits raw HTML as text',
    async test() {
      const safeHtml = renderMarkdownToHtmlSync('<div>unsafe</div>', { htmlHandling: 'escape' });
      assert.match(safeHtml, /&lt;div&gt;unsafe&lt;\/div&gt;/);
    },
  },
  {
    id: 'trusted-html-mode',
    description: 'allow-trusted mode passes raw HTML through',
    async test() {
      const trustedHtml = renderMarkdownToHtmlSync('<div>trusted</div>', { htmlHandling: 'allow-trusted' });
      assert.match(trustedHtml, /<div>trusted<\/div>/);
    },
  },
  {
    id: 'async-render',
    description: 'renderMarkdownToHtml resolves asynchronously',
    async test() {
      const asyncHtml = await renderMarkdownToHtml('Paragraph');
      assert.match(asyncHtml, /<p/);
    },
  },
  {
    id: 'html-fragment-document',
    description: 'createHtmlDocument wraps body HTML in a document shell',
    async test() {
      const fragment = createHtmlDocument({ title: 'Fragment', bodyHtml: '<main>Fragment</main>' });
      assert.match(fragment, /<!DOCTYPE html>/);
      assert.match(fragment, /<main>Fragment<\/main>/);
    },
  },
  {
    id: 'render-document-sync',
    description: 'renderMarkdownToHtmlDocumentSync returns a complete HTML document',
    async test() {
      const documentHtml = renderMarkdownToHtmlDocumentSync('# Export', { title: 'Export' });
      assert.match(documentHtml, /<!DOCTYPE html>/);
      assert.match(documentHtml, /Export/);
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

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(summary, null, 2));
} else {
  assert.equal(summary.failed, 0, `renderer-core smoke failures: ${summary.failed}`);
  console.log('renderer-core smoke tests passed');
}
