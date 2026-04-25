import React from "react";
import { useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ThemeStudioService } from "../types.js";
import { themeStudioLabels } from "../i18n.js";

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
          <span className="settings-session-label">{formatLabel(themeStudioLabels.settingsShortcutKicker)}</span>
          <strong style={{ fontSize: 13 }}>{formatLabel(themeStudioLabels.settingsShortcutTitle)}</strong>
          <p style={{ margin: 0, fontSize: 11, color: "var(--fg-muted)", lineHeight: 1.4 }}>
            {formatLabel(themeStudioLabels.settingsShortcutDescription)}
          </p>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsThemeId)}</span><span className="settings-session-value">{snapshot.metadata.themeId}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsTokens)}</span><span className="settings-session-value">{snapshot.tokenDefinitions.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsRelationships)}</span><span className="settings-session-value">{snapshot.relationships.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsStatus)}</span><span className="settings-session-value">{snapshot.busy ? formatLabel(themeStudioLabels.statusBusy) : formatLabel(themeStudioLabels.statusReady)}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">{formatLabel(themeStudioLabels.settingsChipPaneOnly)}</span>
          <span className="settings-chip">{formatLabel(themeStudioLabels.settingsChipSplitSingle)}</span>
          <span className="settings-chip">{formatLabel(themeStudioLabels.settingsChipEnglishFallback)}</span>
        </div>
        <div className="settings-action-row" style={{ padding: 6 }}>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void open()}>{formatLabel(themeStudioLabels.settingsOpenStudio)}</button>
        </div>
      </div>
    </div>
  );
};
