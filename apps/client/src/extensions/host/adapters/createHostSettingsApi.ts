import type { HostSettingsApi } from '@markdown-workspace/extension-host';
import type { HostSettingsStore } from '../../../features/settings/settingsStore';

export function createHostSettingsApi(store: HostSettingsStore): HostSettingsApi {
  return {
    get: store.get,
    set: store.set,
    remove: store.remove,
    watch: store.watch,
  };
}
