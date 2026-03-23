import React from 'react';
import { useSyncExternalStore } from 'react';
import { ActionRail, type ActionRailItemModel } from '../../components/Chassis/ActionRail/ActionRail';
import { useClientExtensionHost, useClientRuntimeServices } from '../app/runtime/ClientRuntimeContext';
import { renderExtensionIcon } from './iconRenderer';

export const ActionRailHost: React.FC<{ className?: string }> = ({ className }) => {
  const services = useClientRuntimeServices();
  const host = useClientExtensionHost();
  const snapshot = useSyncExternalStore(services.actionRail.subscribe, services.actionRail.getSnapshot, services.actionRail.getSnapshot);

  const items = React.useMemo<ActionRailItemModel[]>(() => snapshot.items.map((item) => ({
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
  })), [host.commands, host.views, services.i18n, snapshot.items]);

  return <ActionRail className={className} items={items} />;
};
