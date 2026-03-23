import type { HostDiagnosticsApi } from '@markdown-workspace/extension-host';
import type { ClientDiagnosticsService } from '../../../features/diagnostics/clientDiagnosticsService';

export function createHostDiagnosticsApi(diagnostics: ClientDiagnosticsService): HostDiagnosticsApi {
  return {
    publish: diagnostics.publish,
    clear: diagnostics.clear,
  };
}
