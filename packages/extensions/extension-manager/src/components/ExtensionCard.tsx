import React from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import { deriveExtensionIntent, type ExtensionRuntime, type ExtensionRuntimeExtensionSnapshot } from "@mdwrk/extension-runtime";
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

const formatDiagnosticCode = (code: string): string =>
  code.replaceAll("_", " ").toLowerCase().replace(/^\w|\s\w/g, (match) => match.toUpperCase());

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

  const stopSummaryToggle = (event: { preventDefault: () => void; stopPropagation: () => void }): void => {
    event.preventDefault();
    event.stopPropagation();
  };

  const enableLabel = formatLabel(extensionManagerLabels.actionEnable);
  const disableLabel = formatLabel(extensionManagerLabels.actionDisable);
  const activateLabel = formatLabel(extensionManagerLabels.actionActivate);
  const deactivateLabel = formatLabel(extensionManagerLabels.actionDeactivate);
  const intent = deriveExtensionIntent(extension);

  return (
    <article className="settings-card settings-card-stack" style={{ display: "grid", gap: 14 }}>
      <details open style={{ display: "grid", gap: 12 }}>
        <summary style={{ listStyle: "none", cursor: "pointer" }}>
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
            onClick={(event) => { stopSummaryToggle(event); void toggleEnabled(); }}
            disabled={busy}
            aria-label={`${extension.enabled ? disableLabel : enableLabel} ${extension.id}`}
            title={extension.enabled ? disableLabel : enableLabel}
          >
            {extension.enabled ? <PowerOff size={14} /> : <Power size={14} />}
          </button>
          <button className="modal-btn modal-btn-primary" onClick={(event) => { stopSummaryToggle(event); void activate(); }} disabled={busy || !extension.enabled} aria-label={`${activateLabel} ${extension.id}`} title={activateLabel}>
            <CheckCircle2 size={14} />
          </button>
          <button className="modal-btn" onClick={(event) => { stopSummaryToggle(event); void deactivate(); }} disabled={busy || extension.status !== "active"} aria-label={`${deactivateLabel} ${extension.id}`} title={deactivateLabel}>
            <CircleSlash2 size={14} />
          </button>
        </div>
          </header>
        </summary>

      <div className="settings-session-grid">
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelPackage)}</span><span className="settings-session-value">{extension.manifest.packageName}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelVersion)}</span><span className="settings-session-value">{extension.manifest.version}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelActivation)}</span><span className="settings-session-value">{extension.activation}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelEnabled)}</span><span className="settings-session-value">{extension.enabled ? formatLabel(extensionManagerLabels.stateEnabled) : formatLabel(extensionManagerLabels.stateDisabled)}</span></div>
      </div>

      <section style={{ display: "grid", gap: 10, padding: 12, border: "1px solid var(--border-primary)", borderRadius: 8 }} aria-label={`Intent for ${formatLabel(extension.manifest.displayName)}`}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
          <div style={{ display: "grid", gap: 4 }}>
            <span className="settings-session-label">Purpose</span>
            <strong style={{ fontSize: 12 }}>{intent.safeDefaultAction}</strong>
            <span className="settings-muted-caption">{intent.purpose}</span>
          </div>
          <span style={pillStyle}>{intent.trust.label}</span>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">Content bridge</span><span className="settings-session-value">{intent.contentAccess.writesWorkspace || intent.contentAccess.writesEditor ? "Read/write markdown" : intent.contentAccess.readsWorkspace || intent.contentAccess.readsEditor ? "Read markdown" : "No markdown access"}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">Network</span><span className="settings-session-value">{intent.networkAccess ? "Network enabled" : "No network access"}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">Persistence</span><span className="settings-session-value">{intent.persistenceAccess ? "Settings-backed" : "No settings persistence"}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">Trust detail</span><span className="settings-session-value">{intent.trust.detail}</span></div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">Workflow</span>
          <div className="settings-chip-row">
            {intent.primaryWorkflow.map((step, index) => <span key={step} className="settings-chip">{index + 1}. {step}</span>)}
          </div>
        </div>
        {intent.dangerousAction && (
          <div style={{ display: "grid", gap: 4 }}>
            <span className="settings-session-label">Review before action</span>
            <span className="settings-muted-caption">{intent.dangerousAction}</span>
          </div>
        )}
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">Recovery</span>
          <div className="settings-chip-row">
            {intent.recoveryActions.map((action) => <span key={action} className="settings-chip">{action}</span>)}
          </div>
        </div>
      </section>

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

      <section style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.labelRetention)}</span>
        <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>
          {formatLabel(extension.source === "installed" ? extensionManagerLabels.retentionInstalled : extensionManagerLabels.retentionBundled)}
        </p>
        {extension.verification && (
          <div className="settings-chip-row">
            <span className="settings-chip">{extension.verification.integrityVerified ? "Integrity verified" : "Integrity pending"}</span>
            <span className="settings-chip">{extension.verification.signatureVerified ? "Signature verified" : "Integrity-only install"}</span>
          </div>
        )}
      </section>

      <details open={showCompatibility} onToggle={(event) => {
        setShowCompatibility((event.currentTarget as HTMLDetailsElement).open);
      }}>
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

      <details open={showDiagnostics} onToggle={(event) => {
        setShowDiagnostics((event.currentTarget as HTMLDetailsElement).open);
      }}>
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
                <li key={`${record.code}-${index}`}>{formatDiagnosticCode(record.code)}: {record.message}</li>
              ))}
            </ul>
          ) : !extension.lastError ? (
            <p style={{ margin: 0, fontSize: 12, color: "var(--fg-muted)" }}>{formatLabel(extensionManagerLabels.noDiagnostics)}</p>
          ) : null}
        </div>
      </details>

      {extension.manifest.settingsSchema && (
        <details open={showSettings} onToggle={(event) => {
          setShowSettings((event.currentTarget as HTMLDetailsElement).open);
        }}>
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
      </details>
    </article>
  );
};
