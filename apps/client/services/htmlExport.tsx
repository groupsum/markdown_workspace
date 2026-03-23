import { createHtmlDocument } from '@markdown-workspace/markdown-renderer-core';
import { renderMarkdownToStaticHtml } from '@markdown-workspace/markdown-renderer-react';
import { AppTheme } from '../types';
import { CORE_STYLESHEET_TEXT, THEME_STYLESHEET_TEXT } from '../styles';

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

export const getExportStyles = async (theme: AppTheme): Promise<{ coreCss: string; themeCss: string; }> => ({
  coreCss: CORE_STYLESHEET_TEXT,
  themeCss: THEME_STYLESHEET_TEXT[theme] || THEME_STYLESHEET_TEXT.default
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
  themeCss
}: {
  title: string;
  content: string;
  theme: AppTheme;
  coreCss: string;
  themeCss: string;
}) => {
  const previewHtml = renderMarkdownToStaticHtml({ markdown: content });

  return createHtmlDocument({
    title: `${title.replace(/\.md$/i, '')} - Preview Export`,
    bodyClassName: 'markdown-export',
    dataTheme: theme,
    htmlClassName: `theme-${theme}`,
    stylesheets: [coreCss, themeCss, EXPORT_STYLE_OVERRIDES],
    bodyHtml: `
  <main class="export-shell">
    <section class="export-page">
      ${previewHtml}
    </section>
  </main>`,
  });
};
