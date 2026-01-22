import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { FileNode, AppTheme } from '../../../../types';
import { getSyntaxThemeStyle } from '../../../../data/themes';

interface PreviewPaneProps {
  content: string;
  theme: AppTheme;
  files: FileNode[];
  onNavigate: (fileId: string) => void;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  content,
  theme,
  files,
  onNavigate
}) => {
  const mergeClassNames = (...classes: Array<string | undefined>) =>
    classes.filter(Boolean).join(' ');

  const withAlignment = (
    align: string | undefined,
    style?: React.CSSProperties
  ): React.CSSProperties | undefined => {
    if (!align) return style;
    return { ...style, textAlign: align as React.CSSProperties['textAlign'] };
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (!href) return;
    if (href.startsWith('http://') || href.startsWith('https://')) return;
    e.preventDefault();
    const targetFile = files.find(f => f.name === href);
    if (targetFile) onNavigate(targetFile.id);
  };

  return (
    <div className="preview-pane markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({node, ...props}) => <h1 className="md-h1" {...props} />,
          h2: ({node, ...props}) => <h2 className="md-h2" {...props} />,
          h3: ({node, ...props}) => <h3 className="md-h3" {...props} />,
          h4: ({node, ...props}) => <h4 className="md-h4" {...props} />,
          h5: ({node, ...props}) => <h5 className="md-h5" {...props} />,
          h6: ({node, ...props}) => <h6 className="md-h6" {...props} />,
          p: ({node, ...props}) => <p className="md-p" {...props} />,
          strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
          em: ({node, ...props}) => <em className="md-em" {...props} />,
          hr: ({node, ...props}) => <hr className="md-hr" {...props} />,
          blockquote: ({node, ...props}) => <blockquote className="md-blockquote" {...props} />,
          
          // Lists
          ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
          ol: ({node, ...props}) => <ol className="md-ol" {...props} />,
          li: ({node, ...props}) => <li className="md-li" {...props} />,

          // Tables
          table: ({node, className, children, ...props}: any) => {
            const alignments = Array.isArray(node?.align) ? node.align : [];
            return (
              <table className={mergeClassNames('md-table', className)} {...props}>
                {alignments.length > 0 && (
                  <colgroup className="md-table-columns">
                    {alignments.map((align: string | null, index: number) => (
                      <col
                        key={`col-${index}`}
                        className="md-table-column"
                        style={withAlignment(align ?? undefined)}
                      />
                    ))}
                  </colgroup>
                )}
                {children}
              </table>
            );
          },
          thead: ({node, className, ...props}: any) => (
            <thead className={mergeClassNames('md-table-head', className)} {...props} />
          ),
          tbody: ({node, className, ...props}: any) => (
            <tbody className={mergeClassNames('md-table-body', className)} {...props} />
          ),
          tr: ({node, className, ...props}: any) => (
            <tr className={mergeClassNames('md-table-row', className)} {...props} />
          ),
          th: ({node, className, align, style, ...props}: any) => (
            <th
              className={mergeClassNames('md-table-header', className)}
              style={withAlignment(align, style)}
              {...props}
            />
          ),
          td: ({node, className, align, style, ...props}: any) => (
            <td
              className={mergeClassNames('md-table-cell', className)}
              style={withAlignment(align, style)}
              {...props}
            />
          ),
          caption: ({node, className, ...props}: any) => (
            <caption className={mergeClassNames('md-table-caption', className)} {...props} />
          ),
          colgroup: ({node, className, ...props}: any) => (
            <colgroup className={mergeClassNames('md-table-columns', className)} {...props} />
          ),
          col: ({node, className, style, ...props}: any) => (
            <col
              className={mergeClassNames('md-table-column', className)}
              style={style}
              {...props}
            />
          ),

          // Checkbox (Input)
          input: ({node, ...props}) => {
              if (props.type === 'checkbox') {
                  return <input type="checkbox" className="md-checkbox" {...props} />;
              }
              return <input {...props} />;
          },

          // Links
          a: ({node, href, ...props}) => (
            <a 
              href={href}
              onClick={(e) => handleLinkClick(e, href)}
              target={href?.startsWith('http') ? "_blank" : undefined}
              rel={href?.startsWith('http') ? "noopener noreferrer" : undefined}
              className="md-link" 
              {...props} 
            />
          ),

          // Code
          code: ({node, inline, className, children, ...props}: any) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="md-code-block">
                <div className="md-code-header">
                   <span>{match[1]}</span>
                </div>
                <SyntaxHighlighter
                  style={getSyntaxThemeStyle(theme)}
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
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
