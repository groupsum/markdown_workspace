import React from "react";
import type { GeminiPromptMention, GeminiAgentViewProps } from "../types.js";
import type { WorkspaceFileSummary } from "@mdwrk/extension-host";
import { geminiAgentLabels } from "../i18n.js";
import { geminiCardStyle, geminiInputStyle, geminiPillStyle } from "./GeminiAgentSurfaceStyles.js";

interface ActiveMentionQuery {
  readonly start: number;
  readonly end: number;
  readonly query: string;
}

function getActiveMentionQuery(prompt: string, cursor: number): ActiveMentionQuery | null {
  const clampedCursor = Math.max(0, Math.min(cursor, prompt.length));
  const beforeCursor = prompt.slice(0, clampedCursor);
  const match = beforeCursor.match(/(?:^|\s)@([^\s@]*)$/);
  if (!match || match.index == null) return null;
  return {
    start: match.index + match[0].lastIndexOf("@"),
    end: clampedCursor,
    query: match[1] ?? "",
  };
}

export function GeminiAgentPromptComposer({
  prompt,
  busy,
  formatLabel,
  mentionableFiles,
  mentionedFiles,
  onPromptChange,
  onSend,
}: {
  readonly prompt: string;
  readonly busy: boolean;
  readonly formatLabel: GeminiAgentViewProps["formatLabel"];
  readonly mentionableFiles: readonly WorkspaceFileSummary[];
  readonly mentionedFiles: readonly GeminiPromptMention[];
  readonly onPromptChange: (value: string) => void;
  readonly onSend: () => void;
}) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [activeMention, setActiveMention] = React.useState<ActiveMentionQuery | null>(null);
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);

  const suggestions = React.useMemo(() => {
    if (!activeMention) return [];
    const normalized = activeMention.query.trim().toLowerCase();
    return mentionableFiles
      .filter((file) => {
        if (!normalized) return true;
        return file.path.toLowerCase().includes(normalized) || file.name.toLowerCase().includes(normalized);
      })
      .sort((left, right) => {
        const leftStarts = Number(left.path.toLowerCase().startsWith(normalized) || left.name.toLowerCase().startsWith(normalized));
        const rightStarts = Number(right.path.toLowerCase().startsWith(normalized) || right.name.toLowerCase().startsWith(normalized));
        if (leftStarts !== rightStarts) return rightStarts - leftStarts;
        return left.path.localeCompare(right.path);
      })
      .slice(0, 7);
  }, [activeMention, mentionableFiles]);

  React.useEffect(() => {
    setHighlightedIndex(0);
  }, [activeMention?.query]);

  const syncMentionQuery = React.useCallback((nextPrompt: string, cursor: number) => {
    setActiveMention(getActiveMentionQuery(nextPrompt, cursor));
  }, []);

  const selectSuggestion = React.useCallback((file: WorkspaceFileSummary) => {
    const textarea = textareaRef.current;
    if (!textarea || !activeMention) return;
    const nextPrompt = `${prompt.slice(0, activeMention.start)}@${file.path} ${prompt.slice(activeMention.end)}`;
    const nextCursor = activeMention.start + file.path.length + 2;
    onPromptChange(nextPrompt);
    setActiveMention(null);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }, [activeMention, onPromptChange, prompt]);

  return (
    <>
      <label style={{ display: "grid", gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelChatInput)}</span>
        <textarea
          ref={textareaRef}
          value={prompt}
          placeholder={formatLabel(geminiAgentLabels.statusPromptPlaceholder)}
          style={{ ...geminiInputStyle, minHeight: 132 }}
          onChange={(event) => {
            const nextPrompt = event.currentTarget.value;
            onPromptChange(nextPrompt);
            syncMentionQuery(nextPrompt, event.currentTarget.selectionStart ?? nextPrompt.length);
          }}
          onClick={(event) => syncMentionQuery(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
          onKeyUp={(event) => syncMentionQuery(event.currentTarget.value, event.currentTarget.selectionStart ?? event.currentTarget.value.length)}
          onKeyDown={(event) => {
            if (suggestions.length === 0) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlightedIndex((current) => (current + 1) % suggestions.length);
              return;
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlightedIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
              return;
            }
            if (event.key === "Escape") {
              setActiveMention(null);
              return;
            }
            if ((event.key === "Enter" || event.key === "Tab") && activeMention) {
              event.preventDefault();
              const suggestion = suggestions[highlightedIndex];
              if (suggestion) {
                selectSuggestion(suggestion);
              }
            }
          }}
        />
      </label>
      {suggestions.length > 0 && activeMention && (
        <div style={{ ...geminiCardStyle, gap: 6, marginTop: -2 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {formatLabel(geminiAgentLabels.panelMentionSuggestions)}
          </span>
          <div style={{ display: "grid", gap: 6 }}>
            {suggestions.map((file, index) => (
              <button
                key={file.path}
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectSuggestion(file);
                }}
                style={{
                  display: "grid",
                  gap: 2,
                  textAlign: "left",
                  border: "1px solid var(--border-primary)",
                  borderRadius: 6,
                  padding: "8px 10px",
                  background: index === highlightedIndex ? "var(--bg-tertiary)" : "var(--bg-primary)",
                  color: "var(--fg-primary)",
                  cursor: "pointer",
                }}
              >
                <strong style={{ fontSize: 12 }}>{file.name}</strong>
                <span style={{ fontSize: 11, color: "var(--fg-secondary)" }}>{file.path}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {mentionedFiles.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {formatLabel(geminiAgentLabels.panelMentionedFiles)}
          </span>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {mentionedFiles.map((mention) => (
              <span key={mention.path} style={geminiPillStyle} title={mention.path}>
                @{mention.name}
              </span>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(geminiAgentLabels.panelComposerHint)}</span>
        <button type="button" className="modal-btn modal-btn-primary" disabled={busy || !prompt.trim()} onClick={onSend}>
          {formatLabel(geminiAgentLabels.panelRunPrompt)}
        </button>
      </div>
    </>
  );
}
