import React from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import { useSyncExternalStore } from "react";
import type { LanguagePackStudioController } from "../types.js";

export interface LanguagePackStudioSettingsPanelProps {
  readonly controller: LanguagePackStudioController;
  readonly open: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
}

export const LanguagePackStudioSettingsPanel: React.FC<LanguagePackStudioSettingsPanelProps> = ({
  controller,
  open,
  formatLabel,
}) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
  const builtIns = snapshot.packs.filter((pack) => pack.source === "built-in").length;
  const installed = snapshot.packs.filter((pack) => pack.source === "installed").length;

  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">{formatLabel("LANGUAGE_PACK_STUDIO")}</span>
          <strong style={{ fontSize: 13 }}>{formatLabel("Language Pack Studio")}</strong>
          <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
            {formatLabel("Use the pane workspace for token audits, import/export, built-in enablement, and pack authoring.")}
          </p>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">PACKS</span><span className="settings-session-value">{snapshot.packs.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">BUILT_IN</span><span className="settings-session-value">{builtIns}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">INSTALLED</span><span className="settings-session-value">{installed}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">ACTIVE</span><span className="settings-session-value">{snapshot.activeLocale}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">{builtIns} BUILT_IN</span>
          <span className="settings-chip">{snapshot.packs.filter((pack) => pack.enabled).length} ENABLED</span>
          <span className="settings-chip">EN_FALLBACK</span>
          <span className="settings-chip">INDEXEDDB</span>
        </div>
        <div className="settings-action-row" style={{ padding: 6 }}>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void open()}>OPEN_STUDIO</button>
        </div>
      </div>
    </div>
  );
};
