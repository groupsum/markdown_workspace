import React from 'react';
import type { ExtensionSettingsSchema } from '@mdwrk/extension-manifest';
import type { ExtensionRuntimeRegistrationSink } from '@mdwrk/extension-runtime';
import type { ClientRuntimeServices } from '../../app/runtime/clientRuntimeTypes';
import type { RegisteredCommand, RegisteredSettingsSection, RegisteredView } from '@mdwrk/extension-host';
import { ExtensionViewErrorBoundary } from './ExtensionViewErrorBoundary';

function createSettingsSectionPlaceholder(extensionId: string, section: RegisteredSettingsSection): React.ReactNode {
  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        <span className="font-bold text-[11px] uppercase">{section.title.defaultMessage}</span>
        {section.description?.defaultMessage && (
          <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed">{section.description.defaultMessage}</p>
        )}
        <div className="settings-session-grid">
          <div className="settings-session-item">
            <span className="settings-session-label">EXTENSION</span>
            <span className="settings-session-value">{extensionId}</span>
          </div>
          <div className="settings-session-item">
            <span className="settings-session-label">SECTION_ID</span>
            <span className="settings-session-value">{section.id}</span>
          </div>
          {section.schemaPath && (
            <div className="settings-session-item">
              <span className="settings-session-label">SCHEMA_PATH</span>
              <span className="settings-session-value">{section.schemaPath}</span>
            </div>
          )}
        </div>
        <p className="text-[10px] uppercase text-[var(--fg-muted)]">Settings renderer unavailable for this extension section.</p>
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
        panel: 'extensions',
        icon: { kind: 'lucide', name: 'Puzzle' },
        extensionId,
        schema,
        render: render ?? (schema ? undefined : () => createSettingsSectionPlaceholder(extensionId, section)),
      });
    },
  };
}
