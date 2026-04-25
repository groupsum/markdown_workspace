import React from "react";
import { geminiAgentLabels } from "../i18n.js";
import type { GeminiAgentViewProps } from "../types.js";

type IconName = "sidebar" | "sidebar-open" | "single" | "split" | "close";

function ToolbarIcon({ name }: { readonly name: IconName }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "sidebar") {
    return <svg {...common}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M9 3v18" /></svg>;
  }
  if (name === "sidebar-open") {
    return <svg {...common}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M15 3v18" /></svg>;
  }
  if (name === "single") {
    return <svg {...common}><rect width="16" height="16" x="4" y="4" rx="2" /></svg>;
  }
  if (name === "split") {
    return <svg {...common}><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M12 3v18" /></svg>;
  }
  return <svg {...common}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>;
}

const cardStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 12,
  border: "1px solid var(--border-primary)",
  borderRadius: 10,
  background: "var(--bg-secondary)",
};

const pillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 8px",
  borderRadius: 999,
  border: "1px solid var(--border-primary)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const textareaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 120,
  background: "var(--bg-primary)",
  color: "var(--fg-primary)",
  border: "1px solid var(--border-primary)",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 12,
  lineHeight: 1.6,
  resize: "vertical",
};

const getSplitBand = (value: number): number => {
  const clamped = Math.min(80, Math.max(20, value));
  return Math.round(clamped / 5) * 5;
};

function useWorkspaceModuleSplit(defaultPosition = 55) {
  const [splitPos, setSplitPos] = React.useState(defaultPosition);
  const [isDragging, setIsDragging] = React.useState(false);
  const splitContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !splitContainerRef.current) return;
      const rect = splitContainerRef.current.getBoundingClientRect();
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
  }, [isDragging]);

  return {
    splitBand: getSplitBand(splitPos),
    isDragging,
    splitContainerRef,
    startSplitDrag: () => setIsDragging(true),
  };
}

export const GeminiAgentSidebar: React.FC<Pick<GeminiAgentViewProps, "service" | "formatLabel">> = ({ service, formatLabel }) => {
  const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  const context = snapshot.lastContext;
  return (
    <div className="workspace-panel-content" style={{ display: "grid", gap: 12, padding: 12 }}>
      <div style={cardStyle}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelContext)}</span>
        <button type="button" className="settings-sidebar-btn active" style={{ justifyContent: "space-between" }}>
          <span style={{ textAlign: "left" }}>{context?.project?.name ?? formatLabel(geminiAgentLabels.panelContextNone)}</span>
          <span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextProject)}</span>
        </button>
        <button type="button" className="settings-sidebar-btn active" style={{ justifyContent: "space-between" }}>
          <span style={{ textAlign: "left" }}>{context?.file?.name ?? formatLabel(geminiAgentLabels.panelContextNone)}</span>
          <span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextFile)}</span>
        </button>
      </div>
    </div>
  );
};

export const GeminiAgentView: React.FC<GeminiAgentViewProps> = ({
  close,
  formatLabel,
  service,
  input,
  shellSidebarOpen,
  onShellSidebarToggle,
  embedBrowserInShellSidebar = false,
}) => {
  const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  const [prompt, setPrompt] = React.useState(input?.prompt ?? "");
  const [settingsSummary, setSettingsSummary] = React.useState<Record<string, unknown> | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [layoutMode, setLayoutMode] = React.useState<"single" | "split">("split");
  const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
  const lastIntentRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    void service.refreshContext();
    void service.loadSettings().then((settings) => {
      setSettingsSummary({
        endpoint: settings.endpoint,
        model: settings.model,
        authMode: settings.authMode,
        hasApiKey: Boolean(settings.apiKey),
        allowWriteBack: settings.allowWriteBack,
        autoAttachDocument: settings.autoAttachDocument,
        autoAttachSelection: settings.autoAttachSelection,
      });
    });
  }, [service]);

  React.useEffect(() => {
    if (!input?.intent || input.intent === "idle") return;
    const inputKey = `${input.intent}:${input.prompt ?? ""}`;
    if (lastIntentRef.current === inputKey) return;
    lastIntentRef.current = inputKey;
    if (input.prompt) {
      setPrompt(input.prompt);
    }
    void service.runIntent(input.intent, input.prompt ?? "");
  }, [input, service]);

  const context = snapshot.lastContext;
  const selectionLength = context?.selections?.[0]?.text?.length ?? 0;
  const configured = Boolean(settingsSummary?.endpoint) && (settingsSummary?.authMode === "none" || Boolean(settingsSummary?.hasApiKey));
  const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;

  const promptPane = (
    <div className="settings-pane" style={{ display: "grid", gap: 14 }}>
      <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 10 }}>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelPrompt)}</span>
          <textarea
            value={prompt}
            placeholder={formatLabel(geminiAgentLabels.statusPromptPlaceholder)}
            style={textareaStyle}
            onChange={(event) => setPrompt(event.currentTarget.value)}
          />
        </label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="modal-btn modal-btn-primary" disabled={snapshot.busy} onClick={() => void service.runIntent("custom-prompt", prompt)}>{formatLabel(geminiAgentLabels.panelRunPrompt)}</button>
          <button className="modal-btn" disabled={snapshot.busy} onClick={() => void service.runIntent("summarize-current-file")}>{formatLabel(geminiAgentLabels.panelSummarize)}</button>
          <button className="modal-btn" disabled={snapshot.busy} onClick={() => void service.runIntent("rewrite-selection", prompt)}>{formatLabel(geminiAgentLabels.panelRewriteSelection)}</button>
          <button className="modal-btn" disabled={snapshot.busy} onClick={() => void service.refreshContext()}>{formatLabel(geminiAgentLabels.panelRefresh)}</button>
          <button className="modal-btn" onClick={() => service.clearResult()}>{formatLabel(geminiAgentLabels.panelClearResult)}</button>
        </div>
      </div>
      <div style={cardStyle}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelResponse)}</span>
        <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)", fontSize: 12, lineHeight: 1.6 }}>{snapshot.lastResponse?.text ?? ""}</pre>
      </div>
    </div>
  );

  const draftPane = (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelDraft)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="modal-btn" disabled={snapshot.busy} onClick={() => void service.applyDraft("selection")}>{formatLabel(geminiAgentLabels.panelApplySelection)}</button>
          <button className="modal-btn" disabled={snapshot.busy} onClick={() => void service.applyDraft("document")}>{formatLabel(geminiAgentLabels.panelReplaceDocument)}</button>
          <button className="modal-btn" onClick={() => service.clearDraft()}>{formatLabel(geminiAgentLabels.panelClearDraft)}</button>
        </div>
      </div>
      <textarea
        value={snapshot.pendingDraft ?? ""}
        style={{ ...textareaStyle, minHeight: 180 }}
        onChange={(event) => service.updateDraft(event.currentTarget.value)}
      />
      {snapshot.writebackBlockedReason && <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{snapshot.writebackBlockedReason}</p>}
    </div>
  );

  return (
    <div className="extension-manager-pane editor-pane-container" role="region" aria-label={formatLabel(geminiAgentLabels.viewTitle)}>
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label={formatLabel(geminiAgentLabels.toolbarLabel)}>
        <div className="view-toolbar-group">
          <button type="button" className={`view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarToggleSidebar)} onClick={() => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current)}>
            <ToolbarIcon name={effectiveSidebarOpen ? "sidebar-open" : "sidebar"} />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarSinglePane)} onClick={() => setLayoutMode("single")}>
            <ToolbarIcon name="single" />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarSplitScreen)} onClick={() => setLayoutMode("split")}>
            <ToolbarIcon name="split" />
          </button>
        </div>
        <div className="view-toolbar-group" style={{ justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(geminiAgentLabels.toolbarClose)} onClick={() => void close()}>
            <ToolbarIcon name="close" />
          </button>
        </div>
      </div>
      <div className="editor-pane-shell">
        <div className="editor-pane-body is-split">
          {!embedBrowserInShellSidebar && effectiveSidebarOpen && (
            <aside className="workspace-sidebar editor-pane-column" style={{ width: "min(320px, 28vw)", padding: 12, gap: 12 }}>
              <div style={cardStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelContext)}</span>
                <div className="settings-session-grid">
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextProject)}</span><span className="settings-session-value">{context?.project?.name ?? formatLabel(geminiAgentLabels.panelContextNone)}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextFile)}</span><span className="settings-session-value">{context?.file?.path ?? context?.file?.name ?? formatLabel(geminiAgentLabels.panelContextNone)}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextSelection)}</span><span className="settings-session-value">{selectionLength > 0 ? `${selectionLength} ${formatLabel(geminiAgentLabels.panelSelectionCountSuffix)}` : formatLabel(geminiAgentLabels.panelContextNone)}</span></div>
                </div>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelSettings)}</span>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "var(--font-mono, monospace)", fontSize: 12, lineHeight: 1.5 }}>{JSON.stringify(settingsSummary ?? {}, null, 2)}</pre>
              </div>
            </aside>
          )}
          <div className="editor-pane-column" style={{ flex: 1, padding: 16, gap: 16 }}>
            <div className="settings-card settings-card-stack" style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "grid", gap: 4 }}>
                <span className="settings-session-label">{formatLabel(geminiAgentLabels.panelKicker)}</span>
                <strong style={{ fontSize: 14 }}>{formatLabel(geminiAgentLabels.panelTitle)}</strong>
                <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>{formatLabel(geminiAgentLabels.panelSubtitle)}</span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={pillStyle}>{configured ? formatLabel(geminiAgentLabels.statusConfigured) : formatLabel(geminiAgentLabels.statusMissingConfiguration)}</span>
                <span style={pillStyle}>{settingsSummary?.allowWriteBack ? formatLabel(geminiAgentLabels.statusWritebackEnabled) : formatLabel(geminiAgentLabels.statusWritebackDisabled)}</span>
                <span style={pillStyle}>{snapshot.busy ? formatLabel(geminiAgentLabels.statusRunning) : formatLabel(geminiAgentLabels.statusIdle)}</span>
              </div>
            </div>
            {layoutMode === "split" ? (
              <div ref={splitContainerRef} className="editor-pane-body is-split" style={{ background: "transparent" }}>
                <div className={`editor-pane-column editor-pane-column--split-left-${splitBand}`} style={{ display: "grid", gap: 16, paddingRight: 12 }}>
                  {promptPane}
                </div>
                <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? "dragging" : ""}`} role="separator" aria-orientation="vertical" aria-label={formatLabel(geminiAgentLabels.toolbarResizePanes)}>
                  <div className="editor-splitter-handle" />
                </div>
                <div className={`editor-pane-column editor-pane-column--split-right-${100 - splitBand}`} style={{ display: "grid", gap: 16, paddingLeft: 12 }}>
                  {draftPane}
                </div>
              </div>
            ) : (
              <>
                {promptPane}
                {draftPane}
              </>
            )}
            {snapshot.infoMessage && (
              <div style={cardStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelLastInfo)}</span>
                <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{snapshot.infoMessage}</p>
              </div>
            )}
            {snapshot.lastError && (
              <div style={cardStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelLastError)}</span>
                <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{snapshot.lastError}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
