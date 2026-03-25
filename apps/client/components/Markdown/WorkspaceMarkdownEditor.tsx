import React from 'react';
import {
  MarkdownSourceEditor,
  createMarkdownEditorThemeStyle,
  type MarkdownSourceEditorHandle,
  type MarkdownSourceEditorProps,
} from '@mdwrk/markdown-editor-react';
import type { AppTheme } from '../../types';

export interface WorkspaceMarkdownEditorProps extends Omit<MarkdownSourceEditorProps, 'themeStyle' | 'themeVariables'> {
  readonly theme: AppTheme;
}

export const WorkspaceMarkdownEditor = React.forwardRef<MarkdownSourceEditorHandle, WorkspaceMarkdownEditorProps>(
  function WorkspaceMarkdownEditor({ theme: _theme, style, ...props }, ref): React.JSX.Element {
    return (
      <MarkdownSourceEditor
        ref={ref}
        {...props}
        themeStyle={{
          ...createMarkdownEditorThemeStyle(),
          ...style,
        }}
      />
    );
  },
);
