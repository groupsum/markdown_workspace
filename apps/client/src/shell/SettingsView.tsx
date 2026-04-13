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
  const viewSnapshot = React.useSyncExternalStore(
    services.views.subscribe,
    services.views.getSnapshot,
    services.views.getSnapshot,
  );
  const sectionsSnapshot = useSyncExternalStore(
    services.settingsRegistry.subscribe,
    services.settingsRegistry.getSnapshot,
    services.settingsRegistry.getSnapshot,
  );

  const [schemaValues, setSchemaValues] = React.useState<Record<string, unknown>>({});

  const sections = React.useMemo<SettingsModalSection[]>(() => sectionsSnapshot.sections.map((section) => ({
    id: section.id,
    title: services.i18n.format(section.title),
    description: section.description ? services.i18n.format(section.description) : undefined,
    icon: renderExtensionIcon(section.icon, 14),
    panel: section.panel,
    render: () => {
      const schemaRenderer = section.schema ? (
        <SettingsSchemaRenderer
          schema={section.schema}
          values={schemaValues}
          store={section.extensionId ? extensionRuntime.getConfigurationStore(section.extensionId) : undefined}
          formatLabel={services.i18n.format}
          onChange={(key, value) => {
            setSchemaValues((current) => ({ ...current, [key]: value }));
          }}
        />
      ) : null;

      if (section.render) {
        return (
          <>
            {section.render()}
            {schemaRenderer}
          </>
        );
      }
      return schemaRenderer;
    },
  })), [extensionRuntime, schemaValues, sectionsSnapshot.sections, services.i18n]);

  const initialSectionId = React.useMemo(() => {
    const input = viewSnapshot.inputs['core.settings'];
    if (!input || typeof input !== 'object') {
      return null;
    }
    const requestedSectionId = (input as { sectionId?: unknown }).sectionId;
    return typeof requestedSectionId === 'string' ? requestedSectionId : null;
  }, [viewSnapshot.inputs]);

  return (
    <SettingsModal
      isOpen
      onClose={() => { void services.views.close('core.settings'); }}
      sections={sections}
      activeThemeLabel={runtime.app.state.currentThemeDef.name}
      initialSectionId={initialSectionId}
    />
  );
};
