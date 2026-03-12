import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const read = (relativePath: string) =>
  readFileSync(resolve(__dirname, relativePath), 'utf8');

describe('markdown/editor alignment token contract', () => {
  it('keeps markdown line height bound to editor line height token', () => {
    const rootCss = read('./base/root.css');
    expect(rootCss).toContain('--editor-line-rhythm: var(--editor-line-height);');
    expect(rootCss).toContain('--markdown-line-height: var(--editor-line-rhythm);');
    expect(rootCss).toContain('--markdown-heading-line-height: calc(1.1 + ((var(--ui-scale) - 1) * 0.35));');
  });

  it('uses shared tokens for editor and markdown rhythm', () => {
    const editorCss = read('./base/ui-editor.css');
    const markdownCss = read('./base/markdown.css');

    expect(editorCss).toContain('line-height: var(--editor-line-rhythm);');
    expect(editorCss).toContain('height: var(--editor-line-rhythm);');
    expect(markdownCss).toContain('line-height: var(--markdown-line-height);');
    expect(markdownCss).toContain('line-height: var(--markdown-heading-line-height);');
    expect(editorCss).toContain('width: var(--line-number-gutter-width);');
  });

  it('keeps inline single-backtick code close to paragraph sizing', () => {
    const markdownCss = read('./base/markdown.css');

    expect(markdownCss).toContain('font-size: calc(1em + 1px);');
    expect(markdownCss).toContain('line-height: 1.35;');
  });
});
