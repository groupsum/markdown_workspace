import React from "react";
import type { ExtensionRuntimeExtensionSnapshot } from "@mdwrk/extension-runtime";

export interface ExtensionStatusBadgeProps {
  readonly status: ExtensionRuntimeExtensionSnapshot["status"];
}

export const ExtensionStatusBadge: React.FC<ExtensionStatusBadgeProps> = ({ status }) => (
  <span className="settings-session-value extension-status-badge">{status}</span>
);
