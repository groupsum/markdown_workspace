import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  APP_STORAGE_SCHEMA,
  APP_VERSION,
} from '../constants';
import {
  type ClientVersionEntry,
  type ClientVersionManifest,
  deriveInstalledVersion,
  deriveVersionStatusLabel,
  fetchVersionManifest,
  getCurrentVersionBasePath,
  isVersionCompatible,
  readLocalStorageSchema,
  readSelectedVersion,
  recordLocalStorageSchema,
  resolveSelectedVersion,
  writeSelectedVersion,
} from '../src/pwa/versionManifest';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const AUTO_UPDATE_STORAGE_KEY = 'lattice-auto-update';
const FAILED_VERSIONS_STORAGE_KEY = 'lattice-failed-pwa-versions';
const LAST_KNOWN_GOOD_VERSION_KEY = 'lattice-last-known-good-version';

const getInitialAutoUpdate = () => {
  const stored = window.localStorage.getItem(AUTO_UPDATE_STORAGE_KEY);
  if (stored === null) {
    return true;
  }
  return stored === 'true';
};

const getStandaloneStatus = () => {
  const standaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = window.navigator && 'standalone' in window.navigator
    ? Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
    : false;
  return standaloneMatch || iosStandalone;
};

const readFailedVersions = () => {
  const stored = window.localStorage.getItem(FAILED_VERSIONS_STORAGE_KEY);
  if (!stored) {
    return [] as string[];
  }
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((version) => typeof version === 'string') : [];
  } catch {
    return [];
  }
};

const writeFailedVersions = (versions: string[]) => {
  window.localStorage.setItem(FAILED_VERSIONS_STORAGE_KEY, JSON.stringify(versions));
};

const resolveWorkerVersion = (worker: ServiceWorker | null) => {
  if (!worker) {
    return null;
  }
  try {
    const match = new URL(worker.scriptURL).pathname.match(/\/client\/versions\/([^/]+)\/sw\.js$/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

const normalizeVersionManifest = (manifest: ClientVersionManifest | null): ClientVersionManifest => ({
  latest: manifest?.latest ?? APP_VERSION,
  available: manifest?.available?.length
    ? manifest.available
    : [{
        version: APP_VERSION,
        buildId: 'local-build',
        releasedAt: new Date(0).toISOString(),
        storageSchema: APP_STORAGE_SCHEMA,
        isSelectable: true,
      }],
});

export const usePwa = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getStandaloneStatus());
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(getInitialAutoUpdate());
  const [failedVersions, setFailedVersions] = useState<string[]>(readFailedVersions());
  const [versionManifest, setVersionManifest] = useState<ClientVersionManifest>(() => normalizeVersionManifest(null));
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const shouldReloadRef = useRef(false);
  const currentVersionBasePath = getCurrentVersionBasePath(APP_VERSION);
  const localStorageSchema = readLocalStorageSchema();

  const runningVersion = APP_VERSION;
  const resolvedVersionSelection = useMemo(
    () => resolveSelectedVersion(versionManifest, readSelectedVersion(), localStorageSchema),
    [localStorageSchema, versionManifest],
  );
  const selectedVersion = resolvedVersionSelection.selectedVersion;
  const latestVersion = resolvedVersionSelection.latestVersion;

  const announceUpdate = useCallback(() => {
    setUpdateAvailable(true);
    window.dispatchEvent(new Event('lattice-update-ready'));
  }, []);

  const addFailedVersion = useCallback((version: string) => {
    setFailedVersions((current) => {
      if (current.includes(version)) {
        return current;
      }
      const next = [...current, version];
      writeFailedVersions(next);
      return next;
    });
  }, []);

  const markVersionAsHealthy = useCallback((version: string) => {
    window.localStorage.setItem(LAST_KNOWN_GOOD_VERSION_KEY, version);
    setFailedVersions((current) => {
      if (!current.includes(version)) {
        return current;
      }
      const next = current.filter((item) => item !== version);
      writeFailedVersions(next);
      return next;
    });
  }, []);

  const refreshVersionManifest = useCallback(async () => {
    const manifest = normalizeVersionManifest(await fetchVersionManifest().catch(() => null));
    setVersionManifest(manifest);
    return manifest;
  }, []);

  const availableVersions = useMemo(() => resolvedVersionSelection.availableVersions.map((entry) => {
    const compatible = isVersionCompatible(entry, localStorageSchema);
    const blocked = failedVersions.includes(entry.version);
    return {
      ...entry,
      compatible,
      blocked,
      disabled: !entry.isSelectable || !compatible || blocked,
    };
  }), [failedVersions, localStorageSchema, resolvedVersionSelection.availableVersions]);

  const selectedVersionEntry = useMemo(
    () => availableVersions.find((entry) => entry.version === selectedVersion) ?? null,
    [availableVersions, selectedVersion],
  );
  const selectedCompatible = selectedVersionEntry ? selectedVersionEntry.compatible : localStorageSchema === APP_STORAGE_SCHEMA;
  const installedVersion = deriveInstalledVersion(registrationRef.current);
  const isLatest = selectedVersion === latestVersion;
  const failedBlocked = failedVersions.includes(selectedVersion);
  const versionStatusLabel = deriveVersionStatusLabel({
    updateAvailable,
    selectedVersion,
    latestVersion,
    selectedCompatible,
    failedBlocked,
  });
  const compatibilityState = selectedCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE_WITH_LOCAL_DATA';

  const syncUpdateAvailability = useCallback(() => {
    const registration = registrationRef.current;
    if (!registration?.waiting) {
      setUpdateAvailable(false);
      return;
    }
    const waitingVersion = resolveWorkerVersion(registration.waiting);
    if (waitingVersion !== selectedVersion || (waitingVersion && failedVersions.includes(waitingVersion))) {
      setUpdateAvailable(false);
      return;
    }
    announceUpdate();
  }, [announceUpdate, failedVersions, selectedVersion]);

  useEffect(() => {
    recordLocalStorageSchema(APP_STORAGE_SCHEMA);
    if (!readSelectedVersion()) {
      writeSelectedVersion(APP_VERSION);
    }
    void refreshVersionManifest();
  }, [refreshVersionManifest]);

  useEffect(() => {
    if (readSelectedVersion() !== selectedVersion) {
      writeSelectedVersion(selectedVersion);
    }
  }, [selectedVersion]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return undefined;
    }

    const handleControllerChange = () => {
      if (shouldReloadRef.current) {
        shouldReloadRef.current = false;
        setUpdateAvailable(false);
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    navigator.serviceWorker.register(`${currentVersionBasePath}sw.js`, { scope: currentVersionBasePath }).then((registration) => {
      registrationRef.current = registration;

      if ('sync' in registration) {
        (registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync
          ?.register('check-for-updates')
          .catch(() => undefined);
      }

      if (registration.waiting) {
        syncUpdateAvailability();
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            syncUpdateAvailability();
          }
        });
      });

      void registration.update().then(() => syncUpdateAvailability()).catch(() => undefined);
    });

    const updateInterval = window.setInterval(() => {
      void refreshVersionManifest();
      registrationRef.current?.update().catch(() => undefined);
    }, 1000 * 60 * 30);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.clearInterval(updateInterval);
    };
  }, [currentVersionBasePath, refreshVersionManifest, syncUpdateAvailability]);

  useEffect(() => {
    window.localStorage.setItem(AUTO_UPDATE_STORAGE_KEY, String(autoUpdateEnabled));
  }, [autoUpdateEnabled]);

  useEffect(() => {
    if (!autoUpdateEnabled || !updateAvailable) {
      return;
    }
    const registration = registrationRef.current;
    if (!registration?.waiting) {
      return;
    }
    const waitingVersion = resolveWorkerVersion(registration.waiting);
    if (waitingVersion !== selectedVersion || (waitingVersion && failedVersions.includes(waitingVersion))) {
      setUpdateAvailable(false);
      return;
    }
    shouldReloadRef.current = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [autoUpdateEnabled, failedVersions, selectedVersion, updateAvailable]);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const { data } = event;
      if (!data || typeof data !== 'object') {
        return;
      }
      if (data.type === 'PWA_BACKGROUND_UPDATE_CHECK') {
        void refreshVersionManifest();
        registrationRef.current?.update().then(() => syncUpdateAvailability()).catch(() => undefined);
      }
      if (data.type === 'PWA_UPDATE_FAILED' && typeof data.version === 'string') {
        addFailedVersion(data.version);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [addFailedVersion, refreshVersionManifest, syncUpdateAvailability]);

  useEffect(() => {
    markVersionAsHealthy(APP_VERSION);
    if (!('serviceWorker' in navigator)) {
      return;
    }
    const notifyReady = () => {
      const message = { type: 'CLIENT_READY', version: APP_VERSION };
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
        return;
      }
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage(message);
      }).catch(() => undefined);
    };
    notifyReady();
  }, [markVersionAsHealthy]);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
      setIsInstalled(true);
    }
  }, [installPrompt]);

  const requestUpdate = useCallback(() => {
    const registration = registrationRef.current;
    if (!registration?.waiting) {
      return;
    }
    const waitingVersion = resolveWorkerVersion(registration.waiting);
    if (waitingVersion !== selectedVersion || (waitingVersion && failedVersions.includes(waitingVersion))) {
      setUpdateAvailable(false);
      return;
    }
    shouldReloadRef.current = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [failedVersions, selectedVersion]);

  const checkForUpdates = useCallback(async () => {
    setIsCheckingForUpdates(true);
    try {
      await refreshVersionManifest();
      await registrationRef.current?.update();
      syncUpdateAvailability();
    } finally {
      setIsCheckingForUpdates(false);
    }
  }, [refreshVersionManifest, syncUpdateAvailability]);

  const toggleAutoUpdate = useCallback((enabled: boolean) => {
    setAutoUpdateEnabled(enabled);
  }, []);

  const switchToVersion = useCallback((version: string) => {
    const targetVersion = availableVersions.find((entry) => entry.version === version);
    if (!targetVersion || targetVersion.disabled) {
      return;
    }
    writeSelectedVersion(version);
    window.location.assign(getCurrentVersionBasePath(version));
  }, [availableVersions]);

  const switchToLatest = useCallback(() => {
    const latestEntry = availableVersions.find((entry) => entry.version === latestVersion);
    if (!latestEntry || latestEntry.disabled || latestVersion === selectedVersion) {
      return;
    }
    writeSelectedVersion(latestVersion);
    window.location.assign(getCurrentVersionBasePath(latestVersion));
  }, [availableVersions, latestVersion, selectedVersion]);

  const canInstall = useMemo(() => Boolean(installPrompt) && !isInstalled, [installPrompt, isInstalled]);

  return {
    state: {
      canInstall,
      updateAvailable,
      isInstalled,
      autoUpdateEnabled,
      isSupported: 'serviceWorker' in navigator,
      isCheckingForUpdates,
      runningVersion,
      installedVersion,
      selectedVersion,
      latestVersion,
      isLatest,
      compatibilityState,
      versionStatusLabel,
      localStorageSchema,
      availableVersions,
    },
    actions: {
      promptInstall,
      requestUpdate,
      checkForUpdates,
      toggleAutoUpdate,
      switchToVersion,
      switchToLatest,
    }
  };
};
