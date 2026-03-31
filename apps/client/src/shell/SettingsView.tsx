import React from 'react';
import { useSyncExternalStore } from 'react';
import { SettingsModal, type SettingsModalSection } from '../../components/Modals/SettingsModal';
import { useClientRuntimeServices, useClientRuntimeSnapshot } from '../app/runtime/ClientRuntimeContext';
import { useExtensionRuntime } from '../extensions/runtime/ExtensionRuntimeContext';
import { renderExtensionIcon } from './iconRenderer';
import { SettingsSchemaRenderer } from '../features/settings/SettingsSchemaRenderer';

export const SettingsView: React.FC = () => {
  const runtime = useClientRuntimeSnapshot();
  const services = useClientRuntimeServices();
  const extensionRuntime = useExtensionRuntime();
  const sectionsSnapshot = useSyncExternalStore(
    services.settingsRegistry.subscribe,
    services.settingsRegistry.getSnapshot,
    services.settingsRegistry.getSnapshot,
  );

  const [schemaValues, setSchemaValues] = React.useState<Record<string, unknown>>({});

  const sections = React.useMemo<SettingsModalSection[]>(() => sectionsSnapshot.sections.map((section) => ({
    id: section.id,
    title: services.i18n.format(section.title),
    icon: renderExtensionIcon(section.icon, 14),
    panel: section.panel,
    render: () => {
      if (section.render) {
        return section.render();
      }
      if (section.schema) {
        const store = section.extensionId ? extensionRuntime.getConfigurationStore(section.extensionId) : undefined;
        return (
          <SettingsSchemaRenderer
            schema={section.schema}
            values={schemaValues}
            store={store}
            formatLabel={services.i18n.format}
            onChange={(key, value) => {
              setSchemaValues((current) => ({ ...current, [key]: value }));
            }}
          />
        );
      }
      return null;
    },
  })), [extensionRuntime, schemaValues, sectionsSnapshot.sections, services.i18n]);

  return (
    <SettingsModal
      isOpen
      onClose={() => { void services.views.close('core.settings'); }}
      sections={sections}
      activeThemeLabel={runtime.app.state.currentThemeDef.name}
    />
  );
};
