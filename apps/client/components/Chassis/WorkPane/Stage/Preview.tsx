import React from 'react';
import { FileNode, AppTheme } from '../../../../types';
import { WorkspaceMarkdownRenderer } from '../../../Markdown/WorkspaceMarkdownRenderer';

interface PreviewPaneProps {
  content: string;
  theme: AppTheme;
  files: FileNode[];
  currentFile?: FileNode | null;
  onNavigate: (fileId: string) => void;
}

export const PreviewPane: React.FC<PreviewPaneProps> = ({
  content,
  theme,
  files,
  currentFile = null,
  onNavigate,
}) => {
  return (
    <WorkspaceMarkdownRenderer
      markdown={content}
      theme={theme}
      files={files}
      currentFile={currentFile}
      onNavigate={onNavigate}
      className="preview-pane"
    />
  );
};
