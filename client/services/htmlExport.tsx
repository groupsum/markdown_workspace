import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkSupersub from 'remark-supersub';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { AppTheme } from '../types';
import { getSyntaxTheme } from '../data/themes';
import { CORE_STYLESHEET_TEXT, THEME_STYLESHEET_TEXT } from '../styles';
import { normalizeEmptyListItemsForPreview } from '../hooks/formatting';

const EXPORT_STYLE_OVERRIDES = `
  html,
  body.markdown-export {
    margin: 0;
    min-height: 100%;
    background: var(--bg-app, #0b0f14);
    color: var(--fg-primary, #e9ecf1);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  body.markdown-export {
    overflow-y: auto;
    font-family: "Inter", "Segoe UI", system-ui, sans-serif;
  }

  .export-shell {
    display: block;
    box-sizing: border-box;
    width: min(100%, 980px);
    margin: 0 auto;
    padding: 24px;
  }

  .export-page {
    width: 100%;
    box-sizing: border-box;
    background: var(--bg-panel, #11151a);
    border: 1px solid var(--border-color, rgba(255,255,255,0.1));
    box-shadow: 0 16px 42px rgba(0,0,0,0.3);
    margin: 0 0 20px 0;
    padding: 24px;
    break-after: page;
    page-break-after: always;
  }

  .export-page:last-child {
    margin-bottom: 0;
    break-after: auto;
    page-break-after: auto;
  }

  .export-page .markdown-body {
    margin: 0;
    background: transparent;
  }

  @page {
    margin: 12mm;
  }

  @media print {
    html,
    body.markdown-export {
      background: var(--bg-app, #0b0f14) !important;
      min-height: auto;
      overflow: visible;
    }

    .export-shell {
      width: auto;
      padding: 0;
      margin: 0;
    }

    .export-page {
      width: auto;
      margin: 0;
      border: none;
      box-shadow: none;
      padding: 10mm;
      min-height: calc(297mm - 24mm);
      background: var(--bg-panel, #11151a) !important;
      break-after: page;
      page-break-after: always;
    }

    .export-page:last-child {
      break-after: auto;
      page-break-after: auto;
    }
  }
`;

export const EXPORT_PAGE_BREAK_PATTERN = /\n(?:\s*<!--\s*pagebreak\s*-->\s*\n|\f\n?)/gi;

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const sanitizeFileSegment = (value: string) => value
  .trim()
  .replace(/[\\/:*?"<>|]/g, '')
  .replace(/\s+/g, ' ')
  .slice(0, 120)
  .trim();

const normalizeFallbackName = (fallbackName: string) => {
  const withoutMd = fallbackName.replace(/\.md$/i, '');
  return sanitizeFileSegment(withoutMd) || 'untitled';
};

export const getPreferredExportTitle = (content: string, fallbackName: string): string => {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const h1 = line.match(/^\s*#\s+(.+?)\s*$/);
    if (h1?.[1]) {
      const cleaned = sanitizeFileSegment(h1[1].replace(/[*_`~\[\]()]/g, '').trim());
      if (cleaned) {
        return cleaned;
      }
    }
  }
  return normalizeFallbackName(fallbackName);
};

const previewComponents = (theme: AppTheme) => ({
  h1: ({node, ...props}: any) => <h1 className="md-h1" {...props} />,
  h2: ({node, ...props}: any) => <h2 className="md-h2" {...props} />,
  h3: ({node, ...props}: any) => <h3 className="md-h3" {...props} />,
  h4: ({node, ...props}: any) => <h4 className="md-h4" {...props} />,
  h5: ({node, ...props}: any) => <h5 className="md-h5" {...props} />,
  h6: ({node, ...props}: any) => <h6 className="md-h6" {...props} />,
  p: ({node, ...props}: any) => <p className="md-p" {...props} />,
  strong: ({node, ...props}: any) => <strong className="md-strong" {...props} />,
  em: ({node, ...props}: any) => <em className="md-em" {...props} />,
  hr: ({node, ...props}: any) => <hr className="md-hr" {...props} />,
  blockquote: ({node, ...props}: any) => <blockquote className="md-blockquote" {...props} />,
  ul: ({node, ...props}: any) => <ul className="md-ul" {...props} />,
  ol: ({node, ...props}: any) => <ol className="md-ol" {...props} />,
  li: ({node, checked, ...props}: any) => (
    <li
      className={`md-li${typeof checked === 'boolean' ? ' md-task-list-item' : ''}`}
      data-checked={typeof checked === 'boolean' ? String(checked) : undefined}
      {...props}
    />
  ),
  table: ({node, ...props}: any) => <table className="md-table" {...props} />,
  thead: ({node, ...props}: any) => <thead className="md-table-head" {...props} />,
  tbody: ({node, ...props}: any) => <tbody className="md-table-body" {...props} />,
  tr: ({node, ...props}: any) => <tr className="md-table-row" {...props} />,
  th: ({node, ...props}: any) => <th className="md-table-header" {...props} />,
  td: ({node, ...props}: any) => <td className="md-table-cell" {...props} />,
  caption: ({node, ...props}: any) => <caption className="md-table-caption" {...props} />,
  colgroup: ({node, ...props}: any) => <colgroup className="md-table-columns" {...props} />,
  col: ({node, ...props}: any) => <col className="md-table-column" {...props} />,
  input: ({node, ...props}: any) => {
    if (props.type === 'checkbox') {
      return <input type="checkbox" className="md-checkbox" {...props} />;
    }
    return <input {...props} />;
  },
  a: ({node, ...props}: any) => <a className="md-link" {...props} />,
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
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkSupersub]} components={previewComponents(theme)}>
      {normalizeEmptyListItemsForPreview(content)}
    </ReactMarkdown>
  </div>
);

export const splitMarkdownIntoPages = (content: string): string[] => content
  .split(EXPORT_PAGE_BREAK_PATTERN)
  .map((segment) => segment.trim())
  .filter(Boolean);

export const getExportStyles = async (theme: AppTheme): Promise<{ coreCss: string; themeCss: string; }> => ({
  coreCss: CORE_STYLESHEET_TEXT,
  themeCss: THEME_STYLESHEET_TEXT[theme] || THEME_STYLESHEET_TEXT.default
});

export const toHtmlFileName = (name: string, content = '') => {
  const preferredTitle = getPreferredExportTitle(content, name);
  return `${preferredTitle}.html`;
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
  const previewPages = splitMarkdownIntoPages(content);
  const pageContents = previewPages.length > 0 ? previewPages : [''];
  const previewHtml = pageContents
    .map((pageContent) => `<section class="export-page">${renderPreviewMarkup(pageContent, theme)}</section>`)
    .join('\n');
  const preferredTitle = getPreferredExportTitle(content, title);
  const safeTitle = escapeHtml(preferredTitle);

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
    ${previewHtml}
  </main>
</body>
</html>`;
};
