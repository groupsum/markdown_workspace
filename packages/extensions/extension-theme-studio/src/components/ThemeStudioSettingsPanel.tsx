import React from "react";
import { useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ThemeStudioService } from "../types.js";

export interface ThemeStudioSettingsPanelProps {
  readonly service: ThemeStudioService;
  readonly open: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
}

export const ThemeStudioSettingsPanel: React.FC<ThemeStudioSettingsPanelProps> = ({
  service,
  open,
  formatLabel,
}) => {
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);

  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">{formatLabel("THEME_STUDIO")}</span>
          <strong style={{ fontSize: 13 }}>{formatLabel("Theme Studio")}</strong>
          <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
            {formatLabel("Open the pane workspace to inspect token bridges, preview renderer/editor output, and export portable theme artifacts.")}
          </p>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">THEME_ID</span><span className="settings-session-value">{snapshot.metadata.themeId}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">TOKENS</span><span className="settings-session-value">{snapshot.tokenDefinitions.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">RELATIONSHIPS</span><span className="settings-session-value">{snapshot.relationships.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">STATUS</span><span className="settings-session-value">{snapshot.busy ? "BUSY" : "READY"}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">PANE_ONLY</span>
          <span className="settings-chip">SPLIT + SINGLE</span>
          <span className="settings-chip">EN_FALLBACK</span>
        </div>
        <div className="settings-action-row" style={{ padding: 6 }}>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void open()}>OPEN_STUDIO</button>
        </div>
      </div>
    </div>
  );
};
