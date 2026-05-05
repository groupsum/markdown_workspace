import { buildLlmsTxt, buildRobotsTxt, buildSitemap } from "@mdwrk/lander-core";
import type { CompiledLanderSite, CompiledPage } from "@mdwrk/lander-core";
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
