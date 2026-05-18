import {
  buildCacheHeaderManifest,
  buildLlmsTxt,
  buildRobotsTxt,
  buildSitemap,
  normalizeRouteSlug,
  pageText,
} from "@mdwrk/lander-core";
import type { CompiledLanderSite, CompiledPage } from "@mdwrk/lander-core";
import type { LanderCacheHeaderManifest, LanderCacheResourceInput } from "@mdwrk/lander-core";
import { LANDER_SEO_VERSION } from "./version.js";

export { LANDER_SEO_VERSION, buildLlmsTxt, buildRobotsTxt, buildSitemap };

export interface PageMetadata {
  title: string;
  description: string;
  alternates: { canonical: string };
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    type: "website" | "article";
  };
  twitter: {
    card: "summary" | "summary_large_image";
    title: string;
    description: string;
  };
}

export interface SeoScore {
  title: number;
  description: number;
  h1: number;
  canonical: number;
  schema: number;
  faq: number;
  internalLinks: number;
  crawlableText: number;
  total: number;
  diagnostics: string[];
}

export interface DiscoveryArtifactPageSource {
  sourcePath?: string;
  sourceHash?: string;
  lastmod?: string;
  text?: string;
  headings?: string[];
  links?: string[];
  tags?: string[];
  locale?: string;
  translationOf?: string;
  localeGroup?: string;
  contentType?: string;
  intent?: string;
  subtitle?: string;
  llmsInclude?: boolean;
  alternates?: { hreflang: string; href: string }[];
  jsonLdGraph?: Record<string, unknown>[];
}

export interface DiscoveryArtifactOptions {
  generatedAt?: Date | string;
  crawlerPolicies?: DiscoveryCrawlerPolicy[];
  pageSources?: Record<string, DiscoveryArtifactPageSource>;
  additionalCacheResources?: LanderCacheResourceInput[];
  sitemapBasePath?: string;
}

export interface DiscoveryCrawlerPolicy {
  userAgent: string;
  category?: string;
  purpose?: string;
  allow?: string[];
  disallow?: string[];
}

export interface ContentIndexEntry {
  slug: string;
  url: string;
  title: string;
  description: string;
  h1: string;
  subtitle?: string;
  intent?: string;
  contentType?: string;
  locale?: string;
  translationOf?: string;
  localeGroup?: string;
  updatedAt?: string;
  tags?: string[];
  llmsInclude: boolean;
  markdownMirror: string | null;
  jsonLdId: string;
}

export interface SemanticIndexEntry extends ContentIndexEntry {
  path: string;
  wordCount: number;
  headings: string[];
  links: string[];
  schemaIntentIds: string[];
  componentIntentIds: string[];
}

export interface ContentRegistryEntry {
  sourcePath?: string;
  sourceHash?: string;
  frontmatter: Record<string, unknown>;
  rendered: {
    text: string;
    headings: string[];
    links: string[];
    wordCount: number;
  };
  discovery: {
    canonical: string;
    sitemap: boolean;
    robots: "index,follow" | "noindex,follow";
    llms: boolean;
    markdownMirror: boolean;
    jsonLdGraphIds: string[];
  };
}

export interface JsonLdGraphArtifact {
  "@context": "https://schema.org";
  "@graph": Record<string, unknown>[];
}

export interface DiscoveryArtifacts {
  sitemapXml: string;
  sitemapXsl: string;
  sitemapFiles: SitemapFile[];
  robotsTxt: string;
  llmsTxt: string;
  llmsFullTxt: string;
  contentIndex: ContentIndexEntry[];
  semanticIndex: SemanticIndexEntry[];
  contentRegistry: ContentRegistryEntry[];
  jsonLdGraph: JsonLdGraphArtifact;
  cacheHeaderManifest: LanderCacheHeaderManifest;
}

export interface SitemapFile {
  path: string;
  loc: string;
  kind: "index" | "urlset";
  xml: string;
  entryCount: number;
}

export interface DiscoveryValidationResult {
  ok: boolean;
  diagnostics: string[];
}

const discoveryArtifactPaths = [
  "/sitemap.xml",
  "/sitemap.xsl",
  "/robots.txt",
  "/llms.txt",
  "/llms-full.txt",
  "/content-index.json",
  "/semantic-index.json",
  "/content-registry.json",
  "/jsonld-graph.json",
];

const getPageSource = (
  page: CompiledPage,
  options: DiscoveryArtifactOptions,
): DiscoveryArtifactPageSource => options.pageSources?.[page.path] ?? options.pageSources?.[page.slug] ?? {};

const pageUpdatedAt = (page: CompiledPage, source: DiscoveryArtifactPageSource): string | undefined =>
  source.lastmod;

const pageLlmsIncluded = (page: CompiledPage, source: DiscoveryArtifactPageSource): boolean =>
  page.seo?.noindex !== true && source.llmsInclude !== false;

const pageRenderedText = (page: CompiledPage, source: DiscoveryArtifactPageSource): string =>
  source.text ?? pageText(page);

const stableJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;

const escapeXml = (value: string): string =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const slugifySitemapName = (value: string): string =>
  String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "pages";

const sitemapBasePath = (options: DiscoveryArtifactOptions): string => {
  const raw = options.sitemapBasePath ?? "/sitemaps/";
  const normalized = normalizeRouteSlug(raw);
  return normalized === "/" ? "/sitemaps/" : normalized;
};

function sortedPages(site: CompiledLanderSite): CompiledPage[] {
  return [...site.pages].sort((left, right) => left.path.localeCompare(right.path));
}

export function buildSitemapXml(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): string {
  return buildSitemapFileSet(site, options).find((file) => file.path === "/sitemap.xml")?.xml ?? "";
}

export function buildSitemapUrlsetXml(site: CompiledLanderSite, pages: CompiledPage[], options: DiscoveryArtifactOptions = {}): string {
  const urls = [...pages]
    .sort((left, right) => left.path.localeCompare(right.path))
    .filter((page) => page.seo?.noindex !== true)
    .map((page) => {
      const source = getPageSource(page, options);
      const alternates = source.alternates ?? [];
      return [
        "  <url>",
        `    <loc>${escapeXml(page.canonicalUrl)}</loc>`,
        ...(pageUpdatedAt(page, source) ? [`    <lastmod>${escapeXml(pageUpdatedAt(page, source) ?? "")}</lastmod>`] : []),
        ...alternates.map((alternate) => `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}" />`),
        "  </url>",
      ].join("\n");
    });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    urls.join("\n\n"),
    "</urlset>",
    "",
  ].join("\n");
}

export function buildSitemapIndexXml(site: CompiledLanderSite, files: SitemapFile[], options: DiscoveryArtifactOptions = {}): string {
  const entries = files
    .filter((file) => file.kind === "urlset" && file.entryCount > 0)
    .map((file) => {
      const childPages = sortedPages(site).filter((page) => sitemapGroupName(page, getPageSource(page, options)) === sitemapNameFromPath(file.path));
      const lastmod = latestLastmod(childPages.map((page) => pageUpdatedAt(page, getPageSource(page, options))));
      return [
        "  <sitemap>",
        `    <loc>${escapeXml(file.loc)}</loc>`,
        ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
        "  </sitemap>",
      ].join("\n");
    });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    entries.join("\n\n"),
    "</sitemapindex>",
    "",
  ].join("\n");
}

const sitemapGroupName = (page: CompiledPage, source: DiscoveryArtifactPageSource): string =>
  slugifySitemapName(source.contentType ?? page.kind ?? "pages");

const sitemapNameFromPath = (value: string): string =>
  slugifySitemapName(value.replace(/^.*\/([^/]+)\.xml$/i, "$1"));

const latestLastmod = (values: (string | undefined)[]): string | undefined =>
  values.filter((value): value is string => Boolean(value)).sort().slice(-1)[0];

export function buildSitemapFileSet(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): SitemapFile[] {
  const basePath = sitemapBasePath(options);
  const baseUrl = site.product.canonicalUrl.replace(/\/+$/, "");
  const groups = new Map<string, CompiledPage[]>();
  for (const page of sortedPages(site).filter((candidate) => candidate.seo?.noindex !== true)) {
    const group = sitemapGroupName(page, getPageSource(page, options));
    groups.set(group, [...(groups.get(group) ?? []), page]);
  }

  const childFiles: SitemapFile[] = [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([group, pages]) => {
      const resourcePath = `${basePath}${group}.xml`;
      return {
        path: resourcePath,
        loc: `${baseUrl}${resourcePath}`,
        kind: "urlset" as const,
        xml: buildSitemapUrlsetXml(site, pages, options),
        entryCount: pages.length,
      };
    });

  const indexFile: SitemapFile = {
    path: "/sitemap.xml",
    loc: `${baseUrl}/sitemap.xml`,
    kind: "index",
    xml: buildSitemapIndexXml(site, childFiles, options),
    entryCount: childFiles.length,
  };

  return [indexFile, ...childFiles];
}

export function buildSitemapStylesheet(site: CompiledLanderSite): string {
  const productName = escapeXml(site.product.name);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:sm="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    '  <xsl:output method="html" encoding="UTF-8" indent="yes" />',
    '  <xsl:template match="/">',
    '    <html lang="en">',
    '      <head>',
    `        <title>${productName} Sitemap</title>`,
    '        <meta charset="UTF-8" />',
    '        <meta name="viewport" content="width=device-width, initial-scale=1" />',
    '        <style>',
    '          :root { color-scheme: light; --bg: #f8fafc; --ink: #18212f; --muted: #5b6676; --panel: #ffffff; --line: #cbd5e1; --accent: #2563eb; }',
    '          * { box-sizing: border-box; }',
    '          body { margin: 0; background: var(--bg); color: var(--ink); font: 16px/1.55 Georgia, "Times New Roman", serif; }',
    '          main { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; padding: 3rem 0; }',
    '          h1 { margin: 0; font-size: 3rem; line-height: 1; letter-spacing: 0; }',
    '          p { max-width: 66ch; color: var(--muted); }',
    '          table { width: 100%; margin-top: 2rem; border-collapse: collapse; overflow-wrap: anywhere; background: var(--panel); border: 1px solid var(--line); box-shadow: 0 24px 70px rgba(73, 45, 19, .14); }',
    '          th, td { padding: .9rem 1rem; text-align: left; vertical-align: top; border-bottom: 1px solid var(--line); }',
    '          th { color: #fff; background: var(--accent); font-family: ui-sans-serif, system-ui, sans-serif; font-size: .78rem; letter-spacing: .12em; text-transform: uppercase; }',
    '          tr:last-child td { border-bottom: 0; }',
    '          a { color: #6f3d16; font-weight: 700; }',
    '          .alternate { color: var(--muted); font-size: .9rem; }',
    '        </style>',
    '      </head>',
    '      <body>',
    '        <main>',
    `          <h1>${productName} Sitemap</h1>`,
    '          <p>This is the machine-readable XML sitemap rendered as a human-readable table. Search engines read the XML nodes; browsers use this stylesheet for review.</p>',
    '          <xsl:choose>',
    '            <xsl:when test="sm:sitemapindex">',
    '              <table>',
    '                <thead>',
    '                  <tr>',
    '                    <th scope="col">Sitemap</th>',
    '                    <th scope="col">Last modified</th>',
    '                  </tr>',
    '                </thead>',
    '                <tbody>',
    '                  <xsl:for-each select="sm:sitemapindex/sm:sitemap">',
    '                    <tr>',
    '                      <td>',
    '                        <a>',
    '                          <xsl:attribute name="href"><xsl:value-of select="sm:loc" /></xsl:attribute>',
    '                          <xsl:value-of select="sm:loc" />',
    '                        </a>',
    '                      </td>',
    '                      <td><xsl:value-of select="sm:lastmod" /></td>',
    '                    </tr>',
    '                  </xsl:for-each>',
    '                </tbody>',
    '              </table>',
    '            </xsl:when>',
    '            <xsl:otherwise>',
    '          <table>',
    '            <thead>',
    '              <tr>',
    '                <th scope="col">URL</th>',
    '                <th scope="col">Last modified</th>',
    '              </tr>',
    '            </thead>',
    '            <tbody>',
    '              <xsl:for-each select="sm:urlset/sm:url">',
    '                <tr>',
    '                  <td>',
    '                    <a>',
    '                      <xsl:attribute name="href"><xsl:value-of select="sm:loc" /></xsl:attribute>',
    '                      <xsl:value-of select="sm:loc" />',
    '                    </a>',
    '                    <br />',
    '                    <xsl:for-each select="xhtml:link">',
    '                      <span class="alternate">alternate <xsl:value-of select="@hreflang" />: <xsl:value-of select="@href" /></span>',
    '                      <br />',
    '                    </xsl:for-each>',
    '                  </td>',
    '                  <td><xsl:value-of select="sm:lastmod" /></td>',
    '                </tr>',
    '              </xsl:for-each>',
    '            </tbody>',
    '          </table>',
    '            </xsl:otherwise>',
    '          </xsl:choose>',
    '        </main>',
    '      </body>',
    '    </html>',
    '  </xsl:template>',
    '</xsl:stylesheet>',
    '',
  ].join("\n");
}

export function buildRobotsTxtArtifact(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): string {
  if (!options.crawlerPolicies?.length) return buildRobotsTxt(site);
  return [
    ...options.crawlerPolicies.flatMap((policy) => [
      `User-agent: ${policy.userAgent}`,
      ...(policy.category ? [`# Category: ${policy.category}`] : []),
      ...(policy.purpose ? [`# Purpose: ${policy.purpose}`] : []),
      ...(policy.allow ?? []).map((value) => `Allow: ${value}`),
      ...(policy.disallow ?? []).map((value) => `Disallow: ${value}`),
      "",
    ]),
    `Sitemap: ${site.product.canonicalUrl.replace(/\/+$/, "")}/sitemap.xml`,
    "",
  ].join("\n");
}

export function buildLlmsFullTxt(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): string {
  const title = site.ai?.llmsTxtTitle ?? site.product.name;
  return [
    `# ${title} Full Content`,
    "",
    ...sortedPages(site)
      .filter((page) => pageLlmsIncluded(page, getPageSource(page, options)))
      .flatMap((page) => {
        const source = getPageSource(page, options);
        return [
          `## ${page.h1}`,
          "",
          `URL: ${page.canonicalUrl}`,
          "",
          source.subtitle ?? page.description,
          "",
          pageRenderedText(page, source),
          "",
        ];
      }),
  ].join("\n");
}

export function buildContentIndex(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): ContentIndexEntry[] {
  return sortedPages(site)
    .filter((page) => page.seo?.noindex !== true)
    .map((page) => {
      const source = getPageSource(page, options);
      return {
        slug: normalizeRouteSlug(page.slug),
        url: page.canonicalUrl,
        title: page.title,
        description: page.description,
        h1: page.h1,
        subtitle: source.subtitle,
        intent: source.intent,
        contentType: source.contentType,
        locale: source.locale,
        translationOf: source.translationOf,
        localeGroup: source.localeGroup,
        updatedAt: pageUpdatedAt(page, source),
        tags: source.tags,
        llmsInclude: pageLlmsIncluded(page, source),
        markdownMirror: pageLlmsIncluded(page, source) ? `${normalizeRouteSlug(page.slug)}index.md` : null,
        jsonLdId: `${page.canonicalUrl}#webpage`,
      };
    });
}

export function buildSemanticIndex(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): SemanticIndexEntry[] {
  return buildContentIndex(site, options).map((entry) => {
    const page = site.pageByPath.get(normalizeRouteSlug(entry.slug)) ?? site.pages.find((candidate) => candidate.canonicalUrl === entry.url);
    const source = page ? getPageSource(page, options) : {};
    return {
      ...entry,
      path: page?.path ?? normalizeRouteSlug(entry.slug),
      wordCount: page?.wordCount ?? 0,
      headings: source.headings ?? [entry.h1],
      links: source.links ?? page?.internalLinks ?? [],
      schemaIntentIds: page?.schemaIntents.map((intent) => intent.id) ?? [],
      componentIntentIds: page?.componentIntents.map((intent) => intent.id) ?? [],
    };
  });
}

export function buildJsonLdGraphArtifact(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): JsonLdGraphArtifact {
  const graph = sortedPages(site).flatMap((page) => {
    const source = getPageSource(page, options);
    if (source.jsonLdGraph?.length) return source.jsonLdGraph;
    return [
      {
        "@type": "WebPage",
        "@id": `${page.canonicalUrl}#webpage`,
        url: page.canonicalUrl,
        name: page.title,
        description: page.description,
        inLanguage: source.locale,
        dateModified: pageUpdatedAt(page, source),
        isPartOf: { "@id": `${site.product.canonicalUrl.replace(/\/+$/, "")}#website` },
      },
    ];
  });
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.product.canonicalUrl.replace(/\/+$/, "")}#website`,
        url: site.product.canonicalUrl.replace(/\/+$/, ""),
        name: site.product.name,
        description: site.product.description,
      },
      ...graph,
    ],
  };
}

export function buildContentRegistry(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): ContentRegistryEntry[] {
  const jsonLdIdsByCanonical = new Map<string, string[]>();
  for (const node of buildJsonLdGraphArtifact(site, options)["@graph"]) {
    const id = typeof node["@id"] === "string" ? node["@id"] : undefined;
    if (!id) continue;
    const canonical = id.replace(/#.*$/, "");
    const values = jsonLdIdsByCanonical.get(canonical) ?? [];
    values.push(id);
    jsonLdIdsByCanonical.set(canonical, values);
  }

  return sortedPages(site).map((page) => {
    const source = getPageSource(page, options);
    const renderedText = pageRenderedText(page, source);
    return {
      sourcePath: source.sourcePath,
      sourceHash: source.sourceHash,
      frontmatter: {
        slug: page.slug,
        canonical: page.canonicalUrl,
        title: page.title,
        description: page.description,
        h1: page.h1,
        updatedAt: pageUpdatedAt(page, source),
        noindex: page.seo?.noindex === true,
        llmsInclude: pageLlmsIncluded(page, source),
        locale: source.locale,
        translationOf: source.translationOf,
        localeGroup: source.localeGroup,
        tags: source.tags,
        contentType: source.contentType,
        intent: source.intent,
      },
      rendered: {
        text: renderedText,
        headings: source.headings ?? [page.h1],
        links: source.links ?? page.internalLinks,
        wordCount: page.wordCount,
      },
      discovery: {
        canonical: page.canonicalUrl,
        sitemap: page.seo?.noindex !== true,
        robots: page.seo?.noindex === true ? "noindex,follow" : "index,follow",
        llms: pageLlmsIncluded(page, source),
        markdownMirror: pageLlmsIncluded(page, source),
        jsonLdGraphIds: jsonLdIdsByCanonical.get(page.canonicalUrl) ?? [],
      },
    };
  });
}

export function buildDiscoveryArtifacts(site: CompiledLanderSite, options: DiscoveryArtifactOptions = {}): DiscoveryArtifacts {
  const sitemapFiles = buildSitemapFileSet(site, options);
  const sitemapXml = sitemapFiles[0]?.xml ?? "";
  const sitemapXsl = buildSitemapStylesheet(site);
  const robotsTxt = buildRobotsTxtArtifact(site, options);
  const llmsTxt = buildLlmsTxt(site);
  const llmsFullTxt = buildLlmsFullTxt(site, options);
  const contentIndex = buildContentIndex(site, options);
  const semanticIndex = buildSemanticIndex(site, options);
  const contentRegistry = buildContentRegistry(site, options);
  const jsonLdGraph = buildJsonLdGraphArtifact(site, options);
  const cacheInputs: LanderCacheResourceInput[] = [
    { path: "/sitemap.xml", content: sitemapXml, contentType: "application/xml; charset=utf-8" },
    ...sitemapFiles
      .filter((file) => file.path !== "/sitemap.xml")
      .map((file) => ({ path: file.path, content: file.xml, contentType: "application/xml; charset=utf-8" })),
    { path: "/sitemap.xsl", content: sitemapXsl, contentType: "application/xml; charset=utf-8" },
    { path: "/robots.txt", content: robotsTxt, contentType: "text/plain; charset=utf-8" },
    { path: "/llms.txt", content: llmsTxt, contentType: "text/plain; charset=utf-8" },
    { path: "/llms-full.txt", content: llmsFullTxt, contentType: "text/plain; charset=utf-8" },
    { path: "/content-index.json", content: stableJson(contentIndex), contentType: "application/json; charset=utf-8" },
    { path: "/semantic-index.json", content: stableJson(semanticIndex), contentType: "application/json; charset=utf-8" },
    { path: "/content-registry.json", content: stableJson(contentRegistry), contentType: "application/json; charset=utf-8" },
    { path: "/jsonld-graph.json", content: stableJson(jsonLdGraph), contentType: "application/json; charset=utf-8" },
    ...(options.additionalCacheResources ?? []),
  ];
  const cacheHeaderManifest = options.generatedAt ? buildCacheHeaderManifest(cacheInputs, options.generatedAt) : buildCacheHeaderManifest(cacheInputs);
  return { sitemapXml, sitemapXsl, sitemapFiles, robotsTxt, llmsTxt, llmsFullTxt, contentIndex, semanticIndex, contentRegistry, jsonLdGraph, cacheHeaderManifest };
}

export function validateDiscoveryArtifacts(site: CompiledLanderSite, artifacts: DiscoveryArtifacts): DiscoveryValidationResult {
  const diagnostics: string[] = [];
  const indexCanonicals = new Set(artifacts.contentIndex.map((entry) => entry.url));
  const registryCanonicals = new Set(artifacts.contentRegistry.map((entry) => entry.discovery.canonical));
  const graphIds = new Set(artifacts.jsonLdGraph["@graph"].map((node) => node["@id"]).filter((value): value is string => typeof value === "string"));
  const cachePaths = new Set(artifacts.cacheHeaderManifest.entries.map((entry) => entry.path));

  if (!artifacts.sitemapXml.includes('<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>')) diagnostics.push("sitemap.xml missing sitemap.xsl stylesheet link");
  if (!artifacts.sitemapXml.includes("<sitemapindex")) diagnostics.push("sitemap.xml must be a sitemap index");
  if (/<url>/i.test(artifacts.sitemapXml)) diagnostics.push("sitemap.xml must not contain page <url> records");
  if (!artifacts.sitemapXsl.includes("<table>")) diagnostics.push("sitemap.xsl missing human-readable table");
  if (!artifacts.sitemapXsl.includes('<th scope="col">URL</th>')) diagnostics.push("sitemap.xsl missing URL table header");
  if (!artifacts.sitemapXsl.includes('<th scope="col">Last modified</th>')) diagnostics.push("sitemap.xsl missing Last modified table header");
  if (!artifacts.sitemapXsl.includes("<br />")) diagnostics.push("sitemap.xsl missing visible line break markers");
  if (/localhost|127\.0\.0\.1|:\d{2,5}\b/i.test(artifacts.robotsTxt)) diagnostics.push("robots.txt contains local host or explicit port policy");
  for (const path of discoveryArtifactPaths) {
    if (!cachePaths.has(path)) diagnostics.push(`cache-header-manifest.json missing ${path}`);
  }
  for (const file of artifacts.sitemapFiles.filter((entry) => entry.path !== "/sitemap.xml")) {
    if (!cachePaths.has(file.path)) diagnostics.push(`cache-header-manifest.json missing ${file.path}`);
    if (!artifacts.sitemapXml.includes(`<loc>${escapeXml(file.loc)}</loc>`)) diagnostics.push(`sitemap.xml missing child sitemap ${file.loc}`);
  }
  for (const page of site.pages) {
    const childSitemap = artifacts.sitemapFiles.find((file) => file.kind === "urlset" && file.xml.includes(`<loc>${escapeXml(page.canonicalUrl)}</loc>`));
    if (page.seo?.noindex === true) {
      if (artifacts.sitemapFiles.some((file) => file.xml.includes(page.canonicalUrl))) diagnostics.push(`${page.path}: noindex page appears in sitemap files`);
      continue;
    }
    if (!childSitemap) diagnostics.push(`${page.path}: child sitemap missing canonical URL`);
    if (!indexCanonicals.has(page.canonicalUrl)) diagnostics.push(`${page.path}: content-index.json missing canonical URL`);
    if (!registryCanonicals.has(page.canonicalUrl)) diagnostics.push(`${page.path}: content-registry.json missing canonical URL`);
    if (!graphIds.has(`${page.canonicalUrl}#webpage`)) diagnostics.push(`${page.path}: jsonld-graph.json missing WebPage id`);
    if (!artifacts.llmsFullTxt.includes(page.canonicalUrl)) diagnostics.push(`${page.path}: llms-full.txt missing canonical URL`);
  }
  return { ok: diagnostics.length === 0, diagnostics };
}

export function buildPageMetadata(site: CompiledLanderSite, page: CompiledPage): PageMetadata {
  const title = page.seo?.title ?? page.title;
  const description = page.seo?.description ?? page.description;
  return {
    title,
    description,
    alternates: {
      canonical: page.canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: page.canonicalUrl,
      siteName: site.product.name,
      type: page.kind === "answer" || page.kind === "feature" ? "article" : "website",
    },
    twitter: {
      card: page.seo?.image ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}

export function scoreSeoPage(page: CompiledPage): SeoScore {
  const diagnostics: string[] = [];
  const title = page.title.length >= 10 && page.title.length <= 120 ? 1 : 0;
  const description = page.description.length >= 40 && page.description.length <= 220 ? 1 : 0;
  const h1 = page.h1.length >= 4 && page.h1.length <= 120 ? 1 : 0;
  const canonical = page.canonicalUrl.startsWith("http") ? 1 : 0;
  const schema = page.schema?.length || ["home", "feature", "answer", "compare", "package", "proof", "trust"].includes(page.kind) ? 1 : 0;
  const faq = page.kind !== "feature" || Boolean(page.faq?.length || page.sections.some((section) => section.kind === "faq")) ? 1 : 0;
  const internalLinks = page.internalLinks.length >= 1 || page.slug === "/" ? 1 : 0;
  const crawlableText = page.wordCount >= 80 ? 1 : 0;

  if (!title) diagnostics.push("title length is outside the recommended range");
  if (!description) diagnostics.push("description length is outside the recommended range");
  if (!h1) diagnostics.push("h1 length is outside the recommended range");
  if (!canonical) diagnostics.push("canonical URL is missing or invalid");
  if (!schema) diagnostics.push("schema metadata is missing");
  if (!faq) diagnostics.push("feature page is missing FAQ content");
  if (!internalLinks) diagnostics.push("page has too few internal links");
  if (!crawlableText) diagnostics.push("page has too little crawlable text");

  const total = title + description + h1 + canonical + schema + faq + internalLinks + crawlableText;
  return { title, description, h1, canonical, schema, faq, internalLinks, crawlableText, total, diagnostics };
}

export function buildAiSummary(site: CompiledLanderSite): string {
  return [
    `# ${site.product.name} Facts`,
    "",
    site.ai?.summary ?? site.product.description,
    "",
    "## Core Facts",
    ...(site.ai?.coreFacts ?? [site.product.tagline, site.product.category]).map((fact) => `- ${fact}`),
    "",
  ].join("\n");
}
