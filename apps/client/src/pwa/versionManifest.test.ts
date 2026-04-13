// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { deriveVersionStatusLabel, resolveSelectedVersion, type ClientVersionManifest } from './versionManifest';

const manifest: ClientVersionManifest = {
  latest: '1.4.20',
  available: [
    {
      version: '1.4.20',
      buildId: 'build-new',
      releasedAt: '2026-04-12T00:00:00.000Z',
      storageSchema: 'lattice-idb-v3',
      isSelectable: true,
    },
    {
      version: '1.4.18',
      buildId: 'build-old',
      releasedAt: '2026-04-01T00:00:00.000Z',
      storageSchema: 'lattice-idb-v3',
      isSelectable: true,
    },
    {
      version: '1.3.0',
      buildId: 'build-incompatible',
      releasedAt: '2026-03-20T00:00:00.000Z',
      storageSchema: 'lattice-idb-v2',
      isSelectable: true,
    },
  ],
};

describe('version manifest selection', () => {
  it('defaults to latest when no saved selection exists', () => {
    const resolved = resolveSelectedVersion(manifest, null, 'lattice-idb-v3');
    expect(resolved.selectedVersion).toBe('1.4.20');
  });

  it('reuses a saved selection when still present and selectable', () => {
    const resolved = resolveSelectedVersion(manifest, '1.4.18', 'lattice-idb-v3');
    expect(resolved.selectedVersion).toBe('1.4.18');
  });

  it('falls back to latest when the saved version is missing', () => {
    const resolved = resolveSelectedVersion(manifest, '0.9.0', 'lattice-idb-v3');
    expect(resolved.selectedVersion).toBe('1.4.20');
  });

  it('falls back to latest when the saved version is incompatible', () => {
    const resolved = resolveSelectedVersion(manifest, '1.3.0', 'lattice-idb-v3');
    expect(resolved.selectedVersion).toBe('1.4.20');
  });
});

describe('version status labels', () => {
  it('reports up to date when selected equals latest', () => {
    expect(deriveVersionStatusLabel({
      updateAvailable: false,
      selectedVersion: '1.4.20',
      latestVersion: '1.4.20',
      selectedCompatible: true,
      failedBlocked: false,
    })).toBe('UP_TO_DATE');
  });

  it('reports newer version available when selected trails latest', () => {
    expect(deriveVersionStatusLabel({
      updateAvailable: false,
      selectedVersion: '1.4.18',
      latestVersion: '1.4.20',
      selectedCompatible: true,
      failedBlocked: false,
    })).toBe('NEWER_VERSION_AVAILABLE');
  });

  it('reports update ready when a waiting worker exists', () => {
    expect(deriveVersionStatusLabel({
      updateAvailable: true,
      selectedVersion: '1.4.18',
      latestVersion: '1.4.20',
      selectedCompatible: true,
      failedBlocked: false,
    })).toBe('UPDATE_READY');
  });

  it('reports failed blocked ahead of compatibility or recency', () => {
    expect(deriveVersionStatusLabel({
      updateAvailable: false,
      selectedVersion: '1.4.18',
      latestVersion: '1.4.20',
      selectedCompatible: true,
      failedBlocked: true,
    })).toBe('FAILED_VERSION_BLOCKED');
  });
});
