import React from 'react';
import { useSyncExternalStore } from 'react';
import { ActionRail, type ActionRailItemModel } from '../../components/Chassis/ActionRail/ActionRail';
import { useClientExtensionHost, useClientRuntimeServices, useClientRuntimeSnapshot } from '../app/runtime/ClientRuntimeContext';
import { renderExtensionIcon } from './iconRenderer';
import { useWorkspacePreferences } from '../features/preferences/workspacePreferences';

export const ActionRailHost: React.FC<{ className?: string }> = ({ className }) => {
  const services = useClientRuntimeServices();
  const host = useClientExtensionHost();
  const runtime = useClientRuntimeSnapshot();
  const preferences = useWorkspacePreferences();
  const actionRailSnapshot = useSyncExternalStore(services.actionRail.subscribe, services.actionRail.getSnapshot, services.actionRail.getSnapshot);
  const viewSnapshot = useSyncExternalStore(services.views.subscribe, services.views.getSnapshot, services.views.getSnapshot);
  const localeSnapshot = useSyncExternalStore(services.i18n.subscribe, services.i18n.getSnapshot, services.i18n.getSnapshot);

  const items = React.useMemo<ActionRailItemModel[]>(() => actionRailSnapshot.items
    .filter((item) => !preferences.hiddenActionRailButtons.includes(item.id))
    .map((item) => ({
      id: item.id,
      title: services.i18n.format(item.title),
      icon: renderExtensionIcon(item.icon),
      badge: item.badge,
      active: (() => {
        if (item.id === 'core.toggle-explorer') {
          return !viewSnapshot.activeMainViewId && runtime.app.state.sidebarOpen;
        }
        if (item.target.kind === 'view') {
          return viewSnapshot.activeViewId === item.target.viewId && viewSnapshot.openViewIds.includes(item.target.viewId);
        }
        return item.isActive?.() ?? false;
      })(),
      disabled: item.isDisabled?.() ?? false,
      group: item.group,
      onClick: async () => {
        if (item.target.kind === 'view') {
          await services.views.toggle(item.target.viewId);
        } else {
          await host.commands.execute(item.target.commandId);
        }
      },
    })), [actionRailSnapshot.items, host.commands, localeSnapshot.locale, preferences.hiddenActionRailButtons, runtime.app.state.sidebarOpen, services.i18n, services.views, viewSnapshot.activeMainViewId, viewSnapshot.activeViewId, viewSnapshot.openViewIds]);

  const ariaLabel = React.useMemo(
    () => services.i18n.format({ key: 'core.action-rail.aria-label', defaultMessage: 'Primary Actions' }),
    [localeSnapshot.locale, services.i18n],
  );

  return <ActionRail className={className} items={items} ariaLabel={ariaLabel} displayMode={preferences.actionRailDisplayMode} />;
};
