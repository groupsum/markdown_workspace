import React from "react";
import type { ExtensionRuntimeExtensionSnapshot } from "@mdwrk/extension-runtime";

export interface ExtensionStatusBadgeProps {
  readonly status: ExtensionRuntimeExtensionSnapshot["status"];
}

export const ExtensionStatusBadge: React.FC<ExtensionStatusBadgeProps> = ({ status }) => (
  <span
    className="settings-session-value"
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 999,
      border: "1px solid var(--border-primary)",
      fontSize: 10,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
    }}
  >
    {status}
  </span>
);
