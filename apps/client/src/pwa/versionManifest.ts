import {
  ACTIVE_STORAGE_SCHEMA_STORAGE_KEY,
  APP_BUILD_ID,
  APP_PACKAGE_NAME,
  APP_STORAGE_SCHEMA,
  APP_VERSION,
  CLIENT_VERSION_INDEX_PATH,
  SELECTED_VERSION_STORAGE_KEY,
} from '../../constants';

export interface ClientVersionEntry {
  readonly version: string;
  readonly buildId: string;
  readonly releasedAt: string;
  readonly storageSchema: string;
  readonly isSelectable: boolean;
}

export interface ClientVersionManifest {
  readonly latest: string;
  readonly available: readonly ClientVersionEntry[];
}

export interface PwaSystemConfig {
  readonly appVersion: string;
  readonly buildId: string;
  readonly packageName: string;
  readonly storageSchema: string;
  readonly versionIndexPath: string;
  readonly currentVersionBasePath: string;
}

export type VersionStatusLabel =
  | 'UP_TO_DATE'
  | 'UPDATE_READY'
  | 'NEWER_VERSION_AVAILABLE'
  | 'INCOMPATIBLE_WITH_LOCAL_DATA'
  | 'FAILED_VERSION_BLOCKED';

export interface ResolvedVersionSelection {
  readonly selectedVersion: string;
  readonly latestVersion: string;
  readonly selectedEntry: ClientVersionEntry | null;
  readonly availableVersions: readonly ClientVersionEntry[];
  readonly localStorageSchema: string;
}

export const getCurrentVersionBasePath = (version = APP_VERSION): string => `/client/versions/${version}/`;

export const getPwaSystemConfig = (version = APP_VERSION): PwaSystemConfig => ({
  appVersion: APP_VERSION,
  buildId: APP_BUILD_ID,
  packageName: APP_PACKAGE_NAME,
  storageSchema: APP_STORAGE_SCHEMA,
  versionIndexPath: CLIENT_VERSION_INDEX_PATH,
  currentVersionBasePath: getCurrentVersionBasePath(version),
});

export const readSelectedVersion = (): string | null => {
  try {
    return window.localStorage.getItem(SELECTED_VERSION_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const writeSelectedVersion = (version: string): void => {
  window.localStorage.setItem(SELECTED_VERSION_STORAGE_KEY, version);
};

export const readLocalStorageSchema = (): string => {
  const stored = window.localStorage.getItem(ACTIVE_STORAGE_SCHEMA_STORAGE_KEY);
  if (stored) {
    return stored;
  }
  window.localStorage.setItem(ACTIVE_STORAGE_SCHEMA_STORAGE_KEY, APP_STORAGE_SCHEMA);
  return APP_STORAGE_SCHEMA;
};

export const recordLocalStorageSchema = (schema = APP_STORAGE_SCHEMA): void => {
  window.localStorage.setItem(ACTIVE_STORAGE_SCHEMA_STORAGE_KEY, schema);
};

export const isVersionCompatible = (entry: ClientVersionEntry, localStorageSchema: string): boolean =>
  entry.storageSchema === localStorageSchema;

export const resolveSelectedVersion = (
  manifest: ClientVersionManifest,
  persistedVersion: string | null,
  localStorageSchema: string,
): ResolvedVersionSelection => {
  const availableVersions = Array.isArray(manifest.available) ? manifest.available : [];
  const latestVersion = manifest.latest || availableVersions[0]?.version || APP_VERSION;
  const persistedEntry = persistedVersion
    ? availableVersions.find((entry) => entry.version === persistedVersion) ?? null
    : null;
  const persistedSelectable = Boolean(
    persistedEntry && persistedEntry.isSelectable && isVersionCompatible(persistedEntry, localStorageSchema),
  );
  const latestEntry = availableVersions.find((entry) => entry.version === latestVersion) ?? null;
  const latestSelectable = Boolean(
    latestEntry && latestEntry.isSelectable && isVersionCompatible(latestEntry, localStorageSchema),
  );
  const selectedEntry = persistedSelectable
    ? persistedEntry
    : latestSelectable
      ? latestEntry
      : availableVersions.find((entry) => entry.isSelectable && isVersionCompatible(entry, localStorageSchema)) ?? latestEntry;
  return {
    selectedVersion: selectedEntry?.version ?? latestVersion,
    latestVersion,
    selectedEntry,
    availableVersions,
    localStorageSchema,
  };
};

export const deriveInstalledVersion = (registration: ServiceWorkerRegistration | null): string | null => {
  const worker = registration?.waiting ?? registration?.active ?? registration?.installing ?? null;
  if (!worker) {
    return null;
  }
  try {
    const url = new URL(worker.scriptURL);
    const match = url.pathname.match(/\/client\/versions\/([^/]+)\/sw\.js$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

export const deriveVersionStatusLabel = ({
  updateAvailable,
  selectedVersion,
  latestVersion,
  selectedCompatible,
  failedBlocked,
}: {
  readonly updateAvailable: boolean;
  readonly selectedVersion: string | null;
  readonly latestVersion: string | null;
  readonly selectedCompatible: boolean;
  readonly failedBlocked: boolean;
}): VersionStatusLabel => {
  if (failedBlocked) {
    return 'FAILED_VERSION_BLOCKED';
  }
  if (!selectedCompatible) {
    return 'INCOMPATIBLE_WITH_LOCAL_DATA';
  }
  if (updateAvailable) {
    return 'UPDATE_READY';
  }
  if (selectedVersion && latestVersion && selectedVersion !== latestVersion) {
    return 'NEWER_VERSION_AVAILABLE';
  }
  return 'UP_TO_DATE';
};

export const fetchVersionManifest = async (
  fetchImpl: typeof fetch = fetch,
  indexPath = CLIENT_VERSION_INDEX_PATH,
): Promise<ClientVersionManifest> => {
  const response = await fetchImpl(indexPath, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load version index: ${response.status}`);
  }
  const manifest = await response.json() as ClientVersionManifest;
  return {
    latest: manifest.latest,
    available: Array.isArray(manifest.available) ? manifest.available : [],
  };
};
