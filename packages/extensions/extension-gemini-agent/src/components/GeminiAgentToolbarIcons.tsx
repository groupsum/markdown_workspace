import React from "react";

export type GeminiToolbarIconName = "sidebar" | "sidebar-open" | "single" | "split" | "close";
export type GeminiFocusIconName = "conversation" | "preview" | "draft";

export function ToolbarIcon({ name }: { readonly name: GeminiToolbarIconName }) {
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

export function FocusIcon({ name }: { readonly name: GeminiFocusIconName }) {
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
  if (name === "conversation") {
    return <svg {...common}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v6A2.5 2.5 0 0 1 17.5 15H10l-4 4v-4H6.5A2.5 2.5 0 0 1 4 12.5z" /></svg>;
  }
  if (name === "preview") {
    return <svg {...common}><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></svg>;
  }
  return <svg {...common}><path d="M4 19.5V4.5A1.5 1.5 0 0 1 5.5 3h8.879a1.5 1.5 0 0 1 1.06.44l3.121 3.12A1.5 1.5 0 0 1 19 7.621V19.5A1.5 1.5 0 0 1 17.5 21h-12A1.5 1.5 0 0 1 4 19.5Z" /><path d="M8 13h8" /><path d="M8 17h5" /><path d="M14 3v4h4" /></svg>;
}
