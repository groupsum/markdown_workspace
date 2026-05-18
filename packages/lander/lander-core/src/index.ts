import type { LanderSite, PageSpec, SectionSpec } from "@mdwrk/lander-content-contract";
import { validateComponentIntent, validateStructuredDataIntent } from "@mdwrk/lander-content-contract";
import { LANDER_CORE_VERSION } from "./version.js";
import type {
  BreadcrumbItem,
  CompiledComponentIntent,
  CompiledLanderSite,
  CompiledPage,
  CompiledStructuredDataIntent,
  LanderDiagnostic,
  SitemapEntry,
} from "./types.js";

export { LANDER_CORE_VERSION };
export type * from "./types.js";
export * from "./cache/resource-policy.js";
export * from "./critical-css/profile.js";
export * from "./performance/budget.js";

export function defineLanderSite<T extends LanderSite>(site: T): T {
  return site;
}

export function normalizeRouteSlug(value: string): string {
  const trimmed = String(value ?? "").trim();
  if (!trimmed || trimmed === "/") return "/";
  return `/${trimmed.replace(/^\/+|\/+$/g, "")}/`;
}

export function canonicalForSlug(productUrl: string, slug: string): string {
  const base = productUrl.replace(/\/+$/, "");
  return `${base}${normalizeRouteSlug(slug)}`;
}

export function extractInternalLinks(value: string): string[] {
  const links = new Set<string>();
  const markdownLinks = String(value ?? "").matchAll(/\[[^\]]+]\((\/[^)\s]+)\)/g);
  for (const match of markdownLinks) {
    links.add(normalizeRouteSlug(match[1] ?? "/"));
  }
  const hrefLinks = String(value ?? "").matchAll(/\bhref=["'](\/[^"']+)["']/g);
  for (const match of hrefLinks) {
    links.add(normalizeRouteSlug(match[1] ?? "/"));
  }
  return [...links].sort();
}

export function textForSection(section: SectionSpec): string {
  switch (section.kind) {
    case "hero":
      return [section.title, section.subtitle, section.eyebrow].filter(Boolean).join(" ");
    case "feature_grid":
      return [section.title, ...section.items.flatMap((item) => [item.title, item.description])].join(" ");
    case "feature_detail":
      return [section.title, section.body, ...(section.items ?? []).flatMap((item) => [item.title, item.description])].join(" ");
    case "comparison":
      return [section.title, ...section.columns.map((column) => column.label), ...section.rows.map((row) => row.label)].join(" ");
    case "proof_matrix":
      return [section.title, ...section.items.flatMap((item) => [item.claim, item.evidence])].join(" ");
    case "package_grid":
      return [section.title, ...section.packages.flatMap((item) => [item.name, item.description, item.install, ...(item.api ?? [])])].join(" ");
    case "pricing":
    case "cta":
      return [section.title, section.body].filter(Boolean).join(" ");
    case "faq":
      return [section.title, ...section.items.flatMap((item) => [item.question, item.answer])].filter(Boolean).join(" ");
    case "markdown":
      return section.body;
    default:
      return assertNever(section);
  }
}

export function pageText(page: PageSpec): string {
  return [
    page.title,
    page.description,
    page.h1,
    page.intro,
    ...page.sections.map(textForSection),
    ...(page.faq ?? []).flatMap((item) => [item.question, item.answer]),
  ].join(" ");
}

export function wordCount(value: string): number {
  return (String(value ?? "").match(/\b[\w'-]+\b/g) ?? []).length;
}

export function buildBreadcrumbs(page: PageSpec): BreadcrumbItem[] {
  const slug = normalizeRouteSlug(page.slug);
  if (slug === "/") return [{ label: page.h1, href: "/" }];
  const parts = slug.replace(/^\/|\/$/g, "").split("/");
  const crumbs: BreadcrumbItem[] = [{ label: "Home", href: "/" }];
  let cursor = "";
  for (const part of parts) {
    cursor += `/${part}`;
    crumbs.push({
      label: part.replace(/-/g, " ").replace(/\b\w/g, (value) => value.toUpperCase()),
      href: normalizeRouteSlug(cursor),
    });
  }
  crumbs[crumbs.length - 1] = { label: page.h1, href: slug };
  return crumbs;
}

const slugifyIntentId = (value: string): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "intent";

function compileComponentIntents(page: PageSpec, path: string): CompiledComponentIntent[] {
  const sectionIntents: CompiledComponentIntent[] = page.sections.map((section) => ({
    id: `${path}#section-${slugifyIntentId(section.id)}`,
    kind: section.kind,
    sourceId: section.id,
    data: section.title ? { title: section.title } : undefined,
    pagePath: path,
    source: "section",
  }));
  const schemaIntents: CompiledComponentIntent[] = page.schema?.length
    ? [{
        id: `${path}#structured-data-graph`,
        kind: "structured_data_graph",
        sourceId: path,
        data: { count: page.schema.length },
        pagePath: path,
        source: "schema",
      }]
    : [];
  const declaredIntents: CompiledComponentIntent[] = (page.componentIntents ?? []).map((intent) => ({
    ...intent,
    pagePath: path,
    source: "declared",
  }));

  return [
    { id: `${path}#page-shell`, kind: "page_shell", sourceId: path, pagePath: path, source: "page" },
    { id: `${path}#breadcrumbs`, kind: "breadcrumbs", sourceId: path, pagePath: path, source: "page" },
    ...sectionIntents,
    ...schemaIntents,
    ...declaredIntents,
  ];
}

function compileSchemaIntents(page: PageSpec, path: string): CompiledStructuredDataIntent[] {
  return (page.schema ?? []).map((intent, index) => ({
    ...intent,
    id: intent.id ?? `${path}#schema-${index + 1}-${slugifyIntentId(intent.kind)}`,
    pagePath: path,
    source: "schema",
  }));
}

export function validateLanderSite(input: LanderSite): LanderDiagnostic[] {
  const diagnostics: LanderDiagnostic[] = [];
  const slugs = new Set<string>();

  if (!input.product?.name) diagnostics.push({ level: "error", code: "product.name.missing", message: "Product name is required." });
  if (!input.product?.canonicalUrl) diagnostics.push({ level: "error", code: "product.canonicalUrl.missing", message: "Product canonicalUrl is required." });
  if (!Array.isArray(input.pages) || input.pages.length === 0) {
    diagnostics.push({ level: "error", code: "pages.empty", message: "At least one page is required." });
  }

  for (const page of input.pages ?? []) {
    const slug = normalizeRouteSlug(page.slug);
    if (slugs.has(slug)) diagnostics.push({ level: "error", code: "page.slug.duplicate", message: `Duplicate page slug ${slug}.`, slug });
    slugs.add(slug);

    for (const field of ["title", "description", "h1", "intro"] as const) {
      if (!page[field]?.trim()) diagnostics.push({ level: "error", code: `page.${field}.missing`, message: `Page ${slug} is missing ${field}.`, slug });
    }
    if (!page.sections?.length) diagnostics.push({ level: "error", code: "page.sections.empty", message: `Page ${slug} must have at least one section.`, slug });
    if (wordCount(page.intro) < 8) diagnostics.push({ level: "warning", code: "page.intro.thin", message: `Page ${slug} has a thin crawlable intro.`, slug });
    if (page.kind === "feature" && !page.faq?.length && !page.sections.some((section) => section.kind === "faq")) {
      diagnostics.push({ level: "warning", code: "page.feature.faq.missing", message: `Feature page ${slug} should include FAQ content.`, slug });
    }
    if (page.kind === "compare" && !page.sections.some((section) => section.kind === "comparison")) {
      diagnostics.push({ level: "error", code: "page.compare.matrix.missing", message: `Comparison page ${slug} must include a comparison section.`, slug });
    }
    if (page.kind === "package" && !page.sections.some((section) => section.kind === "package_grid" || section.kind === "markdown")) {
      diagnostics.push({ level: "warning", code: "page.package.install.missing", message: `Package page ${slug} should include install or API content.`, slug });
    }
    page.schema?.forEach((schema, index) => {
      for (const failure of validateStructuredDataIntent({ id: schema.id, kind: schema.kind, data: schema.data })) {
        diagnostics.push({ level: "error", code: "page.schema.intent.invalid", message: `Schema intent ${index + 1} on ${slug}: ${failure}.`, slug });
      }
    });
    page.componentIntents?.forEach((intent) => {
      for (const failure of validateComponentIntent(intent)) {
        diagnostics.push({ level: "error", code: "page.component.intent.invalid", message: `Component intent ${intent.id || "<missing>"} on ${slug}: ${failure}.`, slug });
      }
    });
  }

  return diagnostics;
}

export function compileLanderSite(input: LanderSite): CompiledLanderSite {
  const diagnostics = validateLanderSite(input);
  const pages = input.pages.map((page): CompiledPage => {
    const path = normalizeRouteSlug(page.slug);
    const text = pageText(page);
    return {
      ...page,
      slug: path,
      path,
      canonicalUrl: page.seo?.canonical ?? canonicalForSlug(input.product.canonicalUrl, path),
      breadcrumbs: buildBreadcrumbs(page),
      internalLinks: extractInternalLinks(text),
      wordCount: wordCount(text),
      componentIntents: compileComponentIntents(page, path),
      schemaIntents: compileSchemaIntents(page, path),
    };
  });

  return {
    ...input,
    pages,
    pageByPath: new Map(pages.map((page) => [page.path, page])),
    diagnostics,
  };
}

export function buildSitemap(site: CompiledLanderSite): SitemapEntry[] {
  return site.pages
    .filter((page) => page.seo?.noindex !== true)
    .map((page) => ({ loc: page.canonicalUrl }));
}

export function buildLlmsTxt(site: CompiledLanderSite): string {
  const title = site.ai?.llmsTxtTitle ?? site.product.name;
  const facts = site.ai?.coreFacts?.map((fact) => `- ${fact}`) ?? [`- ${site.product.description}`];
  const pages = site.pages
    .filter((page) => page.seo?.noindex !== true)
    .map((page) => `- [${page.h1}](${page.canonicalUrl}) - ${page.description}`);
  return [`# ${title}`, "", ...facts, "", "## Pages", ...pages, ""].join("\n");
}

export function buildRobotsTxt(site: CompiledLanderSite): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    "User-agent: OAI-SearchBot",
    "Allow: /",
    "",
    "User-agent: GPTBot",
    "Disallow: /",
    "",
    `Sitemap: ${site.product.canonicalUrl.replace(/\/+$/, "")}/sitemap.xml`,
    "",
  ].join("\n");
}

function assertNever(value: never): never {
  throw new Error(`Unsupported section: ${JSON.stringify(value)}`);
}
