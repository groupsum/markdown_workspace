import React from 'react';
import { useSyncExternalStore } from 'react';
import { ActionRail, type ActionRailItemModel } from '../../components/Chassis/ActionRail/ActionRail';
import { useClientExtensionHost, useClientRuntimeServices } from '../app/runtime/ClientRuntimeContext';
import { renderExtensionIcon } from './iconRenderer';
import { useWorkspacePreferences } from '../features/preferences/workspacePreferences';

export const ActionRailHost: React.FC<{ className?: string }> = ({ className }) => {
  const services = useClientRuntimeServices();
  const host = useClientExtensionHost();
  const preferences = useWorkspacePreferences();
  const actionRailSnapshot = useSyncExternalStore(services.actionRail.subscribe, services.actionRail.getSnapshot, services.actionRail.getSnapshot);
  const localeSnapshot = useSyncExternalStore(services.i18n.subscribe, services.i18n.getSnapshot, services.i18n.getSnapshot);

  const items = React.useMemo<ActionRailItemModel[]>(() => actionRailSnapshot.items
    .filter((item) => !preferences.hiddenActionRailButtons.includes(item.id))
    .map((item) => ({
      id: item.id,
      title: services.i18n.format(item.title),
      icon: renderExtensionIcon(item.icon),
      badge: item.badge,
      active: item.isActive?.() ?? false,
      disabled: item.isDisabled?.() ?? false,
      group: item.group,
      onClick: async () => {
        if (item.target.kind === 'view') {
          await host.views.open(item.target.viewId);
        } else {
          await host.commands.execute(item.target.commandId);
        }
      },
    })), [actionRailSnapshot.items, host.commands, host.views, preferences.hiddenActionRailButtons, services.i18n, localeSnapshot.locale]);

  const ariaLabel = React.useMemo(
    () => services.i18n.format({ key: 'core.action-rail.aria-label', defaultMessage: 'Primary Actions' }),
    [localeSnapshot.locale, services.i18n],
  );

  return <ActionRail className={className} items={items} ariaLabel={ariaLabel} displayMode={preferences.actionRailDisplayMode} />;
};
