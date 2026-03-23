import React from 'react';
import { MarkdownRenderer, createMarkdownRendererThemeStyle } from '@markdown-workspace/markdown-renderer-react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({ content }) => {
  return (
    <MarkdownRenderer
      markdown={content}
      className="lander-markdown"
      themeStyle={createMarkdownRendererThemeStyle({
        foreground: 'var(--lander-fg, #0f172a)',
        foregroundMuted: 'var(--lander-fg-muted, #475569)',
        background: 'var(--lander-surface, #ffffff)',
        border: 'var(--lander-border, rgba(15, 23, 42, 0.12))',
        accent: 'var(--lander-accent, #4f46e5)',
        codeBackground: 'var(--lander-code-bg, #0f172a)',
        codeForeground: 'var(--lander-code-fg, #f8fafc)',
        codeBorder: 'var(--lander-code-border, rgba(15, 23, 42, 0.16))',
      })}
    />
  );
};
