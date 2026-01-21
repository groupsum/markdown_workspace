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
  }

  .export-shell {
    max-width: 1100px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }

  .export-header {
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.1));
  }

  .export-header h1 {
    font-size: 1.6rem;
    margin: 0 0 8px;
  }

  .export-header p {
    margin: 0;
    color: var(--fg-muted, #9aa3b2);
    font-size: 0.9rem;
  }

  .export-section {
    background: var(--bg-secondary, rgba(255,255,255,0.04));
    border: 1px solid var(--border-color, rgba(255,255,255,0.1));
    padding: 24px;
  }

  .export-section h2 {
    margin-top: 0;
    font-size: 1.2rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  .markdown-source {
    white-space: pre-wrap;
    word-break: break-word;
    background: rgba(0,0,0,0.35);
    border: 1px solid var(--border-color, rgba(255,255,255,0.1));
    padding: 16px;
    font-family: "JetBrains Mono", "Fira Code", monospace;
    font-size: 0.9rem;
  }

  .export-pane {
    margin-top: 16px;
  }
`;

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

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
  li: ({node, ...props}: any) => <li className="md-li" {...props} />,
  table: ({node, ...props}: any) => <table className="md-table" {...props} />,
  thead: ({node, ...props}: any) => <thead {...props} />,
  tbody: ({node, ...props}: any) => <tbody {...props} />,
  tr: ({node, ...props}: any) => <tr {...props} />,
  th: ({node, ...props}: any) => <th {...props} />,
  td: ({node, ...props}: any) => <td {...props} />,
  input: ({node, ...props}: any) => {
    if (props.type === 'checkbox') {
      return <input type="checkbox" className="md-checkbox" {...props} />;
    }
    return <input {...props} />;
  },
  a: ({node, href, ...props}: any) => (
    <a
      href={href}
      className="md-link"
      target={href?.startsWith('http') ? "_blank" : undefined}
      rel={href?.startsWith('http') ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  code: ({node, inline, className, children, ...props}: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <div className="md-code-block">
        <div className="md-code-header">
          <span>{match[1]}</span>
        </div>
        <SyntaxHighlighter
          style={getSyntaxTheme(theme)}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0, borderRadius: 0, border: 'none' }}
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      </div>
    ) : (
      <code className="md-inline-code" {...props}>
        {children}
      </code>
    );
  }
});

const renderPureMarkup = (content: string) => renderToStaticMarkup(
  <div className="markdown-body export-pane export-pane--pure">
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {content}
    </ReactMarkdown>
  </div>
);

const renderPreviewMarkup = (content: string, theme: AppTheme) => renderToStaticMarkup(
  <div className="markdown-body export-pane export-pane--preview">
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
  const pureHtml = renderPureMarkup(content);
  const previewHtml = renderPreviewMarkup(content, theme);
  const markdownHtml = `<pre class="markdown-source"><code>${escapeHtml(content)}</code></pre>`;
  const safeTitle = title.replace(/\.md$/i, '');

  return `<!DOCTYPE html>
<html lang="en" data-theme="${theme}" class="theme-${theme}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(safeTitle)} - HTML Export</title>
  <style>
${coreCss}
${themeCss}
${EXPORT_STYLE_OVERRIDES}
  </style>
</head>
<body class="markdown-export">
  <main class="export-shell">
    <header class="export-header">
      <h1>${escapeHtml(safeTitle)}</h1>
      <p>Markdown source, pure render, and preview render exports.</p>
    </header>

    <section class="export-section">
      <h2>Markdown Source</h2>
      ${markdownHtml}
    </section>

    <section class="export-section">
      <h2>Pure Render</h2>
      ${pureHtml}
    </section>

    <section class="export-section">
      <h2>Preview Render</h2>
      ${previewHtml}
    </section>
  </main>
</body>
</html>`;
};
