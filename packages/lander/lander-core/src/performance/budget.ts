import type { LanderCacheHeaderManifest } from "../cache/resource-policy.js";
import { normalizeCacheResourcePath } from "../cache/resource-policy.js";

export type LanderRouteScriptKind =
  | "theme-bootstrap"
  | "theme-toggle"
  | "navigation"
  | "demo-controls"
  | "syntax-highlighting"
  | "analytics"
  | "enhancement";

export interface LanderRouteScriptFact {
  kind: LanderRouteScriptKind;
  required: boolean;
  reason: string;
  inlineBytes?: number;
  externalBytes?: number;
}

export interface LanderMotionFact {
  selector: string;
  firstViewport: boolean;
  animatedProperties: string[];
  reducedMotion: boolean;
  migrationDebt?: boolean;
}

export interface LanderCriticalPathRouteInput {
  path: string;
  criticalCssProfileId: string;
  criticalCssBytes: number;
  deferredStylesheetHref: string;
  renderBlockingStylesheets?: string[];
  scripts?: LanderRouteScriptFact[];
  motion?: LanderMotionFact[];
  budget?: Partial<LanderPerformanceBudget>;
}

export interface LanderCriticalPathRouteEntry extends LanderCriticalPathRouteInput {
  path: string;
  renderBlockingStylesheets: string[];
  scripts: LanderRouteScriptFact[];
  motion: LanderMotionFact[];
  budget: LanderPerformanceBudget;
}

export interface LanderCriticalPathManifest {
  version: 1;
  generatedAt: string;
  routes: LanderCriticalPathRouteEntry[];
}

export interface LanderPerformanceBudget {
  maxCriticalCssBytes: number;
  maxRenderBlockingStylesheets: number;
  maxInlineScriptBytes: number;
  maxExternalScriptBytes: number;
}

export interface LanderPerformanceValidationInput {
  manifest: LanderCriticalPathManifest;
  cacheManifest?: LanderCacheHeaderManifest;
}

export interface LanderSyntaxHighlightingRouteGateInput {
  routePath: string;
  markdownSources: readonly string[];
  inlineBytes?: number;
  externalBytes?: number;
}

export interface LanderSyntaxHighlightingRouteGate {
  routePath: string;
  required: boolean;
  highlightableCodeBlockCount: number;
  fact: LanderRouteScriptFact & { kind: "syntax-highlighting" };
}

export interface LanderPerformanceDiagnostic {
  level: "error" | "warning";
  code: string;
  path?: string;
  message: string;
}

export const defaultLanderPerformanceBudget: LanderPerformanceBudget = {
  maxCriticalCssBytes: 14_000,
  maxRenderBlockingStylesheets: 0,
  maxInlineScriptBytes: 18_000,
  maxExternalScriptBytes: 0,
};

const DISALLOWED_FIRST_VIEWPORT_ANIMATION_PROPERTIES = new Set([
  "width",
  "height",
  "top",
  "right",
  "bottom",
  "left",
  "margin",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "padding",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "filter",
  "backdrop-filter",
  "box-shadow",
  "background",
  "background-color",
]);

export function defineRouteScriptFact<T extends LanderRouteScriptFact>(fact: T): T {
  if (!fact.kind) throw new Error("Route script fact kind is required.");
  if (!fact.reason.trim()) throw new Error(`Route script fact ${fact.kind} requires a reason.`);
  return fact;
}

export function countHighlightableCodeBlocks(markdownSources: readonly string[]): number {
  let count = 0;
  for (const source of markdownSources) {
    const text = String(source ?? "");
    for (const match of text.matchAll(/^```([A-Za-z][\w-]*)\s*$/gm)) {
      if (match[1]?.trim()) count += 1;
    }
  }
  return count;
}

export function defineSyntaxHighlightingRouteGate(input: LanderSyntaxHighlightingRouteGateInput): LanderSyntaxHighlightingRouteGate {
  const routePath = normalizeCacheResourcePath(input.routePath);
  const highlightableCodeBlockCount = countHighlightableCodeBlocks(input.markdownSources);
  const required = highlightableCodeBlockCount > 0;
  return {
    routePath,
    required,
    highlightableCodeBlockCount,
    fact: defineRouteScriptFact({
      kind: "syntax-highlighting",
      required,
      reason: required
        ? `${routePath} has ${highlightableCodeBlockCount} highlightable code block${highlightableCodeBlockCount === 1 ? "" : "s"}`
        : `${routePath} has no highlightable code blocks`,
      inlineBytes: required ? (input.inlineBytes ?? 0) : 0,
      externalBytes: required ? (input.externalBytes ?? 0) : 0,
    }),
  };
}

export function buildCriticalPathManifest(
  routes: LanderCriticalPathRouteInput[],
  generatedAt: Date | string = new Date(),
): LanderCriticalPathManifest {
  const generatedDate = generatedAt instanceof Date ? generatedAt : new Date(generatedAt);
  if (Number.isNaN(generatedDate.valueOf())) {
    throw new Error(`Invalid critical-path manifest date: ${String(generatedAt)}`);
  }
  return {
    version: 1,
    generatedAt: generatedDate.toUTCString(),
    routes: routes
      .map((route) => ({
        ...route,
        path: normalizeCacheResourcePath(route.path),
        deferredStylesheetHref: normalizeCacheResourcePath(route.deferredStylesheetHref),
        renderBlockingStylesheets: route.renderBlockingStylesheets ?? [],
        scripts: route.scripts ?? [],
        motion: route.motion ?? [],
        budget: { ...defaultLanderPerformanceBudget, ...route.budget },
      }))
      .sort((left, right) => left.path.localeCompare(right.path)),
  };
}

export function routeRequiresScript(route: LanderCriticalPathRouteEntry, kind: LanderRouteScriptKind): boolean {
  return route.scripts.some((script) => script.kind === kind && script.required);
}

export function validateLanderPerformanceBudget(input: LanderPerformanceValidationInput): LanderPerformanceDiagnostic[] {
  const diagnostics: LanderPerformanceDiagnostic[] = [];
  const cacheEntries = new Map((input.cacheManifest?.entries ?? []).map((entry) => [entry.path, entry]));

  for (const route of input.manifest.routes) {
    const budget = route.budget;
    if (!route.criticalCssProfileId.trim()) {
      diagnostics.push({ level: "error", code: "criticalCss.profile.missing", path: route.path, message: "Route is missing critical CSS profile metadata." });
    }
    if (route.criticalCssBytes > budget.maxCriticalCssBytes) {
      diagnostics.push({ level: "error", code: "criticalCss.bytes.exceeded", path: route.path, message: `Critical CSS is ${route.criticalCssBytes} bytes, above ${budget.maxCriticalCssBytes}.` });
    }
    if (route.renderBlockingStylesheets.length > budget.maxRenderBlockingStylesheets) {
      diagnostics.push({ level: "error", code: "stylesheet.renderBlocking", path: route.path, message: "Route keeps full stylesheet render-blocking while critical CSS is enabled." });
    }
    if (!route.deferredStylesheetHref || route.deferredStylesheetHref === "/") {
      diagnostics.push({ level: "error", code: "stylesheet.deferred.missing", path: route.path, message: "Route is missing deferred stylesheet metadata." });
    }
    for (const script of route.scripts) {
      if (script.kind === "syntax-highlighting" && !script.required && ((script.inlineBytes ?? 0) > 0 || (script.externalBytes ?? 0) > 0)) {
        diagnostics.push({ level: "error", code: "script.syntaxHighlighting.unused", path: route.path, message: "Syntax highlighting script is emitted on a route without highlightable code blocks." });
      }
      if (!script.required && ((script.inlineBytes ?? 0) > 0 || (script.externalBytes ?? 0) > 0)) {
        diagnostics.push({ level: "error", code: "script.unusedGoverned", path: route.path, message: `${script.kind} script is emitted without a route requirement.` });
      }
      if ((script.inlineBytes ?? 0) > budget.maxInlineScriptBytes) {
        diagnostics.push({ level: "error", code: "script.inlineBytes.exceeded", path: route.path, message: `${script.kind} inline script exceeds the route budget.` });
      }
      if ((script.externalBytes ?? 0) > budget.maxExternalScriptBytes) {
        diagnostics.push({ level: "error", code: "script.externalBytes.exceeded", path: route.path, message: `${script.kind} external script exceeds the route budget.` });
      }
    }
    for (const motion of route.motion) {
      if (!motion.firstViewport || motion.migrationDebt) continue;
      if (!motion.reducedMotion) {
        diagnostics.push({ level: "error", code: "motion.reducedMotion.missing", path: route.path, message: `${motion.selector} lacks reduced-motion behavior.` });
      }
      const disallowed = motion.animatedProperties.filter((property) => DISALLOWED_FIRST_VIEWPORT_ANIMATION_PROPERTIES.has(property));
      if (disallowed.length) {
        diagnostics.push({ level: "error", code: "motion.nonComposited", path: route.path, message: `${motion.selector} animates non-composited properties: ${disallowed.join(", ")}.` });
      }
    }
  }

  for (const entry of cacheEntries.values()) {
    const type = entry.contentType?.toLowerCase() ?? "";
    const textCompatible = type.startsWith("text/") || ["application/json", "application/xml", "image/svg+xml", "text/css"].some((value) => type.startsWith(value));
    if (textCompatible && entry.compressionEligible !== true) {
      diagnostics.push({ level: "error", code: "resource.compressionMetadata.missing", path: entry.path, message: "Text-compatible generated asset is missing compression eligibility metadata." });
    }
  }

  return diagnostics;
}
