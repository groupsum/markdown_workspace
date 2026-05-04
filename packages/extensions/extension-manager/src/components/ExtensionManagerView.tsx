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
import {
  Download,
  Sidebar,
  SidebarOpen,
  SplitSquareHorizontal,
  Square,
  Upload,
  X,
} from "lucide-react";
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

const getSplitBand = (value: number): number => {
  const clamped = Math.min(80, Math.max(20, value));
  return Math.round(clamped / 5) * 5;
};

const formatDiagnosticCode = (code: string): string =>
  code.replaceAll("_", " ").toLowerCase().replace(/^\w|\s\w/g, (match) => match.toUpperCase());

function useWorkspaceModuleSplit(defaultPosition = 55) {
  const [splitPos, setSplitPos] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [splitContainer, setSplitContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !splitContainer) return;
      const rect = splitContainer.getBoundingClientRect();
      if (rect.width <= 0) return;
      setSplitPos(getSplitBand(((event.clientX - rect.left) / rect.width) * 100));
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      document.body.classList.add("is-resizing-pane");
    } else {
      document.body.classList.remove("is-resizing-pane");
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("is-resizing-pane");
    };
  }, [isDragging, splitContainer]);

  return {
    splitBand: getSplitBand(splitPos),
    isDragging,
    splitContainerRef: setSplitContainer,
    startSplitDrag: () => setIsDragging(true),
  };
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
          <span className="settings-chip">{formatLabel(extensionManagerLabels.paneTreeChip)}</span>
          <span className="settings-chip">{snapshot.extensions.filter((extension) => extension.source === "installed").length} {formatLabel(extensionManagerLabels.paneTreeInstalledSuffix)}</span>
          <span className="settings-chip">{snapshot.catalogEntries.length} {formatLabel(extensionManagerLabels.paneTreeCatalogSuffix)}</span>
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
          placeholder={formatLabel(extensionManagerLabels.paneTreeFilterPlaceholder)}
          aria-label={formatLabel(extensionManagerLabels.paneTreeFilterAria)}
        />
        <div className="settings-chip-row">
          {[
            ["all", `${formatLabel(extensionManagerLabels.paneTreeFilterAll)} ${browserNodes.extensions.length + browserNodes.catalogEntries.length}`],
            ["extensions", `${formatLabel(extensionManagerLabels.paneTreeFilterExtensions)} ${browserNodes.extensions.length}`],
            ["catalog", `${formatLabel(extensionManagerLabels.paneTreeFilterCatalog)} ${browserNodes.catalogEntries.length}`],
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
            {filteredExtensionNodes.length === 0 && <span className="settings-muted-caption">{formatLabel(extensionManagerLabels.paneTreeExtensionsEmpty)}</span>}
          </div>
        </details>
        <details open={state.treeState.catalog} onToggle={(event) => {
          const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
          setState({ treeState: { ...state.treeState, catalog: nextOpen } });
        }}>
          <summary style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}>{formatLabel(extensionManagerLabels.paneTreeCatalog)}</summary>
          <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
            {filteredCatalogNodes.length === 0 && <span className="settings-muted-caption">{formatLabel(extensionManagerLabels.paneTreeCatalogEmpty)}</span>}
            {filteredCatalogNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={`settings-sidebar-btn ${state.selectedNodeId === node.id ? "active" : ""}`}
                onClick={() => setState({ selectedNodeId: node.id })}
                style={{ justifyContent: "space-between" }}
              >
                <span style={{ textAlign: "left" }}>{node.title}</span>
                <span className="settings-session-label">{node.catalogEntry.installed ? formatLabel(extensionManagerLabels.paneTreeInstalledSuffix) : formatLabel(extensionManagerLabels.paneTreeCatalogSuffix)}</span>
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
  const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
  const { state: browserState, setState: setBrowserState } = useExtensionBrowserState(runtime);
  const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;

  const installedIds = useMemo(
    () => new Set(snapshot.extensions.filter((extension) => extension.source === "installed").map((extension) => extension.id)),
    [snapshot.extensions],
  );
  const browserNodes = useMemo(() => createBrowserNodes(snapshot, formatLabel), [snapshot, formatLabel]);
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
        throw new Error(formatLabel(extensionManagerLabels.errorInvalidPortableArtifact));
      }
      const registration = await createPortableExtensionCatalogRegistration(artifact);
      runtime.registerCatalog(registration.catalog, {
        catalogId: registration.catalogId,
        baseUrl: registration.baseUrl,
      });
      await runtime.installFromCatalogEntry(registration.entryId, { autoActivate: true });
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : formatLabel(extensionManagerLabels.errorImportFailed));
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
      setError(nextError instanceof Error ? nextError.message : formatLabel(extensionManagerLabels.errorInstallFailed));
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
      setError(nextError instanceof Error ? nextError.message : formatLabel(extensionManagerLabels.errorRemoveFailed));
    } finally {
      setBusyEntryId(null);
    }
  };

  const detailsPane = (
    <div style={{ display: "grid", gap: 16 }}>
      {!selectedNode && (
        <div className="settings-card settings-card-stack">
          <span className="settings-muted-caption">{formatLabel(extensionManagerLabels.emptyTreeSelection)}</span>
        </div>
      )}
      {selectedNode?.kind === "catalog" && (
        <div className="settings-card settings-card-stack">
          <strong style={{ fontSize: 12 }}>{selectedNode.title}</strong>
          <div className="settings-session-grid">
            <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelEntryId)}</span><span className="settings-session-value">{selectedNode.catalogEntry.entryId}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelPackage)}</span><span className="settings-session-value">{selectedNode.catalogEntry.packageName}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelVersion)}</span><span className="settings-session-value">{selectedNode.catalogEntry.version}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.labelCatalogId)}</span><span className="settings-session-value">{selectedNode.catalogEntry.catalogId}</span></div>
            <div className="settings-session-item"><span className="settings-session-label">Trust policy</span><span className="settings-session-value">{selectedNode.catalogEntry.policyTrusted ? "Trusted for install" : "Install blocked"}</span></div>
          </div>
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(selectedNode.catalogEntry.description)}</p>
          {!selectedNode.catalogEntry.policyTrusted && (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--status-error, var(--fg-secondary))", display: "grid", gap: 6 }}>
              {selectedNode.catalogEntry.policyIssues.map((issue) => <li key={issue}>{issue}</li>)}
            </ul>
          )}
          <div className="settings-action-row" style={{ padding: 8 }}>
            <button
              type="button"
              className="modal-btn modal-btn-primary"
              onClick={() => void installCatalogEntry(selectedNode.catalogEntry.entryId)}
              disabled={busyEntryId === selectedNode.catalogEntry.entryId || !selectedNode.catalogEntry.policyTrusted}
            >
              {selectedNode.catalogEntry.installed ? formatLabel(extensionManagerLabels.actionUpdate) : formatLabel(extensionManagerLabels.actionInstall)}
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

  const operationsPane = (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="settings-card settings-card-stack">
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">{formatLabel(extensionManagerLabels.paneQuickModal)}</span>
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.quickActionsTitle)}</strong>
          <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{formatLabel(extensionManagerLabels.headerSubtitle)}</span>
        </div>
        <StatsGrid snapshot={snapshot} formatLabel={formatLabel} />
        <div className="settings-action-row" style={{ padding: 8, gap: 8 }}>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => importInput?.click()}>
            <Upload size={14} /> {formatLabel(extensionManagerLabels.actionImport)}
          </button>
          <button type="button" className="modal-btn" onClick={() => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries)} disabled={snapshot.catalogEntries.length === 0}>
            <Download size={14} /> {formatLabel(extensionManagerLabels.actionExport)}
          </button>
        </div>
      </div>

      <div className="settings-card settings-card-stack">
        <div style={{ display: "grid", gap: 6 }}>
          <span className="settings-session-label">{formatLabel(extensionManagerLabels.importTitle)}</span>
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{formatLabel(extensionManagerLabels.importDescription)}</p>
        </div>
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsStatsCatalog)}</span><span className="settings-session-value">{snapshot.catalogEntries.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsStatsInstalled)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.source === "installed").length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsActive)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "active").length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(extensionManagerLabels.statsIncompatible)}</span><span className="settings-session-value">{snapshot.extensions.filter((extension) => extension.status === "incompatible").length}</span></div>
        </div>
      </div>

      {selectedNode?.kind === "catalog" && (
        <div className="settings-card settings-card-stack">
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.catalogEntriesTitle)}</strong>
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{selectedNode.catalogEntry.packageName}@{selectedNode.catalogEntry.version}</p>
          <span className="settings-chip">{selectedNode.catalogEntry.policyTrusted ? "Trusted for install" : "Install blocked by trust policy"}</span>
          <div className="settings-action-row" style={{ padding: 8 }}>
            <button
              type="button"
              className="modal-btn modal-btn-primary"
              onClick={() => void installCatalogEntry(selectedNode.catalogEntry.entryId)}
              disabled={busyEntryId === selectedNode.catalogEntry.entryId || !selectedNode.catalogEntry.policyTrusted}
            >
              {selectedNode.catalogEntry.installed ? formatLabel(extensionManagerLabels.actionUpdate) : formatLabel(extensionManagerLabels.actionInstall)}
            </button>
          </div>
        </div>
      )}
      {selectedNode?.kind === "extension" && selectedNode.extension.diagnostics.length > 0 && (
        <div className="settings-card settings-card-stack">
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.labelHealth)}</strong>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: "var(--fg-secondary)", display: "grid", gap: 6 }}>
            {selectedNode.extension.diagnostics.map((record, index) => (
              <li key={`${record.code}-${index}`}>{formatDiagnosticCode(record.code)}: {record.message}</li>
            ))}
          </ul>
        </div>
      )}
      {selectedNode?.kind === "extension" && selectedNode.extension.diagnostics.length === 0 && (
        <div className="settings-card settings-card-stack">
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(extensionManagerLabels.labelHealth)}</strong>
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-muted)" }}>{formatLabel(extensionManagerLabels.noDiagnostics)}</p>
        </div>
      )}
      </div>
  );

  return (
    <div className="extension-manager-pane editor-pane-container" data-testid="extension-manager-pane" role="region" aria-label={formatLabel(extensionManagerLabels.viewTitle)}>
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label={formatLabel(extensionManagerLabels.toolbarLabel)}>
        <div className="view-toolbar-group">
          <button type="button" className={`view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`} title={formatLabel(extensionManagerLabels.toolbarToggleSidebar)} onClick={() => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current)}>
            {effectiveSidebarOpen ? <SidebarOpen size={14} /> : <Sidebar size={14} />}
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title={formatLabel(extensionManagerLabels.toolbarSinglePane)} onClick={() => setLayoutMode("single")}>
            <Square size={14} />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title={formatLabel(extensionManagerLabels.toolbarSplitScreen)} onClick={() => setLayoutMode("split")}>
            <SplitSquareHorizontal size={14} />
          </button>
        </div>
        <div className="view-toolbar-group">
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(extensionManagerLabels.toolbarImportPackage)} onClick={() => importInput?.click()}>
            <Upload size={14} />
          </button>
          <button type="button" className="view-toolbar-btn" title={formatLabel(extensionManagerLabels.toolbarExportCatalog)} onClick={() => downloadJson("extension-catalog-snapshot.json", snapshot.catalogEntries)} disabled={snapshot.catalogEntries.length === 0}>
            <Download size={14} />
          </button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(extensionManagerLabels.toolbarClose)} onClick={() => void close()}>
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <input ref={setImportInput} type="file" accept="application/json,.json" hidden onChange={handleImportPortablePackage} />
        <div className="editor-pane-body is-split">
          {!embedBrowserInShellSidebar && sidebarOpen && (
            <aside className={`pane-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`} style={{ width: "min(320px, 28vw)", padding: 12, gap: 12 }}>
              <ExtensionManagerBrowserSidebar runtime={runtime} snapshot={snapshot} formatLabel={formatLabel} />
              {error && <p style={{ margin: 0, fontSize: 11, color: "var(--status-error)" }}>{error}</p>}
            </aside>
          )}

          <div className="editor-pane-column" style={{ flex: 1, padding: 16, gap: 16 }}>
            <div className="extension-manager-header">
              <div className="extension-manager-header-main">
                <div className="extension-manager-header-copy">
                  <span className="settings-session-label">{formatLabel(extensionManagerLabels.settingsShortcutKicker)}</span>
                  <strong className="extension-manager-header-title">{formatLabel(extensionManagerLabels.headerTitle)}</strong>
                  <span className="settings-muted-caption">{formatLabel(extensionManagerLabels.headerSubtitle)}</span>
                </div>
                <div className="settings-chip-row">
                  <span className="settings-chip">{formatLabel(extensionManagerLabels.settingsChipPaneOnly)}</span>
                  <span className="settings-chip">{formatLabel(extensionManagerLabels.settingsChipSplitSingle)}</span>
                  <span className="settings-chip">{formatLabel(extensionManagerLabels.settingsChipSettingsContent)}</span>
                </div>
              </div>
            </div>

            {layoutMode === "split" ? (
              <div ref={splitContainerRef} className="editor-pane-body is-split" style={{ background: "transparent" }}>
                <div className={`editor-pane-column editor-pane-column--split-left-${splitBand}`} style={{ display: "grid", gap: 16, paddingRight: 12 }}>
                  {detailsPane}
                </div>
                <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? "dragging" : ""}`} role="separator" aria-orientation="vertical" aria-label={formatLabel(extensionManagerLabels.toolbarResizePanes)}>
                  <div className="editor-splitter-handle" />
                </div>
                <div className={`editor-pane-column editor-pane-column--split-right-${100 - splitBand}`} style={{ display: "grid", gap: 16, paddingLeft: 12 }}>
                  {operationsPane}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gap: 16 }}>{detailsPane}</div>
                {operationsPane}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
