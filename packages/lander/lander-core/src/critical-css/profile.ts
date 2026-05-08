export interface LanderCriticalCssProfile {
  id: string;
  css: string;
}

export function defineCriticalCssProfile<T extends LanderCriticalCssProfile>(profile: T): T {
  if (!profile.id.trim()) throw new Error("Critical CSS profile id is required.");
  if (!profile.css.trim()) throw new Error(`Critical CSS profile ${profile.id} must include CSS.`);
  return profile;
}

export function normalizeCriticalCss(css: string): string {
  return String(css ?? "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>])\s*/g, "$1")
    .trim();
}

export function renderCriticalCssStyle(profile: LanderCriticalCssProfile): string {
  const css = normalizeCriticalCss(profile.css);
  return `<style data-lander-critical-css="${escapeAttribute(profile.id)}">${css}</style>`;
}

export function renderDeferredStylesheetLink(href: string): string {
  const escapedHref = escapeAttribute(href);
  return [
    `<link rel="preload" href="${escapedHref}" as="style" onload="this.onload=null;this.rel='stylesheet'">`,
    `<noscript><link rel="stylesheet" href="${escapedHref}"></noscript>`,
  ].join("");
}

function escapeAttribute(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
