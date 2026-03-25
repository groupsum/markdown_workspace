import type { I18nLabel } from '@mdwrk/extension-manifest';
import type { HostNotificationOptions } from '@mdwrk/extension-host';

export interface ClientNotificationBridge {
  addToast(message: string, type: 'info' | 'warning' | 'success'): void;
}

export interface ClientNotificationService {
  info(message: I18nLabel | string, options?: HostNotificationOptions): Promise<void>;
  warn(message: I18nLabel | string, options?: HostNotificationOptions): Promise<void>;
  error(message: I18nLabel | string, options?: HostNotificationOptions): Promise<void>;
}

export function createClientNotificationService(
  bridge: () => ClientNotificationBridge,
  format: (label: I18nLabel | string) => string,
): ClientNotificationService {
  const publish = async (
    type: 'info' | 'warning' | 'success',
    message: I18nLabel | string,
    options?: HostNotificationOptions,
  ) => {
    const resolved = options?.title
      ? `${options.title}: ${format(message)}`
      : format(message);
    bridge().addToast(resolved.toUpperCase(), type);
  };

  return {
    info(message, options) {
      return publish('info', message, options);
    },
    warn(message, options) {
      return publish('warning', message, options);
    },
    error(message, options) {
      return publish('warning', message, options);
    },
  };
}
