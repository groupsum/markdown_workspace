import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  const html = useMemo(() => {
    // Customizing marked for subscript and superscript
    const renderer = new marked.Renderer();
    
    // GFM is enabled by default in marked 12.x
    const rawHtml = marked.parse(content, { 
      renderer,
      breaks: true,
      gfm: true 
    }) as string;

    // Post-process for subscript (~~ is strikethrough in marked, so we use ~text~)
    // and superscript (^text^)
    let processedHtml = rawHtml
      .replace(/~([^~]+)~/g, '<sub>$1</sub>')
      .replace(/\^([^\^]+)\^/g, '<sup>$1</sup>');

    return DOMPurify.sanitize(processedHtml);
  }, [content]);

  return (
    <div 
      className="prose prose-slate dark:prose-invert max-w-none 
        prose-headings:font-bold prose-headings:tracking-tight
        prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline
        prose-img:rounded-xl prose-img:shadow-lg
        
        prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-pre:border prose-pre:border-slate-800
        dark:prose-pre:bg-slate-900 dark:prose-pre:border-slate-800

        prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-700
        prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:p-3
        prose-td:p-3 prose-td:border-t prose-td:border-slate-100 dark:prose-td:border-slate-800"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};