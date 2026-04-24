// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useTabManager } from './useTabManager';

describe('useTabManager', () => {
  it('opens a new tab and sets it active', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.openTab('file-1');
    });

    expect(result.current.tabs).toEqual([{ id: 'tab-file-1', fileId: 'file-1' }]);
    expect(result.current.activeTabId).toBe('tab-file-1');
  });

  it('does not duplicate tabs when opening the same file repeatedly', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.openTab('file-1');
      result.current.openTab('file-1');
      result.current.openTab('file-1');
    });

    expect(result.current.tabs).toHaveLength(1);
    expect(result.current.tabs[0]).toEqual({ id: 'tab-file-1', fileId: 'file-1' });
    expect(result.current.activeTabId).toBe('tab-file-1');
  });

  it('closes active tabs and falls back to the last remaining tab', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.openTab('file-1');
      result.current.openTab('file-2');
      result.current.closeTab('tab-file-2');
    });

    expect(result.current.tabs).toEqual([{ id: 'tab-file-1', fileId: 'file-1' }]);
    expect(result.current.activeTabId).toBe('tab-file-1');
  });

  it('reorders tabs without changing the active tab', () => {
    const { result } = renderHook(() => useTabManager());

    act(() => {
      result.current.openTab('file-1');
      result.current.openTab('file-2');
      result.current.openTab('file-3');
      result.current.reorderTab('tab-file-3', 'tab-file-1');
    });

    expect(result.current.tabs.map((tab) => tab.fileId)).toEqual(['file-3', 'file-1', 'file-2']);
    expect(result.current.activeTabId).toBe('tab-file-3');
  });
});
