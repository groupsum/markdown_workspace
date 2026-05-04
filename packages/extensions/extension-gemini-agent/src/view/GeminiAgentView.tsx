import React from "react";
import { geminiAgentLabels } from "../i18n.js";
import type { GeminiAgentViewProps } from "../types.js";
import { GeminiAgentConversationSurface } from "../components/GeminiAgentConversationSurface.js";
import { GeminiAgentDraftSurface } from "../components/GeminiAgentDraftSurface.js";
import { GeminiAgentPreviewSurface } from "../components/GeminiAgentPreviewSurface.js";
import { GeminiAgentThreadList } from "../components/GeminiAgentThreadList.js";
import { FocusIcon, ToolbarIcon } from "../components/GeminiAgentToolbarIcons.js";
import { geminiCardStyle, geminiPillStyle } from "../components/GeminiAgentSurfaceStyles.js";
import type { GeminiPromptMention } from "../types.js";
import type { WorkspaceFileSummary } from "@mdwrk/extension-host";
type GeminiPaneFocus = "conversation" | "preview" | "draft";

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
      document.body.classList.add("is-resizing-pane");
    } else {
      document.body.classList.remove("is-resizing-pane");
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("is-resizing-pane");
    };
  }, [isDragging]);

  return {
    splitBand: getSplitBand(splitPos),
    isDragging,
    splitContainerRef,
    startSplitDrag: () => setIsDragging(true),
  };
}

function extractPromptMentionKeys(prompt: string): readonly string[] {
  const matches = prompt.matchAll(/(^|\s)@([^\s@]+)/g);
  const keys = new Set<string>();
  for (const match of matches) {
    const token = match[2]?.trim();
    if (token) {
      keys.add(token);
    }
  }
  return Array.from(keys);
}

function resolvePromptMentions(prompt: string, files: readonly WorkspaceFileSummary[]): readonly GeminiPromptMention[] {
  const mentions: GeminiPromptMention[] = [];
  const seen = new Set<string>();
  for (const key of extractPromptMentionKeys(prompt)) {
    const normalized = key.replace(/^\/+/, "").toLowerCase();
    const exactPath = files.find((file) => file.path.replace(/^\/+/, "").toLowerCase() === normalized);
    const exactNameMatches = files.filter((file) => file.name.toLowerCase() === normalized);
    const match = exactPath ?? (exactNameMatches.length === 1 ? exactNameMatches[0] : null);
    if (!match || seen.has(match.path)) continue;
    seen.add(match.path);
    mentions.push({
      path: match.path,
      name: match.name,
    });
  }
  return mentions;
}

export const GeminiAgentView: React.FC<GeminiAgentViewProps> = ({
  close,
  formatLabel,
  service,
  input,
  shellSidebarOpen,
  onShellSidebarToggle,
  embedBrowserInShellSidebar = false,
  initialLayoutMode = "split",
  initialPaneFocus = "conversation",
}) => {
  const snapshot = React.useSyncExternalStore(service.subscribe, service.getSnapshot, service.getSnapshot);
  const [prompt, setPrompt] = React.useState(input?.prompt ?? "");
  const [settingsSummary, setSettingsSummary] = React.useState<Record<string, unknown> | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [layoutMode, setLayoutMode] = React.useState<"single" | "split">(initialLayoutMode);
  const [paneFocus, setPaneFocus] = React.useState<GeminiPaneFocus>(initialPaneFocus);
  const [mentionableFiles, setMentionableFiles] = React.useState<readonly WorkspaceFileSummary[]>([]);
  const { splitBand, isDragging, splitContainerRef, startSplitDrag } = useWorkspaceModuleSplit();
  const lastIntentRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    void Promise.all([
      service.refreshContext(),
      service.listMentionableFiles().then((files) => setMentionableFiles(files)),
      service.loadSettings().then((settings) => {
        setSettingsSummary({
          endpoint: settings.endpoint,
          model: settings.model,
          authMode: settings.authMode,
          hasApiKey: Boolean(settings.apiKey),
          allowWriteBack: settings.allowWriteBack,
          autoAttachDocument: settings.autoAttachDocument,
          autoAttachSelection: settings.autoAttachSelection,
        });
      }),
    ]);
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
  const mentionedFiles = React.useMemo(() => resolvePromptMentions(prompt, mentionableFiles), [mentionableFiles, prompt]);

  const runPrompt = () => {
    const nextPrompt = prompt.trim();
    if (!nextPrompt) return;
    void service.runIntent("custom-prompt", nextPrompt, { mentionPaths: mentionedFiles.map((mention) => mention.path) });
  };

  const conversationSurface = (
    <GeminiAgentConversationSurface
      activeThread={activeThread}
      prompt={prompt}
      busy={snapshot.busy}
      formatLabel={formatLabel}
      transcriptMaxHeight={layoutMode === "split" ? "min(60vh, 640px)" : "min(68vh, 720px)"}
      mentionableFiles={mentionableFiles}
      mentionedFiles={mentionedFiles}
      onPromptChange={setPrompt}
      onRunPrompt={runPrompt}
      onCreateThread={() => service.createThread()}
      onRefreshContext={() => {
        void Promise.all([
          service.refreshContext(),
          service.listMentionableFiles().then((files) => setMentionableFiles(files)),
        ]);
      }}
      onSummarize={() => void service.runIntent("summarize-current-file")}
      onRewriteSelection={() => void service.runIntent("rewrite-selection", prompt, { mentionPaths: mentionedFiles.map((mention) => mention.path) })}
      onFocusPreview={() => setPaneFocus("preview")}
      onFocusDraft={() => setPaneFocus("draft")}
    />
  );

  const previewSurface = (
    <GeminiAgentPreviewSurface
      formatLabel={formatLabel}
      markdown={previewMarkdown}
      sourceLabel={previewSource}
    />
  );

  const draftSurface = (
    <GeminiAgentDraftSurface
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
    <div className="gemini-agent-pane editor-pane-container" data-testid="gemini-agent-pane" role="region" aria-label={formatLabel(geminiAgentLabels.viewTitle)}>
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
          <span className="view-toolbar-divider" />
          <button type="button" className={`view-toolbar-btn ${paneFocus === "conversation" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarFocusConversation)} onClick={() => setPaneFocus("conversation")}>
            <FocusIcon name="conversation" />
          </button>
          <button type="button" className={`view-toolbar-btn ${paneFocus === "preview" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarFocusPreview)} onClick={() => setPaneFocus("preview")}>
            <FocusIcon name="preview" />
          </button>
          <button type="button" className={`view-toolbar-btn ${paneFocus === "draft" ? "active" : ""}`} title={formatLabel(geminiAgentLabels.toolbarFocusDraft)} onClick={() => setPaneFocus("draft")}>
            <FocusIcon name="draft" />
          </button>
        </div>
        <div className="view-toolbar-group" style={{ marginLeft: "auto", justifyContent: "flex-end" }}>
          <span className="view-toolbar-divider" />
          <button type="button" className="view-toolbar-btn" title={formatLabel(geminiAgentLabels.toolbarClose)} onClick={() => void close()}>
            <ToolbarIcon name="close" />
          </button>
        </div>
      </div>
      <div className="editor-pane-shell">
        <div className="editor-pane-body is-split">
          {!embedBrowserInShellSidebar && effectiveSidebarOpen && (
            <aside className="pane-sidebar editor-pane-column" style={{ width: "min(320px, 28vw)", padding: 12, gap: 12 }}>
              <GeminiAgentThreadList
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
              <div style={geminiCardStyle}>
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
                <span style={geminiPillStyle}>{configured ? formatLabel(geminiAgentLabels.statusConfigured) : formatLabel(geminiAgentLabels.statusMissingConfiguration)}</span>
                <span style={geminiPillStyle}>{settingsSummary?.allowWriteBack ? formatLabel(geminiAgentLabels.statusWritebackEnabled) : formatLabel(geminiAgentLabels.statusWritebackDisabled)}</span>
                <span style={geminiPillStyle}>{snapshot.busy ? formatLabel(geminiAgentLabels.statusRunning) : formatLabel(geminiAgentLabels.statusIdle)}</span>
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
              <div style={geminiCardStyle}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelLastInfo)}</span>
                <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{snapshot.infoMessage}</p>
              </div>
            )}
            {snapshot.lastError && (
              <div style={geminiCardStyle}>
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
