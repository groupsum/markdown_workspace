import React from "react";
import type { GeminiChatThread, GeminiAgentViewProps } from "../types.js";
import { geminiAgentLabels } from "../i18n.js";
import { geminiCardStyle } from "./GeminiAgentSurfaceStyles.js";

export function GeminiAgentThreadList({
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
      <div style={geminiCardStyle}>
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
                  style={{ justifyContent: "space-between", alignItems: "start", textAlign: "left", paddingBlock: 10, borderRadius: 8 }}
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
