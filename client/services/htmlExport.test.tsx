import { describe, expect, it } from 'vitest';
import { createHtmlExport, splitMarkdownIntoPages } from './htmlExport';

const coreCss = '/* core */';
const themeCss = '/* theme */';

describe('splitMarkdownIntoPages', () => {
  it('splits pages on explicit HTML pagebreak markers', () => {
    const pages = splitMarkdownIntoPages('# One\n\n<!-- pagebreak -->\n\n# Two');
    expect(pages).toEqual(['# One', '# Two']);
  });

  it('splits pages on form-feed pagebreak markers', () => {
    const pages = splitMarkdownIntoPages('alpha\n\f\nbeta');
    expect(pages).toEqual(['alpha', 'beta']);
  });

  it('filters out empty page segments', () => {
    const pages = splitMarkdownIntoPages('\n\n<!-- pagebreak -->\n\n');
    expect(pages).toEqual([]);
  });
});

describe('createHtmlExport', () => {
  it('creates multi-page HTML when markdown includes page break markers', () => {
    const html = createHtmlExport({
      title: 'multi.md',
      content: '# Page A\n\n<!-- pagebreak -->\n\n# Page B',
      theme: 'default',
      coreCss,
      themeCss
    });

    expect((html.match(/class="export-page"/g) || []).length).toBe(2);
    expect(html).toContain('Page A');
    expect(html).toContain('Page B');
    expect(html).toContain('page-break-after: always;');
    expect(html).toContain('break-after: page;');
  });

  it('exports preview-specific markdown class names and normalized empty list items', () => {
    const html = createHtmlExport({
      title: 'preview.md',
      content: '# Heading\n\n\t-\n\n[link](https://example.com)',
      theme: 'default',
      coreCss,
      themeCss
    });

    expect(html).toContain('class="md-h1"');
    expect(html).toContain('class="md-link"');
    expect(html).toContain('&amp;nbsp;');
  });

  it('creates one empty page for blank markdown so PDF print still renders', () => {
    const html = createHtmlExport({
      title: 'blank.md',
      content: '\n\n',
      theme: 'default',
      coreCss,
      themeCss
    });

    expect((html.match(/class="export-page"/g) || []).length).toBe(1);
    expect(html).toContain('<div class="markdown-body"></div>');
  });
});
