import { type CSSProperties, type FC, useDeferredValue, useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

export const ThemeStudioView: FC<ThemeStudioViewProps> = ({ service, close, formatLabel }) => {
  const snapshot = useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  const [exportTarget, setExportTarget] = useState<"host" | "renderer" | "editor">("host");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"single" | "split">("split");
  const [sidebarSection, setSidebarSection] = useState<"metadata" | "tokens" | "relationships" | "exports">("metadata");
  const [browserQuery, setBrowserQuery] = useState("");
  const [selectedTokenName, setSelectedTokenName] = useState<string | null>(null);
  const [selectedRelationshipClass, setSelectedRelationshipClass] = useState<string | null>(null);
  const [importInput, setImportInput] = useState<HTMLInputElement | null>(null);
  const deferredBrowserQuery = useDeferredValue(browserQuery.trim().toLowerCase());

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
    if (selectedTokenName) {
      return browserTokens.filter((definition) => definition.name === selectedTokenName);
    }
    return browserTokens;
  }, [browserTokens, selectedTokenName]);
  const visibleRelationships = useMemo(() => {
    if (selectedRelationshipClass) {
      return browserRelationships.filter((relationship) => relationship.className === selectedRelationshipClass);
    }
    return browserRelationships;
  }, [browserRelationships, selectedRelationshipClass]);

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
      {(sidebarSection === "metadata" || layoutMode === "split") && (
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

      {(sidebarSection === "tokens" || layoutMode === "split") && (
        <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
          <div>
            <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.tokenInspectorTitle)}</div>
            <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{formatLabel(themeStudioLabels.tokenInspectorDescription)}</p>
          </div>
          <div style={{ display: "grid", gap: 10, maxHeight: 420, overflow: "auto", paddingRight: 6 }}>
            {visibleTokenDefinitions.map((definition) => (
              <div key={definition.name} className="settings-session-item" style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "baseline" }}>
                  <strong style={{ fontSize: 12 }}>{definition.name}</strong>
                  <span className="settings-session-label">{definition.category}</span>
                </div>
                <span className="text-[11px] text-[var(--fg-muted)]">{definition.description}</span>
                <div className="settings-grid-2">
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelDefault)}</span><span className="settings-session-value">{definition.defaultValue}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelCurrent)}</span><span className="settings-session-value">{(snapshot.currentTokens as Record<string, string> | null)?.[definition.name] ?? definition.defaultValue}</span></div>
                </div>
                <label className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.labelDraft)}</span>
                  <input
                    style={fieldStyle}
                    value={(snapshot.draftTokens as Record<string, string>)[definition.name] ?? (snapshot.currentTokens as Record<string, string> | null)?.[definition.name] ?? definition.defaultValue}
                    onChange={(event) => {
                      void service.setDraftToken(definition.name as never, event.currentTarget.value);
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
      )}

      {(sidebarSection === "relationships" || layoutMode === "split") && (
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

      {(sidebarSection === "exports" || layoutMode === "split") && (
        <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.exportTitle)}</div>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.5 }}>{formatLabel(themeStudioLabels.exportDescription)}</p>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <select style={fieldStyle} value={exportTarget} onChange={(event) => setExportTarget(event.currentTarget.value as "host" | "renderer" | "editor")}>
                <option value="host">Host CSS</option>
                <option value="renderer">Renderer CSS</option>
                <option value="editor">Editor CSS</option>
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

  return (
    <div className="theme-studio-pane editor-pane-container" data-testid="theme-studio-pane" role="region" aria-label={formatLabel(themeStudioLabels.viewTitle)}>
      <div className="view-toolbar" aria-label="Theme Studio toolbar">
        <div className="view-toolbar-group">
          <button type="button" className={`view-toolbar-btn ${sidebarOpen ? "active" : ""}`} title="Toggle sidebar" onClick={() => setSidebarOpen((current) => !current)}>
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
          <button type="button" className="view-toolbar-btn" title="Refresh theme data" onClick={() => void service.refresh()} disabled={snapshot.busy}><RefreshCw size={14} /></button>
          <button type="button" className="view-toolbar-btn" title="Import theme package" onClick={() => importInput?.click()} disabled={snapshot.busy}><Package size={14} /></button>
          <button type="button" className="view-toolbar-btn" title="Preview draft theme" onClick={() => void service.preview()} disabled={snapshot.busy}><Eye size={14} /></button>
          <button type="button" className="view-toolbar-btn" title="Apply draft theme" onClick={() => void service.apply()} disabled={snapshot.busy}><Save size={14} /></button>
          <button type="button" className="view-toolbar-btn" title="Revert draft theme" onClick={() => void service.revert()} disabled={snapshot.busy}><RotateCcw size={14} /></button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title="Close studio" onClick={() => void close()}><X size={14} /></button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <input ref={setImportInput} type="file" accept="application/json,.json" hidden onChange={(event) => { void importPackage(event); }} />
        <div className="editor-pane-body is-split">
          {sidebarOpen && (
            <aside className={`workspace-sidebar editor-pane-column ${sidebarOpen ? "" : "is-collapsed"}`} style={{ width: "min(300px, 26vw)", padding: 12, gap: 12 }}>
              <div className="settings-card settings-card-stack">
                <div className="settings-session-grid">
                  <div className="settings-session-item"><span className="settings-session-label">THEME_ID</span><span className="settings-session-value">{snapshot.metadata.themeId}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">TOKENS</span><span className="settings-session-value">{snapshot.tokenDefinitions.length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">RELATIONSHIPS</span><span className="settings-session-value">{snapshot.relationships.length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">STATUS</span><span className="settings-session-value">{snapshot.busy ? "BUSY" : "READY"}</span></div>
                </div>
                <div className="settings-chip-row">
                  <span className="settings-chip">{snapshot.tokenDefinitions.length} TOKENS</span>
                  <span className="settings-chip">{snapshot.relationships.length} RELATIONSHIPS</span>
                  <span className="settings-chip">PANE_ONLY</span>
                </div>
              </div>
              <div className="settings-card settings-card-stack" style={{ gap: 8 }}>
                <div style={{ display: "grid", gap: 6 }}>
                  <span className="settings-session-label">THEME_BROWSER</span>
                  <input
                    style={fieldStyle}
                    value={browserQuery}
                    onChange={(event) => setBrowserQuery(event.currentTarget.value)}
                    placeholder="Filter tokens, selectors, exports"
                    aria-label="Filter theme browser"
                  />
                </div>
                {[
                  ["metadata", "Metadata"],
                  ["tokens", `Tokens (${browserTokens.length})`],
                  ["relationships", `Relationships (${browserRelationships.length})`],
                  ["exports", "Exports"],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`settings-sidebar-btn ${sidebarSection === value ? "active" : ""}`}
                    onClick={() => {
                      setSidebarSection(value as "metadata" | "tokens" | "relationships" | "exports");
                      if (value !== "tokens") setSelectedTokenName(null);
                      if (value !== "relationships") setSelectedRelationshipClass(null);
                    }}
                  >
                    {label}
                  </button>
                ))}
                <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
                  <span className="settings-session-label">TOKEN_BROWSER</span>
                  {browserTokens.slice(0, 12).map((definition) => (
                    <button
                      key={definition.name}
                      type="button"
                      className={`settings-sidebar-btn ${selectedTokenName === definition.name ? "active" : ""}`}
                      onClick={() => {
                        setSidebarSection("tokens");
                        setSelectedTokenName(definition.name);
                        setSelectedRelationshipClass(null);
                      }}
                      style={{ justifyContent: "space-between", gap: 10 }}
                    >
                      <span style={{ textAlign: "left" }}>{definition.name}</span>
                      <span className="settings-session-label">{definition.category}</span>
                    </button>
                  ))}
                  {browserTokens.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">No tokens match.</span>}
                </div>
                <div style={{ display: "grid", gap: 6, marginTop: 4 }}>
                  <span className="settings-session-label">RELATIONSHIP_BROWSER</span>
                  {browserRelationships.slice(0, 12).map((relationship) => (
                    <button
                      key={relationship.className}
                      type="button"
                      className={`settings-sidebar-btn ${selectedRelationshipClass === relationship.className ? "active" : ""}`}
                      onClick={() => {
                        setSidebarSection("relationships");
                        setSelectedRelationshipClass(relationship.className);
                        setSelectedTokenName(null);
                      }}
                      style={{ justifyContent: "space-between", gap: 10 }}
                    >
                      <span style={{ textAlign: "left" }}>{relationship.className}</span>
                      <span className="settings-session-label">{relationship.bridgeTarget}</span>
                    </button>
                  ))}
                  {browserRelationships.length === 0 && <span className="text-[11px] text-[var(--fg-muted)]">No relationships match.</span>}
                </div>
              </div>
            </aside>
          )}

          <div className="editor-pane-column" style={{ flex: 1, padding: 16, gap: 16 }}>
            <div className="settings-card settings-card-stack" style={{ gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ display: "grid", gap: 4 }}>
                  <span className="settings-session-label">THEME_STUDIO</span>
                  <strong style={{ fontSize: 14 }}>{formatLabel(themeStudioLabels.headerTitle)}</strong>
                  <span style={{ fontSize: 11, color: "var(--fg-muted)" }}>{formatLabel(themeStudioLabels.headerSubtitle)}</span>
                </div>
                <div className="settings-chip-row">
                  <span className="settings-chip">SPLIT + SINGLE</span>
                  <span className="settings-chip">SETTINGS_CONTENT</span>
                  <span className="settings-chip">EN_FALLBACK</span>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: layoutMode === "split" ? "minmax(0, 1.08fr) minmax(360px, 0.92fr)" : "minmax(0, 1fr)" }}>
              <div style={{ display: "grid", gap: 16 }}>
                {inspectorPane}
              </div>

              {layoutMode === "split" && (
                <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="settings-session-label">PREVIEW</span>
                    <strong style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(themeStudioLabels.previewTitle)}</strong>
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
              )}
            </div>

            {layoutMode === "single" && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
