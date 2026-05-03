import React from "react";
import type { GeminiChatThread, GeminiAgentViewProps, GeminiPromptMention } from "../types.js";
import type { WorkspaceFileSummary } from "@mdwrk/extension-host";
import { geminiAgentLabels } from "../i18n.js";
import { GeminiAgentMessageList } from "./GeminiAgentMessageList.js";
import { GeminiAgentPromptComposer } from "./GeminiAgentPromptComposer.js";
import { geminiButtonStyle, geminiCardStyle } from "./GeminiAgentSurfaceStyles.js";

export function GeminiAgentConversationSurface({
  activeThread,
  prompt,
  busy,
  formatLabel,
  transcriptMaxHeight,
  mentionableFiles,
  mentionedFiles,
  onPromptChange,
  onRunPrompt,
  onCreateThread,
  onRefreshContext,
  onSummarize,
  onRewriteSelection,
  onFocusPreview,
  onFocusDraft,
}: {
  readonly activeThread: GeminiChatThread | null;
  readonly prompt: string;
  readonly busy: boolean;
  readonly formatLabel: GeminiAgentViewProps["formatLabel"];
  readonly transcriptMaxHeight: string;
  readonly mentionableFiles: readonly WorkspaceFileSummary[];
  readonly mentionedFiles: readonly GeminiPromptMention[];
  readonly onPromptChange: (value: string) => void;
  readonly onRunPrompt: () => void;
  readonly onCreateThread: () => void;
  readonly onRefreshContext: () => void;
  readonly onSummarize: () => void;
  readonly onRewriteSelection: () => void;
  readonly onFocusPreview: () => void;
  readonly onFocusDraft: () => void;
}) {
  return (
    <div style={{ ...geminiCardStyle, height: "100%", alignContent: "start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelConversation)}</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" style={geminiButtonStyle} onClick={onCreateThread}>{formatLabel(geminiAgentLabels.panelNewThread)}</button>
          <button type="button" style={geminiButtonStyle} disabled={busy} onClick={onRefreshContext}>{formatLabel(geminiAgentLabels.panelRefresh)}</button>
        </div>
      </div>
      <div style={{ display: "grid", gap: 8 }}>
        <div style={{ display: "grid", gap: 4 }}>
          <strong style={{ fontSize: 14 }}>{activeThread?.title ?? formatLabel(geminiAgentLabels.panelNewThread)}</strong>
          <span className="settings-session-value">
            {activeThread ? `${activeThread.messages.length} ${formatLabel(geminiAgentLabels.panelThreadCount)}` : formatLabel(geminiAgentLabels.panelThreadEmpty)}
          </span>
        </div>
        <GeminiAgentMessageList
          messages={activeThread?.messages ?? []}
          formatLabel={formatLabel}
          maxHeight={transcriptMaxHeight}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="modal-btn" disabled={busy} onClick={onSummarize}>{formatLabel(geminiAgentLabels.panelSummarize)}</button>
          <button type="button" className="modal-btn" disabled={busy} onClick={onRewriteSelection}>{formatLabel(geminiAgentLabels.panelRewriteSelection)}</button>
          <button type="button" className="modal-btn" onClick={onFocusPreview}>{formatLabel(geminiAgentLabels.toolbarFocusPreview)}</button>
          <button type="button" className="modal-btn" onClick={onFocusDraft}>{formatLabel(geminiAgentLabels.toolbarFocusDraft)}</button>
        </div>
        <GeminiAgentPromptComposer
          prompt={prompt}
          busy={busy}
          formatLabel={formatLabel}
          mentionableFiles={mentionableFiles}
          mentionedFiles={mentionedFiles}
          onPromptChange={onPromptChange}
          onSend={onRunPrompt}
        />
      </div>
    </div>
  );
}
