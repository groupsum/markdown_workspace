import type { JsonLd, JsonLdNodeType, StructuredDataImage } from "./types.js";

export const SCHEMA_CONTEXT = "https://schema.org";

export const compact = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    const entries = value.map(compact).filter((entry) => entry !== undefined);
    return entries.length ? entries : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, entry]) => {
      const compacted = compact(entry);
      if (compacted !== undefined && compacted !== null && compacted !== "") acc[key] = compacted;
      return acc;
    }, {});
    return Object.keys(entries).length ? entries : undefined;
  }
  return value;
};

export const requireText = (value: string | undefined, field: string): string => {
  if (!value?.trim()) throw new Error(`Missing required structured data field: ${field}`);
  return value;
};

export const node = (type: JsonLdNodeType, value: Record<string, unknown>): JsonLd =>
  compact({
    "@context": SCHEMA_CONTEXT,
    "@type": type,
    ...value,
  }) as JsonLd;

export const stableId = (canonicalUrl: string, fragment: string): string =>
  `${canonicalUrl.replace(/[#/]+$/, "")}#${fragment.replace(/^#+/, "")}`;

export const personOrOrganizationRef = (value: JsonLd | string | undefined): JsonLd | string | undefined =>
  typeof value === "string" ? node("Organization", { name: value }) : value;

export function jsonLdGraph(nodes: JsonLd[], id?: string): JsonLd {
  if (!nodes.length) throw new Error("JSON-LD graph requires at least one node");
  return compact({
    "@context": SCHEMA_CONTEXT,
    "@id": id,
    "@graph": nodes,
  }) as JsonLd;
}

export const canonicalHref = (baseUrl: string, href: string): string =>
  href.startsWith("http") ? href : `${baseUrl.replace(/\/+$/, "")}${href.startsWith("/") ? href : `/${href}`}`;

export type ImageObjectBuilder = (input: {
  name: string;
  url?: string;
  contentUrl?: string;
  width?: number;
  height?: number;
  caption?: string;
}) => JsonLd;

export const imageValue = (
  image: string | StructuredDataImage | undefined,
  buildImageObject: ImageObjectBuilder,
): string | JsonLd | undefined => {
  if (!image) return undefined;
  if (typeof image === "string") return image;
  const url = image.url ?? image.src;
  if (!url) return undefined;
  return buildImageObject({
    name: image.alt ?? image.caption ?? "Image",
    url,
    contentUrl: url,
    width: image.width,
    height: image.height,
    caption: image.caption,
  });
};
