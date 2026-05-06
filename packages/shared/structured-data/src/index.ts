import { LANDER_SCHEMA_VERSION, STRUCTURED_DATA_VERSION } from "./version.js";

export { LANDER_SCHEMA_VERSION, STRUCTURED_DATA_VERSION };

export type JsonLd = Record<string, unknown>;

export interface StructuredDataProduct {
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  category?: string;
  canonicalUrl: string;
  logo?: { src?: string };
  sameAs?: string[];
}

export interface StructuredDataSite {
  product: StructuredDataProduct;
}

export interface StructuredDataBreadcrumbItem {
  label: string;
  href: string;
}

export interface StructuredDataPage {
  kind?: string;
  slug?: string;
  title: string;
  description?: string;
  h1: string;
  canonicalUrl: string;
  breadcrumbs: StructuredDataBreadcrumbItem[];
  faq?: StructuredDataFaqItem[];
}

export interface StructuredDataFaqItem {
  question: string;
  answer: string;
}

const compact = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(compact).filter((entry) => entry !== undefined);
  if (value && typeof value === "object") {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, entry]) => {
      const compacted = compact(entry);
      if (compacted !== undefined && compacted !== null && compacted !== "") acc[key] = compacted;
      return acc;
    }, {});
  }
  return value;
};

export function organizationSchema(site: StructuredDataSite): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.product.name,
    url: site.product.canonicalUrl,
    logo: site.product.logo?.src,
    sameAs: site.product.sameAs,
  }) as JsonLd;
}

export function websiteSchema(site: StructuredDataSite): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.product.name,
    url: site.product.canonicalUrl,
    description: site.product.description,
  }) as JsonLd;
}

export function softwareApplicationSchema(site: StructuredDataSite): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: site.product.name,
    applicationCategory: site.product.category,
    url: site.product.canonicalUrl,
    image: site.product.logo?.src,
    description: site.product.description,
  }) as JsonLd;
}

export function webApplicationSchema(site: StructuredDataSite): JsonLd {
  return {
    ...softwareApplicationSchema(site),
    "@type": "WebApplication",
  };
}

export function softwareSourceCodeSchema(page: StructuredDataPage): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: page.h1,
    description: page.description,
    url: page.canonicalUrl,
  }) as JsonLd;
}

export function techArticleSchema(page: StructuredDataPage): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.description,
    url: page.canonicalUrl,
    mainEntityOfPage: page.canonicalUrl,
  }) as JsonLd;
}

export function articleSchema(page: StructuredDataPage): JsonLd {
  return {
    ...techArticleSchema(page),
    "@type": "Article",
  };
}

export function breadcrumbSchema(items: StructuredDataBreadcrumbItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: item.href,
    })),
  };
}

export function faqSchema(items: StructuredDataFaqItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function itemListSchema(name: string, items: Array<{ name: string; url?: string }>): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function howToSchema(page: StructuredDataPage): JsonLd {
  return compact({
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: page.h1,
    description: page.description,
    url: page.canonicalUrl,
  }) as JsonLd;
}

export function buildJsonLdGraph(site: StructuredDataSite, page: StructuredDataPage): JsonLd[] {
  const graph: JsonLd[] = [
    organizationSchema(site),
    websiteSchema(site),
    softwareApplicationSchema(site),
    breadcrumbSchema(page.breadcrumbs.map((item) => ({ ...item, href: item.href.startsWith("http") ? item.href : `${site.product.canonicalUrl.replace(/\/+$/, "")}${item.href}` }))),
  ];

  if (page.kind === "answer" || page.kind === "feature" || page.kind === "docs_bridge") graph.push(techArticleSchema(page));
  if (page.faq?.length) graph.push(faqSchema(page.faq));
  if (page.kind === "package") graph.push(softwareSourceCodeSchema(page));

  return graph;
}
