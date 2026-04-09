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
  const openWorkspaceViewIds = React.useMemo(
    () => viewSnapshot.views
      .filter((view) => view.location === 'main' && view.id !== 'core.git-pane' && viewSnapshot.openViewIds.includes(view.id))
      .map((view) => view.id),
    [viewSnapshot.openViewIds, viewSnapshot.views],
  );

  const items = React.useMemo<ActionRailItemModel[]>(() => actionRailSnapshot.items
    .filter((item) => !preferences.hiddenActionRailButtons.includes(item.id))
    .map((item) => ({
      id: item.id,
      title: services.i18n.format(item.title),
      icon: renderExtensionIcon(item.icon),
      badge: item.badge,
      active: (() => {
        if (item.id === 'core.toggle-explorer') {
          return item.isActive?.() ?? false;
        }
        if (item.target.kind === 'view') {
          return viewSnapshot.activeViewId === item.target.viewId && viewSnapshot.openViewIds.includes(item.target.viewId);
        }
        return item.isActive?.() ?? false;
      })(),
      disabled: item.isDisabled?.() ?? false,
      group: item.group,
      onClick: async () => {
        if (item.target.kind === 'command' && item.target.commandId === 'core.toggle-explorer') {
          if (openWorkspaceViewIds.length > 0) {
            await Promise.all(openWorkspaceViewIds.map((viewId) => host.views.close(viewId)));
            runtime.app.actions.setAppMode('work');
            if (!runtime.app.state.sidebarOpen) {
              runtime.app.actions.setSidebarOpen(true);
            }
            return;
          }
          runtime.app.actions.setSidebarOpen(!runtime.app.state.sidebarOpen);
          return;
        }
        if (item.target.kind === 'view') {
          const targetViewId = item.target.viewId;
          const targetView = viewSnapshot.views.find((view) => view.id === targetViewId);
          const workspaceScopedView = targetView?.location === 'main';
          if (workspaceScopedView) {
            const isTargetActive = viewSnapshot.activeViewId === targetViewId;
            const isTargetOpen = viewSnapshot.openViewIds.includes(targetViewId);
            if (isTargetActive && isTargetOpen) {
              await host.views.close(targetViewId);
              return;
            }
            runtime.app.actions.setAppMode('work');
          }
          await host.views.open(item.target.viewId);
        } else {
          await host.commands.execute(item.target.commandId);
        }
      },
    })), [actionRailSnapshot.items, host.commands, host.views, localeSnapshot.locale, openWorkspaceViewIds, preferences.hiddenActionRailButtons, runtime.app.actions, runtime.app.state.sidebarOpen, services.i18n, viewSnapshot.activeViewId, viewSnapshot.openViewIds, viewSnapshot.views]);

  const ariaLabel = React.useMemo(
    () => services.i18n.format({ key: 'core.action-rail.aria-label', defaultMessage: 'Primary Actions' }),
    [localeSnapshot.locale, services.i18n],
  );

  return <ActionRail className={className} items={items} ariaLabel={ariaLabel} displayMode={preferences.actionRailDisplayMode} />;
};
