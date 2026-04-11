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

  it('marks the explorer rail inactive while a main workspace view is open', () => {
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
    expect(explorerButton).toHaveAttribute('aria-pressed', 'false');
    expect(geminiButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('routes the explorer rail through the command registry', async () => {
    const execute = vi.fn(async () => {});

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
      activeMainViewId: 'core.theme-studio.view',
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    fireEvent.click(screen.getByRole('button', { name: 'Explorer' }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith('core.toggle-explorer');
    });
  });

  it('marks the explorer rail active only when no main view is active and the sidebar is open', () => {
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
      views: [],
      openViewIds: [],
      activeViewId: null,
      activeMainViewId: null,
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    expect(screen.getByRole('button', { name: 'Explorer' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('routes rail view clicks through the centralized toggle path', async () => {
    const toggle = vi.fn(async () => {});

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
      activeMainViewId: null,
      toggle,
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    fireEvent.click(screen.getByRole('button', { name: 'Gemini' }));

    await waitFor(() => {
      expect(toggle).toHaveBeenCalledWith('core.gemini-agent.view');
    });
  });

  it('keeps an active main-view rail button pressed while that view is open', () => {

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
      activeMainViewId: 'core.gemini-agent.view',
    }));
    mockUseClientExtensionHost.mockReturnValue({
      commands: { execute: vi.fn(async () => {}) },
    });
    mockUseClientRuntimeSnapshot.mockReturnValue({
      app: {
        state: {
          appMode: 'work',
          sidebarOpen: true,
        },
        actions: {
          toggleSidebar: vi.fn(),
        },
      },
    });

    render(<ActionRailHost />);
    expect(screen.getByRole('button', { name: 'Gemini' })).toHaveAttribute('aria-pressed', 'true');
  });
});

function createServices({
  actionRailItems,
  views,
  openViewIds,
  activeViewId,
  activeMainViewId = activeViewId,
  toggle = vi.fn(async () => {}),
}: {
  actionRailItems: any[];
  views: any[];
  openViewIds: string[];
  activeViewId: string | null;
  activeMainViewId?: string | null;
  toggle?: any;
}) {
  const actionRailSnapshot = { items: actionRailItems };
  const viewSnapshot = {
    views,
    openViewIds,
    activeViewId,
    activeMainViewId,
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
      toggle,
    },
    i18n: {
      subscribe: () => () => {},
      getSnapshot: () => localeSnapshot,
      format: (label: { defaultMessage?: string } | string) => (typeof label === 'string' ? label : (label.defaultMessage ?? '')),
    },
  };
}
