import { type CSSProperties, type FC, useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  Columns2,
  Download,
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
import { languagePackStudioLabels } from "../i18n.js";

function downloadJson(filename: string, value: unknown): void {
  const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function pruneMessages(messages: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(messages)
      .map(([key, value]) => [key.trim(), value.trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0),
  );
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
  formatLabel,
}: {
  controller: LanguagePackStudioController;
  snapshot: LanguagePackStudioSnapshot;
  formatLabel: (label: I18nLabel | string) => string;
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
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsPacks)}</span><span className="settings-session-value">{snapshot.packs.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsEnabled)}</span><span className="settings-session-value">{snapshot.packs.filter((pack) => pack.enabled).length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsBuiltIn)}</span><span className="settings-session-value">{builtInPackCount}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.settingsStatsActive)}</span><span className="settings-session-value">{snapshot.activeLocale}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">{formatLabel(languagePackStudioLabels.browserChip)}</span>
          <span className="settings-chip">{formatLabel(languagePackStudioLabels.panelChipIndexedDb)}</span>
          <span className="settings-chip">{formatLabel(languagePackStudioLabels.panelChipBuiltInInstalled)}</span>
        </div>
      </div>

      <div className="settings-card settings-card-stack" style={{ gap: 8 }}>
        <input
          style={denseInputStyle}
          value={state.browserQuery}
          onChange={(event) => setState({ browserQuery: event.target.value })}
          placeholder={formatLabel(languagePackStudioLabels.browserFilterPlaceholder)}
          aria-label={formatLabel(languagePackStudioLabels.browserFilterAria)}
        />
        <div className="settings-chip-row">
          {[
            ["all", `${formatLabel(languagePackStudioLabels.browserFilterAll)} ${snapshot.packs.length}`],
            ["built-in", `${formatLabel(languagePackStudioLabels.browserFilterBuiltIn)} ${builtInPackCount}`],
            ["installed", `${formatLabel(languagePackStudioLabels.browserFilterInstalled)} ${installedPackCount}`],
            ["disabled", `${formatLabel(languagePackStudioLabels.browserFilterDisabled)} ${snapshot.packs.filter((pack) => !pack.enabled).length}`],
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
            <span className="settings-session-label">{pack.source === "built-in" ? formatLabel(languagePackStudioLabels.browserFilterBuiltIn) : pack.enabled ? formatLabel(languagePackStudioLabels.browserFilterInstalled) : formatLabel(languagePackStudioLabels.browserFilterDisabled)}</span>
          </button>
        ))}
        {filteredPacks.length === 0 && <span className="settings-muted-caption">{formatLabel(languagePackStudioLabels.browserEmpty)}</span>}
      </div>
    </div>
  );
}

export const LanguagePackStudioSidebar: FC<Pick<LanguagePackStudioViewProps, "controller" | "formatLabel">> = ({ controller, formatLabel }) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot) as LanguagePackStudioSnapshot;
  return <LanguagePackBrowserSidebar controller={controller} snapshot={snapshot} formatLabel={formatLabel} />;
};

export const LanguagePackStudioView: FC<LanguagePackStudioViewProps> = ({
  controller,
  close,
  formatLabel,
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
  const [tokenQuery, setTokenQuery] = useState("");
  const [editableLabel, setEditableLabel] = useState("");
  const [editableMessages, setEditableMessages] = useState<Record<string, string>>({});
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
  useEffect(() => {
    setEditableLabel(selectedPack?.label ?? "");
    setEditableMessages(selectedPack ? { ...selectedPack.messages } : {});
  }, [selectedPack?.locale, selectedPack?.label, selectedPack?.messages]);

  const missingKeys = useMemo(() => {
    if (!selectedPack || selectedPack.source === "built-in") {
      return snapshot.tokens;
    }
    return snapshot.tokens.filter((token) => !(token.key in selectedPack.messages));
  }, [selectedPack, snapshot.tokens]);

  const filteredTokens = useMemo(() => {
    const query = tokenQuery.trim().toLowerCase();
    if (!query) return snapshot.tokens;
    return snapshot.tokens.filter((token) => `${token.key} ${token.source} ${token.defaultMessage}`.toLowerCase().includes(query));
  }, [snapshot.tokens, tokenQuery]);

  const editedMessageCount = Object.keys(pruneMessages(editableMessages)).length;

  const handleSaveSelectedPack = async () => {
    if (!selectedPack) return;
    try {
      const pack = await controller.updateArtifact(selectedPack.locale, {
        label: editableLabel || selectedPack.label,
        messages: pruneMessages(editableMessages),
        enabled: selectedPack.enabled,
      });
      setBrowserState({ selectedLocale: pack.locale });
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : formatLabel(languagePackStudioLabels.errorCreateFailed));
    }
  };

  const fillDefaultMessages = () => {
    setEditableMessages((current) => ({
      ...Object.fromEntries(snapshot.tokens.map((token) => [token.key, token.defaultMessage])),
      ...current,
    }));
  };
  const handleImport = async (event: { target: { files?: FileList | null; value: string } }) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await controller.importArtifact(await file.text());
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : formatLabel(languagePackStudioLabels.errorImportFailed));
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
      setError(nextError instanceof Error ? nextError.message : formatLabel(languagePackStudioLabels.errorCreateFailed));
    }
  };

  const tokenEditor = selectedPack ? (
    <div className="settings-card settings-card-stack">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 4 }}>
          <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(languagePackStudioLabels.tokenEditorTitle)}</strong>
          <span className="settings-muted-caption">{formatLabel(languagePackStudioLabels.tokenEditorDescription)}</span>
          {selectedPack.source === "built-in" && (
            <span className="settings-muted-caption">{formatLabel(languagePackStudioLabels.tokenEditorBuiltInNotice)}</span>
          )}
        </div>
        <div className="settings-action-row" style={{ padding: 8, gap: 8 }}>
          <button type="button" className="modal-btn" onClick={fillDefaultMessages} disabled={snapshot.tokens.length === 0}>
            {formatLabel(languagePackStudioLabels.actionFillDefaults)}
          </button>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void handleSaveSelectedPack()} disabled={editedMessageCount === 0}>
            {selectedPack.source === "built-in" ? formatLabel(languagePackStudioLabels.actionSaveAsInstalledPack) : formatLabel(languagePackStudioLabels.actionSavePack)}
          </button>
        </div>
      </div>
      <label className="settings-field-stack">
        <span className="settings-field-label">{formatLabel(languagePackStudioLabels.labelPackLabel)}</span>
        <input
          style={denseInputStyle}
          value={editableLabel}
          onChange={(event) => setEditableLabel(event.target.value)}
          aria-label={formatLabel(languagePackStudioLabels.labelPackLabel)}
        />
      </label>
      <input
        style={denseInputStyle}
        value={tokenQuery}
        onChange={(event) => setTokenQuery(event.target.value)}
        placeholder={formatLabel(languagePackStudioLabels.tokenSearchPlaceholder)}
        aria-label={formatLabel(languagePackStudioLabels.tokenSearchAria)}
      />
      {snapshot.loadingTokens ? (
        <span className="settings-muted-caption">{formatLabel(languagePackStudioLabels.loadingTokens)}</span>
      ) : (
        <div style={{ display: "grid", gap: 8, maxHeight: 520, overflow: "auto" }}>
          {filteredTokens.map((token) => {
            const value = editableMessages[token.key] ?? "";
            const saved = selectedPack.messages[token.key];
            const hasEditedValue = value.trim().length > 0;
            const status = hasEditedValue
              ? (saved === value ? languagePackStudioLabels.labelPresent : languagePackStudioLabels.labelCustom)
              : languagePackStudioLabels.labelDefault;
            return (
              <div key={token.key} className="settings-session-item" style={{ alignItems: "stretch", gap: 10, borderColor: hasEditedValue ? undefined : "var(--border-color)" }}>
                <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                  <span className="settings-session-label" style={{ overflowWrap: "anywhere" }}>{token.key}</span>
                  <span className="settings-muted-caption">{token.source}</span>
                  <span className="settings-muted-caption settings-break-anywhere">{token.defaultMessage}</span>
                </div>
                <div style={{ display: "grid", gap: 6, minWidth: "min(320px, 42vw)" }}>
                  <span className="settings-session-value">{formatLabel(status)}</span>
                  <textarea
                    style={{ ...denseInputStyle, minHeight: 62, resize: "vertical" }}
                    value={value}
                    placeholder={token.defaultMessage}
                    aria-label={`${formatLabel(languagePackStudioLabels.labelTokenValue)} ${token.key}`}
                    onChange={(event) => setEditableMessages((current) => ({ ...current, [token.key]: event.target.value }))}
                  />
                  <button
                    type="button"
                    className="view-toolbar-btn"
                    onClick={() => setEditableMessages((current) => {
                      const next = { ...current };
                      delete next[token.key];
                      return next;
                    })}
                    disabled={!hasEditedValue}
                    style={{ justifySelf: "start" }}
                  >
                    {formatLabel(languagePackStudioLabels.actionResetToken)}
                  </button>
                </div>
              </div>
            );
          })}
          {filteredTokens.length === 0 && <span className="settings-muted-caption">{formatLabel(languagePackStudioLabels.tokenEditorEmpty)}</span>}
        </div>
      )}
    </div>
  ) : null;

  const selectedPackSummary = selectedPack ? (
    <div className="settings-card settings-card-stack">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <strong style={{ fontSize: 14 }}>{selectedPack.label}</strong>
          <p style={{ margin: "6px 0 0", fontSize: 11, color: "var(--fg-muted)" }}>{selectedPack.locale} | {selectedPack.source.toUpperCase()}</p>
        </div>
      </div>
      <div className="settings-session-grid">
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.labelStatus)}</span><span className="settings-session-value">{selectedPack.enabled ? formatLabel(languagePackStudioLabels.browserFilterEnabled) : formatLabel(languagePackStudioLabels.browserFilterDisabled)}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.labelSource)}</span><span className="settings-session-value">{selectedPack.source.toUpperCase()}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.labelTokens)}</span><span className="settings-session-value">{selectedPack.source === "installed" ? Object.keys(selectedPack.messages).length : formatLabel(languagePackStudioLabels.labelCore)}</span></div>
        <div className="settings-session-item"><span className="settings-session-label">{formatLabel(languagePackStudioLabels.labelMissing)}</span><span className="settings-session-value">{selectedPack.source === "installed" ? missingKeys.length : formatLabel(languagePackStudioLabels.labelNotAvailable)}</span></div>
      </div>
    </div>
  ) : null;

  const selectedPackActions = selectedPack ? (
    <div className="settings-card settings-card-stack">
      <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{selectedPack.label}</strong>
      <div className="settings-action-row" style={{ padding: 8, gap: 8 }}>
        <button type="button" className="modal-btn" onClick={() => { void controller.setEnabled(selectedPack.locale, !selectedPack.enabled); }}>
          {selectedPack.enabled ? <PowerOff size={14} /> : <Power size={14} />} {selectedPack.enabled ? formatLabel(languagePackStudioLabels.actionDisable) : formatLabel(languagePackStudioLabels.actionEnable)}
        </button>
        <button type="button" className="modal-btn modal-btn-primary" onClick={() => { void controller.activate(selectedPack.locale); }} disabled={!selectedPack.enabled}>{formatLabel(languagePackStudioLabels.actionUse)}</button>
        <button
          type="button"
          className="modal-btn"
          onClick={() => {
            const artifact = controller.exportArtifact(selectedPack.locale);
            if (artifact) downloadJson(`${selectedPack.locale}.language-pack.json`, artifact);
          }}
          disabled={selectedPack.source !== "installed"}
        >
          <Download size={14} /> {formatLabel(languagePackStudioLabels.actionExport)}
        </button>
        <button type="button" className="modal-btn" onClick={() => { void controller.remove(selectedPack.locale); }} disabled={selectedPack.source !== "installed"}>
          <Trash2 size={14} /> {formatLabel(languagePackStudioLabels.actionRemove)}
        </button>
      </div>
    </div>
  ) : null;

  const createPackPane = (
    <div className="settings-card settings-card-stack">
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Columns2 size={14} />
        <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(languagePackStudioLabels.createTitle)}</strong>
      </div>
      <div className="settings-grid-2">
        <label className="settings-field-stack">
          <span className="settings-field-label">{formatLabel(languagePackStudioLabels.createLocale)}</span>
          <input style={denseInputStyle} value={draftLocale} onChange={(event) => setDraftLocale(event.target.value)} />
        </label>
        <label className="settings-field-stack">
          <span className="settings-field-label">{formatLabel(languagePackStudioLabels.createLabel)}</span>
          <input style={denseInputStyle} value={draftLabel} onChange={(event) => setDraftLabel(event.target.value)} />
        </label>
      </div>
      <label className="settings-field-stack">
        <span className="settings-field-label">{formatLabel(languagePackStudioLabels.createMessagesJson)}</span>
        <textarea style={{ ...denseInputStyle, minHeight: 220, fontFamily: "var(--font-mono, monospace)" }} value={draftMessages} onChange={(event) => setDraftMessages(event.target.value)} />
      </label>
      <div className="settings-action-row" style={{ padding: 8 }}>
        <button type="button" className="modal-btn modal-btn-primary" onClick={() => void handleCreate()}>
          <PackagePlus size={14} /> {formatLabel(languagePackStudioLabels.actionCreateAndExport)}
        </button>
      </div>
    </div>
  );

  const authoringPane = (
    <div style={{ display: "grid", gap: 16 }}>
      {selectedPackActions}
      {createPackPane}
    </div>
  );

  return (
    <div className="language-pack-studio-pane editor-pane-container" data-testid="language-pack-studio-pane">
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label={formatLabel(languagePackStudioLabels.toolbarLabel)}>
        <div className="view-toolbar-group">
          <button
            type="button"
            className={`view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`}
            title={formatLabel(languagePackStudioLabels.toolbarToggleSidebar)}
            onClick={() => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current)}
          >
            {effectiveSidebarOpen ? <SidebarOpen size={14} /> : <Sidebar size={14} />}
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title={formatLabel(languagePackStudioLabels.toolbarSinglePane)} onClick={() => setLayoutMode("single")}>
            <Square size={14} />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title={formatLabel(languagePackStudioLabels.toolbarSplitScreen)} onClick={() => setLayoutMode("split")}>
            <SplitSquareHorizontal size={14} />
          </button>
        </div>
        <div className="view-toolbar-group">
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(languagePackStudioLabels.toolbarImportPack)} onClick={() => importInput?.click()}>
            <Upload size={14} />
          </button>
          <button type="button" className="view-toolbar-btn" title={formatLabel(languagePackStudioLabels.toolbarEnableAll)} onClick={() => { void controller.setAllEnabled(true); }}>
            <Power size={14} />
          </button>
          <button type="button" className="view-toolbar-btn" title={formatLabel(languagePackStudioLabels.toolbarDisableAll)} onClick={() => { void controller.setAllEnabled(false); }}>
            <PowerOff size={14} />
          </button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(languagePackStudioLabels.toolbarClose)} onClick={() => void close()}>
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <input ref={setImportInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        <div className="editor-pane-body is-split">
          {!embedBrowserInShellSidebar && sidebarOpen && (
            <aside className={`workspace-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`} style={{ width: "min(320px, 28vw)", padding: 12, gap: 12 }}>
              <LanguagePackBrowserSidebar controller={controller} snapshot={snapshot} formatLabel={formatLabel} />
              {error && <p style={{ margin: 0, fontSize: 11, color: "var(--status-error)" }}>{error}</p>}
            </aside>
          )}

          <div className="editor-pane-column" style={{ flex: 1, padding: 16, gap: 16 }}>
            <div className="language-pack-studio-header">
              <div className="language-pack-studio-header-main">
                <div className="language-pack-studio-header-copy">
                  <span className="settings-session-label">{formatLabel(languagePackStudioLabels.panelKicker)}</span>
                  <strong className="language-pack-studio-header-title">{formatLabel(languagePackStudioLabels.panelTitle)}</strong>
                  <span className="settings-muted-caption">{formatLabel(languagePackStudioLabels.panelSubtitle)}</span>
                </div>
                <div className="settings-chip-row">
                  <span className="settings-chip">{formatLabel(languagePackStudioLabels.panelChipIndexedDb)}</span>
                  <span className="settings-chip">{formatLabel(languagePackStudioLabels.panelChipBuiltInInstalled)}</span>
                  <span className="settings-chip">{formatLabel(languagePackStudioLabels.panelChipPaneOnly)}</span>
                </div>
              </div>
            </div>

            {selectedPack && (
              layoutMode === "split" ? (
              <div ref={splitContainerRef} className="editor-pane-body is-split" style={{ background: "transparent" }}>
                <div className={`editor-pane-column editor-pane-column--split-left-${splitBand}`} style={{ display: "grid", gap: 16, paddingRight: 12 }}>
                  {selectedPackSummary}
                  {tokenEditor}
                </div>

                <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? "dragging" : ""}`} role="separator" aria-orientation="vertical" aria-label={formatLabel(languagePackStudioLabels.toolbarResizePanes)}>
                  <div className="editor-splitter-handle" />
                </div>
                <div className={`editor-pane-column editor-pane-column--split-right-${100 - splitBand}`} style={{ display: "grid", gap: 16, paddingLeft: 12 }}>
                  {authoringPane}
                </div>
              </div>
              ) : (
                <div style={{ display: "grid", gap: 16 }}>
                  {selectedPackSummary}
                  {tokenEditor}
                  {authoringPane}
                </div>
              )
            )}
            {!selectedPack && authoringPane}
          </div>
        </div>
      </div>
    </div>
  );
};
