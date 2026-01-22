import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { AppTheme } from '../types';
import { getSyntaxTheme } from '../data/themes';

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

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const previewComponents = (theme: AppTheme) => ({
  table: ({node, ...props}: any) => <table className="md-table" {...props} />,
  thead: ({node, ...props}: any) => <thead className="md-table-head" {...props} />,
  tbody: ({node, ...props}: any) => <tbody className="md-table-body" {...props} />,
  tr: ({node, ...props}: any) => <tr className="md-table-row" {...props} />,
  th: ({node, ...props}: any) => <th className="md-table-header" {...props} />,
  td: ({node, ...props}: any) => <td className="md-table-cell" {...props} />,
  caption: ({node, ...props}: any) => <caption className="md-table-caption" {...props} />,
  colgroup: ({node, ...props}: any) => <colgroup className="md-table-columns" {...props} />,
  col: ({node, ...props}: any) => <col className="md-table-column" {...props} />,
  code: ({node, inline, className, children, ...props}: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="md-code-block">
        <div className="md-code-header">
          <span>{match[1]}</span>
        </div>
        <div className="md-code-surface">
          <SyntaxHighlighter
            style={getSyntaxTheme(theme)}
            language={match[1]}
            PreTag="div"
            customStyle={{ margin: 0, borderRadius: 0, border: 'none', background: 'transparent', padding: 0 }}
            {...props}
          >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      </div>
    ) : (
      <code className="md-inline-code" {...props}>
        {children}
      </code>
    );
  }
});

const renderPreviewMarkup = (content: string, theme: AppTheme) => renderToStaticMarkup(
  <div className="markdown-body">
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={previewComponents(theme)}>
      {content}
    </ReactMarkdown>
  </div>
);

const getCssText = async (linkId: string): Promise<string> => {
  const linkEl = document.getElementById(linkId) as HTMLLinkElement | null;
  if (!linkEl?.href) return '';
  try {
    const response = await fetch(linkEl.href);
    if (!response.ok) return '';
    return await response.text();
  } catch (error) {
    console.warn(`[htmlExport] Failed to load CSS from ${linkEl.href}`, error);
    return '';
  }
};

export const getExportStyles = async (): Promise<{ coreCss: string; themeCss: string; }> => {
  const coreCss = await getCssText('lattice-core');
  const themeCss = await getCssText('lattice-theme');
  return { coreCss, themeCss };
};

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
  const previewHtml = renderPreviewMarkup(content, theme);
  const safeTitle = escapeHtml(title.replace(/\.md$/i, ''));

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}" class="theme-${theme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - Preview Export</title>
  <style>
${coreCss}
${themeCss}
${EXPORT_STYLE_OVERRIDES}
  </style>
</head>
<body class="markdown-export">
  <main class="export-shell">
    <section class="export-page">
      ${previewHtml}
    </section>
  </main>
</body>
</html>`;
};
