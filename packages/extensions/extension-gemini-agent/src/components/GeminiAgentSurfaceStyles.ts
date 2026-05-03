import type React from "react";

export const geminiCardStyle: React.CSSProperties = {
  display: "grid",
  gap: 10,
  padding: 12,
  border: "1px solid var(--border-primary)",
  borderRadius: 8,
  background: "var(--bg-secondary)",
};

export const geminiPillStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 4,
  padding: "2px 8px",
  borderRadius: 6,
  border: "1px solid var(--border-primary)",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

export const geminiButtonStyle: React.CSSProperties = {
  border: "1px solid var(--border-primary)",
  background: "var(--bg-primary)",
  color: "var(--fg-primary)",
  borderRadius: 8,
  padding: "6px 10px",
  fontSize: 11,
  cursor: "pointer",
};

export const geminiInputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-primary)",
  color: "var(--fg-primary)",
  border: "1px solid var(--border-primary)",
  borderRadius: 8,
  padding: "12px 14px",
  fontSize: 12,
  lineHeight: 1.6,
  resize: "vertical",
};
