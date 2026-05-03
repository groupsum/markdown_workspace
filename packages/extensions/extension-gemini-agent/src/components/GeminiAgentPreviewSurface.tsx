import React from "react";
import { MarkdownRenderer } from "@mdwrk/markdown-renderer-react";
import type { GeminiAgentViewProps } from "../types.js";
import { geminiAgentLabels } from "../i18n.js";
import { geminiCardStyle, geminiPillStyle } from "./GeminiAgentSurfaceStyles.js";

export function GeminiAgentPreviewSurface({
  formatLabel,
  markdown,
  sourceLabel,
}: {
  readonly formatLabel: GeminiAgentViewProps["formatLabel"];
  readonly markdown: string;
  readonly sourceLabel: string;
}) {
  return (
    <div style={{ ...geminiCardStyle, height: "100%", alignContent: "start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{formatLabel(geminiAgentLabels.panelPreview)}</span>
        <span style={geminiPillStyle}>{sourceLabel}</span>
      </div>
      {markdown.trim() ? (
        <div className="preview-pane" style={{ minHeight: 0, borderRadius: 8 }}>
          <MarkdownRenderer markdown={markdown} />
        </div>
      ) : (
        <p style={{ margin: 0, fontSize: 12, color: "var(--fg-secondary)" }}>{formatLabel(geminiAgentLabels.panelPreviewEmpty)}</p>
      )}
    </div>
  );
}
