// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { ActionRailHost } from './ActionRailHost';

const mockUseClientRuntimeServices = vi.fn();
const mockUseClientExtensionHost = vi.fn();
const mockUseClientRuntimeSnapshot = vi.fn();
const mockUseWorkspacePreferences = vi.fn();
const mockRenderExtensionIcon = vi.fn((_: unknown) => <span data-testid="rail-icon" />);

vi.mock('../app/runtime/ClientRuntimeContext', () => ({
  useClientRuntimeServices: () => mockUseClientRuntimeServices(),
  useClientExtensionHost: () => mockUseClientExtensionHost(),
  useClientRuntimeSnapshot: () => mockUseClientRuntimeSnapshot(),
}));

vi.mock('../features/preferences/workspacePreferences', () => ({
  useWorkspacePreferences: () => mockUseWorkspacePreferences(),
}));

vi.mock('./iconRenderer', () => ({
  renderExtensionIcon: (icon: unknown) => mockRenderExtensionIcon(icon),
}));

describe('ActionRailHost', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseWorkspacePreferences.mockReturnValue({
      hiddenActionRailButtons: [],
      actionRailDisplayMode: 'icon-only',
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('keeps the explorer rail active while a workspace view is open', () => {
    mockUseClientRuntimeServices.mockReturnValue(createServices({
      actionRailItems: [
        {
          id: 'core.toggle-explorer',
          title: { defaultMessage: 'Explorer' },
          icon: { kind: 'lucide', name: 'Folder' },
          group: 'workspace.primary',
          target: { kind: 'command', commandId: 'core.toggle-explorer' },
          isActive: () => true,
        },
        {
          id: 'extension.gemini-agent.rail',
          title: { defaultMessage: 'Gemini' },
          icon: { kind: 'lucide', name: 'Bot' },
          group: 'assistant',
          target: { kind: 'view', viewId: 'core.gemini-agent.view' },
        },
      ],
      views: [
        {
          id: 'core.gemini-agent.view',
          title: { defaultMessage: 'Gemini' },
          location: 'main',
          render: () => null,
          renderSidebar: () => null,
        },
      ],
      openViewIds: ['core.gemini-agent.view'],
      activeViewId: 'core.gemini-agent.view',
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
      views: { open: vi.fn(async () => {}), close: vi.fn(async () => {}), focus: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          setAppMode: vi.fn(),
          setSidebarOpen: vi.fn(),
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);

    const [explorerButton, geminiButton] = screen.getAllByRole('button');
    expect(explorerButton).toHaveAttribute('aria-pressed', 'true');
    expect(geminiButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('returns to the file explorer when its rail button is clicked from a workspace view', async () => {
    const close = vi.fn(async () => {});
    const setAppMode = vi.fn();
    const setSidebarOpen = vi.fn();

    mockUseClientRuntimeServices.mockReturnValue(createServices({
      actionRailItems: [
        {
          id: 'core.toggle-explorer',
          title: { defaultMessage: 'Explorer' },
          icon: { kind: 'lucide', name: 'Folder' },
          group: 'workspace.primary',
          target: { kind: 'command', commandId: 'core.toggle-explorer' },
          isActive: () => true,
        },
      ],
      views: [
        {
          id: 'core.theme-studio.view',
          title: { defaultMessage: 'Theme Studio' },
          location: 'main',
          render: () => null,
          renderSidebar: () => null,
        },
      ],
      openViewIds: ['core.theme-studio.view'],
      activeViewId: 'core.theme-studio.view',
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
      views: { open: vi.fn(async () => {}), close, focus: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          setAppMode,
          setSidebarOpen,
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorer' }));

    await waitFor(() => {
      expect(close).toHaveBeenCalledWith('core.theme-studio.view');
      expect(setAppMode).toHaveBeenCalledWith('work');
      expect(setSidebarOpen).not.toHaveBeenCalled();
    });
  });

  it('returns to the file explorer and reopens the tree when it was collapsed', async () => {
    const close = vi.fn(async () => {});
    const setAppMode = vi.fn();
    const setSidebarOpen = vi.fn();

    mockUseClientRuntimeServices.mockReturnValue(createServices({
      actionRailItems: [
        {
          id: 'core.toggle-explorer',
          title: { defaultMessage: 'Explorer' },
          icon: { kind: 'lucide', name: 'Folder' },
          group: 'workspace.primary',
          target: { kind: 'command', commandId: 'core.toggle-explorer' },
          isActive: () => false,
        },
      ],
      views: [
        {
          id: 'core.gemini-agent.view',
          title: { defaultMessage: 'Gemini' },
          location: 'main',
          render: () => null,
          renderSidebar: () => null,
        },
      ],
      openViewIds: ['core.gemini-agent.view'],
      activeViewId: 'core.gemini-agent.view',
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
      views: { open: vi.fn(async () => {}), close, focus: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: false,
        },
        actions: {
          setAppMode,
          setSidebarOpen,
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorer' }));

    await waitFor(() => {
      expect(close).toHaveBeenCalledWith('core.gemini-agent.view');
      expect(setAppMode).toHaveBeenCalledWith('work');
      expect(setSidebarOpen).toHaveBeenCalledWith(true);
    });
  });

  it('opens a workspace view without changing the explorer sidebar state when it is already open', async () => {
    const open = vi.fn(async () => {});
    const setAppMode = vi.fn();
    const setSidebarOpen = vi.fn();

    mockUseClientRuntimeServices.mockReturnValue(createServices({
      actionRailItems: [
        {
          id: 'core.toggle-explorer',
          title: { defaultMessage: 'Explorer' },
          icon: { kind: 'lucide', name: 'Folder' },
          group: 'workspace.primary',
          target: { kind: 'command', commandId: 'core.toggle-explorer' },
          isActive: () => true,
        },
        {
          id: 'extension.gemini-agent.rail',
          title: { defaultMessage: 'Gemini' },
          icon: { kind: 'lucide', name: 'Bot' },
          group: 'assistant',
          target: { kind: 'view', viewId: 'core.gemini-agent.view' },
        },
      ],
      views: [
        {
          id: 'core.gemini-agent.view',
          title: { defaultMessage: 'Gemini' },
          location: 'main',
          render: () => null,
          renderSidebar: () => null,
        },
      ],
      openViewIds: [],
      activeViewId: null,
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
      views: { open, close: vi.fn(async () => {}), focus: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          setAppMode,
          setSidebarOpen,
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    fireEvent.click(screen.getByRole('button', { name: 'Gemini' }));

    await waitFor(() => {
      expect(setAppMode).toHaveBeenCalledWith('work');
      expect(setSidebarOpen).not.toHaveBeenCalled();
      expect(open).toHaveBeenCalledWith('core.gemini-agent.view');
    });
  });

  it('opens a workspace view without opening the explorer tree when it is collapsed', async () => {
    const open = vi.fn(async () => {});
    const setAppMode = vi.fn();
    const setSidebarOpen = vi.fn();

    mockUseClientRuntimeServices.mockReturnValue(createServices({
      actionRailItems: [
        {
          id: 'extension.gemini-agent.rail',
          title: { defaultMessage: 'Gemini' },
          icon: { kind: 'lucide', name: 'Bot' },
          group: 'assistant',
          target: { kind: 'view', viewId: 'core.gemini-agent.view' },
        },
      ],
      views: [
        {
          id: 'core.gemini-agent.view',
          title: { defaultMessage: 'Gemini' },
          location: 'main',
          render: () => null,
          renderSidebar: () => null,
        },
      ],
      openViewIds: [],
      activeViewId: null,
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
      views: { open, close: vi.fn(async () => {}), focus: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: false,
        },
        actions: {
          setAppMode,
          setSidebarOpen,
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    fireEvent.click(screen.getByRole('button', { name: 'Gemini' }));

    await waitFor(() => {
      expect(setAppMode).toHaveBeenCalledWith('work');
      expect(setSidebarOpen).not.toHaveBeenCalled();
      expect(open).toHaveBeenCalledWith('core.gemini-agent.view');
    });
  });

  it('closes the active workspace view when its rail button is clicked again', () => {
    const close = vi.fn(async () => {});
    const setAppMode = vi.fn();
    const setSidebarOpen = vi.fn();

    mockUseClientRuntimeServices.mockReturnValue(createServices({
      actionRailItems: [
        {
          id: 'extension.gemini-agent.rail',
          title: { defaultMessage: 'Gemini' },
          icon: { kind: 'lucide', name: 'Bot' },
          group: 'assistant',
          target: { kind: 'view', viewId: 'core.gemini-agent.view' },
        },
      ],
      views: [
        {
          id: 'core.gemini-agent.view',
          title: { defaultMessage: 'Gemini' },
          location: 'main',
          render: () => null,
          renderSidebar: () => null,
        },
      ],
      openViewIds: ['core.gemini-agent.view'],
      activeViewId: 'core.gemini-agent.view',
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
      views: { open: vi.fn(async () => {}), close, focus: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          setAppMode,
          setSidebarOpen,
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    fireEvent.click(screen.getByRole('button', { name: 'Gemini' }));

    expect(close).toHaveBeenCalledWith('core.gemini-agent.view');
    expect(setAppMode).not.toHaveBeenCalled();
    expect(setSidebarOpen).not.toHaveBeenCalled();
  });
});

function createServices({
  actionRailItems,
  views,
  openViewIds,
  activeViewId,
}: {
  actionRailItems: any[];
  views: any[];
  openViewIds: string[];
  activeViewId: string | null;
}) {
  const actionRailSnapshot = { items: actionRailItems };
  const viewSnapshot = {
    views,
    openViewIds,
    activeViewId,
    inputs: {},
  };
  const localeSnapshot = { locale: 'en' };

  return {
    actionRail: {
      subscribe: () => () => {},
      getSnapshot: () => actionRailSnapshot,
    },
    views: {
      subscribe: () => () => {},
      getSnapshot: () => viewSnapshot,
    },
    i18n: {
      subscribe: () => () => {},
      getSnapshot: () => localeSnapshot,
      format: (label: { defaultMessage?: string } | string) => (typeof label === 'string' ? label : (label.defaultMessage ?? '')),
    },
  };
}
