import React from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import type { ExtensionRuntime, ExtensionRuntimeExtensionSnapshot } from "@mdwrk/extension-runtime";
import { AlertTriangle, CheckCircle2, ChevronsUpDown, CircleSlash2, Power, PowerOff } from "lucide-react";
import { extensionManagerLabels } from "../i18n.js";
import { ExtensionManifestIcon } from "./ExtensionManifestIcon.js";
import { ExtensionStatusBadge } from "./ExtensionStatusBadge.js";
import { SettingsSchemaForm } from "./SettingsSchemaForm.js";

export interface ExtensionCardProps {
  readonly extension: ExtensionRuntimeExtensionSnapshot;
  readonly runtime: ExtensionRuntime;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly defaults: {
    readonly showCompatibility: boolean;
    readonly showDiagnostics: boolean;
  };
}

const detailSummaryStyle: React.CSSProperties = {
  cursor: "pointer",
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid var(--border-primary)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

export const ExtensionCard: React.FC<ExtensionCardProps> = ({ extension, runtime, formatLabel, defaults }) => {
  const [showCompatibility, setShowCompatibility] = React.useState(defaults.showCompatibility || !extension.compatibility.compatible);
  const [showDiagnostics, setShowDiagnostics] = React.useState(defaults.showDiagnostics || extension.status === "error");
  const [showSettings, setShowSettings] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!extension.compatibility.compatible) {
      setShowCompatibility(true);
    }
    if (extension.status === "error") {
      setShowDiagnostics(true);
    }
  }, [extension.compatibility.compatible, extension.status]);

  const toggleEnabled = async () => {
    setBusy(true);
    try {
      await runtime.setEnabled(extension.id, !extension.enabled);
    } finally {
      setBusy(false);
    }
  };

  const activate = async () => {
    setBusy(true);
    try {
      await runtime.activate(extension.id);
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async () => {
    setBusy(true);
    try {
      await runtime.deactivate(extension.id);
    } finally {
      setBusy(false);
    }
  };

  const enableLabel = formatLabel(extensionManagerLabels.actionEnable);
  const disableLabel = formatLabel(extensionManagerLabels.actionDisable);
  const activateLabel = formatLabel(extensionManagerLabels.actionActivate);
  const deactivateLabel = formatLabel(extensionManagerLabels.actionDeactivate);

  return (
    <article className="settings-card settings-card-stack" style={{ display: "grid", gap: 14 }}>
      <header style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 12, alignItems: "start" }}>
        <div style={{ display: "inline-flex", width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center", border: "1px solid var(--border-primary)" }}>
          <ExtensionManifestIcon icon={extension.manifest.icon} size={18} />
        </div>
        <div style={{ display: "grid", gap: 4 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <strong style={{ fontSize: 14 }}>{formatLabel(extension.manifest.displayName)}</strong>
            <span style={pillStyle}>{extension.source === "bundled" ? formatLabel(extensionManagerLabels.sourceBundled) : formatLabel(extensionManagerLabels.sourceInstalled)}</span>
            <ExtensionStatusBadge status={extension.status} />
          </div>
          <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{extension.id}</span>
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }}>
            {formatLabel(extension.manifest.description)}
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            className="modal-btn"
            onClick={() => void toggleEnabled()}
            disabled={busy}
            aria-label={`${extension.enabled ? disableLabel : enableLabel} ${extension.id}`}
          >
            {extension.enabled ? <PowerOff size={14} /> : <Power size={14} />} {extension.enabled ? disableLabel : enableLabel}
          </button>
          <button className="modal-btn modal-btn-primary" onClick={() => void activate()} disabled={busy || !extension.enabled}>
            {activateLabel}
          </button>
          <button className="modal-btn" onClick={() => void deactivate()} disabled={busy || extension.status !== "active"}>
            {deactivateLabel}
          </button>
        </div>
      </header>

      <div className="settings-session-grid">
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelPackage)}</span><span className="settings-session-value">{extension.manifest.packageName}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelVersion)}</span><span className="settings-session-value">{extension.manifest.version}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelActivation)}</span><span className="settings-session-value">{extension.activation}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelEnabled)}</span><span className="settings-session-value">{extension.enabled ? formatLabel(extensionManagerLabels.stateEnabled) : formatLabel(extensionManagerLabels.stateDisabled)}</span></div>
      </div>

      <section style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.labelPermissions)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {extension.grantedCapabilities.map((capability) => (
            <span key={`granted-${capability}`} style={pillStyle}>
              <CheckCircle2 size={12} /> {capability}
            </span>
          ))}
          {extension.missingCapabilities.map((capability) => (
            <span key={`missing-${capability}`} style={pillStyle}>
              <CircleSlash2 size={12} /> {capability}
            </span>
          ))}
        </div>
      </section>

      <details open={showCompatibility} onToggle={(event) => setShowCompatibility((event.currentTarget as HTMLDetailsElement).open)}>
        <summary style={detailSummaryStyle}><ChevronsUpDown size={12} style={{ display: "inline-flex", marginRight: 6 }} />{formatLabel(extensionManagerLabels.labelCompatibility)}</summary>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>
            {extension.compatibility.compatible ? formatLabel(extensionManagerLabels.compatibilityOk) : formatLabel(extensionManagerLabels.compatibilityError)}
          </p>
          {!extension.compatibility.compatible && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--fg-secondary)", display: "grid", gap: 6 }}>
              {extension.compatibility.issues.map((issue, index) => (
                <li key={`${issue.target}-${index}`}>{issue.message}</li>
              ))}
            </ul>
          )}
        </div>
      </details>

      <details open={showDiagnostics} onToggle={(event) => setShowDiagnostics((event.currentTarget as HTMLDetailsElement).open)}>
        <summary style={detailSummaryStyle}><ChevronsUpDown size={12} style={{ display: "inline-flex", marginRight: 6 }} />{formatLabel(extensionManagerLabels.labelHealth)}</summary>
        <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
          {extension.lastError && (
            <div style={{ display: "grid", gap: 4 }}>
              <span style={{ ...pillStyle, width: "fit-content" }}><AlertTriangle size={12} /> {formatLabel(extensionManagerLabels.lastError)}</span>
              <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{extension.lastError.message}</p>
            </div>
          )}
          {extension.diagnostics.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--fg-secondary)", display: "grid", gap: 6 }}>
              {extension.diagnostics.map((record, index) => (
                <li key={`${record.code}-${index}`}>{record.code}: {record.message}</li>
              ))}
            </ul>
          ) : !extension.lastError ? (
            <p style={{ margin: 0, fontSize: 12, color: "var(--fg-muted)" }}>{formatLabel(extensionManagerLabels.noDiagnostics)}</p>
          ) : null}
        </div>
      </details>

      {extension.manifest.settingsSchema && (
        <details open={showSettings} onToggle={(event) => setShowSettings((event.currentTarget as HTMLDetailsElement).open)}>
          <summary style={detailSummaryStyle}><ChevronsUpDown size={12} style={{ display: "inline-flex", marginRight: 6 }} />{formatLabel(extensionManagerLabels.labelSettings)}</summary>
          <div style={{ marginTop: 10 }}>
            <SettingsSchemaForm
              runtime={runtime}
              extensionId={extension.id}
              schema={extension.manifest.settingsSchema}
              formatLabel={formatLabel}
            />
          </div>
        </details>
      )}
    </article>
  );
};
