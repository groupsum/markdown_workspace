import React from 'react';
import { useClientRuntimeServices } from '../../app/runtime/ClientRuntimeContext';

export function useClientI18n() {
  const services = useClientRuntimeServices();
  const snapshot = React.useSyncExternalStore(services.i18n.subscribe, services.i18n.getSnapshot, services.i18n.getSnapshot);

  const t = React.useCallback((key: string, defaultMessage: string) => {
    return services.i18n.format({ key, defaultMessage });
  }, [services.i18n]);

  return {
    locale: snapshot.locale,
    setLocale: services.i18n.setLocale,
    ensureLocale: services.i18n.ensureLocale,
    t,
    format: services.i18n.format,
  };
}
