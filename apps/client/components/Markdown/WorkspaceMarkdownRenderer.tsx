import React from 'react';
import { MarkdownRenderer, createMarkdownRendererThemeStyle } from '@mdwrk/markdown-renderer-react';
import { getSyntaxThemeStyle } from '../../data/themes';
import type { AppTheme, FileNode } from '../../types';

interface WorkspaceMarkdownRendererProps {
  readonly markdown: string;
  readonly theme: AppTheme;
  readonly files: FileNode[];
  readonly onNavigate: (fileId: string) => void;
  readonly className?: string;
}

const isExternalHref = (href?: string) => Boolean(href && /^(https?:)?\/\//i.test(href));

export function WorkspaceMarkdownRenderer({
  markdown,
  theme,
  files,
  onNavigate,
  className,
}: WorkspaceMarkdownRendererProps): React.JSX.Element {
  return (
    <MarkdownRenderer
      markdown={markdown}
      className={className}
      syntaxTheme={getSyntaxThemeStyle(theme)}
      themeStyle={createMarkdownRendererThemeStyle()}
      onLinkClick={(event, href) => {
        if (!href || isExternalHref(href)) return;
        const targetFile = files.find((file) => file.name === href);
        if (!targetFile) return;
        event.preventDefault();
        onNavigate(targetFile.id);
      }}
    />
  );
}
