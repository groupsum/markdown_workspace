export const EXTENSION_CAPABILITIES = [
  "workspace.read",
  "workspace.write",
  "editor.read",
  "editor.write",
  "selection.read",
  "settings.read",
  "settings.write",
  "theme.read",
  "theme.write",
  "command.invoke",
  "network.fetch",
  "notification.publish",
  "actionRail.register",
  "view.register",
  "component.register",
] as const;

export type ExtensionCapability = typeof EXTENSION_CAPABILITIES[number];
