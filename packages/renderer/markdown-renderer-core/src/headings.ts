import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkSupersub from "remark-supersub";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { slugifyHeading } from "./slug.js";
import type { ExtractMarkdownHeadingsOptions, MarkdownHeading } from "./types.js";

export function extractMarkdownHeadings(
  markdown: string,
  options: ExtractMarkdownHeadingsOptions = {},
): readonly MarkdownHeading[] {
  const minimumDepth = options.minimumDepth ?? 1;
  const maximumDepth = options.maximumDepth ?? 6;
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkSupersub).parse(markdown);
  const headings: MarkdownHeading[] = [];
  let index = 0;

  visit(tree, "heading", (node: any) => {
    const depth = Number(node.depth ?? 0);
    if (depth < minimumDepth || depth > maximumDepth) {
      return;
    }
    const text = toString(node).trim();
    headings.push({
      depth,
      text,
      slug: slugifyHeading(text),
      index: index++,
    });
  });

  return Object.freeze(headings);
}
