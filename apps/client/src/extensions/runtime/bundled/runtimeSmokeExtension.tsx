import React from 'react';
import type { ExtensionManifest } from '@mdwrk/extension-manifest';
import type { ClientViewRenderProps } from '../../../features/views/viewRegistry';
import type { MarkdownWorkspaceExtension } from '@mdwrk/extension-host';
import type { BundledExtensionCatalogEntry } from '@mdwrk/extension-runtime';

const extensionId = 'core.runtime-smoke';
const viewId = `${extensionId}.view`;
const commandId = `${extensionId}.open`;
const railId = `${extensionId}.rail`;

const manifest: ExtensionManifest = {
  manifestVersion: 1,
  id: extensionId,
  packageName: '@mdwrk/runtime-smoke-bundled',
  version: '1.0.0',
  displayName: { defaultMessage: 'Runtime Smoke Extension' },
  description: { defaultMessage: 'Bundled runtime smoke extension proving runtime activation, view registration, action rail wiring, and extension settings persistence.' },
  kind: 'bundled',
  icon: { kind: 'lucide', name: 'Plug' },
  enabledByDefault: true,
  capabilities: ['view.register', 'actionRail.register', 'notification.publish', 'settings.read', 'settings.write'],
  compatibility: {
    manifestVersion: 1,
    hostApi: '1.0.0',
    runtime: '^1.0.0',
    app: '>=1.3.49',
    themeContract: '^1.0.0',
  },
  entry: {
    module: './runtimeSmokeExtension.tsx',
    export: 'runtimeSmokeExtensionEntry',
  },
  contributions: {
    commands: [
      {
        id: commandId,
        title: { defaultMessage: 'Open Runtime Smoke View' },
        description: { defaultMessage: 'Open the bundled runtime smoke test modal.' },
        icon: { kind: 'lucide', name: 'Plug' },
        keywords: ['runtime', 'smoke', 'extension'],
      },
    ],
    views: [
      {
        id: viewId,
        title: { defaultMessage: 'Runtime Smoke' },
        description: { defaultMessage: 'Bundled runtime verification modal.' },
        icon: { kind: 'lucide', name: 'Plug' },
        location: 'modal',
        allowMultiple: false,
        canBePinned: false,
      },
    ],
    components: [],
    actionRail: [
      {
        id: railId,
        title: { defaultMessage: 'Runtime Smoke' },
        icon: { kind: 'lucide', name: 'Plug' },
        group: 'extensions',
        order: 10,
        target: {
          kind: 'command',
          commandId,
        },
      },
    ],
    settingsSections: [],
  },
  settingsSchema: {
    version: 1,
    title: { defaultMessage: 'Runtime smoke settings' },
    sections: [
      {
        id: 'runtime-smoke.general',
        title: { defaultMessage: 'General' },
        description: { defaultMessage: 'Settings used to verify extension configuration persistence through the bundled runtime path.' },
      },
    ],
    fields: [
      {
        key: 'toastOnActivate',
        kind: 'boolean',
        sectionId: 'runtime-smoke.general',
        label: { defaultMessage: 'Show activation toast' },
        description: { defaultMessage: 'Publish a host notification when the runtime smoke extension activates.' },
        defaultValue: true,
      },
      {
        key: 'activationMessage',
        kind: 'string',
        sectionId: 'runtime-smoke.general',
        label: { defaultMessage: 'Activation message' },
        description: { defaultMessage: 'Message displayed in notifications and the runtime smoke modal after activation.' },
        defaultValue: 'Runtime smoke extension activated.',
      },
    ],
  },
};

const RuntimeSmokeModal: React.FC<ClientViewRenderProps & { activationCount: number; activationMessage: string; formatLabel: (label: { key: string; defaultMessage: string }) => string }> = ({ close, activationCount, activationMessage, formatLabel }) => (
  <div className="modal-overlay">
    <div className="modal-base settings-modal">
      <div className="modal-header">
        <span className="modal-title">{formatLabel({ key: 'core.runtime-smoke.title', defaultMessage: 'Runtime Smoke' })}</span>
        <button onClick={() => void close()} className="modal-close">{formatLabel({ key: 'core.runtime-smoke.exit', defaultMessage: 'Exit' })}</button>
      </div>
      <div className="settings-content-frame">
        <div className="settings-pane">
          <div className="settings-card settings-card-stack">
            <span className="settings-section-label">{formatLabel({ key: 'core.runtime-smoke.kicker', defaultMessage: 'Phase 8 Bundled Extension' })}</span>
            <p className="settings-muted-caption leading-relaxed">{formatLabel({ key: 'core.runtime-smoke.description', defaultMessage: 'This modal is registered through the new extension runtime, not through ad hoc client imports. Its settings are configurable through the bundled Extension Manager.' })}</p>
            <div className="settings-session-grid">
              <div className="settings-session-item"><span className="settings-session-label">{formatLabel({ key: 'core.runtime-smoke.extension-id', defaultMessage: 'Extension ID' })}</span><span className="settings-session-value">{extensionId}</span></div>
              <div className="settings-session-item"><span className="settings-session-label">{formatLabel({ key: 'core.runtime-smoke.view-id', defaultMessage: 'View ID' })}</span><span className="settings-session-value">{viewId}</span></div>
              <div className="settings-session-item"><span className="settings-session-label">{formatLabel({ key: 'core.runtime-smoke.activation-count', defaultMessage: 'Activation count' })}</span><span className="settings-session-value">{activationCount}</span></div>
            </div>
            <div className="settings-card">
              <span className="settings-session-label">{formatLabel({ key: 'core.runtime-smoke.activation-message', defaultMessage: 'Activation message' })}</span>
              <p className="settings-secondary-caption settings-copy--relaxed">{activationMessage}</p>
            </div>
          </div>
        </div>
      </div>
      <footer className="modal-footer">
        <button onClick={() => void close()} className="modal-btn modal-btn-primary">{formatLabel({ key: 'core.common.close', defaultMessage: 'Close' })}</button>
      </footer>
    </div>
  </div>
);

export const runtimeSmokeExtensionEntry: BundledExtensionCatalogEntry = {
  manifest,
  activation: 'eager',
  async load() {
    const extension: MarkdownWorkspaceExtension = {
      manifest,
      async activate(context) {
        const previousActivationCount = (await context.config.get<number>('activationCount')) ?? 0;
        const activationCount = previousActivationCount + 1;
        const toastOnActivate = (await context.config.get<boolean>('toastOnActivate')) ?? true;
        const activationMessage = (await context.config.get<string>('activationMessage')) ?? 'Runtime smoke extension activated.';

        await context.config.set('activationCount', activationCount);
        if (toastOnActivate) {
          await context.host.notifications.info({ defaultMessage: activationMessage });
        }

        context.registerCommand({
          id: commandId,
          title: { defaultMessage: 'Open Runtime Smoke View' },
          description: { defaultMessage: 'Open the bundled runtime smoke test modal.' },
          icon: { kind: 'lucide', name: 'Plug' },
          keywords: ['runtime', 'smoke', 'extension'],
          execute: async () => {
            await context.host.views.open(viewId);
          },
        });

        context.registerView({
          id: viewId,
          title: { defaultMessage: 'Runtime Smoke' },
          description: { defaultMessage: 'Bundled runtime verification modal.' },
          icon: { kind: 'lucide', name: 'Plug' },
          location: 'modal',
          allowMultiple: false,
          canBePinned: false,
          render: (props) => <RuntimeSmokeModal {...(props as ClientViewRenderProps)} activationCount={activationCount} activationMessage={activationMessage} formatLabel={context.host.i18n.format} />,
        });

        context.registerActionRailItem({
          id: railId,
          title: { defaultMessage: 'Runtime Smoke' },
          icon: { kind: 'lucide', name: 'Plug' },
          group: 'extensions',
          order: 10,
          target: {
            kind: 'command',
            commandId,
          },
        });

        await context.host.diagnostics.publish(context.extensionId, {
          severity: 'info',
          code: 'EXT_RUNTIME_SMOKE_READY',
          message: `Bundled runtime smoke extension activated successfully. activationCount=${activationCount} message=${activationMessage}`,
        });
      },
    };

    return extension;
  },
};
