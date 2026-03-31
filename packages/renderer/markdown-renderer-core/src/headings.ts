
import { extractHeadingNodesFromAst, parseMarkdownToAst } from "./engine.js";

export function extractMarkdownHeadings(markdown, options = {}) {
  return extractHeadingNodesFromAst(parseMarkdownToAst(markdown, options), options);
}
