import React from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import { useSyncExternalStore } from "react";
import type { LanguagePackStudioController } from "../types.js";
import { languagePackStudioLabels } from "../i18n.js";

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
  const enabled = snapshot.packs.filter((pack) => pack.enabled).length;

  return (
    <div className="settings-pane">
      <div className="settings-card settings-card-stack">
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsShortcutKicker)}</span>
          <strong style={{ fontSize: 13 }}>{formatLabel(languagePackStudioLabels.settingsShortcutTitle)}</strong>
          <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
            {formatLabel(languagePackStudioLabels.settingsShortcutDescription)}
          </p>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsPacks)}</span><span className="settings-session-value">{snapshot.packs.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsEnabled)}</span><span className="settings-session-value">{enabled}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsBuiltIn)}</span><span className="settings-session-value">{builtIns}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsInstalled)}</span><span className="settings-session-value">{installed}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsActive)}</span><span className="settings-session-value">{snapshot.activeLocale}</span></div>
        </div>
        <div className="settings-action-row" style={{ padding: 6 }}>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void open()}>{formatLabel(languagePackStudioLabels.settingsOpenStudio)}</button>
        </div>
      </div>
    </div>
  );
};
