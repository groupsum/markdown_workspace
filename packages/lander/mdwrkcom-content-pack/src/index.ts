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
    "jsonld-graph.json",
    "llms-full.txt",
  ]),
});

export function resolveMdwrkcomContentPackPath(pathInPack: string): string {
  return new URL(`../${pathInPack.replace(/^\/+/, "")}`, import.meta.url).pathname;
}
