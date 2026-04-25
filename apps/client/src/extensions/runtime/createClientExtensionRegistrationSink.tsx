import React from 'react';
import type { ExtensionSettingsSchema } from '@mdwrk/extension-manifest';
import type { ExtensionRuntimeRegistrationSink } from '@mdwrk/extension-runtime';
import type { ClientRuntimeServices } from '../../app/runtime/clientRuntimeTypes';
import type { RegisteredCommand, RegisteredSettingsSection, RegisteredView, RegisteredWorkspaceModule } from '@mdwrk/extension-host';
import { ExtensionViewErrorBoundary } from './ExtensionViewErrorBoundary';
import type { SettingsPanelId } from '../../features/settings/settingsRegistry';

const SETTINGS_PANELS = new Set<SettingsPanelId>(['visual', 'git', 'data', 'language', 'keys', 'session', 'extensions', 'advanced']);

function resolveSettingsPanel(panel: string | undefined): SettingsPanelId {
  return panel && SETTINGS_PANELS.has(panel as SettingsPanelId) ? (panel as SettingsPanelId) : 'extensions';
}

function createSettingsSectionPlaceholder(services: ClientRuntimeServices, extensionId: string, section: RegisteredSettingsSection): React.ReactNode {
  const t = (key: string, defaultMessage: string) => services.i18n.format({ key, defaultMessage });
  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        <span className="font-bold text-[11px] uppercase">{section.title.defaultMessage}</span>
        {section.description?.defaultMessage && (
          <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">{section.description.defaultMessage}</p>
        )}
        <div className="settings-session-grid">
          <div className="settings-session-item">
            <span className="settings-session-label">{t('core.extensions.placeholder.extension', 'EXTENSION')}</span>
            <span className="settings-session-value">{extensionId}</span>
          </div>
          <div className="settings-session-item">
            <span className="settings-session-label">{t('core.extensions.placeholder.section-id', 'SECTION_ID')}</span>
            <span className="settings-session-value">{section.id}</span>
          </div>
          {section.schemaPath && (
            <div className="settings-session-item">
              <span className="settings-session-label">{t('core.extensions.placeholder.schema-path', 'SCHEMA_PATH')}</span>
              <span className="settings-session-value">{section.schemaPath}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] uppercase text-[var(--fg-muted)]">{t('core.extensions.placeholder.unavailable', 'Settings renderer unavailable for this extension section.')}</p>
      </div>
    </div>
  );
}

export function createClientExtensionRegistrationSink(services: ClientRuntimeServices): ExtensionRuntimeRegistrationSink {
  return {
    registerCommand(extensionId: string, command: RegisteredCommand) {
      return services.commands.register({
        ...command,
        execute: async (...args: unknown[]) => {
          try {
            return await command.execute(...args);
          } catch (error) {
            await services.diagnostics.publish(extensionId, {
              severity: 'error',
              code: 'EXT_RUNTIME_COMMAND_FAILED',
              message: error instanceof Error ? error.message : String(error),
              detail: error instanceof Error ? error.stack : undefined,
            });
            throw error;
          }
        },
      });
    },
    registerView(extensionId: string, view: RegisteredView) {
      return services.views.register({
        ...view,
        render: (props) => (
          <ExtensionViewErrorBoundary extensionId={extensionId} diagnostics={services.diagnostics}>
            {view.render(props) as React.ReactNode}
          </ExtensionViewErrorBoundary>
        ),
        renderSidebar: view.renderSidebar
          ? (props) => (
              <ExtensionViewErrorBoundary extensionId={extensionId} diagnostics={services.diagnostics}>
                {view.renderSidebar?.(props) as React.ReactNode}
              </ExtensionViewErrorBoundary>
            )
          : undefined,
      });
    },
    registerWorkspaceModule(extensionId: string, module: RegisteredWorkspaceModule) {
      return services.views.register({
        id: module.primaryViewId,
        title: module.title,
        description: module.description,
        icon: module.icon,
        location: 'main',
        allowMultiple: false,
        canBePinned: true,
        render: (props) => (
          <ExtensionViewErrorBoundary extensionId={extensionId} diagnostics={services.diagnostics}>
            {module.render(props) as React.ReactNode}
          </ExtensionViewErrorBoundary>
        ),
        renderSidebar: (props) => (
          <ExtensionViewErrorBoundary extensionId={extensionId} diagnostics={services.diagnostics}>
            {module.renderExplorer(props) as React.ReactNode}
          </ExtensionViewErrorBoundary>
        ),
      });
    },
    registerComponent(_extensionId, _component) {
      return {
        dispose(): void {
          // component slots are introduced in a later phase; runtime retains component registrations internally for now.
        },
      };
    },
    registerActionRailItem(_extensionId, item) {
      return services.actionRail.register(item);
    },
    registerSettingsSection(extensionId: string, section: RegisteredSettingsSection) {
      const schema = (section as RegisteredSettingsSection & { schema?: ExtensionSettingsSchema }).schema;
      const render = (section as RegisteredSettingsSection & { render?: () => React.ReactNode }).render;
      return services.settingsRegistry.register({
        ...section,
        panel: resolveSettingsPanel(section.panel),
        icon: section.icon ?? { kind: 'lucide', name: 'Settings' },
        extensionId,
        schema,
        render: render ?? (schema ? undefined : () => createSettingsSectionPlaceholder(services, extensionId, section)),
      });
    },
  };
}
