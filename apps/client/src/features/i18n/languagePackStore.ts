import React from 'react';
import { CORE_SHELL_SUPPORTED_LOCALES } from '@mdwrk/i18n';

export interface LanguagePackArtifact {
  readonly kind: 'mdwrk-language-pack';
  readonly version: 1;
  readonly locale: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly messages: Readonly<Record<string, string>>;
  readonly source: 'built-in' | 'installed';
}

const LANGUAGE_PACKS_INSTALLED_KEY = 'core.language-packs.installed.v2';
const LANGUAGE_PACKS_DISABLED_BUILT_INS_KEY = 'core.language-packs.disabled-built-ins.v2';
const LANGUAGE_PACKS_EVENT = 'mdwrk:language-packs';

let hydrationTask: Promise<readonly LanguagePackArtifact[]> | null = null;
let cachedLanguagePackSnapshot: readonly LanguagePackArtifact[] = CORE_SHELL_SUPPORTED_LOCALES.map((entry) => ({
  kind: 'mdwrk-language-pack',
  version: 1,
  locale: entry.id,
  label: entry.nativeName,
  enabled: true,
  messages: {},
  source: 'built-in',
}));
const fallbackSettings = new Map<string, unknown>();

interface SettingsBackend {
  getSetting<T>(key: string): Promise<T | null>;
  setSetting<T>(key: string, value: T): Promise<void>;
}

let settingsBackendTask: Promise<SettingsBackend> | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function createFallbackSettingsBackend(): SettingsBackend {
  return {
    async getSetting<T>(key: string): Promise<T | null> {
      return (fallbackSettings.has(key) ? fallbackSettings.get(key) : null) as T | null;
    },
    async setSetting<T>(key: string, value: T): Promise<void> {
      fallbackSettings.set(key, value);
    },
  };
}

async function getSettingsBackend(): Promise<SettingsBackend> {
  if (settingsBackendTask) {
    return await settingsBackendTask;
  }

  settingsBackendTask = (async () => {
    if (typeof indexedDB === 'undefined') {
      return createFallbackSettingsBackend();
    }

    const module = await import('../../../services/storage');
    return module.storage;
  })();

  return await settingsBackendTask;
}

export function normalizeLanguagePackArtifact(
  value: unknown,
  source: LanguagePackArtifact['source'] = 'installed',
): LanguagePackArtifact | null {
  if (!isRecord(value)) {
    return null;
  }
  const locale = typeof value.locale === 'string' ? value.locale.trim().toLowerCase() : '';
  const label = typeof value.label === 'string' ? value.label.trim() : locale;
  const rawMessages = isRecord(value.messages) ? value.messages : {};
  const messages = Object.fromEntries(
    Object.entries(rawMessages).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );

  if (!locale) {
    return null;
  }

  if (source === 'installed' && Object.keys(messages).length === 0) {
    return null;
  }

  return {
    kind: 'mdwrk-language-pack',
    version: 1,
    locale,
    label: label || locale,
    enabled: value.enabled !== false,
    messages,
    source,
  };
}

function emitLanguagePackChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(LANGUAGE_PACKS_EVENT));
  }
}

function buildBuiltInPacks(disabledBuiltIns: readonly string[]): readonly LanguagePackArtifact[] {
  const disabled = new Set(disabledBuiltIns.map((entry) => entry.trim().toLowerCase()));
  return CORE_SHELL_SUPPORTED_LOCALES.map((entry) => ({
    kind: 'mdwrk-language-pack',
    version: 1,
    locale: entry.id,
    label: entry.nativeName,
    enabled: !disabled.has(entry.id),
    messages: {},
    source: 'built-in',
  }));
}

function mergeLanguagePacks(
  installed: readonly LanguagePackArtifact[],
  disabledBuiltIns: readonly string[],
): readonly LanguagePackArtifact[] {
  const installedByLocale = new Map(installed.map((entry) => [entry.locale, entry]));
  const builtIns = buildBuiltInPacks(disabledBuiltIns).filter((entry) => !installedByLocale.has(entry.locale));

  return [...builtIns, ...installed]
    .sort((left, right) => left.label.localeCompare(right.label) || left.locale.localeCompare(right.locale));
}

async function readInstalledLanguagePacks(): Promise<readonly LanguagePackArtifact[]> {
  const settings = await getSettingsBackend();
  const stored = await settings.getSetting<unknown[]>(LANGUAGE_PACKS_INSTALLED_KEY);
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored
    .map((entry) => normalizeLanguagePackArtifact(entry, 'installed'))
    .filter((entry): entry is LanguagePackArtifact => Boolean(entry));
}

async function readDisabledBuiltIns(): Promise<readonly string[]> {
  const settings = await getSettingsBackend();
  const stored = await settings.getSetting<unknown[]>(LANGUAGE_PACKS_DISABLED_BUILT_INS_KEY);
  if (!Array.isArray(stored)) {
    return [];
  }
  return stored.filter((entry): entry is string => typeof entry === 'string').map((entry) => entry.trim().toLowerCase());
}

async function persistInstalledLanguagePacks(packs: readonly LanguagePackArtifact[]): Promise<void> {
  const settings = await getSettingsBackend();
  const normalized = packs
    .filter((entry) => entry.source === 'installed')
    .map((entry) => normalizeLanguagePackArtifact(entry, 'installed'))
    .filter((entry): entry is LanguagePackArtifact => Boolean(entry))
    .sort((left, right) => left.locale.localeCompare(right.locale));

  await settings.setSetting(
    LANGUAGE_PACKS_INSTALLED_KEY,
    normalized.map((entry) => ({
      kind: entry.kind,
      version: entry.version,
      locale: entry.locale,
      label: entry.label,
      enabled: entry.enabled,
      messages: entry.messages,
    })),
  );
}

async function persistDisabledBuiltIns(locales: readonly string[]): Promise<void> {
  const settings = await getSettingsBackend();
  const normalized = Array.from(new Set(locales.map((entry) => entry.trim().toLowerCase()))).sort((left, right) => left.localeCompare(right));
  await settings.setSetting(LANGUAGE_PACKS_DISABLED_BUILT_INS_KEY, normalized);
}

async function replaceSnapshot(
  installed: readonly LanguagePackArtifact[],
  disabledBuiltIns: readonly string[],
): Promise<readonly LanguagePackArtifact[]> {
  cachedLanguagePackSnapshot = mergeLanguagePacks(installed, disabledBuiltIns);
  emitLanguagePackChange();
  return cachedLanguagePackSnapshot;
}

export async function initializeLanguagePackStore(): Promise<readonly LanguagePackArtifact[]> {
  if (hydrationTask) {
    return await hydrationTask;
  }

  hydrationTask = (async () => {
    const [installed, disabledBuiltIns] = await Promise.all([
      readInstalledLanguagePacks(),
      readDisabledBuiltIns(),
    ]);
    return await replaceSnapshot(installed, disabledBuiltIns);
  })();

  try {
    return await hydrationTask;
  } finally {
    hydrationTask = null;
  }
}

export function readStoredLanguagePacksSync(): readonly LanguagePackArtifact[] {
  return cachedLanguagePackSnapshot;
}

export async function upsertStoredLanguagePack(pack: LanguagePackArtifact): Promise<readonly LanguagePackArtifact[]> {
  const normalized = normalizeLanguagePackArtifact(pack, 'installed');
  if (!normalized) {
    return readStoredLanguagePacksSync();
  }

  const [installed, disabledBuiltIns] = await Promise.all([
    readInstalledLanguagePacks(),
    readDisabledBuiltIns(),
  ]);
  const nextInstalled = [...installed.filter((entry) => entry.locale !== normalized.locale), normalized];
  await persistInstalledLanguagePacks(nextInstalled);
  return await replaceSnapshot(nextInstalled, disabledBuiltIns);
}

export async function removeStoredLanguagePack(locale: string): Promise<readonly LanguagePackArtifact[]> {
  const targetLocale = locale.trim().toLowerCase();
  const [installed, disabledBuiltIns] = await Promise.all([
    readInstalledLanguagePacks(),
    readDisabledBuiltIns(),
  ]);
  const nextInstalled = installed.filter((entry) => entry.locale !== targetLocale);
  await persistInstalledLanguagePacks(nextInstalled);
  return await replaceSnapshot(nextInstalled, disabledBuiltIns);
}

export async function setStoredLanguagePackEnabled(locale: string, enabled: boolean): Promise<readonly LanguagePackArtifact[]> {
  const targetLocale = locale.trim().toLowerCase();
  const [installed, disabledBuiltIns] = await Promise.all([
    readInstalledLanguagePacks(),
    readDisabledBuiltIns(),
  ]);
  const builtInLocaleSet = new Set(CORE_SHELL_SUPPORTED_LOCALES.map((entry) => entry.id));

  if (installed.some((entry) => entry.locale === targetLocale)) {
    const nextInstalled = installed.map((entry) => entry.locale === targetLocale ? { ...entry, enabled } : entry);
    await persistInstalledLanguagePacks(nextInstalled);
    return await replaceSnapshot(nextInstalled, disabledBuiltIns);
  }

  if (builtInLocaleSet.has(targetLocale)) {
    const nextDisabledBuiltIns = enabled
      ? disabledBuiltIns.filter((entry) => entry !== targetLocale)
      : [...disabledBuiltIns.filter((entry) => entry !== targetLocale), targetLocale];
    await persistDisabledBuiltIns(nextDisabledBuiltIns);
    return await replaceSnapshot(installed, nextDisabledBuiltIns);
  }

  return readStoredLanguagePacksSync();
}

export async function setAllStoredLanguagePackEnabled(enabled: boolean): Promise<readonly LanguagePackArtifact[]> {
  const [installed] = await Promise.all([readInstalledLanguagePacks(), readDisabledBuiltIns()]);
  const nextInstalled = installed.map((entry) => ({ ...entry, enabled }));
  const nextDisabledBuiltIns = enabled ? [] : CORE_SHELL_SUPPORTED_LOCALES.map((entry) => entry.id);
  await Promise.all([
    persistInstalledLanguagePacks(nextInstalled),
    persistDisabledBuiltIns(nextDisabledBuiltIns),
  ]);
  return await replaceSnapshot(nextInstalled, nextDisabledBuiltIns);
}

export function subscribeStoredLanguagePacks(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  void initializeLanguagePackStore();
  const handleCustom = () => {
    listener();
  };

  window.addEventListener(LANGUAGE_PACKS_EVENT, handleCustom as EventListener);

  return () => {
    window.removeEventListener(LANGUAGE_PACKS_EVENT, handleCustom as EventListener);
  };
}

export function useStoredLanguagePacks(): readonly LanguagePackArtifact[] {
  React.useEffect(() => {
    void initializeLanguagePackStore();
  }, []);

  return React.useSyncExternalStore(
    subscribeStoredLanguagePacks,
    readStoredLanguagePacksSync,
    readStoredLanguagePacksSync,
  );
}

export function readEnabledLanguagePacksSync(): readonly LanguagePackArtifact[] {
  return readStoredLanguagePacksSync().filter((entry) => entry.enabled);
}

if (typeof window !== 'undefined') {
  void initializeLanguagePackStore();
}
