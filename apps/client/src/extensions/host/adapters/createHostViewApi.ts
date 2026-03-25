import type { HostViewApi } from '@mdwrk/extension-host';
import type { ViewRegistry } from '../../../features/views/viewRegistry';

export function createHostViewApi(views: ViewRegistry): HostViewApi {
  return {
    async open(id: string, input?: unknown): Promise<void> {
      await views.open(id, input);
    },
    async close(id: string): Promise<void> {
      await views.close(id);
    },
    async focus(id: string): Promise<void> {
      await views.focus(id);
    },
    async list() {
      return views.listSync().map(({ render: _render, onOpen: _onOpen, onClose: _onClose, onFocus: _onFocus, ...descriptor }) => descriptor);
    },
  };
}
