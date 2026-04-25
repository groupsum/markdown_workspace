import React from "react";
import { useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ExtensionRuntime } from "@mdwrk/extension-runtime";
import { extensionManagerLabels } from "../i18n.js";

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
          <span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsShortcutKicker)}</span>
          <strong style={{ fontSize: 13 }}>{formatLabel(extensionManagerLabels.settingsShortcutTitle)}</strong>
          <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
            {formatLabel(extensionManagerLabels.settingsShortcutDescription)}
          </p>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsStatsExtensions)}</span><span className="settings-session-value">{snapshot.extensions.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsStatsActive)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "active").length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsStatsInstalled)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.source === "installed").length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsStatsCatalog)}</span><span className="settings-session-value">{snapshot.catalogEntries.length}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">{formatLabel(extensionManagerLabels.settingsChipIndexedDb)}</span>
          <span className="settings-chip">{formatLabel(extensionManagerLabels.settingsChipPaneOnly)}</span>
          <span className="settings-chip">{formatLabel(extensionManagerLabels.settingsChipEnglishFallback)}</span>
        </div>
        <div className="settings-action-row" style={{ padding: 6 }}>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void open()}>{formatLabel(extensionManagerLabels.settingsOpenManager)}</button>
        </div>
      </div>
    </div>
  );
};
