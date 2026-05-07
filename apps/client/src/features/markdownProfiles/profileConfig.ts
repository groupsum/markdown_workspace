import React from 'react';
import {
  MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS,
  isMarkdownCustomParserProfileId,
  isMarkdownCustomPreviewerProfileId,
  resolveMarkdownOptionalProfiles,
  type MarkdownOptionalProfileDefinition,
  type MarkdownCustomParserProfileId,
  type MarkdownCustomPreviewerProfileId,
  type MarkdownOptionalProfileId,
} from '@mdwrk/markdown-renderer-core';

export interface MarkdownProfileConfig {
  readonly baseProfile: 'gfm-default';
  readonly parserProfile?: MarkdownCustomParserProfileId;
  readonly previewerProfile?: MarkdownCustomPreviewerProfileId;
  readonly enabledExtensions: readonly MarkdownOptionalProfileId[];
  readonly trustedHtmlPreview: boolean;
}

export interface MarkdownProfileWarning {
  readonly code: string;
  readonly scope: 'preview' | 'export' | 'settings';
  readonly severity: 'info' | 'warning';
  readonly profileId?: MarkdownOptionalProfileId;
  readonly message: string;
}

export const MARKDOWN_PROFILE_CONFIG_STORAGE_KEY = 'core.markdown-profile-config';
export const MARKDOWN_PROFILE_CONFIG_LOCAL_STORAGE_KEY = 'mdwrk.markdown-profile-config.v1';
export const MARKDOWN_PROFILE_CONFIG_EVENT = 'mdwrk:markdown-profile-config';

export const DEFAULT_MARKDOWN_PROFILE_CONFIG: MarkdownProfileConfig = Object.freeze({
  baseProfile: 'gfm-default',
  parserProfile: undefined,
  previewerProfile: undefined,
  enabledExtensions: Object.freeze([] as MarkdownOptionalProfileId[]),
  trustedHtmlPreview: false,
});

let lastLocalStorageRawConfig: string | null = null;
let lastLocalStorageNormalizedConfig: MarkdownProfileConfig = DEFAULT_MARKDOWN_PROFILE_CONFIG;

async function getStorageService() {
  try {
    if (typeof indexedDB === 'undefined') {
      return null;
    }
    const module = await import('../../../services/storage');
    return module.storage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeMarkdownProfileConfig(value: unknown): MarkdownProfileConfig {
  if (!isRecord(value)) {
    return DEFAULT_MARKDOWN_PROFILE_CONFIG;
  }

  const baseProfile = value.baseProfile === 'gfm-default' ? 'gfm-default' : 'gfm-default';
  const enabledExtensions = resolveMarkdownOptionalProfiles(
    Array.isArray(value.enabledExtensions)
      ? (value.enabledExtensions.filter((entry): entry is MarkdownOptionalProfileId => typeof entry === 'string') as MarkdownOptionalProfileId[])
      : [],
  );

  return {
    baseProfile,
    parserProfile: isMarkdownCustomParserProfileId(value.parserProfile) ? value.parserProfile : undefined,
    previewerProfile: isMarkdownCustomPreviewerProfileId(value.previewerProfile) ? value.previewerProfile : undefined,
    enabledExtensions,
    trustedHtmlPreview: value.trustedHtmlPreview === true,
  };
}

function dispatchMarkdownProfileConfigEvent(config: MarkdownProfileConfig): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<MarkdownProfileConfig>(MARKDOWN_PROFILE_CONFIG_EVENT, { detail: config }));
}

function persistLocalMarkdownProfileConfig(config: MarkdownProfileConfig): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MARKDOWN_PROFILE_CONFIG_LOCAL_STORAGE_KEY, JSON.stringify(config));
}

export function readStoredMarkdownProfileConfigSync(): MarkdownProfileConfig {
  if (typeof window === 'undefined') {
    return DEFAULT_MARKDOWN_PROFILE_CONFIG;
  }

  const raw = window.localStorage.getItem(MARKDOWN_PROFILE_CONFIG_LOCAL_STORAGE_KEY);
  if (!raw) {
    lastLocalStorageRawConfig = null;
    lastLocalStorageNormalizedConfig = DEFAULT_MARKDOWN_PROFILE_CONFIG;
    return DEFAULT_MARKDOWN_PROFILE_CONFIG;
  }

  if (raw === lastLocalStorageRawConfig) {
    return lastLocalStorageNormalizedConfig;
  }

  try {
    const normalized = normalizeMarkdownProfileConfig(JSON.parse(raw));
    lastLocalStorageRawConfig = raw;
    lastLocalStorageNormalizedConfig = normalized;
    return normalized;
  } catch {
    lastLocalStorageRawConfig = null;
    lastLocalStorageNormalizedConfig = DEFAULT_MARKDOWN_PROFILE_CONFIG;
    return DEFAULT_MARKDOWN_PROFILE_CONFIG;
  }
}

export async function syncMarkdownProfileConfigFromStore(): Promise<MarkdownProfileConfig> {
  try {
    const storageService = await getStorageService();
    if (!storageService) {
      return readStoredMarkdownProfileConfigSync();
    }

    const persisted = await storageService.getSetting<MarkdownProfileConfig>(MARKDOWN_PROFILE_CONFIG_STORAGE_KEY);
    if (!persisted) {
      return readStoredMarkdownProfileConfigSync();
    }
    const normalized = normalizeMarkdownProfileConfig(persisted);
    persistLocalMarkdownProfileConfig(normalized);
    dispatchMarkdownProfileConfigEvent(normalized);
    return normalized;
  } catch {
    return readStoredMarkdownProfileConfigSync();
  }
}

export function writeStoredMarkdownProfileConfig(value: MarkdownProfileConfig): MarkdownProfileConfig {
  const normalized = normalizeMarkdownProfileConfig(value);
  persistLocalMarkdownProfileConfig(normalized);
  dispatchMarkdownProfileConfigEvent(normalized);
  void getStorageService()
    .then((storageService) => storageService?.setSetting(MARKDOWN_PROFILE_CONFIG_STORAGE_KEY, normalized))
    .catch(() => {
      // Best-effort persistence only for this checkpoint.
    });
  return normalized;
}

export function subscribeMarkdownProfileConfig(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === MARKDOWN_PROFILE_CONFIG_LOCAL_STORAGE_KEY) {
      listener();
    }
  };

  const handleCustom = () => {
    listener();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(MARKDOWN_PROFILE_CONFIG_EVENT, handleCustom as EventListener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(MARKDOWN_PROFILE_CONFIG_EVENT, handleCustom as EventListener);
  };
}

export function useMarkdownProfileConfig(): MarkdownProfileConfig {
  React.useEffect(() => {
    void syncMarkdownProfileConfigFromStore();
  }, []);

  return React.useSyncExternalStore(
    subscribeMarkdownProfileConfig,
    readStoredMarkdownProfileConfigSync,
    readStoredMarkdownProfileConfigSync,
  );
}

export function getMarkdownProfileWarnings(
  config: MarkdownProfileConfig,
  scope: 'preview' | 'export' | 'settings',
): readonly MarkdownProfileWarning[] {
  const warnings: MarkdownProfileWarning[] = [];

  for (const profileId of config.enabledExtensions) {
    const definition = MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS.find(
      (entry) => entry.id === profileId,
    ) as MarkdownOptionalProfileDefinition | undefined;
    if (!definition) continue;

    if (definition.status !== 'in-scope') {
      warnings.push({
        code: `${profileId}-outside-certified-boundary`,
        scope,
        severity: 'warning',
        profileId,
        message:
          profileId === 'citations'
            ? 'Citations remain experimental in this checkpoint. Citation keys render structurally, but bibliography resolution stays outside the certified boundary.'
            : `${definition.name} remains experimental in this checkpoint and is outside the certified optional-profile boundary.`,
      });
    }

    const requiresTrustedHtml = scope === 'export' ? definition.exportRequiresTrustedHtml : definition.previewRequiresTrustedHtml;
    if (requiresTrustedHtml && !config.trustedHtmlPreview) {
      warnings.push({
        code: `${profileId}-requires-trusted-html`,
        scope,
        severity: 'warning',
        profileId,
        message:
          scope === 'export'
            ? `${definition.name} is enabled, but trusted HTML export is disabled. Marked HTML containers will be sanitized rather than interpreted in exported output.`
            : `${definition.name} is enabled, but trusted HTML preview is disabled. Marked HTML containers will be sanitized rather than interpreted in preview output.`,
      });
    }
  }

  return warnings;
}

export function isOptionalProfileInCertifiedBoundary(profileId: MarkdownOptionalProfileId): boolean {
  return MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS.find((entry) => entry.id === profileId)?.status === 'in-scope';
}
