import { type CSSProperties, type FC, useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  Columns2,
  Download,
  Languages,
  PackagePlus,
  Sidebar,
  SidebarOpen,
  Power,
  PowerOff,
  Square,
  SplitSquareHorizontal,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import type { LanguagePackStudioController, LanguagePackStudioSnapshot } from "../types.js";

function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const denseInputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-color)",
  background: "var(--bg-panel)",
  color: "var(--fg-primary)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 11,
  lineHeight: 1.4,
};

const getSplitBand = (value: number): number => {
  const clamped = Math.min(80, Math.max(20, value));
  return Math.round(clamped / 5) * 5;
};

function useWorkspaceModuleSplit(defaultPosition = 58) {
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
      document.body.classList.add("is-resizing-sidebar");
    } else {
      document.body.classList.remove("is-resizing-sidebar");
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("is-resizing-sidebar");
    };
  }, [isDragging, splitContainer]);

  return {
    splitBand: getSplitBand(splitPos),
    isDragging,
    splitContainerRef: setSplitContainer,
    startSplitDrag: () => setIsDragging(true),
  };
}

export interface LanguagePackStudioViewProps {
  readonly controller: LanguagePackStudioController;
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly shellSidebarOpen?: boolean;
  readonly onShellSidebarToggle?: (open: boolean) => void;
  readonly embedBrowserInShellSidebar?: boolean;
}

type LanguageBrowserFilter = "all" | "built-in" | "installed" | "disabled";
type LanguageBrowserState = {
  readonly browserQuery: string;
  readonly browserFilter: LanguageBrowserFilter;
  readonly selectedLocale: string | null;
};

type LanguageBrowserStore = {
  getSnapshot(): LanguageBrowserState;
  subscribe(listener: () => void): () => void;
  setState(update: Partial<LanguageBrowserState>): void;
};

const createLanguageBrowserStore = (): LanguageBrowserStore => {
  let state: LanguageBrowserState = { browserQuery: "", browserFilter: "all", selectedLocale: null };
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

const languageBrowserStores = new WeakMap<LanguagePackStudioController, LanguageBrowserStore>();

const getLanguageBrowserStore = (controller: LanguagePackStudioController): LanguageBrowserStore => {
  let store = languageBrowserStores.get(controller);
  if (!store) {
    store = createLanguageBrowserStore();
    languageBrowserStores.set(controller, store);
  }
  return store;
};

function useLanguageBrowserState(controller: LanguagePackStudioController) {
  const store = getLanguageBrowserStore(controller);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { state, setState: store.setState };
}

function LanguagePackBrowserSidebar({
  controller,
  snapshot,
}: {
  controller: LanguagePackStudioController;
  snapshot: LanguagePackStudioSnapshot;
}) {
  const { state, setState } = useLanguageBrowserState(controller);
  const deferredBrowserQuery = useDeferredValue(state.browserQuery.trim().toLowerCase());
  const builtInPackCount = snapshot.packs.filter((pack) => pack.source === "built-in").length;
  const installedPackCount = snapshot.packs.filter((pack) => pack.source === "installed").length;
  const filteredPacks = useMemo(() => snapshot.packs.filter((pack) => {
    if (state.browserFilter === "built-in" && pack.source !== "built-in") return false;
    if (state.browserFilter === "installed" && pack.source !== "installed") return false;
    if (state.browserFilter === "disabled" && pack.enabled) return false;
    if (!deferredBrowserQuery) return true;
    const haystack = `${pack.locale} ${pack.label} ${pack.source} ${pack.enabled ? "enabled" : "disabled"}`.toLowerCase();
    return haystack.includes(deferredBrowserQuery);
  }), [deferredBrowserQuery, snapshot.packs, state.browserFilter]);

  return (
    <div className="workspace-panel-content" style={{ display: "grid", gap: 12, padding: 12 }}>
      <div className="settings-card settings-card-stack">
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">PACKS</span><span className="settings-session-value">{snapshot.packs.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">ENABLED</span><span className="settings-session-value">{snapshot.packs.filter((pack) => pack.enabled).length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">BUILT_IN</span><span className="settings-session-value">{builtInPackCount}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">ACTIVE</span><span className="settings-session-value">{snapshot.activeLocale}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">LANGUAGE_BROWSER</span>
          <span className="settings-chip">INDEXEDDB</span>
          <span className="settings-chip">BUILT_IN + INSTALLED</span>
        </div>
      </div>

      <div className="settings-card settings-card-stack" style={{ gap: 8 }}>
        <input
          style={denseInputStyle}
          value={state.browserQuery}
          onChange={(event) => setState({ browserQuery: event.target.value })}
          placeholder="Filter locale, label, source"
          aria-label="Filter language browser"
        />
        <div className="settings-chip-row">
          {[
            ["all", `ALL ${snapshot.packs.length}`],
            ["built-in", `BUILT_IN ${builtInPackCount}`],
            ["installed", `INSTALLED ${installedPackCount}`],
            ["disabled", `DISABLED ${snapshot.packs.filter((pack) => !pack.enabled).length}`],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`view-toolbar-btn ${state.browserFilter === value ? "active" : ""}`}
              onClick={() => setState({ browserFilter: value as LanguageBrowserFilter })}
            >
              {label}
            </button>
          ))}
        </div>
        {filteredPacks.map((pack) => (
          <button
            key={`${pack.source}:${pack.locale}`}
            type="button"
            className={`settings-sidebar-btn ${state.selectedLocale === pack.locale ? "active" : ""}`}
            onClick={() => setState({ selectedLocale: pack.locale })}
            style={{ justifyContent: "space-between", gap: 10 }}
          >
            <span style={{ textAlign: "left" }}>{pack.label}</span>
            <span className="settings-session-label">{pack.source === "built-in" ? "BUILT_IN" : pack.enabled ? "INSTALLED" : "DISABLED"}</span>
          </button>
        ))}
        {filteredPacks.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">No language packs match the current browser filter.</span>}
      </div>
    </div>
  );
}

export const LanguagePackStudioSidebar: FC<Pick<LanguagePackStudioViewProps, "controller">> = ({ controller }) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot) as LanguagePackStudioSnapshot;
  return <LanguagePackBrowserSidebar controller={controller} snapshot={snapshot} />;
};

export const LanguagePackStudioView: FC<LanguagePackStudioViewProps> = ({
  controller,
  close,
  formatLabel: _formatLabel,
  shellSidebarOpen,
  onShellSidebarToggle,
  embedBrowserInShellSidebar = false,
}) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot) as LanguagePackStudioSnapshot;
  const [importInput, setImportInput] = useState<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"single" | "split">("split");
  const [draftLocale, setDraftLocale] = useState("custom");
  const [draftLabel, setDraftLabel] = useState("Custom Language Pack");
  const [draftMessages, setDraftMessages] = useState('{\n  "core.views.settings.title": "System Configuration"\n}');
  const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
  const { state: browserState, setState: setBrowserState } = useLanguageBrowserState(controller);
  const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;

  useEffect(() => {
    if (browserState.selectedLocale && snapshot.packs.some((pack) => pack.locale === browserState.selectedLocale)) {
      return;
    }
    setBrowserState({ selectedLocale: snapshot.packs[0]?.locale ?? null });
  }, [browserState.selectedLocale, setBrowserState, snapshot.packs]);

  const selectedPack = snapshot.packs.find((pack) => pack.locale === browserState.selectedLocale) ?? null;
  const missingKeys = useMemo(() => {
    if (!selectedPack || selectedPack.source === "built-in") {
      return [];
    }
    return snapshot.tokens.filter((token) => !(token.key in selectedPack.messages));
  }, [selectedPack, snapshot.tokens]);
  const handleImport = async (event: { target: { files?: FileList | null; value: string } }) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await controller.importArtifact(await file.text());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to import language pack.");
    } finally {
      event.target.value = "";
    }
  };

  const handleCreate = async () => {
    try {
      const messages = JSON.parse(draftMessages) as Record<string, string>;
      const pack = await controller.createArtifact({ locale: draftLocale, label: draftLabel, messages, enabled: true });
      downloadJson(`${pack.locale}.language-pack.json`, pack);
      setBrowserState({ selectedLocale: pack.locale });
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create language pack.");
    }
  };

  return (
    <div className="language-pack-studio-pane editor-pane-container" data-testid="language-pack-studio-pane">
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label="Language Pack Studio toolbar">
        <div className="view-toolbar-group">
          <button
            type="button"
            className={`view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`}
            title="Toggle sidebar"
            onClick={() => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current)}
          >
            {effectiveSidebarOpen ? <SidebarOpen size={14} /> : <Sidebar size={14} />}
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title="Single pane" onClick={() => setLayoutMode("single")}>
            <Square size={14} />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title="Split screen" onClick={() => setLayoutMode("split")}>
            <SplitSquareHorizontal size={14} />
          </button>
        </div>
        <div className="view-toolbar-group">
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title="Import pack" onClick={() => importInput?.click()}>
            <Upload size={14} />
          </button>
          <button type="button" className="view-toolbar-btn" title="Enable all packs" onClick={() => { void controller.setAllEnabled(true); }}>
            <Power size={14} />
          </button>
          <button type="button" className="view-toolbar-btn" title="Disable all packs" onClick={() => { void controller.setAllEnabled(false); }}>
            <PowerOff size={14} />
          </button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title="Close studio" onClick={() => void close()}>
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <input ref={setImportInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        <div className="editor-pane-body is-split">
          {!embedBrowserInShellSidebar && sidebarOpen && (
            <aside className={`workspace-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`} style={{ width: "min(320px, 28vw)", padding: 12, gap: 12 }}>
              <LanguagePackBrowserSidebar controller={controller} snapshot={snapshot} />
              {error && <p style={{ margin: 0, fontSize: 11, color: "var(--status-error)" }}>{error}</p>}
            </aside>
          )}

          <div className="editor-pane-column" style={{ flex: 1, padding: 16, gap: 16 }}>
            <div className="settings-card settings-card-stack" style={{ gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <span className="settings-session-label">LANGUAGE_PACK_STUDIO</span>
                  <strong style={{ fontSize: 14 }}>Workspace language packs</strong>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>Built-in and installed locale packs share one high-density manager surface.</span>
                </div>
                <div className="settings-chip-row">
                  <span className="settings-chip">INDEXEDDB</span>
                  <span className="settings-chip">BUILT_IN + INSTALLED</span>
                  <span className="settings-chip">PANE_ONLY</span>
                </div>
              </div>
            </div>

            {selectedPack && (
              layoutMode === "split" ? (
              <div ref={splitContainerRef} className="editor-pane-body is-split" style={{ background: "transparent" }}>
                <div className={`editor-pane-column editor-pane-column--split-left-${splitBand}`} style={{ display: "grid", gap: 16, paddingRight: 12 }}>
                  <div className="settings-card settings-card-stack">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <div>
                        <strong style={{ fontSize: 14 }}>{selectedPack.label}</strong>
                        <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--fg-muted)" }}>{selectedPack.locale} | {selectedPack.source.toUpperCase()}</p>
                      </div>
                      <div className="settings-action-row" style={{ padding: 8, gap: 8 }}>
                        <button type="button" className="modal-btn" onClick={() => { void controller.setEnabled(selectedPack.locale, !selectedPack.enabled); }}>
                          {selectedPack.enabled ? <PowerOff size={14} /> : <Power size={14} />} {selectedPack.enabled ? "DISABLE" : "ENABLE"}
                        </button>
                        <button type="button" className="modal-btn modal-btn-primary" onClick={() => { void controller.activate(selectedPack.locale); }} disabled={!selectedPack.enabled}>USE</button>
                        <button
                          type="button"
                          className="modal-btn"
                          onClick={() => {
                            const artifact = controller.exportArtifact(selectedPack.locale);
                            if (artifact) downloadJson(`${selectedPack.locale}.language-pack.json`, artifact);
                          }}
                          disabled={selectedPack.source !== "installed"}
                        >
                          <Download size={14} /> EXPORT
                        </button>
                        <button type="button" className="modal-btn" onClick={() => { void controller.remove(selectedPack.locale); }} disabled={selectedPack.source !== "installed"}>
                          <Trash2 size={14} /> REMOVE
                        </button>
                      </div>
                    </div>
                    <div className="settings-session-grid">
                      <div className="settings-session-item"><span className="settings-session-label">STATUS</span><span className="settings-session-value">{selectedPack.enabled ? "ENABLED" : "DISABLED"}</span></div>
                      <div className="settings-session-item"><span className="settings-session-label">SOURCE</span><span className="settings-session-value">{selectedPack.source.toUpperCase()}</span></div>
                      <div className="settings-session-item"><span className="settings-session-label">TOKENS</span><span className="settings-session-value">{selectedPack.source === "installed" ? Object.keys(selectedPack.messages).length : "CORE"}</span></div>
                      <div className="settings-session-item"><span className="settings-session-label">MISSING</span><span className="settings-session-value">{selectedPack.source === "installed" ? missingKeys.length : "N/A"}</span></div>
                    </div>
                  </div>

                  <div className="settings-card settings-card-stack">
                    <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Token Audit</strong>
                    {selectedPack.source === "built-in" ? (
                      <div className="settings-session-item">
                        <span className="settings-session-label">BUILT_IN_LOCALE</span>
                        <span className="settings-session-value">Core shell catalogs load through the extension-aware i18n fallback chain.</span>
                      </div>
                    ) : snapshot.loadingTokens ? (
                      <span className="text-[11px] text-[var(--fg-muted)]">Loading tokens...</span>
                    ) : (
                      <div style={{ display: "grid", gap: 8, maxHeight: 420, overflow: "auto" }}>
                        {snapshot.tokens.map((token) => {
                          const missing = !(token.key in selectedPack.messages);
                          return (
                            <div key={token.key} className="settings-session-item" style={{ borderColor: missing ? "var(--status-error)" : undefined }}>
                              <div style={{ display: "grid", gap: 4 }}>
                                <span className="settings-session-label">{token.key}</span>
                                <span className="text-[11px] text-[var(--fg-muted)]">{token.source}</span>
                              </div>
                              <div style={{ display: "grid", gap: 4 }}>
                                <span className="settings-session-value">{missing ? "MISSING" : "PRESENT"}</span>
                                <span className="text-[11px] text-[var(--fg-muted)]">{selectedPack.messages[token.key] ?? token.defaultMessage}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? "dragging" : ""}`} role="separator" aria-orientation="vertical" aria-label="Resize Language Studio panes">
                  <div className="editor-splitter-handle" />
                </div>
                <div className={`editor-pane-column editor-pane-column--split-right-${100 - splitBand}`} style={{ display: "grid", gap: 16, paddingLeft: 12 }}>
                  <div className="settings-card settings-card-stack">
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Columns2 size={14} />
                      <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Create Language Pack</strong>
                    </div>
                    <div className="settings-grid-2">
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Locale</span>
                        <input style={denseInputStyle} value={draftLocale} onChange={(event) => setDraftLocale(event.target.value)} />
                      </label>
                      <label className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Label</span>
                        <input style={denseInputStyle} value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} />
                      </label>
                    </div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Messages JSON</span>
                      <textarea style={{ ...denseInputStyle, minHeight: 220, fontFamily: "var(--font-mono, monospace)" }} value={draftMessages} onChange={(event) => setDraftMessages(event.target.value)} />
                    </label>
                    <div className="settings-action-row" style={{ padding: 8 }}>
                      <button type="button" className="modal-btn modal-btn-primary" onClick={() => void handleCreate()}>
                        <PackagePlus size={14} /> CREATE_AND_EXPORT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "grid", gap: 16 }}>
                    <div className="settings-card settings-card-stack">
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                        <div>
                          <strong style={{ fontSize: 14 }}>{selectedPack.label}</strong>
                          <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--fg-muted)" }}>{selectedPack.locale} | {selectedPack.source.toUpperCase()}</p>
                        </div>
                        <div className="settings-action-row" style={{ padding: 8, gap: 8 }}>
                          <button type="button" className="modal-btn" onClick={() => { void controller.setEnabled(selectedPack.locale, !selectedPack.enabled); }}>
                            {selectedPack.enabled ? <PowerOff size={14} /> : <Power size={14} />} {selectedPack.enabled ? "DISABLE" : "ENABLE"}
                          </button>
                          <button type="button" className="modal-btn modal-btn-primary" onClick={() => { void controller.activate(selectedPack.locale); }} disabled={!selectedPack.enabled}>USE</button>
                          <button
                            type="button"
                            className="modal-btn"
                            onClick={() => {
                              const artifact = controller.exportArtifact(selectedPack.locale);
                              if (artifact) downloadJson(`${selectedPack.locale}.language-pack.json`, artifact);
                            }}
                            disabled={selectedPack.source !== "installed"}
                          >
                            <Download size={14} /> EXPORT
                          </button>
                          <button type="button" className="modal-btn" onClick={() => { void controller.remove(selectedPack.locale); }} disabled={selectedPack.source !== "installed"}>
                            <Trash2 size={14} /> REMOVE
                          </button>
                        </div>
                      </div>
                      <div className="settings-session-grid">
                        <div className="settings-session-item"><span className="settings-session-label">STATUS</span><span className="settings-session-value">{selectedPack.enabled ? "ENABLED" : "DISABLED"}</span></div>
                        <div className="settings-session-item"><span className="settings-session-label">SOURCE</span><span className="settings-session-value">{selectedPack.source.toUpperCase()}</span></div>
                        <div className="settings-session-item"><span className="settings-session-label">TOKENS</span><span className="settings-session-value">{selectedPack.source === "installed" ? Object.keys(selectedPack.messages).length : "CORE"}</span></div>
                        <div className="settings-session-item"><span className="settings-session-label">MISSING</span><span className="settings-session-value">{selectedPack.source === "installed" ? missingKeys.length : "N/A"}</span></div>
                      </div>
                    </div>

                    <div className="settings-card settings-card-stack">
                      <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Token Audit</strong>
                      {selectedPack.source === "built-in" ? (
                        <div className="settings-session-item">
                          <span className="settings-session-label">BUILT_IN_LOCALE</span>
                          <span className="settings-session-value">Core shell catalogs load through the extension-aware i18n fallback chain.</span>
                        </div>
                      ) : snapshot.loadingTokens ? (
                        <span className="text-[11px] text-[var(--fg-muted)]">Loading tokens...</span>
                      ) : (
                        <div style={{ display: "grid", gap: 8, maxHeight: 420, overflow: "auto" }}>
                          {snapshot.tokens.map((token) => {
                            const missing = !(token.key in selectedPack.messages);
                            return (
                              <div key={token.key} className="settings-session-item" style={{ borderColor: missing ? "var(--status-error)" : undefined }}>
                                <div style={{ display: "grid", gap: 4 }}>
                                  <span className="settings-session-label">{token.key}</span>
                                  <span className="text-[11px] text-[var(--fg-muted)]">{token.source}</span>
                                </div>
                                <div style={{ display: "grid", gap: 4 }}>
                                  <span className="settings-session-value">{missing ? "MISSING" : "PRESENT"}</span>
                                  <span className="text-[11px] text-[var(--fg-muted)]">{selectedPack.messages[token.key] ?? token.defaultMessage}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {layoutMode === "single" && (
              <div className="settings-card settings-card-stack">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Languages size={14} />
                  <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>Create Language Pack</strong>
                </div>
                <div className="settings-grid-2">
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Locale</span>
                    <input style={denseInputStyle} value={draftLocale} onChange={(event) => setDraftLocale(event.target.value)} />
                  </label>
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Label</span>
                    <input style={denseInputStyle} value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} />
                  </label>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">Messages JSON</span>
                  <textarea style={{ ...denseInputStyle, minHeight: 180, fontFamily: "var(--font-mono, monospace)" }} value={draftMessages} onChange={(event) => setDraftMessages(event.target.value)} />
                </label>
                <div className="settings-action-row" style={{ padding: 8 }}>
                  <button type="button" className="modal-btn modal-btn-primary" onClick={() => void handleCreate()}>
                    <PackagePlus size={14} /> CREATE_AND_EXPORT
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
