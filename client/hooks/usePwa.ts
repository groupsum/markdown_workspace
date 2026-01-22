import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const AUTO_UPDATE_STORAGE_KEY = 'lattice-auto-update';

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

export const usePwa = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(getStandaloneStatus());
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(getInitialAutoUpdate());
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null);
  const shouldReloadRef = useRef(false);

  const announceUpdate = useCallback(() => {
    setUpdateAvailable(true);
    window.dispatchEvent(new Event('lattice-update-ready'));
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

    navigator.serviceWorker.register('/sw.js').then((registration) => {
      registrationRef.current = registration;

      if (registration.waiting) {
        announceUpdate();
      }

      registration.addEventListener('updatefound', () => {
        const installingWorker = registration.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            announceUpdate();
          }
        });
      });
    });

    const updateInterval = window.setInterval(() => {
      registrationRef.current?.update();
    }, 1000 * 60 * 30);

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      window.clearInterval(updateInterval);
    };
  }, [announceUpdate]);

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
    shouldReloadRef.current = true;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }, [autoUpdateEnabled, updateAvailable]);

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
    if (registration.waiting) {
      shouldReloadRef.current = true;
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return;
    }
    registration.update();
  }, []);

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
