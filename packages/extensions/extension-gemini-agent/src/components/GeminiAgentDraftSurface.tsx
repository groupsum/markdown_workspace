import React from "react";
import type { GeminiAgentViewProps } from "../types.js";
import { geminiAgentLabels } from "../i18n.js";
import { geminiCardStyle, geminiInputStyle } from "./GeminiAgentSurfaceStyles.js";

export function GeminiAgentDraftSurface({
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
    <div style={{ ...geminiCardStyle, height: "100%", alignContent: "start" }}>
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
        style={{ ...geminiInputStyle, minHeight: 220, fontFamily: "var(--font-mono, monospace)" }}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
      {writebackBlockedReason && <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{writebackBlockedReason}</p>}
    </div>
  );
}
