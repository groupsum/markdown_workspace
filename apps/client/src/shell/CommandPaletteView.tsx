import React from 'react';
import { useSyncExternalStore } from 'react';
import { CommandPalette, type CommandPaletteActionItem } from '../../components/Modals/CommandPalette';
import { useClientRuntimeServices, useClientRuntimeSnapshot } from '../app/runtime/ClientRuntimeContext';
import { renderExtensionIcon } from './iconRenderer';

export const CommandPaletteView: React.FC = () => {
  const services = useClientRuntimeServices();
  const runtime = useClientRuntimeSnapshot();
  const commandSnapshot = useSyncExternalStore(services.commands.subscribe, services.commands.getSnapshot, services.commands.getSnapshot);

  const commands = React.useMemo<CommandPaletteActionItem[]>(() => commandSnapshot.commands.map((command) => ({
    id: command.id,
    label: services.i18n.format(command.title),
    action: () => services.commands.execute(command.id),
    icon: renderExtensionIcon(command.icon, 14),
    keywords: command.keywords,
  })), [commandSnapshot.commands, services.commands, services.i18n]);

  return (
    <CommandPalette
      isOpen
      onClose={() => { void services.views.close('core.command-palette'); }}
      files={runtime.app.state.files}
      onSelectFile={(fileId) => {
        runtime.app.actions.handleExplorerSelect(fileId);
        void services.views.close('core.command-palette');
      }}
      commands={commands}
    />
  );
};
