import React, { useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ExtensionRuntime } from "@mdwrk/extension-runtime";
import { extensionManagerLabels } from "../i18n.js";
import { ExtensionCard } from "./ExtensionCard.js";

export interface ExtensionManagerViewProps {
  readonly runtime: ExtensionRuntime;
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly defaultSettings?: {
    readonly showCompatibility?: boolean;
    readonly showDiagnostics?: boolean;
  };
}

export const ExtensionManagerView: React.FC<ExtensionManagerViewProps> = ({ runtime, close, formatLabel, defaultSettings }) => {
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot) as ReturnType<ExtensionRuntime["getSnapshot"]>;
  const defaults = React.useMemo(() => ({
    showCompatibility: defaultSettings?.showCompatibility ?? true,
    showDiagnostics: defaultSettings?.showDiagnostics ?? true,
  }), [defaultSettings]);

  return (
    <div className="modal-overlay" data-testid="extension-manager-modal">
      <div className="modal-base settings-modal" style={{ width: "min(1180px, 96vw)" }}>
        <div className="modal-header">
          <div style={{ display: "grid", gap: 4 }}>
            <span className="modal-title">{formatLabel(extensionManagerLabels.headerTitle)}</span>
            <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              {formatLabel(extensionManagerLabels.headerSubtitle)}
            </span>
          </div>
          <button onClick={() => void close()} className="modal-close">{formatLabel(extensionManagerLabels.actionExit)}</button>
        </div>
        <div className="settings-content-frame" style={{ maxHeight: "72vh", overflow: "auto" }}>
          <div className="settings-pane" style={{ display: "grid", gap: 16 }}>
            <div className="settings-card settings-card-stack">
              <div className="settings-session-grid">
                <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsExtensions)}</span><span className="settings-session-value">{snapshot.extensions.length}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsActive)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "active").length}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsDisabled)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => !extension.enabled).length}</span></div>
                <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsIncompatible)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "incompatible").length}</span></div>
              </div>
            </div>
            {snapshot.extensions.map((extension) => (
              <ExtensionCard
                key={extension.id}
                extension={extension}
                runtime={runtime}
                formatLabel={formatLabel}
                defaults={{
                  showCompatibility: defaults.showCompatibility,
                  showDiagnostics: defaults.showDiagnostics,
                }}
              />
            ))}
          </div>
        </div>
        <footer className="modal-footer">
          <button onClick={() => void close()} className="modal-btn modal-btn-primary">{formatLabel(extensionManagerLabels.actionClose)}</button>
        </footer>
      </div>
    </div>
  );
};
