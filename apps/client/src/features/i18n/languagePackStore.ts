import React from 'react';

export interface LanguagePackArtifact {
  readonly kind: 'mdwrk-language-pack';
  readonly version: 1;
  readonly locale: string;
  readonly label: string;
  readonly messages: Readonly<Record<string, string>>;
}

const LANGUAGE_PACKS_STORAGE_KEY = 'mdwrk.language-packs.v1';
const LANGUAGE_PACKS_EVENT = 'mdwrk:language-packs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeLanguagePackArtifact(value: unknown): LanguagePackArtifact | null {
  if (!isRecord(value)) {
    return null;
  }
  const locale = typeof value.locale === 'string' ? value.locale.trim().toLowerCase() : '';
  const label = typeof value.label === 'string' ? value.label.trim() : locale;
  const rawMessages = isRecord(value.messages) ? value.messages : {};
  const messages = Object.fromEntries(
    Object.entries(rawMessages).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );

  if (!locale || Object.keys(messages).length === 0) {
    return null;
  }

  return {
    kind: 'mdwrk-language-pack',
    version: 1,
    locale,
    label: label || locale,
    messages,
  };
}

export function readStoredLanguagePacksSync(): readonly LanguagePackArtifact[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(LANGUAGE_PACKS_STORAGE_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .map(normalizeLanguagePackArtifact)
      .filter((entry): entry is LanguagePackArtifact => Boolean(entry));
  } catch {
    return [];
  }
}

function writeStoredLanguagePacks(packs: readonly LanguagePackArtifact[]): readonly LanguagePackArtifact[] {
  const next = packs
    .map(normalizeLanguagePackArtifact)
    .filter((entry): entry is LanguagePackArtifact => Boolean(entry))
    .sort((left, right) => left.locale.localeCompare(right.locale));

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(LANGUAGE_PACKS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(LANGUAGE_PACKS_EVENT));
  }

  return next;
}

export function upsertStoredLanguagePack(pack: LanguagePackArtifact): readonly LanguagePackArtifact[] {
  const normalized = normalizeLanguagePackArtifact(pack);
  if (!normalized) {
    return readStoredLanguagePacksSync();
  }
  const current = readStoredLanguagePacksSync().filter((entry) => entry.locale !== normalized.locale);
  return writeStoredLanguagePacks([...current, normalized]);
}

export function removeStoredLanguagePack(locale: string): readonly LanguagePackArtifact[] {
  return writeStoredLanguagePacks(readStoredLanguagePacksSync().filter((entry) => entry.locale !== locale.trim().toLowerCase()));
}

export function subscribeStoredLanguagePacks(listener: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === LANGUAGE_PACKS_STORAGE_KEY) {
      listener();
    }
  };
  const handleCustom = () => {
    listener();
  };

  window.addEventListener('storage', handleStorage);
  window.addEventListener(LANGUAGE_PACKS_EVENT, handleCustom as EventListener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener(LANGUAGE_PACKS_EVENT, handleCustom as EventListener);
  };
}

export function useStoredLanguagePacks(): readonly LanguagePackArtifact[] {
  return React.useSyncExternalStore(
    subscribeStoredLanguagePacks,
    readStoredLanguagePacksSync,
    readStoredLanguagePacksSync,
  );
}
