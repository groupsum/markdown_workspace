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
  const activeWorkspaceView = React.useMemo(
    () => (
      viewSnapshot.activeViewId && viewSnapshot.openViewIds.includes(viewSnapshot.activeViewId)
        ? viewSnapshot.views.find((view) => view.id === viewSnapshot.activeViewId && view.location === 'main' && view.id !== 'core.git-pane')
        : undefined
    ) ?? viewSnapshot.views.find((view) => view.location === 'main' && view.id !== 'core.git-pane' && viewSnapshot.openViewIds.includes(view.id)),
    [viewSnapshot.activeViewId, viewSnapshot.openViewIds, viewSnapshot.views],
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
          return !activeWorkspaceView && (item.isActive?.() ?? false);
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
          if (activeWorkspaceView) {
            await host.views.close(activeWorkspaceView.id);
            runtime.app.actions.setAppMode('work');
            runtime.app.actions.setSidebarOpen(true);
            return;
          }
          runtime.app.actions.toggleSidebar();
          return;
        }
        if (item.target.kind === 'view') {
          const targetViewId = item.target.viewId;
          const targetView = viewSnapshot.views.find((view) => view.id === targetViewId);
          const workspaceScopedView = targetView?.location === 'main';
          if (workspaceScopedView) {
            const isTargetActive = viewSnapshot.activeViewId === targetViewId;
            const isTargetOpen = viewSnapshot.openViewIds.includes(targetViewId);
            const hasWorkspaceSidebar = Boolean(targetView?.renderSidebar);
            if (isTargetActive && isTargetOpen) {
              await host.views.close(targetViewId);
              return;
            }
            runtime.app.actions.setAppMode('work');
            runtime.app.actions.setSidebarOpen(hasWorkspaceSidebar);
          }
          await host.views.open(item.target.viewId);
        } else {
          await host.commands.execute(item.target.commandId);
        }
      },
    })), [actionRailSnapshot.items, activeWorkspaceView, host.commands, host.views, localeSnapshot.locale, preferences.hiddenActionRailButtons, runtime.app.actions, services.i18n, viewSnapshot.activeViewId, viewSnapshot.openViewIds, viewSnapshot.views]);

  const ariaLabel = React.useMemo(
    () => services.i18n.format({ key: 'core.action-rail.aria-label', defaultMessage: 'Primary Actions' }),
    [localeSnapshot.locale, services.i18n],
  );

  return <ActionRail className={className} items={items} ariaLabel={ariaLabel} displayMode={preferences.actionRailDisplayMode} />;
};
