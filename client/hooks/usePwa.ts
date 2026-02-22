import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { APP_BUILD_ID, APP_VERSION } from '../constants';

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

const getWorkerVersion = (worker: ServiceWorker | null) => {
  if (!worker) {
    return null;
  }
  try {
    return new URL(worker.scriptURL).searchParams.get('version');
  } catch {
    return null;
  }
};

export const usePwa = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getStandaloneStatus());
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(getInitialAutoUpdate());
  const [failedVersions, setFailedVersions] = useState<string[]>(readFailedVersions());
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const shouldReloadRef = useRef(false);

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

  const promoteWaitingWorker = useCallback((registration: ServiceWorkerRegistration, shouldReload: boolean) => {
    if (!registration.waiting) {
      return;
    }
    shouldReloadRef.current = shouldReload;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, []);

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

  const serviceWorkerBuildVersion = useMemo(() => `${APP_VERSION}-${APP_BUILD_ID}`, []);

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

    navigator.serviceWorker.register(`/sw.js?version=${encodeURIComponent(serviceWorkerBuildVersion)}`).then((registration) => {
      registrationRef.current = registration;

      const handleWaitingWorker = (shouldReloadWhenApplied: boolean) => {
        const waitingVersion = getWorkerVersion(registration.waiting);
        if (waitingVersion && failedVersions.includes(waitingVersion)) {
          setUpdateAvailable(false);
          promoteWaitingWorker(registration, false);
          registration.update();
          return;
        }
        if (autoUpdateEnabled) {
          promoteWaitingWorker(registration, shouldReloadWhenApplied);
          return;
        }
        announceUpdate();
      };

      if ('sync' in registration) {
        (registration as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync
          ?.register('check-for-updates')
          .catch(() => undefined);
      }

      if (registration.waiting) {
        handleWaitingWorker(true);
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            window.setTimeout(() => {
              if (registration.waiting) {
                handleWaitingWorker(true);
              }
            }, 0);
          }
        });
      });

      registration.update();
    });

    const updateInterval = window.setInterval(() => {
      registrationRef.current?.update();
    }, 1000 * 60 * 30);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.clearInterval(updateInterval);
    };
  }, [announceUpdate, autoUpdateEnabled, failedVersions, promoteWaitingWorker, serviceWorkerBuildVersion]);

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
    const waitingVersion = getWorkerVersion(registration.waiting);
    if (waitingVersion && failedVersions.includes(waitingVersion)) {
      setUpdateAvailable(false);
      promoteWaitingWorker(registration, false);
      registration.update();
      return;
    }
    promoteWaitingWorker(registration, true);
  }, [autoUpdateEnabled, updateAvailable, failedVersions, promoteWaitingWorker]);



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
        registrationRef.current?.update();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleMessage = (event: MessageEvent) => {
      const { data } = event;
      if (!data || typeof data !== 'object') {
        return;
      }
      if (data.type === 'PWA_UPDATE_FAILED' && typeof data.version === 'string') {
        addFailedVersion(data.version);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, [addFailedVersion]);

  useEffect(() => {
    markVersionAsHealthy(serviceWorkerBuildVersion);
    if (!('serviceWorker' in navigator)) {
      return;
    }
    const notifyReady = () => {
      const message = { type: 'CLIENT_READY', version: serviceWorkerBuildVersion };
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(message);
        return;
      }
      navigator.serviceWorker.ready.then((registration) => {
        registration.active?.postMessage(message);
      }).catch(() => undefined);
    };
    notifyReady();
  }, [markVersionAsHealthy, serviceWorkerBuildVersion]);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) {
      return;
    }
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  }, [installPrompt]);

  const requestUpdate = useCallback(() => {
    const registration = registrationRef.current;
    if (!registration) {
      return;
    }

    const promoteIfWaiting = () => {
      if (!registration.waiting) {
        return false;
      }

      const waitingVersion = getWorkerVersion(registration.waiting);
      if (waitingVersion && failedVersions.includes(waitingVersion)) {
        setUpdateAvailable(false);
        promoteWaitingWorker(registration, false);
        void registration.update();
        return true;
      }

      promoteWaitingWorker(registration, true);
      return true;
    };

    if (promoteIfWaiting()) {
      return;
    }

    const installingWorker = registration.installing;
    if (installingWorker) {
      installingWorker.addEventListener('statechange', () => {
        if (installingWorker.state === 'installed') {
          promoteIfWaiting();
        }
      });
    }

    void registration.update().then(() => {
      if (promoteIfWaiting()) {
        return;
      }

      const pendingWorker = registration.installing;
      if (!pendingWorker) {
        return;
      }

      pendingWorker.addEventListener('statechange', () => {
        if (pendingWorker.state === 'installed') {
          promoteIfWaiting();
        }
      });
    }).catch(() => undefined);
  }, [failedVersions, promoteWaitingWorker]);

  const checkForUpdates = useCallback(() => {
    registrationRef.current?.update();
  }, []);

  const toggleAutoUpdate = useCallback((enabled: boolean) => {
    setAutoUpdateEnabled(enabled);
  }, []);

  const canInstall = useMemo(() => Boolean(installPrompt) && !isInstalled, [installPrompt, isInstalled]);

  return {
    state: {
      canInstall,
      updateAvailable,
      isInstalled,
      autoUpdateEnabled,
      isSupported: 'serviceWorker' in navigator
    },
    actions: {
      promptInstall,
      requestUpdate,
      checkForUpdates,
      toggleAutoUpdate
    }
  };
};
