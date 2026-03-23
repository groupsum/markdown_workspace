import matter from "gray-matter";
import type { ParsedMarkdownDocument } from "./types.js";
import { extractMarkdownHeadings } from "./headings.js";

export function parseMarkdownDocument(
  raw: string,
  options: { excerptSeparator?: string } = {},
): ParsedMarkdownDocument {
  const parsed = matter(raw, {
    excerpt: Boolean(options.excerptSeparator),
    excerpt_separator: options.excerptSeparator,
  });

  return Object.freeze({
    raw,
    content: parsed.content,
    metadata: Object.freeze({ ...(parsed.data as Record<string, unknown>) }),
    headings: extractMarkdownHeadings(parsed.content),
    excerpt: parsed.excerpt,
  });
}
