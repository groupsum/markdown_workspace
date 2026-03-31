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

const EXPORT_STYLE_OVERRIDES = `
  body.markdown-export {
    margin: 0;
    padding: 32px;
    font-family: "Inter", "Segoe UI", system-ui, sans-serif;
    background: var(--bg-primary, #0d0f12);
    color: var(--fg-primary, #e9ecf1);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .export-shell {
    display: flex;
    flex-direction: column;
    gap: 32px;
    align-items: center;
  }

  .export-page {
    width: 8.5in;
    min-height: 11in;
    padding: 0.75in;
    box-sizing: border-box;
    background: var(--bg-panel, #11151a);
    border: 1px solid var(--border-color, rgba(255,255,255,0.1));
    box-shadow: 0 20px 60px rgba(0,0,0,0.45);
  }

  .export-page .markdown-body {
    margin: 0;
  }

  .export-advisory {
    width: 8.5in;
    box-sizing: border-box;
    padding: 16px 18px;
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
  }

  @page {
    margin: 0.75in;
  }

  @media print {
    body.markdown-export {
      padding: 0;
      background: #fff;
    }

    .export-shell {
      gap: 0;
    }

    .export-advisory {
      width: auto;
      margin: 0 0 16px;
      box-shadow: none;
    }

    .export-page {
      width: auto;
      min-height: auto;
      margin: 0;
      border: none;
      box-shadow: none;
      page-break-after: always;
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
  const htmlHandling = resolveMarkdownHtmlHandlingMode(profileConfig, 'export');
  const warnings = getMarkdownProfileWarnings(profileConfig, 'export');
  const normalizedContent = normalizeEmptyListItemsForPreview(content);
  const renderedPreviewHtml = renderMarkdownToStaticHtml({
    markdown: normalizedContent,
    profile: profileConfig.baseProfile,
    extensions: profileConfig.enabledExtensions,
    htmlHandling,
  });
  const previewHtml = rewriteRenderedMarkdownLinksForHtmlExport(renderedPreviewHtml);

  const advisoryItems = [
    htmlHandling === 'allow-trusted'
      ? 'Raw HTML passthrough is enabled for this export.'
      : 'Raw HTML is sanitized for this export unless trusted HTML mode is explicitly enabled.',
    ...warnings.map((warning) => warning.message),
  ];

  const advisoryHtml = advisoryItems.length > 0
    ? `
      <aside class="export-advisory" data-markdown-html-handling="${escapeHtml(htmlHandling)}">
        <span class="export-advisory-title">EXPORT_POLICY</span>
        <ul>
          ${advisoryItems.map((message) => `<li>${escapeHtml(message)}</li>`).join('')}
        </ul>
      </aside>`
    : '';

  return createHtmlDocument({
    title: `${title.replace(/\.md$/i, '')} - Preview Export`,
    bodyClassName: 'markdown-export',
    dataTheme: theme,
    htmlClassName: `theme-${theme}`,
    stylesheets: [coreCss, themeCss, EXPORT_STYLE_OVERRIDES],
    bodyHtml: `
  <main class="export-shell" data-markdown-html-handling="${escapeHtml(htmlHandling)}">
    ${advisoryHtml}
    <section class="export-page">
      ${previewHtml}
    </section>
  </main>`,
  });
};
