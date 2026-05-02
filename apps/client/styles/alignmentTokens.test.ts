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
    expect(rootCss).toContain('--pdf-page-size: A4;');
    expect(rootCss).toContain('--pdf-page-margin-block: 14mm;');
    expect(rootCss).toContain('--pdf-page-margin-inline: 16mm;');
  });

  it('uses shared tokens for editor and markdown rhythm', () => {
    const editorCss = read('./base/ui-editor.css');
    const markdownCss = read('./base/markdown.css');

    expect(editorCss).toContain('line-height: var(--editor-line-rhythm);');
    expect(editorCss).toContain('height: var(--editor-line-rhythm);');
    expect(markdownCss).toContain('line-height: var(--markdown-line-height);');
    expect(markdownCss).toContain('line-height: var(--markdown-heading-line-height);');
    expect(editorCss).toContain('width: var(--line-number-gutter-width);');
    expect(editorCss).toContain('padding: var(--editor-padding) 8px;');
    expect(editorCss).not.toContain('padding: calc(var(--editor-padding) - 8px) 8px;');
  });

  it('defines PDF print pages and page-break controls through tokens', () => {
    const printCss = read('./base/chassis/print.css');
    const markdownCss = read('./base/markdown.css');

    expect(printCss).toContain('@page mdwrk-pdf-portrait');
    expect(printCss).toContain('size: A4 portrait;');
    expect(printCss).toContain('@page mdwrk-pdf-landscape');
    expect(printCss).toContain('size: A4 landscape;');
    expect(printCss).toContain('margin: var(--pdf-page-margin-block, 14mm) var(--pdf-page-margin-inline, 16mm);');
    expect(printCss).toContain('.preview-pane-overlay-actions,');
    expect(printCss).toContain('body[data-pdf-page-orientation="landscape"]');
    expect(printCss).not.toContain('.markdown-body {\n    page: mdwrk-pdf-portrait;');
    expect(markdownCss).toContain('font-size: var(--pdf-content-font-size, 10.5pt);');
    expect(markdownCss).toContain('break-before: page;');
  });

  it('keeps inline single-backtick code close to paragraph sizing', () => {
    const markdownCss = read('./base/markdown.css');

    expect(markdownCss).toContain('font-size: calc(1em + 1px);');
    expect(markdownCss).toContain('line-height: 1.35;');
  });

  it('prevents editor and preview surfaces from creating horizontal scroll', () => {
    const editorCss = read('./base/ui-editor.css');
    const markdownCss = read('./base/markdown.css');
    const portableEditorCss = read('../../../packages/editor/markdown-editor-react/src/styles/default.css');
    const portableRendererCss = read('../../../packages/renderer/markdown-renderer-react/src/styles/default.css');

    expect(editorCss).toContain('white-space: pre-wrap;');
    expect(editorCss).toContain('overflow-x: hidden;');
    expect(editorCss).toContain('overflow-wrap: anywhere;');
    expect(editorCss).toContain('--preview-pane-inline-padding: clamp(18px, 4vw, 64px);');
    expect(editorCss).toContain('padding: 18px var(--preview-pane-inline-padding) 24px;');
    expect(editorCss).toContain('max-width: 78ch;');
    expect(editorCss).toContain('.preview-pane .markdown-body > p');
    expect(markdownCss).toContain('width: 100%;');
    expect(markdownCss).toContain('table-layout: fixed;');
    expect(markdownCss).toContain('white-space: pre-wrap;');
    expect(markdownCss).toContain('overflow-x: hidden;');
    expect(portableEditorCss).toContain('overflow-wrap: anywhere;');
    expect(portableEditorCss).toContain('overflow-x: hidden;');
    expect(portableEditorCss).toContain('padding: var(--mwe-editor-padding, 16px) 8px;');
    expect(portableEditorCss).not.toContain('padding: calc(var(--mwe-editor-padding, 16px) - 8px) 8px;');
    expect(portableRendererCss).toContain('table-layout: fixed;');
    expect(portableRendererCss).toContain('overflow-x: hidden !important;');
  });

  it('keeps preview export and print controls as top-right overlay buttons', () => {
    const editorCss = read('./base/ui-editor.css');

    expect(editorCss).toContain('.preview-pane-overlay-actions');
    expect(editorCss).toContain('position: sticky;');
    expect(editorCss).toContain('justify-content: flex-end;');
    expect(editorCss).toContain('.preview-pane-overlay-btn');
    expect(editorCss).toContain('pointer-events: auto;');
  });

  it('keeps workspace module toolbar and panes in a two-row container grid', () => {
    const shellCss = read('./base/shell-structure.css');
    const editorCss = read('./base/ui-editor.css');

    expect(shellCss).toContain(':root[data-theme] .editor-pane-container');
    expect(shellCss).toContain('display: grid;');
    expect(shellCss).toContain('grid-template-rows: auto minmax(0, 1fr);');
    expect(shellCss).toContain('grid-row: 2;');
    expect(shellCss).not.toContain(':root[data-theme] .editor-pane-container {\n  display: flex;');
    expect(editorCss).not.toContain('position: absolute !important;');
    expect(editorCss).not.toContain('width: clamp(34px, 9vw, 40px) !important;');
  });
});
