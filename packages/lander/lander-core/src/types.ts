import type { LanderSite, PageSpec } from "@mdwrk/lander-content-contract";

export interface LanderDiagnostic {
  level: "error" | "warning";
  code: string;
  message: string;
  slug?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface CompiledPage extends PageSpec {
  path: string;
  canonicalUrl: string;
  breadcrumbs: BreadcrumbItem[];
  internalLinks: string[];
  wordCount: number;
}

export interface CompiledLanderSite extends Omit<LanderSite, "pages"> {
  pages: CompiledPage[];
  pageByPath: Map<string, CompiledPage>;
  diagnostics: LanderDiagnostic[];
}

export interface SitemapEntry {
  loc: string;
  lastmod?: string;
}
