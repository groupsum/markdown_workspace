import React, { useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  createPortableExtensionCatalogRegistration,
  normalizePortableExtensionPackageArtifact,
  type ExtensionRuntime,
} from "@mdwrk/extension-runtime";
import { Download, PackageOpen, Trash2, Upload } from "lucide-react";
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

function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export const ExtensionManagerView: React.FC<ExtensionManagerViewProps> = ({ runtime, close, formatLabel, defaultSettings }) => {
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot) as ReturnType<ExtensionRuntime["getSnapshot"]>;
  const defaults = React.useMemo(() => ({
    showCompatibility: defaultSettings?.showCompatibility ?? true,
    showDiagnostics: defaultSettings?.showDiagnostics ?? true,
  }), [defaultSettings]);
  const importRef = React.useRef<HTMLInputElement>(null);
  const [busyEntryId, setBusyEntryId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const installedIds = React.useMemo(
    () => new Set(snapshot.extensions.filter((extension) => extension.source === "installed").map((extension) => extension.id)),
    [snapshot.extensions],
  );

  const handleImportPortablePackage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const artifact = normalizePortableExtensionPackageArtifact(JSON.parse(text));
      if (!artifact) {
        throw new Error("Invalid portable extension package artifact.");
      }
      const registration = await createPortableExtensionCatalogRegistration(artifact);
      runtime.registerCatalog(registration.catalog, {
        catalogId: registration.catalogId,
        baseUrl: registration.baseUrl,
      });
      await runtime.installFromCatalogEntry(registration.entryId, { autoActivate: true });
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to import extension package.");
    } finally {
      event.target.value = "";
    }
  };

  const installCatalogEntry = async (entryId: string) => {
    setBusyEntryId(entryId);
    try {
      await runtime.installFromCatalogEntry(entryId, { autoActivate: true });
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to install extension.");
    } finally {
      setBusyEntryId(null);
    }
  };

  const removeInstalledExtension = async (extensionId: string) => {
    setBusyEntryId(extensionId);
    try {
      await runtime.removeInstalledExtension(extensionId);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to remove installed extension.");
    } finally {
      setBusyEntryId(null);
    }
  };

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

            <div className="settings-card settings-card-stack">
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ display: "grid", gap: 6 }}>
                    <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Portable Package Import</strong>
                    <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
                      Import a portable extension package artifact, register it in the runtime catalog, and install it immediately.
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button className="modal-btn" onClick={() => importRef.current?.click()}>
                      <Upload size={14} /> Import Package
                    </button>
                    <button
                      className="modal-btn"
                      onClick={() => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries)}
                      disabled={snapshot.catalogEntries.length === 0}
                    >
                      <Download size={14} /> Export Catalog Snapshot
                    </button>
                  </div>
                </div>
                <input
                  ref={importRef}
                  type="file"
                  accept="application/json,.json"
                  hidden
                  onChange={handleImportPortablePackage}
                />
                {error && <span style={{ fontSize: 11, color: "var(--status-error)" }}>{error}</span>}
              </div>
            </div>

            {snapshot.catalogEntries.length > 0 && (
              <div className="settings-card settings-card-stack">
                <div style={{ display: "grid", gap: 10 }}>
                  <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Available Catalog Entries</strong>
                  <div style={{ display: "grid", gap: 10 }}>
                    {snapshot.catalogEntries.map((entry) => (
                      <div key={entry.entryId} className="settings-session-item" style={{ alignItems: "start" }}>
                        <div style={{ display: "grid", gap: 4 }}>
                          <span className="settings-session-label">{formatLabel(entry.displayName)}</span>
                          <span className="settings-session-value">{entry.packageName}@{entry.version}</span>
                          <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{formatLabel(entry.description)}</span>
                        </div>
                        <div className="settings-action-row">
                          <button
                            className="modal-btn modal-btn-primary"
                            onClick={() => void installCatalogEntry(entry.entryId)}
                            disabled={busyEntryId === entry.entryId || !entry.policyTrusted}
                          >
                            <PackageOpen size={14} /> {entry.installed ? "Update" : "Install"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {snapshot.extensions.map((extension) => (
              <div key={extension.id} style={{ display: "grid", gap: 10 }}>
                <ExtensionCard
                  extension={extension}
                  runtime={runtime}
                  formatLabel={formatLabel}
                  defaults={{
                    showCompatibility: defaults.showCompatibility,
                    showDiagnostics: defaults.showDiagnostics,
                  }}
                />
                {installedIds.has(extension.id) && (
                  <div className="settings-action-row" style={{ justifyContent: "flex-end" }}>
                    <button
                      className="modal-btn"
                      onClick={() => void removeInstalledExtension(extension.id)}
                      disabled={busyEntryId === extension.id}
                    >
                      <Trash2 size={14} /> Remove Installed Package
                    </button>
                  </div>
                )}
              </div>
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
