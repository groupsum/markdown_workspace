import matter from "gray-matter";
import { extractMarkdownHeadings } from "./headings.js";
export function parseMarkdownDocument(raw, options = {}) {
    const parsed = matter(raw, {
        excerpt: Boolean(options.excerptSeparator),
        excerpt_separator: options.excerptSeparator,
    });
    return Object.freeze({
        raw,
        content: parsed.content,
        metadata: Object.freeze({ ...parsed.data }),
        headings: extractMarkdownHeadings(parsed.content),
        excerpt: parsed.excerpt,
    });
}
//# sourceMappingURL=frontmatter.js.map