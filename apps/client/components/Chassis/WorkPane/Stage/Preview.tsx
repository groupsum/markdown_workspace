import React from 'react';
import { FileNode, AppTheme } from '../../../../types';
import { WorkspaceMarkdownRenderer } from '../../../Markdown/WorkspaceMarkdownRenderer';

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
  onNavigate,
}) => {
  return (
    <WorkspaceMarkdownRenderer
      markdown={content}
      theme={theme}
      files={files}
      onNavigate={onNavigate}
      className="preview-pane"
    />
  );
};
