import React from "react";
import { MarkdownRenderer } from "@mdwrk/markdown-renderer-react";
import { geminiAgentLabels } from "../i18n.js";
import type { GeminiAgentViewProps, GeminiChatMessage, GeminiChatThread } from "../types.js";

type IconName = "sidebar" | "sidebar-open" | "single" | "split" | "close";
type GeminiPaneFocus = "conversation" | "preview" | "draft";

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

const buttonStyle: React.CSSProperties = {
  border: "1px solid var(--border-primary)",
  background: "var(--bg-primary)",
  color: "var(--fg-primary)",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 11,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-primary)",
  color: "var(--fg-primary)",
  border: "1px solid var(--border-primary)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 12,
  lineHeight: 1.6,
  resize: "vertical",
};

const getSplitBand = (value: number): number => {
  const clamped = Math.min(80, Math.max(20, value));
  return Math.round(clamped / 5) * 5;
};

function useWorkspaceModuleSplit(defaultPosition = 52) {
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

function formatTimestamp(createdAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

function messageTone(role: GeminiChatMessage["role"]): React.CSSProperties {
  if (role === "assistant") {
    return {
      justifySelf: "start",
      background: "color-mix(in srgb, var(--accent) 12%, var(--bg-primary))",
      border: "1px solid color-mix(in srgb, var(--accent) 40%, var(--border-primary))",
    };
  }
  if (role === "system") {
    return {
      justifySelf: "center",
      background: "color-mix(in srgb, var(--bg-secondary) 80%, transparent)",
      border: "1px dashed var(--border-primary)",
    };
  }
  return {
    justifySelf: "end",
    background: "var(--bg-primary)",
    border: "1px solid var(--border-primary)",
  };
}

function PreviewSurface({
  formatLabel,
  markdown,
  sourceLabel,
}: {
  readonly formatLabel: GeminiAgentViewProps["formatLabel"];
  readonly markdown: string;
  readonly sourceLabel: string;
}) {
  return (
    <div style={{ ...cardStyle, height: "100%", alignContent: "start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelPreview)}</span>
        <span style={pillStyle}>{sourceLabel}</span>
      </div>
      {markdown.trim() ? (
        <div className="preview-pane" style={{ minHeight: 0, borderRadius: 10 }}>
          <MarkdownRenderer markdown={markdown} />
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(geminiAgentLabels.panelPreviewEmpty)}</p>
      )}
    </div>
  );
}

function DraftSurface({
  formatLabel,
  draft,
  busy,
  writebackBlockedReason,
  onChange,
  onApplySelection,
  onReplaceDocument,
  onClearDraft,
}: {
  readonly formatLabel: GeminiAgentViewProps["formatLabel"];
  readonly draft: string;
  readonly busy: boolean;
  readonly writebackBlockedReason: string | null;
  readonly onChange: (value: string) => void;
  readonly onApplySelection: () => void;
  readonly onReplaceDocument: () => void;
  readonly onClearDraft: () => void;
}) {
  return (
    <div style={{ ...cardStyle, height: "100%", alignContent: "start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelDraft)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="modal-btn" disabled={busy} onClick={onApplySelection}>{formatLabel(geminiAgentLabels.panelApplySelection)}</button>
          <button type="button" className="modal-btn" disabled={busy} onClick={onReplaceDocument}>{formatLabel(geminiAgentLabels.panelReplaceDocument)}</button>
          <button type="button" className="modal-btn" onClick={onClearDraft}>{formatLabel(geminiAgentLabels.panelClearDraft)}</button>
        </div>
      </div>
      <textarea
        value={draft}
        style={{ ...inputStyle, minHeight: 220, fontFamily: "var(--font-mono, monospace)" }}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      {writebackBlockedReason && <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{writebackBlockedReason}</p>}
    </div>
  );
}

function ThreadList({
  threads,
  activeThreadId,
  formatLabel,
  onNewThread,
  onSelectThread,
}: {
  readonly threads: readonly GeminiChatThread[];
  readonly activeThreadId: string | null;
  readonly formatLabel: GeminiAgentViewProps["formatLabel"];
  readonly onNewThread: () => void;
  readonly onSelectThread: (threadId: string) => void;
}) {
  return (
    <div className="workspace-panel-content gemini-agent-thread-browser" style={{ display: "grid", gap: 12, padding: 12 }}>
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelThreads)}</span>
          <button type="button" className="settings-sidebar-btn active" style={{ width: "auto", paddingInline: 12 }} onClick={onNewThread}>
            {formatLabel(geminiAgentLabels.panelNewThread)}
          </button>
        </div>
        {threads.length ? (
          <div style={{ display: "grid", gap: 8 }}>
            {threads.map((thread) => {
              const selected = thread.id === activeThreadId;
              const lastMessage = thread.messages.at(-1);
              return (
                <button
                  key={thread.id}
                  type="button"
                  className={`settings-sidebar-btn ${selected ? "active" : ""}`}
                  style={{ justifyContent: "space-between", alignItems: "start", textAlign: "left", paddingBlock: 10 }}
                  onClick={() => onSelectThread(thread.id)}
                >
                  <span style={{ display: "grid", gap: 4 }}>
                    <strong style={{ fontSize: 12 }}>{thread.title}</strong>
                    <span className="settings-session-value" style={{ maxWidth: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {lastMessage?.text ?? formatLabel(geminiAgentLabels.panelThreadEmpty)}
                    </span>
                  </span>
                  <span className="settings-session-label">{thread.messages.length} {formatLabel(geminiAgentLabels.panelThreadCount)}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(geminiAgentLabels.panelThreadEmpty)}</p>
        )}
      </div>
    </div>
  );
}

export const GeminiAgentSidebar: React.FC<Pick<GeminiAgentViewProps, "service" | "formatLabel">> = ({ service, formatLabel }) => {
  const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  return (
    <ThreadList
      threads={snapshot.threads}
      activeThreadId={snapshot.activeThreadId}
      formatLabel={formatLabel}
      onNewThread={() => {
        service.createThread();
      }}
      onSelectThread={(threadId) => {
        service.selectThread(threadId);
      }}
    />
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
  const [paneFocus, setPaneFocus] = React.useState<GeminiPaneFocus>("conversation");
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
    if (input.prompt) setPrompt(input.prompt);
    void service.runIntent(input.intent, input.prompt ?? "");
  }, [input, service]);

  const effectiveSidebarOpen = embedBrowserInShellSidebar ? (shellSidebarOpen ?? true) : sidebarOpen;
  const activeThread = snapshot.activeThreadId
    ? snapshot.threads.find((thread) => thread.id === snapshot.activeThreadId) ?? null
    : snapshot.threads[0] ?? null;
  const context = snapshot.lastContext;
  const selectionLength = context?.selections?.[0]?.text?.length ?? 0;
  const configured = Boolean(settingsSummary?.endpoint) && (settingsSummary?.authMode === "none" || Boolean(settingsSummary?.hasApiKey));
  const previewMarkdown = snapshot.pendingDraft ?? snapshot.lastResponse?.text ?? context?.document?.content ?? "";
  const previewSource = snapshot.pendingDraft
    ? formatLabel(geminiAgentLabels.panelPreviewDraft)
    : snapshot.lastResponse?.text
      ? formatLabel(geminiAgentLabels.panelPreviewResponse)
      : formatLabel(geminiAgentLabels.panelPreviewDocument);

  const runPrompt = () => {
    const nextPrompt = prompt.trim();
    if (!nextPrompt) return;
    void service.runIntent("custom-prompt", nextPrompt);
  };

  const conversationSurface = (
    <div style={{ ...cardStyle, height: "100%", alignContent: "start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelConversation)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={buttonStyle} onClick={() => service.createThread()}>{formatLabel(geminiAgentLabels.panelNewThread)}</button>
          <button type="button" style={buttonStyle} disabled={snapshot.busy} onClick={() => void service.refreshContext()}>{formatLabel(geminiAgentLabels.panelRefresh)}</button>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <strong style={{ fontSize: 14 }}>{activeThread?.title ?? formatLabel(geminiAgentLabels.panelNewThread)}</strong>
          <span className="settings-session-value">
            {activeThread ? `${activeThread.messages.length} ${formatLabel(geminiAgentLabels.panelThreadCount)}` : formatLabel(geminiAgentLabels.panelThreadEmpty)}
          </span>
        </div>
        <div
          aria-label={formatLabel(geminiAgentLabels.panelChatTranscript)}
          style={{
            display: "grid",
            gap: 10,
            minHeight: 280,
            maxHeight: layoutMode === "split" ? "min(60vh, 640px)" : "min(68vh, 720px)",
            overflowY: "auto",
            padding: 6,
          }}
        >
          {activeThread?.messages.length ? activeThread.messages.map((message) => (
            <article
              key={message.id}
              style={{
                ...messageTone(message.role),
                display: "grid",
                gap: 6,
                width: "min(92%, 760px)",
                padding: "10px 12px",
                borderRadius: 14,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <strong style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>{message.role}</strong>
                <span className="settings-session-label">{formatTimestamp(message.createdAt)}</span>
              </div>
              <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: 12, lineHeight: 1.6 }}>{message.text}</pre>
            </article>
          )) : (
            <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(geminiAgentLabels.panelThreadEmpty)}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="modal-btn" disabled={snapshot.busy} onClick={() => void service.runIntent("summarize-current-file")}>{formatLabel(geminiAgentLabels.panelSummarize)}</button>
          <button type="button" className="modal-btn" disabled={snapshot.busy} onClick={() => void service.runIntent("rewrite-selection", prompt)}>{formatLabel(geminiAgentLabels.panelRewriteSelection)}</button>
          <button type="button" className="modal-btn" onClick={() => setPaneFocus("preview")}>{formatLabel(geminiAgentLabels.toolbarFocusPreview)}</button>
          <button type="button" className="modal-btn" onClick={() => setPaneFocus("draft")}>{formatLabel(geminiAgentLabels.toolbarFocusDraft)}</button>
        </div>
        <label style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelChatInput)}</span>
          <textarea
            value={prompt}
            placeholder={formatLabel(geminiAgentLabels.statusPromptPlaceholder)}
            style={{ ...inputStyle, minHeight: 132 }}
            onChange={(event) => setPrompt(event.currentTarget.value)}
          />
        </label>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(geminiAgentLabels.panelComposerHint)}</span>
          <button type="button" className="modal-btn modal-btn-primary" disabled={snapshot.busy || !prompt.trim()} onClick={runPrompt}>
            {formatLabel(geminiAgentLabels.panelRunPrompt)}
          </button>
        </div>
      </div>
    </div>
  );

  const previewSurface = (
    <PreviewSurface
      formatLabel={formatLabel}
      markdown={previewMarkdown}
      sourceLabel={previewSource}
    />
  );

  const draftSurface = (
    <DraftSurface
      formatLabel={formatLabel}
      draft={snapshot.pendingDraft ?? ""}
      busy={snapshot.busy}
      writebackBlockedReason={snapshot.writebackBlockedReason}
      onChange={(value) => service.updateDraft(value)}
      onApplySelection={() => void service.applyDraft("selection")}
      onReplaceDocument={() => void service.applyDraft("document")}
      onClearDraft={() => service.clearDraft()}
    />
  );

  const detailSurface = paneFocus === "draft" ? draftSurface : previewSurface;

  return (
    <div className="extension-manager-pane editor-pane-container" data-testid="gemini-agent-pane" role="region" aria-label={formatLabel(geminiAgentLabels.viewTitle)}>
      {isDragging && <div className="editor-splitter-drag-shield" />}
      <div className="view-toolbar" aria-label={formatLabel(geminiAgentLabels.toolbarLabel)}>
        <div className="view-toolbar-group">
          <button
            type="button"
            className={`view-toolbar-btn ${effectiveSidebarOpen ? "active" : ""}`}
            title={formatLabel(geminiAgentLabels.toolbarToggleSidebar)}
            onClick={() => embedBrowserInShellSidebar ? onShellSidebarToggle?.(!effectiveSidebarOpen) : setSidebarOpen((current) => !current)}
          >
            <ToolbarIcon name={effectiveSidebarOpen ? "sidebar-open" : "sidebar"} />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "single" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarSinglePane)} onClick={() => setLayoutMode("single")}>
            <ToolbarIcon name="single" />
          </button>
          <button type="button" className={`view-toolbar-btn ${layoutMode === "split" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarSplitScreen)} onClick={() => setLayoutMode("split")}>
            <ToolbarIcon name="split" />
          </button>
        </div>
        <div className="view-toolbar-group">
          <button type="button" className={`view-toolbar-btn ${paneFocus === "conversation" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarFocusConversation)} onClick={() => setPaneFocus("conversation")}>
            C
          </button>
          <button type="button" className={`view-toolbar-btn ${paneFocus === "preview" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarFocusPreview)} onClick={() => setPaneFocus("preview")}>
            P
          </button>
          <button type="button" className={`view-toolbar-btn ${paneFocus === "draft" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarFocusDraft)} onClick={() => setPaneFocus("draft")}>
            D
          </button>
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
              <ThreadList
                threads={snapshot.threads}
                activeThreadId={snapshot.activeThreadId}
                formatLabel={formatLabel}
                onNewThread={() => {
                  service.createThread();
                }}
                onSelectThread={(threadId) => {
                  service.selectThread(threadId);
                }}
              />
              <div style={cardStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelContext)}</span>
                <div className="settings-session-grid">
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextProject)}</span><span className="settings-session-value">{context?.project?.name ?? formatLabel(geminiAgentLabels.panelContextNone)}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextFile)}</span><span className="settings-session-value">{context?.file?.path ?? context?.file?.name ?? formatLabel(geminiAgentLabels.panelContextNone)}</span></div>
                  <div className="settings-session-item"><span className="settings-session-label">{formatLabel(geminiAgentLabels.panelContextSelection)}</span><span className="settings-session-value">{selectionLength > 0 ? `${selectionLength} ${formatLabel(geminiAgentLabels.panelSelectionCountSuffix)}` : formatLabel(geminiAgentLabels.panelContextNone)}</span></div>
                </div>
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
                  {conversationSurface}
                </div>
                <div onMouseDown={startSplitDrag} className={`editor-splitter ${isDragging ? "dragging" : ""}`} role="separator" aria-orientation="vertical" aria-label={formatLabel(geminiAgentLabels.toolbarResizePanes)}>
                  <div className="editor-splitter-handle" />
                </div>
                <div className={`editor-pane-column editor-pane-column--split-right-${100 - splitBand}`} style={{ display: "grid", gap: 16, paddingLeft: 12 }}>
                  {detailSurface}
                </div>
              </div>
            ) : (
              paneFocus === "conversation" ? conversationSurface : detailSurface
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
