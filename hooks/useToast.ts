import { useState, useCallback } from 'react';
import { ToastMessage } from '../components/UI/Toast';

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Date.now().toString();
    console.log(`[useToast] Adding Toast: [${type.toUpperCase()}] ${message}`);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      console.log(`[useToast] Auto-expiring Toast: ${id}`);
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    console.log(`[useToast] Manual-dismiss Toast: ${id}`);
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
};