import { createHtmlDocument } from '@mdwrk/markdown-renderer-core';
import { renderMarkdownToStaticHtml } from '@mdwrk/markdown-renderer-react';
import { AppTheme } from '../types';
import { CORE_STYLESHEET_TEXT, THEME_STYLESHEET_TEXT } from '../styles';
import { getMarkdownProfileWarnings, readStoredMarkdownProfileConfigSync } from '../src/features/markdownProfiles/profileConfig';
import {
  normalizeEmptyListItemsForPreview,
  resolveMarkdownHtmlHandlingMode,
  rewriteRenderedMarkdownLinksForHtmlExport,
} from './markdownPreviewPolicy.js';
import { readWorkspacePreferencesSync } from '../src/features/preferences/workspacePreferences';
import { resolveExportMessage } from '../src/features/i18n/exportLocalization';

const EXPORT_STYLE_OVERRIDES = `
  :root {
    --pdf-page-size: A4;
    --pdf-page-margin-block: 14mm;
    --pdf-page-margin-inline: 16mm;
    --pdf-content-font-size: 10.5pt;
    --pdf-content-line-height: 1.5;
    --pdf-heading-keep-with-next: avoid;
    --html-export-viewport-padding: clamp(18px, 4vw, 56px);
    --html-export-shell-gap: clamp(18px, 3vw, 36px);
    --html-export-content-max-width: 84ch;
    --html-export-wide-content-max-width: min(118ch, calc(100vw - (var(--html-export-viewport-padding) * 2)));
    --html-export-page-padding-block: clamp(24px, 5vw, 64px);
    --html-export-page-padding-inline: clamp(20px, 5vw, 72px);
    --html-export-advisory-padding: clamp(14px, 2vw, 20px);
  }

  body.markdown-export {
    margin: 0;
    min-height: 100vh;
    padding: var(--html-export-viewport-padding);
    font-family: "Inter", "Segoe UI", system-ui, sans-serif;
    background: var(--bg-app, #0d0f12);
    color: var(--fg-primary, #e9ecf1);
    overflow-x: hidden;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .export-shell {
    display: flex;
    flex-direction: column;
    gap: var(--html-export-shell-gap);
    align-items: stretch;
    width: 100%;
    max-width: var(--html-export-content-max-width);
    margin-inline: auto;
  }

  .export-shell[data-pdf-page-orientation="landscape"] {
    max-width: var(--html-export-wide-content-max-width);
  }

  .export-page {
    width: 100%;
    min-width: 0;
    padding: var(--html-export-page-padding-block) var(--html-export-page-padding-inline);
    box-sizing: border-box;
    background: var(--bg-panel, #11151a);
    border: 1px solid var(--border-color, rgba(255,255,255,0.1));
    box-shadow: 0 20px 60px rgba(0,0,0,0.28);
  }

  body.markdown-export--plain,
  .export-shell--plain .export-page,
  .export-shell--plain .export-advisory {
    background: #ffffff;
    color: #111111;
    border-color: rgba(0, 0, 0, 0.12);
    box-shadow: none;
  }

  .export-shell--grayscale {
    filter: grayscale(1);
  }

  .export-page .markdown-body {
    margin: 0;
    max-width: none;
    overflow-wrap: break-word;
    word-break: normal;
  }

  .export-page pre,
  .export-page code,
  .export-page table,
  .export-page img,
  .export-page svg {
    max-width: 100%;
  }

  .export-page table,
  .export-page .md-table {
    width: 100%;
    table-layout: fixed;
  }

  .export-page pre {
    white-space: pre-wrap;
    overflow-wrap: break-word;
  }

  .export-advisory {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding: var(--html-export-advisory-padding);
    border: 1px solid var(--border-color, rgba(255,255,255,0.12));
    background: var(--bg-panel, #11151a);
  }

  .export-advisory-title {
    display: block;
    margin-bottom: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .export-advisory ul {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    line-height: 1.55;
    color: var(--fg-muted, #b7beca);
    overflow-wrap: break-word;
  }

  @media screen and (max-aspect-ratio: 3/4) {
    :root {
      --html-export-content-max-width: min(76ch, calc(100vw - (var(--html-export-viewport-padding) * 2)));
      --html-export-page-padding-block: clamp(20px, 5vw, 42px);
      --html-export-page-padding-inline: clamp(16px, 5vw, 36px);
    }
  }

  @media screen and (min-aspect-ratio: 4/3) {
    :root {
      --html-export-content-max-width: min(92ch, calc(100vw - (var(--html-export-viewport-padding) * 2)));
      --html-export-wide-content-max-width: min(126ch, calc(100vw - (var(--html-export-viewport-padding) * 2)));
    }
  }

  @media screen and (min-aspect-ratio: 16/9) {
    :root {
      --html-export-content-max-width: min(98ch, calc(100vw - (var(--html-export-viewport-padding) * 2)));
      --html-export-wide-content-max-width: min(138ch, calc(100vw - (var(--html-export-viewport-padding) * 2)));
    }
  }

  @media screen and (max-width: 720px) {
    body.markdown-export {
      padding: clamp(10px, 3vw, 18px);
    }

    .export-page {
      padding: clamp(18px, 6vw, 28px) clamp(14px, 5vw, 22px);
      box-shadow: 0 10px 28px rgba(0,0,0,0.18);
    }

    .export-page .markdown-body {
      font-size: clamp(0.92rem, 2.8vw, 1rem);
    }
  }

  @media screen and (max-width: 480px) {
    body.markdown-export {
      padding: 0;
    }

    .export-shell {
      gap: 0;
      max-width: none;
    }

    .export-page,
    .export-advisory {
      border-left: 0;
      border-right: 0;
      box-shadow: none;
    }
  }

  @media screen and (max-height: 520px) and (min-aspect-ratio: 4/3) {
    :root {
      --html-export-viewport-padding: 12px;
      --html-export-shell-gap: 12px;
      --html-export-page-padding-block: 18px;
      --html-export-page-padding-inline: 24px;
    }
  }

  @media screen and (min-width: 1600px) {
    :root {
      --html-export-content-max-width: 96ch;
      --html-export-wide-content-max-width: 136ch;
    }
  }

  @page {
    size: A4 portrait;
    margin: var(--pdf-page-margin-block, 14mm) var(--pdf-page-margin-inline, 16mm);
  }

  @page mdwrk-export-pdf-portrait {
    size: A4 portrait;
    margin: var(--pdf-page-margin-block, 14mm) var(--pdf-page-margin-inline, 16mm);
  }

  @page mdwrk-export-pdf-landscape {
    size: A4 landscape;
    margin: var(--pdf-page-margin-block, 14mm) var(--pdf-page-margin-inline, 16mm);
  }

  @media print {
    html,
    body.markdown-export {
      width: 100%;
      min-height: 100%;
      overflow: visible;
      background: var(--bg-app, #0d0f12);
      color: var(--fg-primary, #e9ecf1);
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    body.markdown-export {
      padding: 0;
    }

    .export-shell {
      gap: 0;
      max-width: none;
    }

    .export-advisory {
      width: auto;
      margin: 0 0 16px;
      box-shadow: none;
    }

    .export-page {
      page: mdwrk-export-pdf-portrait;
      width: auto;
      min-height: auto;
      padding: 0;
      margin: 0;
      border: none;
      background: var(--bg-app, #0d0f12);
      color: var(--fg-primary, #e9ecf1);
      box-shadow: none;
      break-after: auto;
      page-break-after: auto;
    }

    body.markdown-export--plain,
    body.markdown-export--plain .export-page,
    body.markdown-export--plain .export-advisory {
      background: #ffffff;
      color: #111111;
    }

    .export-page--landscape {
      page: mdwrk-export-pdf-landscape;
    }

    .export-page .markdown-body {
      font-size: var(--pdf-content-font-size, 10.5pt);
      line-height: var(--pdf-content-line-height, 1.5);
    }

    .export-page .markdown-body h1,
    .export-page .markdown-body h2,
    .export-page .markdown-body h3,
    .export-page .markdown-body h4,
    .export-page .markdown-body h5,
    .export-page .markdown-body h6 {
      break-after: var(--pdf-heading-keep-with-next, avoid);
      page-break-after: avoid;
    }

    .export-page .markdown-body .page-break,
    .export-page .markdown-body [data-page-break="always"],
    .export-page .markdown-body hr.md-page-break {
      display: block;
      height: 0;
      margin: 0;
      padding: 0;
      border: 0;
      break-before: page;
      page-break-before: always;
    }

    .export-page .markdown-body [data-break-before="page"] {
      break-before: page;
      page-break-before: always;
    }

    .export-page .markdown-body [data-break-after="page"] {
      break-after: page;
      page-break-after: always;
    }

    .export-page .markdown-body [data-break-inside="avoid"] {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`;

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

export const getExportStyles = async (theme: AppTheme): Promise<{ coreCss: string; themeCss: string; }> => ({
  coreCss: CORE_STYLESHEET_TEXT,
  themeCss: THEME_STYLESHEET_TEXT[theme] || THEME_STYLESHEET_TEXT.default,
});

export const toHtmlFileName = (name: string) => {
  const base = name.replace(/\.md$/i, '');
  return `${base}.html`;
};

export const createHtmlExport = ({
  title,
  content,
  theme,
  coreCss,
  themeCss,
}: {
  title: string;
  content: string;
  theme: AppTheme;
  coreCss: string;
  themeCss: string;
}) => {
  const profileConfig = readStoredMarkdownProfileConfigSync();
  const workspacePreferences = readWorkspacePreferencesSync();
  const htmlHandling = resolveMarkdownHtmlHandlingMode(profileConfig, 'export');
  const warnings = getMarkdownProfileWarnings(profileConfig, 'export');
  const normalizedContent = normalizeEmptyListItemsForPreview(content);
  const renderedPreviewHtml = renderMarkdownToStaticHtml({
    markdown: normalizedContent,
    profile: profileConfig.baseProfile,
    extensions: profileConfig.enabledExtensions,
    htmlHandling,
    preserveSoftLineBreaks: true,
  });
  const previewHtml = rewriteRenderedMarkdownLinksForHtmlExport(renderedPreviewHtml);

  const advisoryItems = workspacePreferences.hidePreviewPolicy
    ? []
    : [
        htmlHandling === 'allow-trusted'
          ? resolveExportMessage('core.export.policy.allowTrusted', 'Raw HTML passthrough is enabled for this export.')
          : resolveExportMessage('core.export.policy.sanitize', 'Raw HTML is sanitized for this export unless trusted HTML mode is explicitly enabled.'),
        ...warnings.map((warning) => warning.message),
      ];

  const advisoryHtml = advisoryItems.length > 0
    ? `
      <aside class="export-advisory" data-markdown-html-handling="${escapeHtml(htmlHandling)}">
        <span class="export-advisory-title">${escapeHtml(resolveExportMessage('core.export.policy.title', 'Export Policy'))}</span>
        <ul>
          ${advisoryItems.map((message) => `<li>${escapeHtml(message)}</li>`).join('')}
        </ul>
      </aside>`
    : '';

  return createHtmlDocument({
    title: `${title.replace(/\.md$/i, '')} - Preview Export`,
    bodyClassName: `markdown-export markdown-export--${workspacePreferences.htmlExportBackground}`,
    dataTheme: theme,
    htmlClassName: `theme-${theme}`,
    stylesheets: [coreCss, themeCss, EXPORT_STYLE_OVERRIDES],
    bodyHtml: `
  <main class="export-shell export-shell--${workspacePreferences.htmlExportBackground}" data-markdown-html-handling="${escapeHtml(htmlHandling)}" data-pdf-page-orientation="${workspacePreferences.pdfPageOrientation}">
    ${advisoryHtml}
    <section class="export-page export-page--${workspacePreferences.pdfPageOrientation}">
      ${previewHtml}
    </section>
  </main>`,
  });
};
