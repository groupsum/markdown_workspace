import React from "react";
import type { GeminiChatMessage, GeminiAgentViewProps } from "../types.js";
import { geminiAgentLabels } from "../i18n.js";

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

export function GeminiAgentMessageList({
  messages,
  formatLabel,
  maxHeight,
}: {
  readonly messages: readonly GeminiChatMessage[];
  readonly formatLabel: GeminiAgentViewProps["formatLabel"];
  readonly maxHeight: string;
}) {
  return (
    <div
      aria-label={formatLabel(geminiAgentLabels.panelChatTranscript)}
      style={{
        display: "grid",
        gap: 10,
        minHeight: 280,
        maxHeight,
        overflowY: "auto",
        padding: 6,
      }}
    >
      {messages.length ? messages.map((message) => (
        <article
          key={message.id}
          style={{
            ...messageTone(message.role),
            display: "grid",
            gap: 6,
            width: "min(92%, 760px)",
            padding: "10px 12px",
            borderRadius: 8,
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
  );
}
