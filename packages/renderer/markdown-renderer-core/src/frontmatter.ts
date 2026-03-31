
import { parseSimpleFrontmatter } from "./engine.js";

export function parseMarkdownDocument(raw, options = {}) {
  return parseSimpleFrontmatter(raw, options);
}
