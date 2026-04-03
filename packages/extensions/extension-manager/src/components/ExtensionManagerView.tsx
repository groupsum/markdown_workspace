import { type FC, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  type ExtensionRuntime,
  type ExtensionRuntimeCatalogEntrySnapshot,
  type ExtensionRuntimeExtensionSnapshot,
} from "@mdwrk/extension-runtime";
import {
  createPortableExtensionCatalogRegistration,
  normalizePortableExtensionPackageArtifact,
} from "@mdwrk/extension-runtime";
import { extensionManagerLabels } from "../i18n.js";
import { ExtensionCard } from "./ExtensionCard.js";

type ExtensionBrowserNode =
  | { kind: "extension"; id: string; title: string; subtitle: string; extension: ExtensionRuntimeExtensionSnapshot }
  ;
type CatalogBrowserNode = { kind: "catalog"; id: string; title: string; subtitle: string; catalogEntry: ExtensionRuntimeCatalogEntrySnapshot };
type BrowserNode = ExtensionBrowserNode | CatalogBrowserNode;

export interface ExtensionManagerViewProps {
  readonly runtime: ExtensionRuntime;
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly defaultSettings?: {
    readonly showCompatibility?: boolean;
    readonly showDiagnostics?: boolean;
  };
  readonly shellSidebarOpen?: boolean;
  readonly onShellSidebarToggle?: (open: boolean) => void;
  readonly embedBrowserInShellSidebar?: boolean;
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
): { extensions: ExtensionBrowserNode[]; catalogEntries: CatalogBrowserNode[] } {
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

type ExtensionBrowserScope = "all" | "extensions" | "catalog";
type ExtensionBrowserState = {
  readonly selectedNodeId: string | null;
  readonly browserQuery: string;
  readonly browserScope: ExtensionBrowserScope;
  readonly treeState: {
    readonly extensions: boolean;
    readonly catalog: boolean;
  };
};

type ExtensionBrowserStore = {
  getSnapshot(): ExtensionBrowserState;
  subscribe(listener: () => void): () => void;
  setState(update: Partial<ExtensionBrowserState>): void;
};

const createExtensionBrowserStore = (): ExtensionBrowserStore => {
  let state: ExtensionBrowserState = {
    selectedNodeId: null,
    browserQuery: "",
    browserScope: "all",
    treeState: { extensions: true, catalog: true },
  };
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState(update) {
      state = { ...state, ...update };
      listeners.forEach((listener) => listener());
    },
  };
};

const extensionBrowserStores = new WeakMap<ExtensionRuntime, ExtensionBrowserStore>();
const getExtensionBrowserStore = (runtime: ExtensionRuntime): ExtensionBrowserStore => {
  let store = extensionBrowserStores.get(runtime);
  if (!store) {
    store = createExtensionBrowserStore();
    extensionBrowserStores.set(runtime, store);
  }
  return store;
};

function useExtensionBrowserState(runtime: ExtensionRuntime) {
  const store = getExtensionBrowserStore(runtime);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { state, setState: store.setState };
}

function ExtensionManagerBrowserSidebar({
  runtime,
  snapshot,
  formatLabel,
}: {
  runtime: ExtensionRuntime;
  snapshot: ReturnType<ExtensionRuntime["getSnapshot"]>;
  formatLabel: (label: I18nLabel | string) => string;
}) {
  const browserNodes = useMemo(() => createBrowserNodes(snapshot, formatLabel), [snapshot, formatLabel]);
  const { state, setState } = useExtensionBrowserState(runtime);
  const filteredExtensionNodes = useMemo(() => browserNodes.extensions.filter((node) => {
    if (state.browserScope === "catalog") return false;
    if (!state.browserQuery.trim()) return true;
    const query = state.browserQuery.trim().toLowerCase();
    return `${node.title} ${node.subtitle} ${node.extension.status}`.toLowerCase().includes(query);
  }), [browserNodes.extensions, state.browserQuery, state.browserScope]);
  const filteredCatalogNodes = useMemo(() => browserNodes.catalogEntries.filter((node) => {
    if (state.browserScope === "extensions") return false;
    if (!state.browserQuery.trim()) return true;
    const query = state.browserQuery.trim().toLowerCase();
    return `${node.title} ${node.subtitle} ${node.catalogEntry.catalogId}`.toLowerCase().includes(query);
  }), [browserNodes.catalogEntries, state.browserQuery, state.browserScope]);

  return (
    <div className="workspace-panel-content" style={{ display: "grid", gap: 12, padding: 12 }}>
      <div className="settings-card settings-card-stack">
        <StatsGrid snapshot={snapshot} formatLabel={formatLabel} />
        <div className="settings-chip-row">
          <span className="settings-chip">EXTENSION_BROWSER</span>
          <span className="settings-chip">{snapshot.extensions.filter((extension) => extension.source === "installed").length} INSTALLED</span>
          <span className="settings-chip">{snapshot.catalogEntries.length} CATALOG</span>
        </div>
      </div>

      <div className="settings-card settings-card-stack" style={{ gap: 12 }}>
        <input
          style={{
            width: "100%",
            border: "1px solid var(--border-primary)",
            background: "var(--surface-elevated, var(--bg-panel))",
            color: "var(--fg-primary)",
            borderRadius: 8,
            padding: "8px 10px",
            fontSize: 11,
          }}
          value={state.browserQuery}
          onChange={(event) => setState({ browserQuery: event.currentTarget.value })}
          placeholder="Filter extensions or catalog entries"
          aria-label="Filter extension browser"
        />
        <div className="settings-chip-row">
          {[
            ["all", `ALL ${browserNodes.extensions.length + browserNodes.catalogEntries.length}`],
            ["extensions", `EXT ${browserNodes.extensions.length}`],
            ["catalog", `CAT ${browserNodes.catalogEntries.length}`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`view-toolbar-btn ${state.browserScope === value ? "active" : ""}`}
              onClick={() => setState({ browserScope: value as ExtensionBrowserScope })}
            >
              {label}
            </button>
          ))}
        </div>
        <details open={state.treeState.extensions} onToggle={(event) => {
          const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
          setState({ treeState: { ...state.treeState, extensions: nextOpen } });
        }}>
          <summary style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>{formatLabel(extensionManagerLabels.paneTreeExtensions)}</summary>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {filteredExtensionNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`settings-sidebar-btn ${state.selectedNodeId === node.id ? "active" : ""}`}
                onClick={() => setState({ selectedNodeId: node.id })}
                style={{ justifyContent: "space-between" }}
              >
                <span style={{ textAlign: "left" }}>{node.title}</span>
                <span className="settings-session-label">{node.extension.status}</span>
              </button>
            ))}
            {filteredExtensionNodes.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">No extensions match the current browser filter.</span>}
          </div>
        </details>
        <details open={state.treeState.catalog} onToggle={(event) => {
          const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
          setState({ treeState: { ...state.treeState, catalog: nextOpen } });
        }}>
          <summary style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>{formatLabel(extensionManagerLabels.paneTreeCatalog)}</summary>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {filteredCatalogNodes.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">No catalog entries match the current browser filter.</span>}
            {filteredCatalogNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`settings-sidebar-btn ${state.selectedNodeId === node.id ? "active" : ""}`}
                onClick={() => setState({ selectedNodeId: node.id })}
                style={{ justifyContent: "space-between" }}
              >
                <span style={{ textAlign: "left" }}>{node.title}</span>
                <span className="settings-session-label">{node.catalogEntry.installed ? "INSTALLED" : "CATALOG"}</span>
              </button>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

export const ExtensionManagerSidebar: FC<Pick<ExtensionManagerViewProps, "runtime" | "formatLabel">> = ({ runtime, formatLabel }) => {
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot) as ReturnType<ExtensionRuntime["getSnapshot"]>;
  return <ExtensionManagerBrowserSidebar runtime={runtime} snapshot={snapshot} formatLabel={formatLabel} />;
};

export const ExtensionManagerView: FC<ExtensionManagerViewProps> = ({
  runtime,
  close,
  formatLabel,
  defaultSettings,
  shellSidebarOpen,
  onShellSidebarToggle,
  embedBrowserInShellSidebar = false,
}) => {
  const snapshot = useSyncExternalStore(runtime.subscribe, runtime.getSnapshot, runtime.getSnapshot) as ReturnType<ExtensionRuntime["getSnapshot"]>;
  const defaults = useMemo(() => ({
    showCompatibility: defaultSettings?.showCompatibility ?? true,
    showDiagnostics: defaultSettings?.showDiagnostics ?? true,
  }), [defaultSettings]);
  const [importInput, setImportInput] = useState<HTMLInputElement | null>(null);
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"single" | "split">("split");
  const { state: browserState, setState: setBrowserState } = useExtensionBrowserState(runtime);
  const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;

  const installedIds = useMemo(
    () => new Set(snapshot.extensions.filter((extension) => extension.source === "installed").map((extension) => extension.id)),
    [snapshot.extensions],
  );
  const browserNodes = useMemo(() => createBrowserNodes(snapshot, formatLabel), [snapshot, formatLabel]);
  const filteredExtensionNodes = useMemo(() => browserNodes.extensions.filter((node) => {
    if (browserState.browserScope === "catalog") return false;
    if (!browserState.browserQuery.trim()) return true;
    const query = browserState.browserQuery.trim().toLowerCase();
    return `${node.title} ${node.subtitle} ${node.extension.status}`.toLowerCase().includes(query);
  }), [browserNodes.extensions, browserState.browserQuery, browserState.browserScope]);
  const filteredCatalogNodes = useMemo(() => browserNodes.catalogEntries.filter((node) => {
    if (browserState.browserScope === "extensions") return false;
    if (!browserState.browserQuery.trim()) return true;
    const query = browserState.browserQuery.trim().toLowerCase();
    return `${node.title} ${node.subtitle} ${node.catalogEntry.catalogId}`.toLowerCase().includes(query);
  }), [browserNodes.catalogEntries, browserState.browserQuery, browserState.browserScope]);

  useEffect(() => {
    if (browserState.selectedNodeId && [...browserNodes.extensions, ...browserNodes.catalogEntries].some((node) => node.id === browserState.selectedNodeId)) {
      return;
    }
    setBrowserState({ selectedNodeId: browserNodes.extensions[0]?.id ?? browserNodes.catalogEntries[0]?.id ?? null });
  }, [browserNodes.catalogEntries, browserNodes.extensions, browserState.selectedNodeId, setBrowserState]);

  const selectedNode = useMemo(
    () => [...browserNodes.extensions, ...browserNodes.catalogEntries].find((node) => node.id === browserState.selectedNodeId) ?? null,
    [browserNodes.catalogEntries, browserNodes.extensions, browserState.selectedNodeId],
  );

  const handleImportPortablePackage = async (event: { target: { files?: FileList | null; value: string } }) => {
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

  const detailsPane = (
    <div style={{ display: "grid", gap: 16 }}>
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
          <div className="settings-action-row" style={{ padding: 8 }}>
            <button
              type="button"
              className="modal-btn modal-btn-primary"
              onClick={() => void installCatalogEntry(selectedNode.catalogEntry.entryId)}
              disabled={busyEntryId === selectedNode.catalogEntry.entryId || !selectedNode.catalogEntry.policyTrusted}
            >
              {selectedNode.catalogEntry.installed ? "UPDATE" : "INSTALL"}
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
            <div className="settings-action-row" style={{ justifyContent: "flex-end", padding: 8 }}>
              <button
                type="button"
                className="modal-btn"
                onClick={() => void removeInstalledExtension(selectedNode.extension.id)}
                disabled={busyEntryId === selectedNode.extension.id}
              >
                {formatLabel(extensionManagerLabels.actionRemove)}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const catalogPane = (
      <div className="settings-card settings-card-stack">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="settings-session-label">CATALOG</span>
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.catalogEntriesTitle)}</strong>
        </div>
      <div style={{ display: "grid", gap: 10 }}>
        {snapshot.catalogEntries.map((entry) => (
          <div key={entry.entryId} className="settings-session-item" style={{ alignItems: "start" }}>
            <div style={{ display: "grid", gap: 4 }}>
              <span className="settings-session-label">{formatLabel(entry.displayName)}</span>
              <span className="settings-session-value">{entry.packageName}@{entry.version}</span>
            </div>
            <div className="settings-action-row" style={{ padding: 8 }}>
              <button type="button" className="modal-btn" onClick={() => setBrowserState({ selectedNodeId: entry.entryId })}>INSPECT</button>
              <button
                type="button"
                className="modal-btn modal-btn-primary"
                onClick={() => void installCatalogEntry(entry.entryId)}
                disabled={busyEntryId === entry.entryId || !entry.policyTrusted}
              >
                {entry.installed ? "UPDATE" : "INSTALL"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="extension-manager-pane editor-pane-container" data-testid="extension-manager-pane" role="region" aria-label={formatLabel(extensionManagerLabels.viewTitle)}>
      <div className="view-toolbar" aria-label="Extension Manager toolbar">
        <div className="view-toolbar-group">
          <button type="button" className={`view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`} title="Toggle sidebar" onClick={() => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current)}>
            SB
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title="Single pane" onClick={() => setLayoutMode("single")}>
            1P
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title="Split screen" onClick={() => setLayoutMode("split")}>
            2P
          </button>
        </div>
        <div className="view-toolbar-group">
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title="Import extension package" onClick={() => importInput?.click()}>
            IMP
          </button>
          <button type="button" className="view-toolbar-btn" title="Export catalog snapshot" onClick={() => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries)} disabled={snapshot.catalogEntries.length === 0}>
            EXP
          </button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title="Close manager" onClick={() => void close()}>
            CLOSE
          </button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <input ref={setImportInput} type="file" accept="application/json,.json" hidden onChange={handleImportPortablePackage} />
        <div className="editor-pane-body is-split">
          {!embedBrowserInShellSidebar && sidebarOpen && (
            <aside className={`workspace-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`} style={{ width: "min(320px, 28vw)", padding: 12, gap: 12 }}>
              <ExtensionManagerBrowserSidebar runtime={runtime} snapshot={snapshot} formatLabel={formatLabel} />
              {error && <p style={{ margin: 0, fontSize: 11, color: "var(--status-error)" }}>{error}</p>}
            </aside>
          )}

          <div className="editor-pane-column" style={{ flex: 1, padding: 16, gap: 16 }}>
            <div className="settings-card settings-card-stack" style={{ gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <span className="settings-session-label">EXTENSION_MANAGER</span>
                  <strong style={{ fontSize: 14 }}>{formatLabel(extensionManagerLabels.headerTitle)}</strong>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{formatLabel(extensionManagerLabels.headerSubtitle)}</span>
                </div>
                <div className="settings-chip-row">
                  <span className="settings-chip">PANE_ONLY</span>
                  <span className="settings-chip">SPLIT + SINGLE</span>
                  <span className="settings-chip">SETTINGS_CONTENT</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: layoutMode === "split" ? "minmax(0, 1.1fr) minmax(320px, 0.9fr)" : "minmax(0, 1fr)" }}>
              <div style={{ display: "grid", gap: 16 }}>
                {detailsPane}
              </div>
              {layoutMode === "split" && (
                <div style={{ display: "grid", gap: 16 }}>
                  <div className="settings-card settings-card-stack">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="settings-session-label">CATALOG</span>
                      <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Catalog Browser</strong>
                    </div>
                    {catalogPane}
                  </div>
                </div>
              )}
            </div>

            {layoutMode === "single" && catalogPane}
          </div>
        </div>
      </div>
    </div>
  );
};
