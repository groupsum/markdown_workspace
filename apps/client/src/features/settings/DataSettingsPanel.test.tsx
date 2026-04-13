// @vitest-environment jsdom
import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DataSettingsPanel } from './DataSettingsPanel';

const requestUpdate = vi.fn();
const checkForUpdates = vi.fn();
const switchToLatest = vi.fn();
const switchToVersion = vi.fn();

vi.mock('../../app/runtime/ClientRuntimeContext', () => ({
  useClientRuntimeSnapshot: () => ({
    app: {
      actions: {
        exportData: vi.fn(),
        restoreData: vi.fn(),
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
  it('renders retained version details and exposes version actions', () => {
    render(<DataSettingsPanel />);

    expect(screen.getByText('RUNNING_VERSION')).toBeTruthy();
    expect(screen.getByText('INSTALLED_VERSION')).toBeTruthy();
    expect(screen.getByText('SELECTED_VERSION')).toBeTruthy();
    expect(screen.getByText('LATEST_VERSION')).toBeTruthy();
    expect(screen.getByText('NEWER_VERSION_AVAILABLE')).toBeTruthy();

    fireEvent.click(screen.getByText('CHECK_FOR_UPDATES'));
    fireEvent.click(screen.getByText('SWITCH_TO_LATEST'));
    fireEvent.change(screen.getByDisplayValue(/1.4.18 \| lattice-idb-v3 \| RETAINED/i), {
      target: { value: '1.4.20' },
    });

    expect(checkForUpdates).toHaveBeenCalled();
    expect(switchToLatest).toHaveBeenCalled();
    expect(switchToVersion).toHaveBeenCalledWith('1.4.20');
  });
});
