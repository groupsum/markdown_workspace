// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DataSettingsPanel } from './DataSettingsPanel';

const requestUpdate = vi.fn();
const checkForUpdates = vi.fn();
const switchToLatest = vi.fn();
const switchToVersion = vi.fn();
let persistenceDiagnosticsEnabled = false;

vi.mock('../../app/runtime/ClientRuntimeContext', () => ({
  useClientRuntimeSnapshot: () => ({
    app: {
      actions: {
        exportData: vi.fn(),
        restoreData: vi.fn(),
      },
      state: {
        currentProject: {
          id: 'proj-1',
          name: 'Filesystem Project',
          sourceKind: 'filesystem',
          rootPath: 'C:\\workspace',
        },
        persistenceDiagnosticsEnabled,
      },
    },
    pwa: {
      state: {
        canInstall: false,
        updateAvailable: false,
        isInstalled: true,
        autoUpdateEnabled: true,
        isSupported: true,
        isCheckingForUpdates: false,
        runningVersion: '1.4.20',
        installedVersion: '1.4.20',
        selectedVersion: '1.4.18',
        latestVersion: '1.4.20',
        isLatest: false,
        compatibilityState: 'COMPATIBLE',
        versionStatusLabel: 'NEWER_VERSION_AVAILABLE',
        localStorageSchema: 'lattice-idb-v3',
        availableVersions: [
          {
            version: '1.4.18',
            buildId: 'selected-build',
            releasedAt: '2026-04-10T00:00:00.000Z',
            storageSchema: 'lattice-idb-v3',
            isSelectable: true,
            compatible: true,
            blocked: false,
            disabled: false,
          },
          {
            version: '1.4.20',
            buildId: 'latest-build',
            releasedAt: '2026-04-12T00:00:00.000Z',
            storageSchema: 'lattice-idb-v3',
            isSelectable: true,
            compatible: true,
            blocked: false,
            disabled: false,
          },
          {
            version: '1.3.0',
            buildId: 'blocked-build',
            releasedAt: '2026-03-01T00:00:00.000Z',
            storageSchema: 'lattice-idb-v2',
            isSelectable: true,
            compatible: false,
            blocked: false,
            disabled: true,
          },
        ],
      },
      actions: {
        promptInstall: vi.fn(),
        requestUpdate,
        checkForUpdates,
        toggleAutoUpdate: vi.fn(),
        switchToVersion,
        switchToLatest,
      },
    },
  }),
}));

vi.mock('../i18n/useClientI18n', () => ({
  useClientI18n: () => ({
    t: (_key: string, fallback: string) => fallback,
  }),
}));

describe('DataSettingsPanel', () => {
  afterEach(() => {
    persistenceDiagnosticsEnabled = false;
  });

  it('renders retained version details and exposes version actions', () => {
    render(<DataSettingsPanel />);

    expect(screen.getByText('Running version')).toBeTruthy();
    expect(screen.getByText('Installed version')).toBeTruthy();
    expect(screen.getByText('Selected version')).toBeTruthy();
    expect(screen.getByText('Latest version')).toBeTruthy();
    expect(screen.getByText('Newer version available')).toBeTruthy();
    expect(screen.getByText('Version base path')).toBeTruthy();
    expect(screen.getByText('/client/versions/1.4.18/')).toBeTruthy();
    expect(screen.queryByText('Install PWA')).toBeNull();

    fireEvent.click(screen.getByText('Check for updates'));
    fireEvent.click(screen.getByText('Switch to latest'));
    fireEvent.change(screen.getByDisplayValue(/1.4.18 \| lattice-idb-v3 \| Retained/i), {
      target: { value: '1.4.20' },
    });

    expect(checkForUpdates).toHaveBeenCalled();
    expect(switchToLatest).toHaveBeenCalled();
    expect(switchToVersion).toHaveBeenCalledWith('1.4.20');
  });

  it('shows storage backend details only when persistence diagnostics are enabled', () => {
    const { rerender } = render(<DataSettingsPanel />);
    expect(screen.queryByText('Persistence diagnostics')).toBeNull();
    expect(screen.queryByText('Content backend')).toBeNull();

    persistenceDiagnosticsEnabled = true;
    rerender(<DataSettingsPanel />);

    expect(screen.getByText('Persistence diagnostics')).toBeTruthy();
    expect(screen.getByText('Content backend')).toBeTruthy();
    expect(screen.getByText('FILESYSTEM')).toBeTruthy();
    expect(screen.getByText('IndexedDB settings')).toBeTruthy();
    expect(screen.getByText('Out of bounds')).toBeTruthy();
  });
});
