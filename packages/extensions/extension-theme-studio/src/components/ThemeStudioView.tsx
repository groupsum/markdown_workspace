import React from "react";
import { MarkdownSourceEditor, createMarkdownEditorThemeStyleFromThemeTokens } from "@mdwrk/markdown-editor-react";
import { MarkdownRenderer, createMarkdownRendererThemeStyleFromThemeTokens } from "@mdwrk/markdown-renderer-react";
import type { I18nLabel } from "@mdwrk/extension-manifest";
import { Download, Eye, Package, RefreshCw, RotateCcw, Save, X } from "lucide-react";
import { THEME_STUDIO_SAMPLE_MARKDOWN } from "../constants.js";
import { themeStudioLabels } from "../i18n.js";
import { sanitizePackageName, sanitizeThemeIdentifier } from "../export.js";
import type { ThemeStudioService } from "../types.js";

export interface ThemeStudioViewProps {
  readonly service: ThemeStudioService;
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--border-primary)",
  background: "var(--surface-elevated, var(--bg-panel))",
  color: "var(--fg-primary)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 12,
};

const codeBlockStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 160,
  border: "1px solid var(--border-primary)",
  background: "var(--surface-elevated, var(--bg-panel))",
  color: "var(--fg-primary)",
  borderRadius: 8,
  padding: 12,
  fontSize: 11,
  fontFamily: "var(--font-mono, monospace)",
  lineHeight: 1.6,
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

export const ThemeStudioView: React.FC<ThemeStudioViewProps> = ({ service, close, formatLabel }) => {
  const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  const [exportTarget, setExportTarget] = React.useState<"host" | "renderer" | "editor">("host");
  const importRef = React.useRef<HTMLInputElement>(null);

  const effectiveTokens = React.useMemo(
    () => mergeTokens(snapshot.currentTokens as Record<string, string> | null, snapshot.draftTokens as Record<string, string>),
    [snapshot.currentTokens, snapshot.draftTokens],
  );

  const rendererThemeStyle = React.useMemo(() => createMarkdownRendererThemeStyleFromThemeTokens(effectiveTokens as any), [effectiveTokens]);
  const editorThemeStyle = React.useMemo(() => createMarkdownEditorThemeStyleFromThemeTokens(effectiveTokens as any), [effectiveTokens]);

  React.useEffect(() => {
    void service.refresh();
    void service.readSettings().then((settings) => setExportTarget(settings.defaultExportTarget));
  }, [service]);

  const runExport = async (): Promise<void> => {
    await service.generateExports(exportTarget);
  };

  const importPackage = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
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

  return (
    <div
      className="theme-studio-pane"
      data-testid="theme-studio-pane"
      role="region"
      aria-label={formatLabel(themeStudioLabels.viewTitle)}
      style={{ display: "grid", gridTemplateRows: "auto 1fr", minHeight: "100%", background: "var(--bg-canvas)" }}
    >
      <div
        className="workspace-panel-header"
        style={{ alignItems: "flex-start", gap: 16, flexWrap: "wrap", height: "auto", minHeight: "var(--panel-header-height)", padding: "12px 10px" }}
      >
        <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
          <span className="settings-modal-kicker">THEME_STUDIO</span>
          <strong className="settings-modal-title">{formatLabel(themeStudioLabels.headerTitle)}</strong>
          <span className="settings-modal-subtitle">{formatLabel(themeStudioLabels.headerSubtitle)}</span>
        </div>
        <div className="settings-modal-actions" style={{ marginLeft: "auto", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button type="button" className="modal-btn" onClick={() => void service.refresh()} disabled={snapshot.busy}><RefreshCw size={14} /> {formatLabel(themeStudioLabels.actionRefresh)}</button>
          <button type="button" className="modal-btn" onClick={() => importRef.current?.click()} disabled={snapshot.busy}><Package size={14} /> IMPORT_PACKAGE</button>
          <button type="button" className="modal-btn" onClick={() => void service.preview()} disabled={snapshot.busy}><Eye size={14} /> {formatLabel(themeStudioLabels.actionPreview)}</button>
          <button type="button" className="modal-btn modal-btn-primary" onClick={() => void service.apply()} disabled={snapshot.busy}><Save size={14} /> {formatLabel(themeStudioLabels.actionApply)}</button>
          <button type="button" className="modal-btn" onClick={() => void service.revert()} disabled={snapshot.busy}><RotateCcw size={14} /> {formatLabel(themeStudioLabels.actionRevert)}</button>
          <button type="button" className="modal-btn" onClick={() => void close()}><X size={14} /> {formatLabel(themeStudioLabels.actionClose)}</button>
        </div>
        <input ref={importRef} type="file" accept="application/json,.json" hidden onChange={(event) => { void importPackage(event); }} />
      </div>

      <div className="workspace-panel-content" style={{ overflow: "auto" }}>
        <div className="settings-pane" style={{ padding: 16 }}>
          <div style={{ display: "grid", gap: 16 }}>
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

            <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
              <div>
                <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.tokenInspectorTitle)}</div>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }}>{formatLabel(themeStudioLabels.tokenInspectorDescription)}</p>
              </div>
              <div style={{ display: "grid", gap: 10, maxHeight: 320, overflow: "auto", paddingRight: 6 }}>
                {snapshot.tokenDefinitions.map((definition) => (
                  <div key={definition.name} className="settings-session-item" style={{ display: "grid", gap: 8 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "baseline" }}>
                      <strong style={{ fontSize: 12 }}>{definition.name}</strong>
                      <span className="settings-session-label">{definition.category}</span>
                    </div>
                    <span className="text-[11px] text-[var(--fg-muted)]">{definition.description}</span>
                    <div className="settings-grid-2">
                      <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelDefault)}</span><span className="settings-session-value">{definition.defaultValue}</span></div>
                      <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelCurrent)}</span><span className="settings-session-value">{(snapshot.currentTokens as any)?.[definition.name] ?? definition.defaultValue}</span></div>
                    </div>
                    <label className="flex flex-col gap-2">
                      <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{formatLabel(themeStudioLabels.labelDraft)}</span>
                      <input
                        style={fieldStyle}
                        value={(snapshot.draftTokens as any)[definition.name] ?? (snapshot.currentTokens as any)?.[definition.name] ?? definition.defaultValue}
                        onChange={(event) => {
                          void service.setDraftToken(definition.name as any, event.currentTarget.value);
                        }}
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="settings-grid-2">
              <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.previewTitle)}</div>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }}>{formatLabel(themeStudioLabels.previewDescription)}</p>
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

              <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
                <div>
                  <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.classInspectorTitle)}</div>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }}>{formatLabel(themeStudioLabels.classInspectorDescription)}</p>
                </div>
                <div style={{ display: "grid", gap: 10, maxHeight: 420, overflow: "auto", paddingRight: 6 }}>
                  {snapshot.relationships.length === 0 && <span className="text-[12px] text-[var(--fg-muted)]">{formatLabel(themeStudioLabels.labelNoRelationships)}</span>}
                  {snapshot.relationships.map((relationship) => (
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
                      <div className="settings-session-item"><span className="settings-session-label">{formatLabel(themeStudioLabels.labelTokens)}</span><span className="settings-session-value">{relationship.sourceTokens.join(", ")}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <div style={sectionTitleStyle}>{formatLabel(themeStudioLabels.exportTitle)}</div>
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--fg-secondary)", lineHeight: 1.6 }}>{formatLabel(themeStudioLabels.exportDescription)}</p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <select style={fieldStyle} value={exportTarget} onChange={(event) => setExportTarget(event.currentTarget.value as any)}>
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
                    {exports && <button type="button" className="modal-btn" onClick={() => downloadTextFile(`${snapshot.metadata.themeId}.json`, exports.json, "application/json") }><Download size={14} /> {formatLabel(themeStudioLabels.actionDownloadJson)}</button>}
                  </div>
                  <textarea readOnly style={codeBlockStyle} value={exports?.json ?? ""} />
                </div>
                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={sectionTitleStyle}>{formatLabel(themeStudioLabels.labelCssExport)}</span>
                    {exports && <button type="button" className="modal-btn" onClick={() => downloadTextFile(`${snapshot.metadata.themeId}.css`, exportTarget === "host" ? exports.hostCss : exportTarget === "renderer" ? exports.rendererCss : exports.editorCss, "text/css") }><Download size={14} /> {formatLabel(themeStudioLabels.actionDownloadCss)}</button>}
                  </div>
                  <textarea readOnly style={codeBlockStyle} value={exports ? (exportTarget === "host" ? exports.hostCss : exportTarget === "renderer" ? exports.rendererCss : exports.editorCss) : ""} />
                </div>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={sectionTitleStyle}>{formatLabel(themeStudioLabels.labelPackageArtifact)}</span>
                  {exports && <button type="button" className="modal-btn" onClick={() => downloadTextFile(`${snapshot.metadata.themeId}.theme-package.json`, JSON.stringify(exports.packageArtifact, null, 2), "application/json") }><Download size={14} /> {formatLabel(themeStudioLabels.actionDownloadPackage)}</button>}
                </div>
                <textarea readOnly style={{ ...codeBlockStyle, minHeight: 220 }} value={exports ? JSON.stringify(exports.packageArtifact, null, 2) : ""} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
