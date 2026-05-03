import React from 'react';
import { contentFiles } from '../data/content';
import { parseMarkdown } from '../utils/markdownParser';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { summarizeMarkdown } from '../utils/pageMetadata';
import { MarkdownViewer } from './MarkdownViewer';
import { ShieldCheck } from 'lucide-react';

interface LegalViewProps {
  page: 'legal/privacy' | 'legal/terms';
}

export const LegalView: React.FC<LegalViewProps> = ({ page }) => {
  const raw = contentFiles[page];

  if (!raw) {
    return (
      <div className="legal-shell">
        <div className="legal-card">
          <div className="legal-status">
            <ShieldCheck className="legal-status-icon" />
            <span className="legal-status-label">Document Unavailable</span>
          </div>
          <p className="legal-unavailable-copy">
            This document is not currently published.
          </p>
        </div>
      </div>
    );
  }

  const { metadata, content } = parseMarkdown(raw);
  const title = page === 'legal/privacy' ? 'Privacy Policy' : 'Terms of Service';

  usePageMetadata({
    title: `${title} | MdWrk`,
    description: summarizeMarkdown(content),
    path: `/${page}`,
  });

  return (
    <div className="legal-shell">
      <div className="legal-card">
        <div className="legal-status">
           <ShieldCheck className="legal-status-icon" />
           <span className="legal-status-label">Official Document</span>
        </div>
        <div className="legal-last-updated">Last Updated: {metadata.lastUpdated}</div>
        <MarkdownViewer content={content} />
      </div>
    </div>
  );
};
