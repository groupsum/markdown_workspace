// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorPane } from './EditorPane';

const executeCommand = vi.fn();

vi.mock('../../../Markdown/WorkspaceMarkdownEditor', () => ({
  WorkspaceMarkdownEditor: React.forwardRef((_props: unknown, ref: React.ForwardedRef<unknown>) => {
    React.useImperativeHandle(ref, () => ({
      executeCommand,
      getSelection: () => ({ start: 0, end: 0, direction: 'none' }),
      setValue: vi.fn(),
    }));
    return <textarea aria-label="Mock markdown editor" />;
  }),
}));

vi.mock('../../../Markdown/WorkspaceMarkdownRenderer', () => ({
  WorkspaceMarkdownRenderer: () => <div data-testid="mock-preview" />,
}));

vi.mock('../../../../src/features/editor/activeEditorBridge', () => ({
  useActiveEditorBridge: () => null,
}));

vi.mock('../../../../src/features/layout/splitViewPolicy', () => ({
  isSplitViewAllowedForViewport: () => true,
}));

vi.mock('../../../../src/features/preferences/workspacePreferences', () => ({
  useWorkspacePreferences: () => ({ hiddenEditorToolbarButtons: [] }),
}));

vi.mock('./TableBuilderModal', () => ({
  TableBuilderModal: () => null,
}));

describe('EditorPane splitter', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 1000,
      bottom: 600,
      width: 1000,
      height: 600,
      toJSON: () => ({}),
    } as DOMRect);
  });

  afterEach(() => {
    cleanup();
    executeCommand.mockClear();
    vi.restoreAllMocks();
  });

  it('resizes editor and preview panes by dragging the splitter', async () => {
    renderEditorPane();

    const splitter = screen.getByRole('separator', { name: 'Resize editor and preview panes' });
    expect(splitter).toHaveAttribute('aria-valuenow', '50');

    fireEvent(splitter, new MouseEvent('pointerdown', { bubbles: true, clientX: 700 }));
    fireEvent(window, new MouseEvent('pointermove', { bubbles: true, clientX: 700 }));
    fireEvent(window, new MouseEvent('pointerup', { bubbles: true }));

    await waitFor(() => {
      expect(splitter).toHaveAttribute('aria-valuenow', '70');
    });
    expect(document.querySelector('.editor-pane-column--split-left-70')).toBeInTheDocument();
    expect(document.querySelector('.editor-pane-column--split-right-30')).toBeInTheDocument();
  });

  it('resizes editor and preview panes from the keyboard', () => {
    renderEditorPane();

    const splitter = screen.getByRole('separator', { name: 'Resize editor and preview panes' });
    fireEvent.keyDown(splitter, { key: 'ArrowRight' });

    expect(splitter).toHaveAttribute('aria-valuenow', '55');
    expect(document.querySelector('.editor-pane-column--split-left-55')).toBeInTheDocument();
    expect(document.querySelector('.editor-pane-column--split-right-45')).toBeInTheDocument();
  });

  it('resizes stacked editor and preview panes by dragging the splitter vertically', async () => {
    const getComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element: Element, pseudoElement?: string | null) => {
      const style = getComputedStyle(element, pseudoElement);
      if ((element as HTMLElement).classList?.contains('editor-pane-body')) {
        return new Proxy(style, {
          get(target, property, receiver) {
            if (property === 'flexDirection') return 'column';
            return Reflect.get(target, property, receiver);
          },
        });
      }
      return style;
    });
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 1000,
      bottom: 600,
      width: 1000,
      height: 600,
      toJSON: () => ({}),
    } as DOMRect);
    renderEditorPane();

    const splitter = screen.getByRole('separator', { name: 'Resize editor and preview panes' });

    fireEvent(splitter, new MouseEvent('pointerdown', { bubbles: true, clientY: 420 }));
    fireEvent(window, new MouseEvent('pointermove', { bubbles: true, clientY: 420 }));
    fireEvent(window, new MouseEvent('pointerup', { bubbles: true }));

    await waitFor(() => {
      expect(splitter).toHaveAttribute('aria-valuenow', '70');
    });
  });

  it('runs the configurable hyperlink toolbar command', () => {
    renderEditorPane();

    fireEvent.click(screen.getByTitle('Insert Link'));

    expect(executeCommand).toHaveBeenCalledWith('link');
  });
});

function renderEditorPane() {
  return render(
    <EditorPane
      file={{ id: 'file-1', name: 'README.md', type: 'file', content: '# Hello' } as any}
      files={[]}
      onChange={vi.fn()}
      onCursorChange={vi.fn()}
      onNavigate={vi.fn()}
      theme="default"
      viewMode="split"
      onViewModeChange={vi.fn()}
      showLineNumbers={false}
    />,
  );
}
