// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { WorkPane } from './WorkPane';

vi.mock('./Explorer/FileTree', () => ({
  FileTree: () => <div data-testid="mock-file-tree" />,
}));

vi.mock('./Stage/EditorPane', () => ({
  EditorPane: () => <div data-testid="mock-editor-pane" />,
}));

vi.mock('../../../src/features/i18n/useClientI18n', () => ({
  useClientI18n: () => ({ t: (_key: string, fallback: string) => fallback }),
}));

describe('WorkPane sidebar resizer', () => {
  afterEach(() => {
    cleanup();
    document.body.classList.remove('is-resizing-sidebar');
  });

  it('resizes the workspace panel by dragging the sidebar separator', () => {
    const onSidebarWidthChange = vi.fn();
    renderWorkPane({ sidebarWidth: 260, onSidebarWidthChange });

    const resizer = screen.getByRole('separator', { name: 'Resize file explorer' });
    fireEvent(resizer, new MouseEvent('pointerdown', { bubbles: true, clientX: 260 }));
    fireEvent(window, new MouseEvent('pointermove', { bubbles: true, clientX: 390 }));
    fireEvent(window, new MouseEvent('pointerup', { bubbles: true }));

    expect(onSidebarWidthChange).toHaveBeenCalledWith(390);
    expect(document.body).not.toHaveClass('is-resizing-sidebar');
  });

  it('clamps drag resizing to the supported workspace panel bounds', () => {
    const onSidebarWidthChange = vi.fn();
    renderWorkPane({ sidebarWidth: 260, onSidebarWidthChange });

    const resizer = screen.getByRole('separator', { name: 'Resize file explorer' });
    fireEvent(resizer, new MouseEvent('pointerdown', { bubbles: true, clientX: 260 }));
    fireEvent(window, new MouseEvent('pointermove', { bubbles: true, clientX: 900 }));

    expect(onSidebarWidthChange).toHaveBeenCalledWith(480);
  });

  it('resizes the workspace panel from the keyboard', () => {
    const onSidebarWidthChange = vi.fn();
    renderWorkPane({ sidebarWidth: 260, onSidebarWidthChange });

    const resizer = screen.getByRole('separator', { name: 'Resize file explorer' });
    fireEvent.keyDown(resizer, { key: 'ArrowRight' });
    fireEvent.keyDown(resizer, { key: 'Home' });

    expect(onSidebarWidthChange).toHaveBeenNthCalledWith(1, 280);
    expect(onSidebarWidthChange).toHaveBeenNthCalledWith(2, 180);
  });

  it('does not start resizing while the workspace panel is collapsed', () => {
    const onSidebarWidthChange = vi.fn();
    renderWorkPane({ sidebarOpen: false, sidebarWidth: 260, onSidebarWidthChange });

    const resizer = screen.getByRole('separator', { name: 'Resize file explorer' });
    expect(resizer).toHaveAttribute('tabindex', '-1');

    fireEvent(resizer, new MouseEvent('pointerdown', { bubbles: true, clientX: 260 }));
    fireEvent(window, new MouseEvent('pointermove', { bubbles: true, clientX: 390 }));
    fireEvent.keyDown(resizer, { key: 'ArrowRight' });

    expect(onSidebarWidthChange).not.toHaveBeenCalled();
  });
});

function renderWorkPane(overrides: Partial<React.ComponentProps<typeof WorkPane>> = {}) {
  return render(
    <WorkPane
      currentProject={{ id: 'project-1', name: 'Project', files: [] } as any}
      files={[]}
      activeFile={{ id: 'file-1', name: 'README.md', type: 'file', content: '# Hello' } as any}
      selectedExplorerId={null}
      searchQuery=""
      theme="default"
      viewMode="split"
      currentThemeDef={{} as any}
      showLineNumbers={false}
      sidebarOpen
      sidebarWidth={260}
      onSidebarToggle={vi.fn()}
      onSidebarWidthChange={vi.fn()}
      onNewFile={vi.fn()}
      onNewFolder={vi.fn()}
      onRenameSelected={vi.fn()}
      onDeleteSelected={vi.fn()}
      onFileSelect={vi.fn()}
      onFileHighlight={vi.fn()}
      onFileMove={vi.fn()}
      onContentChange={vi.fn()}
      onCursorChange={vi.fn()}
      onViewModeChange={vi.fn()}
      {...overrides}
    />,
  );
}
