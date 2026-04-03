import React from "react";
import { useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ExtensionRuntime } from "@mdwrk/extension-runtime";

export interface ExtensionManagerSettingsPanelProps {
  readonly runtime: ExtensionRuntime;
  readonly open: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
}

export const ExtensionManagerSettingsPanel: React.FC<ExtensionManagerSettingsPanelProps> = ({
  runtime,
  open,
  formatLabel,
}) => {
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot) as ReturnType<ExtensionRuntime["getSnapshot"]>;

  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">{formatLabel("EXTENSION_MANAGER")}</span>
          <strong style={{ fontSize: 13 }}>{formatLabel("Extension Manager")}</strong>
          <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
            {formatLabel("Open the pane workspace to inspect runtime inventory, compatibility, installed catalog entries, and diagnostics.")}
          </p>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">EXTENSIONS</span><span className="settings-session-value">{snapshot.extensions.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">ACTIVE</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "active").length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">INSTALLED</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.source === "installed").length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">CATALOG</span><span className="settings-session-value">{snapshot.catalogEntries.length}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">INDEXEDDB</span>
          <span className="settings-chip">PANE_ONLY</span>
          <span className="settings-chip">EN_FALLBACK</span>
        </div>
        <div className="settings-action-row" style={{ padding: 6 }}>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void open()}>OPEN_MANAGER</button>
        </div>
      </div>
    </div>
  );
};
