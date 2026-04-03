import { type CSSProperties, type FC, useEffect, useMemo, useState, useSyncExternalStore } from "react";
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

export interface LanguagePackStudioViewProps {
  readonly controller: LanguagePackStudioController;
  readonly close: () => Promise<void>;
  readonly formatLabel: (label: I18nLabel | string) => string;
}

export const LanguagePackStudioView: FC<LanguagePackStudioViewProps> = ({ controller, close, formatLabel: _formatLabel }) => {
  const snapshot = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getSnapshot) as LanguagePackStudioSnapshot;
  const [importInput, setImportInput] = useState<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocale, setSelectedLocale] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState<"single" | "split">("split");
  const [draftLocale, setDraftLocale] = useState("custom");
  const [draftLabel, setDraftLabel] = useState("Custom Language Pack");
  const [draftMessages, setDraftMessages] = useState('{\n  "core.views.settings.title": "System Configuration"\n}');

  useEffect(() => {
    if (selectedLocale && snapshot.packs.some((pack) => pack.locale === selectedLocale)) {
      return;
    }
    setSelectedLocale(snapshot.packs[0]?.locale ?? null);
  }, [selectedLocale, snapshot.packs]);

  const selectedPack = snapshot.packs.find((pack) => pack.locale === selectedLocale) ?? null;
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
      setSelectedLocale(pack.locale);
      setError(null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create language pack.");
    }
  };

  return (
    <div className="language-pack-studio-pane editor-pane-container" data-testid="language-pack-studio-pane">
      <div className="view-toolbar" aria-label="Language Pack Studio toolbar">
        <div className="view-toolbar-group">
          <button type="button" className={`view-toolbar-btn ${sidebarOpen ? "active" : ""}`} title="Toggle sidebar" onClick={() => setSidebarOpen((current) => !current)}>
            {sidebarOpen ? <SidebarOpen size={14} /> : <Sidebar size={14} />}
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title="Single pane" onClick={() => setLayoutMode("single")}>
            <Square size={14} />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title="Split screen" onClick={() => setLayoutMode("split")}>
            <SplitSquareHorizontal size={14} />
          </button>
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
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title="Close studio" onClick={() => void close()}>
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="editor-pane-shell">
        <input ref={setImportInput} type="file" accept="application/json,.json" hidden onChange={handleImport} />
        <div className="editor-pane-body is-split">
          {sidebarOpen && (
            <aside className="editor-pane-column" style={{ width: "min(320px, 28vw)", borderRight: "1px solid var(--border-color)", padding: 12, gap: 12 }}>
              <div className="settings-card settings-card-stack">
                <div className="settings-session-grid">
                  <div className="settings-session-item"><span className="settings-session-label">PACKS</span><span className="settings-session-value">{snapshot.packs.length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">ENABLED</span><span className="settings-session-value">{snapshot.packs.filter((pack) => pack.enabled).length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">BUILT_IN</span><span className="settings-session-value">{snapshot.packs.filter((pack) => pack.source === "built-in").length}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">ACTIVE</span><span className="settings-session-value">{snapshot.activeLocale}</span></div>
                </div>
                {error && <p style={{ margin: 0, fontSize: 11, color: "var(--status-error)" }}>{error}</p>}
              </div>

              <div className="settings-card settings-card-stack" style={{ gap: 8 }}>
                {snapshot.packs.map((pack) => (
                  <button
                    key={`${pack.source}:${pack.locale}`}
                    type="button"
                    className={`settings-sidebar-btn ${selectedLocale === pack.locale ? "active" : ""}`}
                    onClick={() => setSelectedLocale(pack.locale)}
                    style={{ justifyContent: "space-between", gap: 10 }}
                  >
                    <span style={{ textAlign: "left" }}>{pack.label}</span>
                    <span className="settings-session-label">{pack.source === "built-in" ? "BUILT_IN" : pack.enabled ? "INSTALLED" : "DISABLED"}</span>
                  </button>
                ))}
              </div>
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
                <div className="settings-action-row" style={{ padding: 8, gap: 8 }}>
                  <button type="button" className="modal-btn" onClick={() => importInput?.click()}><Upload size={14} /> IMPORT</button>
                  <button type="button" className="modal-btn" onClick={() => { void controller.setAllEnabled(false); }}><PowerOff size={14} /> DISABLE_ALL</button>
                  <button type="button" className="modal-btn modal-btn-primary" onClick={() => { void controller.setAllEnabled(true); }}><Power size={14} /> ENABLE_ALL</button>
                </div>
              </div>
            </div>

            {selectedPack && (
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: layoutMode === "split" ? "minmax(0, 1.15fr) minmax(320px, 0.85fr)" : "minmax(0, 1fr)" }}>
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

                {layoutMode === "split" && (
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
                )}
              </div>
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
