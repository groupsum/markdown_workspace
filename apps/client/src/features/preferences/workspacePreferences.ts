import React from 'react';

export type WorkspaceActionRailDisplayMode = 'icon-only' | 'labeled';
export type WorkspaceExportBackgroundMode = 'theme' | 'plain' | 'grayscale';
export type WorkspacePdfPageOrientation = 'portrait' | 'landscape';

export interface WorkspacePreferences {
  readonly hidePreviewPolicy: boolean;
  readonly actionRailDisplayMode: WorkspaceActionRailDisplayMode;
  readonly hiddenActionRailButtons: readonly string[];
  readonly hiddenEditorToolbarButtons: readonly string[];
  readonly htmlExportBackground: WorkspaceExportBackgroundMode;
  readonly printBackground: WorkspaceExportBackgroundMode;
  readonly pdfPageOrientation: WorkspacePdfPageOrientation;
}

export const WORKSPACE_PREFERENCES_STORAGE_KEY = 'mdwrk.workspace-preferences.v1';
export const WORKSPACE_PREFERENCES_EVENT = 'mdwrk:workspace-preferences';

export const DEFAULT_WORKSPACE_PREFERENCES: WorkspacePreferences = Object.freeze({
  hidePreviewPolicy: false,
  actionRailDisplayMode: 'icon-only',
  hiddenActionRailButtons: Object.freeze([]),
  hiddenEditorToolbarButtons: Object.freeze([]),
  htmlExportBackground: 'theme',
  printBackground: 'theme',
  pdfPageOrientation: 'portrait',
});

let cachedWorkspacePreferencesRaw: string | null = null;
let cachedWorkspacePreferencesSnapshot: WorkspacePreferences = DEFAULT_WORKSPACE_PREFERENCES;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function uniqueStrings(value: unknown): readonly string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return Array.from(new Set(value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)));
}

export function normalizeWorkspacePreferences(value: unknown): WorkspacePreferences {
  if (!isRecord(value)) {
    return DEFAULT_WORKSPACE_PREFERENCES;
  }

  const actionRailDisplayMode = value.actionRailDisplayMode === 'labeled' ? 'labeled' : 'icon-only';
  const htmlExportBackground = value.htmlExportBackground === 'plain' || value.htmlExportBackground === 'grayscale'
    ? value.htmlExportBackground
    : 'theme';
  const printBackground = value.printBackground === 'plain' || value.printBackground === 'grayscale'
    ? value.printBackground
    : 'theme';
  const pdfPageOrientation = value.pdfPageOrientation === 'landscape' ? 'landscape' : 'portrait';

  return {
    hidePreviewPolicy: value.hidePreviewPolicy === true,
    actionRailDisplayMode,
    hiddenActionRailButtons: uniqueStrings(value.hiddenActionRailButtons),
    hiddenEditorToolbarButtons: uniqueStrings(value.hiddenEditorToolbarButtons),
    htmlExportBackground,
    printBackground,
    pdfPageOrientation,
  };
}

export function readWorkspacePreferencesSync(): WorkspacePreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_WORKSPACE_PREFERENCES;
  }

  const raw = window.localStorage.getItem(WORKSPACE_PREFERENCES_STORAGE_KEY);
  if (raw === cachedWorkspacePreferencesRaw) {
    return cachedWorkspacePreferencesSnapshot;
  }
  if (!raw) {
    cachedWorkspacePreferencesRaw = null;
    cachedWorkspacePreferencesSnapshot = DEFAULT_WORKSPACE_PREFERENCES;
    return cachedWorkspacePreferencesSnapshot;
  }

  try {
    cachedWorkspacePreferencesRaw = raw;
    cachedWorkspacePreferencesSnapshot = normalizeWorkspacePreferences(JSON.parse(raw));
    return cachedWorkspacePreferencesSnapshot;
  } catch {
    cachedWorkspacePreferencesRaw = raw;
    cachedWorkspacePreferencesSnapshot = DEFAULT_WORKSPACE_PREFERENCES;
    return cachedWorkspacePreferencesSnapshot;
  }
}

function dispatchWorkspacePreferencesEvent(preferences: WorkspacePreferences): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.dispatchEvent(new CustomEvent<WorkspacePreferences>(WORKSPACE_PREFERENCES_EVENT, { detail: preferences }));
}

export function writeWorkspacePreferences(value: WorkspacePreferences): WorkspacePreferences {
  const normalized = normalizeWorkspacePreferences(value);
  if (typeof window !== 'undefined') {
    const raw = JSON.stringify(normalized);
    window.localStorage.setItem(WORKSPACE_PREFERENCES_STORAGE_KEY, raw);
    cachedWorkspacePreferencesRaw = raw;
    cachedWorkspacePreferencesSnapshot = normalized;
    dispatchWorkspacePreferencesEvent(normalized);
  }
  return normalized;
}

export function updateWorkspacePreferences(
  updater: Partial<WorkspacePreferences> | ((current: WorkspacePreferences) => WorkspacePreferences),
): WorkspacePreferences {
  const current = readWorkspacePreferencesSync();
  const next = typeof updater === 'function'
    ? updater(current)
    : { ...current, ...updater };
  return writeWorkspacePreferences(next);
}

export function subscribeWorkspacePreferences(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === WORKSPACE_PREFERENCES_STORAGE_KEY) {
      listener();
    }
  };
  const handleCustom = () => {
    listener();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(WORKSPACE_PREFERENCES_EVENT, handleCustom as EventListener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(WORKSPACE_PREFERENCES_EVENT, handleCustom as EventListener);
  };
}

export function useWorkspacePreferences(): WorkspacePreferences {
  return React.useSyncExternalStore(
    subscribeWorkspacePreferences,
    readWorkspacePreferencesSync,
    readWorkspacePreferencesSync,
  );
}
