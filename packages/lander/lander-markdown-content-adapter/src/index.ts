import type { FaqItem, PageKind, PageSpec } from "@mdwrk/lander-content-contract";
import { normalizeRouteSlug } from "@mdwrk/lander-core";
import { LANDER_MARKDOWN_CONTENT_ADAPTER_VERSION } from "./version.js";

export { LANDER_MARKDOWN_CONTENT_ADAPTER_VERSION };

export interface ParsedMarkdownPage {
  metadata: Record<string, unknown>;
  body: string;
  page: PageSpec;
}

const parseScalar = (value: string): unknown => {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (/^["'].*["']$/.test(trimmed)) return trimmed.slice(1, -1);
  return trimmed;
};

export function splitFrontmatter(raw: string): { frontmatter: string; body: string } {
  const normalized = String(raw ?? "").replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
  if (!match) return { frontmatter: "", body: normalized.trim() };
  return { frontmatter: match[1] ?? "", body: normalized.slice(match[0].length).trim() };
}

export function parseSimpleFrontmatter(frontmatter: string): Record<string, unknown> {
  const output: Record<string, unknown> = {};
  const lines = frontmatter.split("\n");
  for (const line of lines) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    output[match[1]] = parseScalar(match[2] ?? "");
  }
  return output;
}

export function markdownToPageSpec(raw: string): ParsedMarkdownPage {
  const { frontmatter, body } = splitFrontmatter(raw);
  const metadata = parseSimpleFrontmatter(frontmatter);
  const title = String(metadata.title ?? metadata.h1 ?? "Untitled Page");
  const h1 = String(metadata.h1 ?? title);
  const slug = normalizeRouteSlug(String(metadata.slug ?? `/${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}/`));
  const kind = String(metadata.kind ?? metadata.contentType ?? "docs_bridge") as PageKind;
  const description = String(metadata.description ?? body.split(/\n\s*\n/)[0] ?? title);
  const intro = String(metadata.intro ?? description);
  const faqs = Array.isArray(metadata.faq) ? metadata.faq as FaqItem[] : undefined;
  const page: PageSpec = {
    kind,
    slug,
    title,
    description,
    h1,
    intro,
    sections: [
      {
        id: "content",
        kind: "markdown",
        body,
      },
    ],
    faq: faqs,
  };
  return { metadata, body, page };
}
