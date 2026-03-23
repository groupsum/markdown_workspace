import type { MessageDescriptor, MessageValue } from "./types.js";

export function defineMessages<T extends Record<string, MessageDescriptor>>(messages: T): T {
  return messages;
}

export function normalizeMessageDescriptor(
  descriptor: string | MessageDescriptor,
  key?: string,
): MessageDescriptor {
  if (typeof descriptor === "string") {
    return {
      key,
      defaultMessage: descriptor,
    };
  }

  return descriptor;
}

export function interpolateMessage(
  template: string,
  values: Readonly<Record<string, MessageValue>> = {},
): string {
  return template.replace(/\{([a-zA-Z0-9_.-]+)\}/g, (_, name: string) => {
    const value = values[name];
    return value === null || value === undefined ? "" : String(value);
  });
}

export function formatMessage(
  descriptor: string | MessageDescriptor,
  values?: Readonly<Record<string, MessageValue>>,
): string {
  const normalized = normalizeMessageDescriptor(descriptor);
  return interpolateMessage(normalized.defaultMessage, {
    ...(normalized.values ?? {}),
    ...(values ?? {}),
  });
}
