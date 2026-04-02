import React, { useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  createPortableExtensionCatalogRegistration,
  normalizePortableExtensionPackageArtifact,
  type ExtensionRuntime,
  type ExtensionRuntimeCatalogEntrySnapshot,
  type ExtensionRuntimeExtensionSnapshot,
} from "@mdwrk/extension-runtime";
import { Boxes, Download, PackageOpen, SquareMenu, Trash2, Upload } from "lucide-react";
import { extensionManagerLabels } from "../i18n.js";
import { ExtensionCard } from "./ExtensionCard.js";

type BrowserNode =
  | { kind: "extension"; id: string; title: string; subtitle: string; extension: ExtensionRuntimeExtensionSnapshot }
  | { kind: "catalog"; id: string; title: string; subtitle: string; catalogEntry: ExtensionRuntimeCatalogEntrySnapshot };

export interface ExtensionManagerViewProps {
  readonly runtime: ExtensionRuntime;
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly mode?: "pane" | "modal";
  readonly openQuickActions?: () => Promise<void>;
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

function createBrowserNodes(
  snapshot: ReturnType<ExtensionRuntime["getSnapshot"]>,
  formatLabel: (label: I18nLabel | string) => string,
): { extensions: BrowserNode[]; catalogEntries: BrowserNode[] } {
  return {
    extensions: snapshot.extensions.map((extension) => ({
      kind: "extension",
      id: extension.id,
      title: formatLabel(extension.manifest.displayName),
      subtitle: extension.manifest.packageName,
      extension,
    })),
    catalogEntries: snapshot.catalogEntries.map((entry) => ({
      kind: "catalog",
      id: entry.entryId,
      title: formatLabel(entry.displayName),
      subtitle: `${entry.packageName}@${entry.version}`,
      catalogEntry: entry,
    })),
  };
}

function StatsGrid({
  snapshot,
  formatLabel,
}: {
  snapshot: ReturnType<ExtensionRuntime["getSnapshot"]>;
  formatLabel: (label: I18nLabel | string) => string;
}) {
  return (
    <div className="settings-session-grid">
      <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsExtensions)}</span><span className="settings-session-value">{snapshot.extensions.length}</span></div>
      <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsActive)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "active").length}</span></div>
      <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsDisabled)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => !extension.enabled).length}</span></div>
      <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsIncompatible)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "incompatible").length}</span></div>
    </div>
  );
}

export const ExtensionManagerView: React.FC<ExtensionManagerViewProps> = ({
  runtime,
  close,
  formatLabel,
  mode = "pane",
  openQuickActions,
  defaultSettings,
}) => {
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot) as ReturnType<ExtensionRuntime["getSnapshot"]>;
  const defaults = React.useMemo(() => ({
    showCompatibility: defaultSettings?.showCompatibility ?? true,
    showDiagnostics: defaultSettings?.showDiagnostics ?? true,
  }), [defaultSettings]);
  const importRef = React.useRef<HTMLInputElement>(null);
  const [busyEntryId, setBusyEntryId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [treeState, setTreeState] = React.useState({ extensions: true, catalog: true });

  const installedIds = React.useMemo(
    () => new Set(snapshot.extensions.filter((extension) => extension.source === "installed").map((extension) => extension.id)),
    [snapshot.extensions],
  );
  const browserNodes = React.useMemo(() => createBrowserNodes(snapshot, formatLabel), [snapshot, formatLabel]);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (selectedNodeId && [...browserNodes.extensions, ...browserNodes.catalogEntries].some((node) => node.id === selectedNodeId)) {
      return;
    }
    setSelectedNodeId(browserNodes.extensions[0]?.id ?? browserNodes.catalogEntries[0]?.id ?? null);
  }, [browserNodes.catalogEntries, browserNodes.extensions, selectedNodeId]);

  const selectedNode = React.useMemo(
    () => [...browserNodes.extensions, ...browserNodes.catalogEntries].find((node) => node.id === selectedNodeId) ?? null,
    [browserNodes.catalogEntries, browserNodes.extensions, selectedNodeId],
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

  const renderImportCard = () => (
    <div className="settings-card settings-card-stack">
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6 }}>
            <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.importTitle)}</strong>
            <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>
              {formatLabel(extensionManagerLabels.importDescription)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" className="modal-btn" onClick={() => importRef.current?.click()}>
              <Upload size={14} /> {formatLabel(extensionManagerLabels.actionImport)}
            </button>
            <button
              type="button"
              className="modal-btn"
              onClick={() => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries)}
              disabled={snapshot.catalogEntries.length === 0}
            >
              <Download size={14} /> {formatLabel(extensionManagerLabels.actionExport)}
            </button>
          </div>
        </div>
        <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImportPortablePackage} />
        {error && <span style={{ fontSize: 11, color: "var(--status-error)" }}>{error}</span>}
      </div>
    </div>
  );

  if (mode === "modal") {
    return (
      <div className="modal-overlay" data-testid="extension-manager-modal">
        <div className="modal-base settings-modal" style={{ width: "min(760px, 94vw)" }}>
          <div className="modal-header">
            <div style={{ display: "grid", gap: 4 }}>
              <span className="modal-title">{formatLabel(extensionManagerLabels.modalTitle)}</span>
              <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{formatLabel(extensionManagerLabels.modalDescription)}</span>
            </div>
            <button type="button" onClick={() => void close()} className="modal-close">{formatLabel(extensionManagerLabels.actionExit)}</button>
          </div>
          <div className="settings-content-frame" style={{ maxHeight: "70vh", overflow: "auto" }}>
            <div className="settings-pane" style={{ display: "grid", gap: 16 }}>
              <div className="settings-card settings-card-stack">
                <StatsGrid snapshot={snapshot} formatLabel={formatLabel} />
              </div>
              {renderImportCard()}
              <div className="settings-card settings-card-stack">
                <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.quickActionsTitle)}</strong>
                <div style={{ display: "grid", gap: 10 }}>
                  {snapshot.extensions.map((extension) => (
                    <div key={extension.id} className="settings-session-item" style={{ alignItems: "start" }}>
                      <div style={{ display: "grid", gap: 4 }}>
                        <span className="settings-session-label">{formatLabel(extension.manifest.displayName)}</span>
                        <span className="settings-session-value">{extension.id}</span>
                      </div>
                      <div className="settings-action-row">
                        <button type="button" className="modal-btn" onClick={() => void runtime.setEnabled(extension.id, !extension.enabled)}>
                          {extension.enabled ? formatLabel(extensionManagerLabels.actionDisable) : formatLabel(extensionManagerLabels.actionEnable)}
                        </button>
                        <button type="button" className="modal-btn modal-btn-primary" onClick={() => void runtime.activate(extension.id)} disabled={!extension.enabled}>
                          {formatLabel(extensionManagerLabels.actionActivate)}
                        </button>
                        {installedIds.has(extension.id) && (
                          <button type="button" className="modal-btn" onClick={() => void removeInstalledExtension(extension.id)} disabled={busyEntryId === extension.id}>
                            <Trash2 size={14} /> {formatLabel(extensionManagerLabels.actionRemove)}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <footer className="modal-footer">
            <button type="button" onClick={() => void close()} className="modal-btn modal-btn-primary">{formatLabel(extensionManagerLabels.actionClose)}</button>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div
      className="extension-manager-pane"
      data-testid="extension-manager-pane"
      role="region"
      aria-label={formatLabel(extensionManagerLabels.viewTitle)}
      style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: "100%", background: "var(--bg-canvas)" }}
    >
      <div
        className="workspace-panel-header"
        style={{ alignItems: "flex-start", gap: 16, flexWrap: "wrap", height: "auto", minHeight: "var(--panel-header-height)", padding: "12px 10px" }}
      >
        <div style={{ display: "grid", gap: 4 }}>
          <span className="settings-modal-kicker">EXTENSION_MANAGER</span>
          <strong className="settings-modal-title">{formatLabel(extensionManagerLabels.headerTitle)}</strong>
          <span className="settings-modal-subtitle">{formatLabel(extensionManagerLabels.headerSubtitle)}</span>
        </div>
        <div className="settings-modal-actions" style={{ marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          {openQuickActions && (
            <button type="button" className="modal-btn" onClick={() => void openQuickActions()}>
              <SquareMenu size={14} /> {formatLabel(extensionManagerLabels.paneQuickModal)}
            </button>
          )}
          <button type="button" className="modal-btn" onClick={() => importRef.current?.click()}>
            <Upload size={14} /> {formatLabel(extensionManagerLabels.actionImport)}
          </button>
          <button type="button" className="modal-btn" onClick={() => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries)} disabled={snapshot.catalogEntries.length === 0}>
            <Download size={14} /> {formatLabel(extensionManagerLabels.actionExport)}
          </button>
          <button type="button" className="modal-btn" onClick={() => void close()}>{formatLabel(extensionManagerLabels.actionClose)}</button>
        </div>
        <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={handleImportPortablePackage} />
      </div>

      <div className="workspace-panel-content" style={{ overflow: "auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "320px minmax(0, 1fr)", minHeight: "100%" }}>
          <aside style={{ borderRight: "1px solid var(--border-color)", display: "grid", gridTemplateRows: "auto 1fr", minWidth: 0 }}>
            <div className="settings-pane" style={{ padding: 12 }}>
              <div className="settings-card settings-card-stack">
                <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.paneTreeTitle)}</strong>
                <StatsGrid snapshot={snapshot} formatLabel={formatLabel} />
              </div>
              {error && <p style={{ margin: 0, fontSize: 11, color: "var(--status-error)" }}>{error}</p>}
            </div>
            <div className="workspace-panel-content" style={{ padding: "0 12px 12px", overflow: "auto" }}>
              <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
                <details open={treeState.extensions} onToggle={(event) => {
                  const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
                  setTreeState((current) => ({ ...current, extensions: nextOpen }));
                }}>
                  <summary style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>{formatLabel(extensionManagerLabels.paneTreeExtensions)}</summary>
                  <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                    {browserNodes.extensions.map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        className={`settings-sidebar-btn ${selectedNodeId === node.id ? "active" : ""}`}
                        onClick={() => setSelectedNodeId(node.id)}
                        style={{ justifyContent: "space-between" }}
                      >
                        <span style={{ textAlign: "left" }}>{node.title}</span>
                        <span className="settings-session-label">{node.extension.status}</span>
                      </button>
                    ))}
                  </div>
                </details>
                <details open={treeState.catalog} onToggle={(event) => {
                  const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
                  setTreeState((current) => ({ ...current, catalog: nextOpen }));
                }}>
                  <summary style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>{formatLabel(extensionManagerLabels.paneTreeCatalog)}</summary>
                  <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
                    {browserNodes.catalogEntries.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">{formatLabel(extensionManagerLabels.emptyCatalog)}</span>}
                    {browserNodes.catalogEntries.map((node) => (
                      <button
                        key={node.id}
                        type="button"
                        className={`settings-sidebar-btn ${selectedNodeId === node.id ? "active" : ""}`}
                        onClick={() => setSelectedNodeId(node.id)}
                        style={{ justifyContent: "space-between" }}
                      >
                        <span style={{ textAlign: "left" }}>{node.title}</span>
                        <span className="settings-session-label">{node.catalogEntry.installed ? "installed" : "catalog"}</span>
                      </button>
                    ))}
                  </div>
                </details>
              </div>
            </div>
          </aside>

          <div className="settings-pane" style={{ padding: 16, display: "grid", gap: 16, alignContent: "start" }}>
            {renderImportCard()}
            {!selectedNode && (
              <div className="settings-card settings-card-stack">
                <span className="text-[11px] text-[var(--fg-muted)]">{formatLabel(extensionManagerLabels.emptyTreeSelection)}</span>
              </div>
            )}
            {selectedNode?.kind === "catalog" && (
              <div className="settings-card settings-card-stack">
                <strong style={{ fontSize: 12 }}>{selectedNode.title}</strong>
                <div className="settings-session-grid">
                  <div className="settings-session-item"><span className="settings-session-label">ENTRY_ID</span><span className="settings-session-value">{selectedNode.catalogEntry.entryId}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelPackage)}</span><span className="settings-session-value">{selectedNode.catalogEntry.packageName}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelVersion)}</span><span className="settings-session-value">{selectedNode.catalogEntry.version}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">CATALOG_ID</span><span className="settings-session-value">{selectedNode.catalogEntry.catalogId}</span></div>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(selectedNode.catalogEntry.description)}</p>
                <div className="settings-action-row">
                  <button
                    type="button"
                    className="modal-btn modal-btn-primary"
                    onClick={() => void installCatalogEntry(selectedNode.catalogEntry.entryId)}
                    disabled={busyEntryId === selectedNode.catalogEntry.entryId || !selectedNode.catalogEntry.policyTrusted}
                  >
                    <PackageOpen size={14} /> {selectedNode.catalogEntry.installed ? "Update" : "Install"}
                  </button>
                </div>
              </div>
            )}
            {selectedNode?.kind === "extension" && (
              <div style={{ display: "grid", gap: 12 }}>
                <ExtensionCard
                  extension={selectedNode.extension}
                  runtime={runtime}
                  formatLabel={formatLabel}
                  defaults={defaults}
                />
                {installedIds.has(selectedNode.extension.id) && (
                  <div className="settings-action-row" style={{ justifyContent: "flex-end" }}>
                    <button
                      type="button"
                      className="modal-btn"
                      onClick={() => void removeInstalledExtension(selectedNode.extension.id)}
                      disabled={busyEntryId === selectedNode.extension.id}
                    >
                      <Trash2 size={14} /> {formatLabel(extensionManagerLabels.actionRemove)}
                    </button>
                  </div>
                )}
              </div>
            )}
            <div className="settings-card settings-card-stack">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Boxes size={16} />
                <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.catalogEntriesTitle)}</strong>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                {snapshot.catalogEntries.map((entry) => (
                  <div key={entry.entryId} className="settings-session-item" style={{ alignItems: "start" }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <span className="settings-session-label">{formatLabel(entry.displayName)}</span>
                      <span className="settings-session-value">{entry.packageName}@{entry.version}</span>
                    </div>
                    <div className="settings-action-row">
                      <button type="button" className="modal-btn" onClick={() => setSelectedNodeId(entry.entryId)}>Inspect</button>
                      <button
                        type="button"
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
        </div>
      </div>
    </div>
  );
};
