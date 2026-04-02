import React from 'react';
import { CORE_SHELL_LOCALE_LOADER_DEFINITION } from '@mdwrk/i18n';
import type { ExtensionHost } from '@mdwrk/extension-host';
import { createActionRailRegistry } from '../../features/action-rail/actionRailRegistry';
import { createCommandRegistry } from '../../features/commands/commandRegistry';
import { createActiveEditorBridge, ActiveEditorBridgeProvider } from '../../features/editor/activeEditorBridge';
import { createClientDiagnosticsService } from '../../features/diagnostics/clientDiagnosticsService';
import { createClientI18nService } from '../../features/i18n/clientI18nService';
import { createClientNotificationService } from '../../features/notifications/clientNotificationService';
import { createSettingsRegistry } from '../../features/settings/settingsRegistry';
import { createHostSettingsStore } from '../../features/settings/settingsStore';
import { createViewRegistry } from '../../features/views/viewRegistry';
import { createClientExtensionHost } from '../../extensions/host';
import type { ClientRuntimeBridge, ClientRuntimeServices, ClientRuntimeSnapshot } from './clientRuntimeTypes';
import { useCoreSurfaceRegistrations } from './useCoreSurfaceRegistrations';
import { readStoredLanguagePacksSync } from '../../features/i18n/languagePackStore';

const ClientRuntimeSnapshotContext = React.createContext<ClientRuntimeSnapshot | null>(null);
const ClientRuntimeServicesContext = React.createContext<ClientRuntimeServices | null>(null);
const ClientExtensionHostContext = React.createContext<ExtensionHost | null>(null);

export interface ClientRuntimeProviderProps extends React.PropsWithChildren {
  readonly snapshot: ClientRuntimeSnapshot;
}

export const ClientRuntimeProvider: React.FC<ClientRuntimeProviderProps> = ({ snapshot, children }) => {
  const snapshotRef = React.useRef(snapshot);
  snapshotRef.current = snapshot;

  const runtimeBridge = React.useMemo<ClientRuntimeBridge>(() => ({
    getSnapshot: () => snapshotRef.current,
  }), []);

  const services = React.useMemo<ClientRuntimeServices>(() => {
    const commands = createCommandRegistry();
    const views = createViewRegistry();
    const actionRail = createActionRailRegistry();
    const settingsRegistry = createSettingsRegistry();
    const settingsStore = createHostSettingsStore();
    const i18n = createClientI18nService('en');
    i18n.registerCatalogLoader('core', CORE_SHELL_LOCALE_LOADER_DEFINITION);
    const diagnostics = createClientDiagnosticsService();
    const activeEditor = createActiveEditorBridge();
    const notifications = createClientNotificationService(
      () => ({ addToast: snapshotRef.current.app.actions.addToast }),
      (label) => i18n.format(label),
    );

    const extensionHost = createClientExtensionHost({
      runtime: runtimeBridge,
      commands,
      views,
      actionRail,
      settingsStore,
      notifications,
      i18n,
      diagnostics,
      activeEditor,
    });

    return {
      commands,
      views,
      actionRail,
      settingsRegistry,
      settingsStore,
      i18n,
      notifications,
      diagnostics,
      activeEditor,
      extensionHost,
    };
  }, [runtimeBridge]);

  React.useEffect(() => {
    let active = true;
    const syncLocale = async () => {
      const storedLocale = await services.settingsStore.get<string>('core.locale');
      for (const pack of readStoredLanguagePacksSync()) {
        services.i18n.registerCatalog({
          locale: pack.locale,
          messages: pack.messages,
        });
      }
      if (!active) return;
      if (storedLocale) {
        services.i18n.setLocale(storedLocale);
      }
      await services.i18n.ensureLocale(services.i18n.getLocale());
    };
    void syncLocale();
    return () => {
      active = false;
    };
  }, [services.i18n, services.settingsStore]);

  useCoreSurfaceRegistrations(runtimeBridge, services);

  return (
    <ClientRuntimeSnapshotContext.Provider value={snapshot}>
      <ClientRuntimeServicesContext.Provider value={services}>
        <ClientExtensionHostContext.Provider value={services.extensionHost}>
          <ActiveEditorBridgeProvider bridge={services.activeEditor}>
            {children}
          </ActiveEditorBridgeProvider>
        </ClientExtensionHostContext.Provider>
      </ClientRuntimeServicesContext.Provider>
    </ClientRuntimeSnapshotContext.Provider>
  );
};

export const useClientRuntimeSnapshot = (): ClientRuntimeSnapshot => {
  const value = React.useContext(ClientRuntimeSnapshotContext);
  if (!value) {
    throw new Error('useClientRuntimeSnapshot must be used within ClientRuntimeProvider');
  }
  return value;
};

export const useClientRuntimeServices = (): ClientRuntimeServices => {
  const value = React.useContext(ClientRuntimeServicesContext);
  if (!value) {
    throw new Error('useClientRuntimeServices must be used within ClientRuntimeProvider');
  }
  return value;
};

export const useClientExtensionHost = (): ExtensionHost => {
  const value = React.useContext(ClientExtensionHostContext);
  if (!value) {
    throw new Error('useClientExtensionHost must be used within ClientRuntimeProvider');
  }
  return value;
};
