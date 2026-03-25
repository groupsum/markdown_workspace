import type { ExtensionHost } from '@mdwrk/extension-host';
import type { useApp } from '../../../hooks/useApp';
import type { usePwa } from '../../../hooks/usePwa';
import type { ActionRailRegistry } from '../../features/action-rail/actionRailRegistry';
import type { CommandRegistry } from '../../features/commands/commandRegistry';
import type { ActiveEditorBridge } from '../../features/editor/activeEditorBridge';
import type { ClientDiagnosticsService } from '../../features/diagnostics/clientDiagnosticsService';
import type { ClientI18nService } from '../../features/i18n/clientI18nService';
import type { ClientNotificationService } from '../../features/notifications/clientNotificationService';
import type { SettingsRegistry } from '../../features/settings/settingsRegistry';
import type { HostSettingsStore } from '../../features/settings/settingsStore';
import type { ViewRegistry } from '../../features/views/viewRegistry';

export type ClientAppController = ReturnType<typeof useApp>;
export type ClientPwaController = ReturnType<typeof usePwa>;

export interface ClientRuntimeSnapshot {
  readonly app: ClientAppController;
  readonly pwa: ClientPwaController;
  readonly online: boolean;
  readonly updateAvailable: boolean;
  readonly activeTabName: string | null;
}

export interface ClientRuntimeBridge {
  getSnapshot(): ClientRuntimeSnapshot;
}

export interface ClientRuntimeServices {
  readonly commands: CommandRegistry;
  readonly views: ViewRegistry;
  readonly actionRail: ActionRailRegistry;
  readonly settingsRegistry: SettingsRegistry;
  readonly settingsStore: HostSettingsStore;
  readonly i18n: ClientI18nService;
  readonly notifications: ClientNotificationService;
  readonly diagnostics: ClientDiagnosticsService;
  readonly activeEditor: ActiveEditorBridge;
  readonly extensionHost: ExtensionHost;
}
