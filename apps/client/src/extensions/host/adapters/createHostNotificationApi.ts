import type { HostNotificationApi } from '@markdown-workspace/extension-host';
import type { ClientNotificationService } from '../../../features/notifications/clientNotificationService';

export function createHostNotificationApi(notifications: ClientNotificationService): HostNotificationApi {
  return {
    info: notifications.info,
    warn: notifications.warn,
    error: notifications.error,
  };
}
