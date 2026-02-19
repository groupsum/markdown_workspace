import { useEffect } from 'react';

interface LifecycleActions {
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
}

export const useAppLifecycle = (
  actions: LifecycleActions,
  updateAvailable: boolean,
  setUpdateAvailable: (value: boolean) => void,
  setOnline: (value: boolean) => void
) => {
  useEffect(() => {
    const handleUpdate = () => {
      setUpdateAvailable(true);
      actions.addToast('UPDATE READY: OPEN SETTINGS TO APPLY', 'info');
    };

    const handleOnline = () => {
      setOnline(true);
      actions.addToast('SYSTEM ONLINE', 'success');
    };

    const handleOffline = () => {
      setOnline(false);
      actions.addToast('SYSTEM OFFLINE', 'warning');
    };

    window.addEventListener('lattice-update-ready', handleUpdate);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('lattice-update-ready', handleUpdate);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [actions, setOnline, setUpdateAvailable]);

  useEffect(() => {
    setUpdateAvailable(updateAvailable);
  }, [setUpdateAvailable, updateAvailable]);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const refreshKeyboardState = () => {
      const offset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      document.body.classList.toggle('keyboard-open', offset > 90);
      document.documentElement.style.setProperty('--keyboard-offset', `${Math.round(offset)}px`);
    };

    refreshKeyboardState();
    viewport.addEventListener('resize', refreshKeyboardState);
    viewport.addEventListener('scroll', refreshKeyboardState);

    return () => {
      viewport.removeEventListener('resize', refreshKeyboardState);
      viewport.removeEventListener('scroll', refreshKeyboardState);
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.setProperty('--keyboard-offset', '0px');
    };
  }, []);
};
