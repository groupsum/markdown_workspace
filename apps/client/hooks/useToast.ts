import { useState, useCallback, useRef } from 'react';
import { ToastMessage } from '../components/UI/Toast';

const TOAST_TTL_MS = 3000;

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    console.log(`[useToast] Manual-dismiss Toast: ${id}`);
    const timeout = timeoutRef.current[id];
    if (timeout) {
      clearTimeout(timeout);
      delete timeoutRef.current[id];
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const toastKey = `${type}:${message}`;

    setToasts(prev => {
      if (prev.some((toast) => `${toast.type}:${toast.message}` === toastKey)) {
        console.log(`[useToast] Skipping duplicate Toast: [${type.toUpperCase()}] ${message}`);
        return prev;
      }

      const id = Date.now().toString();
      console.log(`[useToast] Adding Toast: [${type.toUpperCase()}] ${message}`);

      timeoutRef.current[id] = setTimeout(() => {
        console.log(`[useToast] Auto-expiring Toast: ${id}`);
        setToasts(current => current.filter(t => t.id !== id));
        delete timeoutRef.current[id];
      }, TOAST_TTL_MS);

      return [...prev, { id, message, type }];
    });
  }, []);

  return { toasts, addToast, removeToast };
};
