import { type CSSProperties, type FC, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { MarkdownSourceEditor, createMarkdownEditorThemeStyleFromThemeTokens } from "@mdwrk/markdown-editor-react";
import { MarkdownRenderer, createMarkdownRendererThemeStyleFromThemeTokens } from "@mdwrk/markdown-renderer-react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import {
  Download,
  Eye,
  Package,
  RefreshCw,
  RotateCcw,
  Save,
  Sidebar,
  SidebarOpen,
  SplitSquareHorizontal,
  Square,
  X,
} from "lucide-react";
import { THEME_STUDIO_SAMPLE_MARKDOWN } from "../constants.js";
import { themeStudioLabels } from "../i18n.js";
import { sanitizePackageName, sanitizeThemeIdentifier } from "../export.js";
import type { ThemeStudioService } from "../types.js";

export interface ThemeStudioViewProps {
  readonly service: ThemeStudioService;
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
  readonly shellSidebarOpen?: boolean;
  readonly onShellSidebarToggle?: (open: boolean) => void;
  readonly embedBrowserInShellSidebar?: boolean;
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const fieldStyle: CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-primary)",
  background: "var(--surface-elevated, var(--bg-panel))",
  color: "var(--fg-primary)",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 11,
};

const codeBlockStyle: CSSProperties = {
  width: "100%",
  minHeight: 140,
  border: "1px solid var(--border-primary)",
  background: "var(--surface-elevated, var(--bg-panel))",
  color: "var(--fg-primary)",
  borderRadius: 8,
  padding: 10,
  fontSize: 11,
  fontFamily: "var(--font-mono, monospace)",
  lineHeight: 1.5,
  resize: "vertical",
};

const mergeTokens = (current: Record<string, string> | null, draft: Record<string, string>) => ({ ...(current ?? {}), ...draft });

const CSS_HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const CSS_COLOR_FUNCTION_PATTERN = /^(?:rgb|rgba|hsl|hsla|oklch|oklab|lab|lch|color)\(/i;

function isColorToken(definition: { category?: string; name: string; description?: string }, value: string): boolean {
  const haystack = `${definition.category ?? ""} ${definition.name} ${definition.description ?? ""}`.toLowerCase();
  return haystack.includes("color") || CSS_HEX_COLOR_PATTERN.test(value.trim()) || CSS_COLOR_FUNCTION_PATTERN.test(value.trim());
}

function toColorInputValue(value: string): string {
  const trimmed = value.trim();
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed;
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed.slice(1).split("").map((part) => `${part}${part}`).join("")}`;
  }
  if (/^#[0-9a-f]{8}$/i.test(trimmed)) return trimmed.slice(0, 7);
  return "#000000";
}

const getSplitBand = (value: number): number => {
  const clamped = Math.min(80, Math.max(20, value));
  return Math.round(clamped / 5) * 5;
};

function useWorkspaceModuleSplit(defaultPosition = 55) {
  const [splitPos, setSplitPos] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const [splitContainer, setSplitContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !splitContainer) return;
      const rect = splitContainer.getBoundingClientRect();
      if (rect.width <= 0) return;
      const x = event.clientX - rect.left;
      setSplitPos(getSplitBand((x / rect.width) * 100));
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

type ThemeBrowserState = {
  readonly browserQuery: string;
  readonly sidebarSection: "metadata" | "tokens" | "relationships" | "exports";
  readonly selectedTokenName: string | null;
  readonly selectedRelationshipClass: string | null;
};

type ThemeBrowserStore = {
  getSnapshot(): ThemeBrowserState;
  subscribe(listener: () => void): () => void;
  setState(update: Partial<ThemeBrowserState>): void;
};

const createThemeBrowserStore = (): ThemeBrowserStore => {
  let state: ThemeBrowserState = {
    browserQuery: "",
    sidebarSection: "metadata",
    selectedTokenName: null,
    selectedRelationshipClass: null,
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

const themeBrowserStores = new WeakMap<ThemeStudioService, ThemeBrowserStore>();
const getThemeBrowserStore = (service: ThemeStudioService): ThemeBrowserStore => {
  let store = themeBrowserStores.get(service);
  if (!store) {
    store = createThemeBrowserStore();
    themeBrowserStores.set(service, store);
  }
  return store;
};

function useThemeBrowserState(service: ThemeStudioService) {
  const store = getThemeBrowserStore(service);
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  return { state, setState: store.setState };
}

function downloadTextFile(filename: string, content: string, mimeType = "text/plain;charset=utf-8"): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const ThemeStudioSidebar: FC<Pick<ThemeStudioViewProps, "service" | "formatLabel">> = ({ service, formatLabel }) => {
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  const { state: browserState, setState: setBrowserState } = useThemeBrowserState(service);
  const deferredBrowserQuery = browserState.browserQuery.trim().toLowerCase();
  const browserTokens = useMemo(
    () => snapshot.tokenDefinitions.filter((definition) => {
      if (!deferredBrowserQuery) return true;
      const haystack = `${definition.name} ${definition.category} ${definition.description}`.toLowerCase();
      return haystack.includes(deferredBrowserQuery);
    }),
    [deferredBrowserQuery, snapshot.tokenDefinitions],
  );
  const browserRelationships = useMemo(
    () => snapshot.relationships.filter((relationship) => {
      if (!deferredBrowserQuery) return true;
      const haystack = `${relationship.className} ${relationship.selector} ${relationship.scope} ${relationship.bridgeTarget}`.toLowerCase();
      return haystack.includes(deferredBrowserQuery);
    }),
    [deferredBrowserQuery, snapshot.relationships],
  );

  return (
    <div className="workspace-panel-content" style={{ display: "grid", gap: 12, padding: 12 }}>
      <div className="settings-card settings-card-stack">
        <div className="settings-session-grid">
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsThemeId)}</span><span className="settings-session-value">{snapshot.metadata.themeId}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsTokens)}</span><span className="settings-session-value">{snapshot.tokenDefinitions.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsRelationships)}</span><span className="settings-session-value">{snapshot.relationships.length}</span></div>
          <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.settingsStatsStatus)}</span><span className="settings-session-value">{snapshot.busy ? formatLabel(themeStudioLabels.statusBusy) : formatLabel(themeStudioLabels.statusReady)}</span></div>
        </div>
        <div className="settings-chip-row">
          <span className="settings-chip">{formatLabel(themeStudioLabels.browserChip)}</span>
          <span className="settings-chip">{snapshot.tokenDefinitions.length} {formatLabel(themeStudioLabels.settingsStatsTokens)}</span>
          <span className="settings-chip">{snapshot.relationships.length} {formatLabel(themeStudioLabels.settingsStatsRelationships)}</span>
        </div>
      </div>
      <div className="settings-card settings-card-stack" style={{ gap: 8 }}>
        <input
          style={fieldStyle}
          value={browserState.browserQuery}
          onChange={(event) => setBrowserState({ browserQuery: event.currentTarget.value })}
          placeholder={formatLabel(themeStudioLabels.browserFilterPlaceholder)}
          aria-label={formatLabel(themeStudioLabels.browserFilterAria)}
        />
        {[
          ["metadata", formatLabel(themeStudioLabels.browserSectionMetadata)],
          ["tokens", `${formatLabel(themeStudioLabels.browserSectionTokens)} (${browserTokens.length})`],
          ["relationships", `${formatLabel(themeStudioLabels.browserSectionRelationships)} (${browserRelationships.length})`],
          ["exports", formatLabel(themeStudioLabels.browserSectionExports)],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={`settings-sidebar-btn ${browserState.sidebarSection === value ? "active" : ""}`}
            onClick={() => setBrowserState({
              sidebarSection: value as ThemeBrowserState["sidebarSection"],
              selectedTokenName: value === "tokens" ? browserState.selectedTokenName : null,
              selectedRelationshipClass: value === "relationships" ? browserState.selectedRelationshipClass : null,
            })}
          >
            {label}
          </button>
        ))}
        <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
          <span className="settings-session-label">{formatLabel(themeStudioLabels.browserTokenTitle)}</span>
          {browserTokens.slice(0, 12).map((definition) => (
            <button
              key={definition.name}
              type="button"
              className={`settings-sidebar-btn ${browserState.selectedTokenName === definition.name ? "active" : ""}`}
              onClick={() => setBrowserState({ sidebarSection: "tokens", selectedTokenName: definition.name, selectedRelationshipClass: null })}
              style={{ justifyContent: "space-between", gap: 10 }}
            >
              <span style={{ textAlign: "left" }}>{definition.name}</span>
              <span className="settings-session-label">{definition.category}</span>
            </button>
          ))}
          {browserTokens.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">{formatLabel(themeStudioLabels.browserEmptyTokens)}</span>}
        </div>
        <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
          <span className="settings-session-label">{formatLabel(themeStudioLabels.browserRelationshipTitle)}</span>
          {browserRelationships.slice(0, 12).map((relationship) => (
            <button
              key={relationship.className}
              type="button"
              className={`settings-sidebar-btn ${browserState.selectedRelationshipClass === relationship.className ? "active" : ""}`}
              onClick={() => setBrowserState({ sidebarSection: "relationships", selectedRelationshipClass: relationship.className, selectedTokenName: null })}
              style={{ justifyContent: "space-between", gap: 10 }}
            >
              <span style={{ textAlign: "left" }}>{relationship.className}</span>
              <span className="settings-session-label">{relationship.bridgeTarget}</span>
            </button>
          ))}
          {browserRelationships.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">{formatLabel(themeStudioLabels.browserEmptyRelationships)}</span>}
        </div>
      </div>
    </div>
  );
};

export const ThemeStudioView: FC<ThemeStudioViewProps> = ({
  service,
  close,
  formatLabel,
  shellSidebarOpen,
  onShellSidebarToggle,
  embedBrowserInShellSidebar = false,
}) => {
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  const [exportTarget, setExportTarget] = useState<"host" | "renderer" | "editor">("host");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"single" | "split">("split");
  const [importInput, setImportInput] = useState<HTMLInputElement | null>(null);
  const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
  const { state: browserState, setState: setBrowserState } = useThemeBrowserState(service);
  const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;
  const deferredBrowserQuery = browserState.browserQuery.trim().toLowerCase();

  const effectiveTokens = useMemo(
    () => mergeTokens(snapshot.currentTokens as Record<string, string> | null, snapshot.draftTokens as Record<string, string>),
    [snapshot.currentTokens, snapshot.draftTokens],
  );

  const rendererThemeStyle = useMemo(() => createMarkdownRendererThemeStyleFromThemeTokens(effectiveTokens as never), [effectiveTokens]);
  const editorThemeStyle = useMemo(() => createMarkdownEditorThemeStyleFromThemeTokens(effectiveTokens as never), [effectiveTokens]);
  const browserTokens = useMemo(
    () => snapshot.tokenDefinitions.filter((definition) => {
      if (!deferredBrowserQuery) return true;
      const haystack = `${definition.name} ${definition.category} ${definition.description}`.toLowerCase();
      return haystack.includes(deferredBrowserQuery);
    }),
    [deferredBrowserQuery, snapshot.tokenDefinitions],
  );
  const browserRelationships = useMemo(
    () => snapshot.relationships.filter((relationship) => {
      if (!deferredBrowserQuery) return true;
      const haystack = `${relationship.className} ${relationship.selector} ${relationship.scope} ${relationship.bridgeTarget}`.toLowerCase();
      return haystack.includes(deferredBrowserQuery);
    }),
    [deferredBrowserQuery, snapshot.relationships],
  );
  const visibleTokenDefinitions = useMemo(() => {
    if (browserState.selectedTokenName) {
      return browserTokens.filter((definition) => definition.name === browserState.selectedTokenName);
    }
    return browserTokens;
  }, [browserState.selectedTokenName, browserTokens]);
  const visibleRelationships = useMemo(() => {
    if (browserState.selectedRelationshipClass) {
      return browserRelationships.filter((relationship) => relationship.className === browserState.selectedRelationshipClass);
    }
    return browserRelationships;
  }, [browserRelationships, browserState.selectedRelationshipClass]);

  useEffect(() => {
    void service.refresh();
    void service.readSettings().then((settings) => setExportTarget(settings.defaultExportTarget));
  }, [service]);

  const runExport = async (): Promise<void> => {
    await service.generateExports(exportTarget);
  };

  const importPackage = async (event: any): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      await service.importPackageArtifact(await file.text());
    } finally {
      event.target.value = "";
    }
  };

  const handleMetadataChange = (key: "themeName" | "themeId" | "packageName" | "author" | "description", value: string) => {
    const normalizedValue = key === "themeId"
      ? sanitizeThemeIdentifier(value)
      : key === "packageName"
        ? sanitizePackageName(value)
        : value;
    void service.updateMetadata({ [key]: normalizedValue });
  };

  const exports = snapshot.lastExports;

  const inspectorPane = (
    <div style={{ display: "grid", gap: 16 }}>
      {(browserState.sidebarSection === "metadata" || layoutMode === "split") && (
        <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span style={sectionTitleStyle}>{formatLabel(themeStudioLabels.metadataTitle)}</span>
            <span className="text-[11px] text-[var(--fg-muted)]">{snapshot.busy ? formatLabel(themeStudioLabels.statusBusy) : snapshot.infoMessage ?? formatLabel(themeStudioLabels.statusReady)}</span>
          </div>
          {snapshot.lastError && <p style={{ margin: 0, color: "var(--accent-red, #ef4444)", fontSize: 12 }}>{snapshot.lastError}</p>}
          <div className="settings-grid-2">
            <label className="flex flex-col gap-2"><span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.metadataThemeName)}</span><input style={fieldStyle} value={snapshot.metadata.themeName} onChange={(event) => handleMetadataChange("themeName", event.currentTarget.value)} /></label>
            <label className="flex flex-col gap-2"><span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.metadataThemeId)}</span><input style={fieldStyle} value={snapshot.metadata.themeId} onChange={(event) => handleMetadataChange("themeId", event.currentTarget.value)} /></label>
            <label className="flex flex-col gap-2"><span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.metadataPackageName)}</span><input style={fieldStyle} value={snapshot.metadata.packageName} onChange={(event) => handleMetadataChange("packageName", event.currentTarget.value)} /></label>
            <label className="flex flex-col gap-2"><span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.metadataAuthor)}</span><input style={fieldStyle} value={snapshot.metadata.author} onChange={(event) => handleMetadataChange("author", event.currentTarget.value)} /></label>
          </div>
          <label className="flex flex-col gap-2"><span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.metadataDescription)}</span><textarea style={{ ...fieldStyle, minHeight: 72, resize: "vertical" }} value={snapshot.metadata.description} onChange={(event) => handleMetadataChange("description", event.currentTarget.value)} /></label>
        </div>
      )}

      {(browserState.sidebarSection === "tokens" || layoutMode === "split") && (
        <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.tokenInspectorTitle)}</div>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{formatLabel(themeStudioLabels.tokenInspectorDescription)}</p>
          </div>
          <div style={{ display: "grid", gap: 10, maxHeight: 520, overflow: "auto", paddingRight: 6 }}>
            {visibleTokenDefinitions.map((definition) => {
              const currentValue = (snapshot.currentTokens as Record<string, string> | null)?.[definition.name] ?? definition.defaultValue;
              const draftValue = (snapshot.draftTokens as Record<string, string>)[definition.name];
              const effectiveValue = draftValue ?? currentValue;
              const colorToken = isColorToken(definition, effectiveValue);
              const swatchBackground = colorToken ? effectiveValue : "linear-gradient(135deg, var(--bg-muted), var(--border-primary))";
              return (
                <div key={definition.name} className="settings-session-item" style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "baseline" }}>
                    <strong style={{ fontSize: 12 }}>{definition.name}</strong>
                    <span className="settings-session-label">{definition.category}</span>
                  </div>
                  <span className="text-[11px] text-[var(--fg-muted)]">{definition.description}</span>
                  <div className="settings-grid-2">
                    <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelDefault)}</span><span className="settings-session-value">{definition.defaultValue}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelCurrent)}</span><span className="settings-session-value">{currentValue}</span></div>
                    <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelEffective)}</span><span className="settings-session-value">{effectiveValue}</span></div>
                    <div className="settings-session-item" style={{ justifyContent: "start" }}>
                      <span className="settings-session-label">{formatLabel(themeStudioLabels.labelColorPicker)}</span>
                      <input
                        type="color"
                        value={toColorInputValue(effectiveValue)}
                        aria-label={`${formatLabel(themeStudioLabels.labelColorPicker)} ${definition.name}`}
                        disabled={!colorToken}
                        onChange={(event) => {
                          void service.setDraftToken(definition.name as never, event.currentTarget.value);
                        }}
                        style={{
                          width: 34,
                          height: 24,
                          padding: 0,
                          border: "1px solid var(--border-primary)",
                          borderRadius: 8,
                          background: swatchBackground,
                          cursor: colorToken ? "pointer" : "not-allowed",
                        }}
                      />
                    </div>
                  </div>
                  <label className="flex flex-col gap-2">
                    <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.labelDraft)}</span>
                    <input
                      style={fieldStyle}
                      value={effectiveValue}
                      aria-label={`${formatLabel(themeStudioLabels.labelTokenValue)} ${definition.name}`}
                      onChange={(event) => {
                        void service.setDraftToken(definition.name as never, event.currentTarget.value);
                      }}
                    />
                  </label>
                  <div className="settings-action-row" style={{ padding: 8, gap: 8 }}>
                    <button type="button" className="modal-btn" onClick={() => { void service.setDraftToken(definition.name as never, definition.defaultValue); }}>
                      {formatLabel(themeStudioLabels.actionUseDefault)}
                    </button>
                    <button type="button" className="modal-btn" onClick={() => { void service.setDraftToken(definition.name as never, currentValue); }}>
                      {formatLabel(themeStudioLabels.actionCopyCurrent)}
                    </button>
                    <button type="button" className="modal-btn" onClick={() => { void service.clearDraftToken(definition.name as never); }} disabled={draftValue === undefined}>
                      {formatLabel(themeStudioLabels.actionClearDraft)}
                    </button>
                  </div>
                </div>
              );
            })}
            {visibleTokenDefinitions.length === 0 && <span className="text-[12px] text-[var(--fg-muted)]">{formatLabel(themeStudioLabels.browserEmptyTokens)}</span>}
          </div>
        </div>
      )}

      {(browserState.sidebarSection === "relationships" || layoutMode === "split") && (
        <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.classInspectorTitle)}</div>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{formatLabel(themeStudioLabels.classInspectorDescription)}</p>
          </div>
          <div style={{ display: "grid", gap: 10, maxHeight: 320, overflow: "auto", paddingRight: 6 }}>
            {visibleRelationships.length === 0 && <span className="text-[12px] text-[var(--fg-muted)]">{formatLabel(themeStudioLabels.labelNoRelationships)}</span>}
            {visibleRelationships.map((relationship) => (
              <div key={relationship.className} className="settings-session-item" style={{ display: "grid", gap: 6 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "baseline" }}>
                  <strong style={{ fontSize: 12 }}>{relationship.className}</strong>
                  <span className="settings-session-label">{relationship.bridgeTarget}</span>
                </div>
                <span className="text-[11px] text-[var(--fg-muted)]">{relationship.selector}</span>
                <div className="settings-grid-2">
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelScope)}</span><span className="settings-session-value">{relationship.scope}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelBridgeTarget)}</span><span className="settings-session-value">{relationship.bridgeTarget}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(browserState.sidebarSection === "exports" || layoutMode === "split") && (
        <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.exportTitle)}</div>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{formatLabel(themeStudioLabels.exportDescription)}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <select style={fieldStyle} value={exportTarget} onChange={(event) => setExportTarget(event.currentTarget.value as "host" | "renderer" | "editor")}>
                <option value="host">{formatLabel(themeStudioLabels.exportTargetHostCss)}</option>
                <option value="renderer">{formatLabel(themeStudioLabels.exportTargetRendererCss)}</option>
                <option value="editor">{formatLabel(themeStudioLabels.exportTargetEditorCss)}</option>
              </select>
              <button type="button" className="modal-btn modal-btn-primary" onClick={() => void runExport()} disabled={snapshot.busy}><Package size={14} /> {formatLabel(themeStudioLabels.actionExport)}</button>
            </div>
          </div>
          <div className="settings-grid-2">
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={sectionTitleStyle}>{formatLabel(themeStudioLabels.labelJsonExport)}</span>
                {exports && <button type="button" className="modal-btn" onClick={() => downloadTextFile(`${snapshot.metadata.themeId}.json`, exports.json, "application/json")}><Download size={14} /> {formatLabel(themeStudioLabels.actionDownloadJson)}</button>}
              </div>
              <textarea readOnly style={codeBlockStyle} value={exports?.json ?? ""} />
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={sectionTitleStyle}>{formatLabel(themeStudioLabels.labelCssExport)}</span>
                {exports && <button type="button" className="modal-btn" onClick={() => downloadTextFile(`${snapshot.metadata.themeId}.css`, exportTarget === "host" ? exports.hostCss : exportTarget === "renderer" ? exports.rendererCss : exports.editorCss, "text/css")}><Download size={14} /> {formatLabel(themeStudioLabels.actionDownloadCss)}</button>}
              </div>
              <textarea readOnly style={codeBlockStyle} value={exports ? (exportTarget === "host" ? exports.hostCss : exportTarget === "renderer" ? exports.rendererCss : exports.editorCss) : ""} />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const previewPane = (
    <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
      <div>
        <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.previewTitle)}</div>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{formatLabel(themeStudioLabels.previewDescription)}</p>
      </div>
      <div style={{ display: "grid", gap: 12 }}>
        <div style={{ border: "1px solid var(--border-primary)", borderRadius: 8, padding: 12 }}>
          <MarkdownRenderer markdown={THEME_STUDIO_SAMPLE_MARKDOWN} themeStyle={rendererThemeStyle} />
        </div>
        <div style={{ border: "1px solid var(--border-primary)", borderRadius: 8, overflow: "hidden" }}>
          <MarkdownSourceEditor value={THEME_STUDIO_SAMPLE_MARKDOWN} disabled showLineNumbers themeStyle={editorThemeStyle} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="theme-studio-pane editor-pane-container" data-testid="theme-studio-pane" role="region" aria-label={formatLabel(themeStudioLabels.viewTitle)}>
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label={formatLabel(themeStudioLabels.toolbarLabel)}>
        <div className="view-toolbar-group">
          <button type="button" className={`view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`} title={formatLabel(themeStudioLabels.toolbarToggleSidebar)} onClick={() => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current)}>
            {effectiveSidebarOpen ? <SidebarOpen size={14} /> : <Sidebar size={14} />}
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title={formatLabel(themeStudioLabels.toolbarSinglePane)} onClick={() => setLayoutMode("single")}>
            <Square size={14} />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title={formatLabel(themeStudioLabels.toolbarSplitScreen)} onClick={() => setLayoutMode("split")}>
            <SplitSquareHorizontal size={14} />
          </button>
        </div>
        <div className="view-toolbar-group">
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(themeStudioLabels.toolbarRefresh)} onClick={() => void service.refresh()} disabled={snapshot.busy}><RefreshCw size={14} /></button>
          <button type="button" className="view-toolbar-btn" title={formatLabel(themeStudioLabels.toolbarImport)} onClick={() => importInput?.click()} disabled={snapshot.busy}><Package size={14} /></button>
          <button type="button" className="view-toolbar-btn" title={formatLabel(themeStudioLabels.toolbarPreview)} onClick={() => void service.preview()} disabled={snapshot.busy}><Eye size={14} /></button>
          <button type="button" className="view-toolbar-btn" title={formatLabel(themeStudioLabels.toolbarApply)} onClick={() => void service.apply()} disabled={snapshot.busy}><Save size={14} /></button>
          <button type="button" className="view-toolbar-btn" title={formatLabel(themeStudioLabels.toolbarRevert)} onClick={() => void service.revert()} disabled={snapshot.busy}><RotateCcw size={14} /></button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(themeStudioLabels.toolbarClose)} onClick={() => void close()}><X size={14} /></button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <input ref={setImportInput} type="file" accept="application/json,.json" hidden onChange={(event) => { void importPackage(event); }} />
        <div className="editor-pane-body is-split">
          {!embedBrowserInShellSidebar && sidebarOpen && (
            <aside className={`workspace-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`} style={{ width: "min(300px, 26vw)", padding: 12, gap: 12 }}>
              <ThemeStudioSidebar service={service} formatLabel={formatLabel} />
            </aside>
          )}

          <div className="editor-pane-column" style={{ flex: 1, padding: 16, gap: 16 }}>
            <div className="settings-card settings-card-stack" style={{ gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <span className="settings-session-label">{formatLabel(themeStudioLabels.panelKicker)}</span>
                  <strong style={{ fontSize: 14 }}>{formatLabel(themeStudioLabels.headerTitle)}</strong>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{formatLabel(themeStudioLabels.headerSubtitle)}</span>
                </div>
                <div className="settings-chip-row">
                  <span className="settings-chip">{formatLabel(themeStudioLabels.settingsChipSplitSingle)}</span>
                  <span className="settings-chip">{formatLabel(themeStudioLabels.settingsChipSettingsContent)}</span>
                  <span className="settings-chip">{formatLabel(themeStudioLabels.settingsChipEnglishFallback)}</span>
                </div>
              </div>
            </div>

            {layoutMode === "split" ? (
              <div ref={splitContainerRef} className="editor-pane-body is-split" style={{ background: "transparent" }}>
                <div className={`editor-pane-column editor-pane-column--split-left-${splitBand}`} style={{ display: "grid", gap: 16, paddingRight: 12 }}>
                  {inspectorPane}
                </div>
                <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? "dragging" : ""}`} role="separator" aria-orientation="vertical" aria-label={formatLabel(themeStudioLabels.toolbarResizePanes)}>
                  <div className="editor-splitter-handle" />
                </div>
                <div className={`editor-pane-column editor-pane-column--split-right-${100 - splitBand}`} style={{ display: "grid", gap: 16, paddingLeft: 12 }}>
                  {previewPane}
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: "grid", gap: 16 }}>{inspectorPane}</div>
                {previewPane}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
