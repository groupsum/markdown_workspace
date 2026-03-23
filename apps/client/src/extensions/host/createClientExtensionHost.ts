import type { ExtensionHost } from '@markdown-workspace/extension-host';
import { EXTENSION_RUNTIME_VERSION } from '@markdown-workspace/extension-runtime';
import { APP_VERSION } from '../../../constants';
import type { ActiveEditorBridge } from '../../features/editor/activeEditorBridge';
import type { ClientDiagnosticsService } from '../../features/diagnostics/clientDiagnosticsService';
import type { ClientI18nService } from '../../features/i18n/clientI18nService';
import type { ClientNotificationService } from '../../features/notifications/clientNotificationService';
import type { HostSettingsStore } from '../../features/settings/settingsStore';
import type { ActionRailRegistry } from '../../features/action-rail/actionRailRegistry';
import type { CommandRegistry } from '../../features/commands/commandRegistry';
import type { ViewRegistry } from '../../features/views/viewRegistry';
import type { ClientRuntimeBridge } from '../../app/runtime/clientRuntimeTypes';
import { createHostActionRailApi } from './adapters/createHostActionRailApi';
import { createHostCommandApi } from './adapters/createHostCommandApi';
import { createHostDiagnosticsApi } from './adapters/createHostDiagnosticsApi';
import { createHostEditorApi } from './adapters/createHostEditorApi';
import { createHostI18nApi } from './adapters/createHostI18nApi';
import { createHostNotificationApi } from './adapters/createHostNotificationApi';
import { createHostSettingsApi } from './adapters/createHostSettingsApi';
import { createHostThemeApi } from './adapters/createHostThemeApi';
import { createHostViewApi } from './adapters/createHostViewApi';
import { createHostWorkspaceApi } from './adapters/createHostWorkspaceApi';

export interface ClientExtensionHostDependencies {
  readonly runtime: ClientRuntimeBridge;
  readonly commands: CommandRegistry;
  readonly views: ViewRegistry;
  readonly actionRail: ActionRailRegistry;
  readonly settingsStore: HostSettingsStore;
  readonly notifications: ClientNotificationService;
  readonly i18n: ClientI18nService;
  readonly diagnostics: ClientDiagnosticsService;
  readonly activeEditor: ActiveEditorBridge;
}

export function createClientExtensionHost(deps: ClientExtensionHostDependencies): ExtensionHost {
  return {
    apiVersion: '1.0.0',
    commands: createHostCommandApi(deps.commands),
    views: createHostViewApi(deps.views),
    actionRail: createHostActionRailApi(deps.actionRail),
    settings: createHostSettingsApi(deps.settingsStore),
    notifications: createHostNotificationApi(deps.notifications),
    theme: createHostThemeApi(deps.runtime),
    editor: createHostEditorApi(deps.runtime, deps.activeEditor),
    workspace: createHostWorkspaceApi(deps.runtime),
    i18n: createHostI18nApi(deps.i18n),
    diagnostics: createHostDiagnosticsApi(deps.diagnostics),
    logger: {
      async debug(message, context) { console.debug('[extension-host]', message, context); },
      async info(message, context) { console.info('[extension-host]', message, context); },
      async warn(message, context) { console.warn('[extension-host]', message, context); },
      async error(message, context) { console.error('[extension-host]', message, context); },
    },
    environment: {
      platform: 'web',
      mode: import.meta.env.DEV ? 'development' : 'production',
      hostVersion: APP_VERSION,
      runtimeVersion: EXTENSION_RUNTIME_VERSION,
      grantedCapabilities: [
        'workspace.read',
        'workspace.write',
        'editor.read',
        'editor.write',
        'selection.read',
        'settings.read',
        'settings.write',
        'theme.read',
        'theme.write',
        'command.invoke',
        'network.fetch',
        'notification.publish',
        'actionRail.register',
        'view.register',
        'component.register',
      ],
    },
  };
}
