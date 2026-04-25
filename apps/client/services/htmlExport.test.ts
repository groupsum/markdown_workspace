// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { createHtmlExport } from './htmlExport';
import {
  WORKSPACE_PREFERENCES_STORAGE_KEY,
  type WorkspacePreferences,
} from '../src/features/preferences/workspacePreferences';

const preferences = (overrides: Partial<WorkspacePreferences> = {}): WorkspacePreferences => ({
  hidePreviewPolicy: true,
  actionRailDisplayMode: 'icon-only',
  hiddenActionRailButtons: [],
  hiddenEditorToolbarButtons: [],
  htmlExportBackground: 'theme',
  printBackground: 'theme',
  pdfPageOrientation: 'portrait',
  ...overrides,
});

describe('HTML/PDF export document contract', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('emits A4 portrait PDF page tokens and print page rules by default', () => {
    const html = createHtmlExport({
      title: 'report.md',
      content: '# Report\n\nContent',
      theme: 'default',
      coreCss: '',
      themeCss: '',
    });

    expect(html).toContain('--pdf-page-size: A4;');
    expect(html).toContain('@page mdwrk-export-pdf-portrait');
    expect(html).toContain('size: A4 portrait;');
    expect(html).toContain('body.markdown-export {\n      padding: 0;\n    }');
    expect(html).toContain('background: var(--bg-app, #0d0f12);');
    expect(html).toContain('data-pdf-page-orientation="portrait"');
    expect(html).toContain('class="export-page export-page--portrait"');
    expect(html).not.toContain('body.markdown-export {\n      padding: 0;\n      background: #fff;');
  });

  it('emits responsive HTML-export screen styles instead of fixed paper dimensions', () => {
    const html = createHtmlExport({
      title: 'responsive.md',
      content: '# Responsive\n\nPortable HTML content',
      theme: 'default',
      coreCss: '',
      themeCss: '',
    });

    expect(html).toContain('body class="markdown-export markdown-export--theme"');
    expect(html).toContain('--html-export-viewport-padding: clamp(');
    expect(html).toContain('--html-export-content-max-width: 84ch;');
    expect(html).toContain('background: var(--bg-app, #0d0f12);');
    expect(html).toContain('@media screen and (max-aspect-ratio: 3/4)');
    expect(html).toContain('@media screen and (min-aspect-ratio: 16/9)');
    expect(html).toContain('@media screen and (max-width: 480px)');
    expect(html).toContain('@media screen and (max-height: 520px) and (min-aspect-ratio: 4/3)');
    expect(html).toContain('width: 100%;');
    expect(html).not.toContain('--export-page-preview-width');
    expect(html).not.toContain('width: 210mm;');
    expect(html).not.toContain('radial-gradient(circle at top left');
    expect(html).not.toContain('linear-gradient(135deg, var(--bg-app');
  });

  it('emits A4 landscape PDF page rules when the workspace preference requests landscape', () => {
    window.localStorage.setItem(
      WORKSPACE_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences({ pdfPageOrientation: 'landscape' })),
    );

    const html = createHtmlExport({
      title: 'wide-report.md',
      content: '# Wide Report\n\n| A | B |\n| - | - |\n| 1 | 2 |',
      theme: 'default',
      coreCss: '',
      themeCss: '',
    });

    expect(html).toContain('@page mdwrk-export-pdf-landscape');
    expect(html).toContain('size: A4 landscape;');
    expect(html).toContain('data-pdf-page-orientation="landscape"');
    expect(html).toContain('class="export-page export-page--landscape"');
  });

  it('keeps explicit white background available for PDF printing', () => {
    window.localStorage.setItem(
      WORKSPACE_PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences({ htmlExportBackground: 'plain' })),
    );

    const html = createHtmlExport({
      title: 'plain-report.md',
      content: '# Plain Report\n\nContent',
      theme: 'default',
      coreCss: '',
      themeCss: '',
    });

    expect(html).toContain('body class="markdown-export markdown-export--plain"');
    expect(html).toContain('body.markdown-export--plain,\n    body.markdown-export--plain .export-page,\n    body.markdown-export--plain .export-advisory');
    expect(html).toContain('background: #ffffff;');
  });

  it('keeps PDF page-break controls print-scoped so HTML export does not force screen pagination', () => {
    const html = createHtmlExport({
      title: 'breaks.md',
      content: '# Breaks\n\n<div class="page-break"></div>\n\nAfter',
      theme: 'default',
      coreCss: '',
      themeCss: '',
    });

    expect(html).toContain('@media print');
    expect(html).toContain('.export-page .markdown-body .page-break');
    expect(html).toContain('break-before: page;');
  });
});
