import type { HostActionRailApi } from '@markdown-workspace/extension-host';
import type { ActionRailRegistry } from '../../../features/action-rail/actionRailRegistry';

export function createHostActionRailApi(actionRail: ActionRailRegistry): HostActionRailApi {
  return {
    async list() {
      return actionRail.listSync().map(({ badge: _badge, tooltip: _tooltip, isActive: _isActive, isDisabled: _isDisabled, ...descriptor }) => descriptor);
    },
    async reveal(id: string): Promise<void> {
      await actionRail.reveal(id);
    },
    async setBadge(id: string, value: number | null): Promise<void> {
      await actionRail.setBadge(id, value);
    },
  };
}
