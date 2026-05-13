import type { ComponentIntentSpec, StructuredDataIntentSpec } from "@mdwrk/lander-content-contract";
import { MDWRKCOM_CONTENT_PACK_VERSION } from "./version.js";

export { MDWRKCOM_CONTENT_PACK_VERSION };

export interface MdwrkcomContentPackLayout {
  packageName: string;
  version: string;
  sourceContentRoot: "content";
  markdownDataRoot: "data/markdown";
  sitemapPath: "data/content-sitemap.yaml";
  publicAssetRoot: "public";
  generatedArtifactRoot: "generated";
  generatedArtifacts: readonly string[];
}

export interface MdwrkcomLanderRenderingIntent {
  contentPack: typeof MDWRKCOM_CONTENT_PACK_NAME;
  contractPackage: "@mdwrk/lander-content-contract";
  compilerPackage: "@mdwrk/lander-core";
  rendererPackage: "@mdwrk/lander-react";
  componentIntents: readonly ComponentIntentSpec[];
  schemaIntents: readonly StructuredDataIntentSpec[];
}

export const MDWRKCOM_CONTENT_PACK_NAME = "@mdwrk/mdwrkcom-content-pack";

export const mdwrkcomContentPack: MdwrkcomContentPackLayout = Object.freeze({
  packageName: MDWRKCOM_CONTENT_PACK_NAME,
  version: MDWRKCOM_CONTENT_PACK_VERSION,
  sourceContentRoot: "content",
  markdownDataRoot: "data/markdown",
  sitemapPath: "data/content-sitemap.yaml",
  publicAssetRoot: "public",
  generatedArtifactRoot: "generated",
  generatedArtifacts: Object.freeze([
    "content-index.json",
    "content-registry.json",
    "cache-header-manifest.json",
    "jsonld-graph.json",
    "llms.txt",
    "llms-full.txt",
    "robots.txt",
    "sitemap.xml",
  ]),
});

export const mdwrkcomLanderRenderingIntent: MdwrkcomLanderRenderingIntent = Object.freeze({
  contentPack: MDWRKCOM_CONTENT_PACK_NAME,
  contractPackage: "@mdwrk/lander-content-contract",
  compilerPackage: "@mdwrk/lander-core",
  rendererPackage: "@mdwrk/lander-react",
  componentIntents: Object.freeze([
    { id: "mdwrkcom:page-shell", kind: "page_shell", sourceId: "mdwrkcom" },
    { id: "mdwrkcom:breadcrumbs", kind: "breadcrumbs", sourceId: "mdwrkcom" },
    { id: "mdwrkcom:hero", kind: "hero", sourceId: "mdwrkcom.sections.hero" },
    { id: "mdwrkcom:feature-grid", kind: "feature_grid", sourceId: "mdwrkcom.sections.feature_grid" },
    { id: "mdwrkcom:structured-data-graph", kind: "structured_data_graph", sourceId: "mdwrkcom.schema" },
  ] satisfies ComponentIntentSpec[]),
  schemaIntents: Object.freeze([
    { id: "mdwrkcom:schema-software-application", kind: "SoftwareApplication" },
    { id: "mdwrkcom:schema-website", kind: "WebSite" },
    { id: "mdwrkcom:schema-faq-page", kind: "FAQPage" },
    { id: "mdwrkcom:schema-tech-article", kind: "TechArticle" },
    { id: "mdwrkcom:schema-item-list", kind: "ItemList" },
    { id: "mdwrkcom:schema-software-source-code", kind: "SoftwareSourceCode" },
  ] satisfies StructuredDataIntentSpec[]),
});

export function resolveMdwrkcomContentPackPath(pathInPack: string): string {
  return new URL(`../${pathInPack.replace(/^\/+/, "")}`, import.meta.url).pathname;
}
