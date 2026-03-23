import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkSupersub from "remark-supersub";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { slugifyHeading } from "./slug.js";
export function extractMarkdownHeadings(markdown, options = {}) {
    const minimumDepth = options.minimumDepth ?? 1;
    const maximumDepth = options.maximumDepth ?? 6;
    const tree = unified().use(remarkParse).use(remarkGfm).use(remarkSupersub).parse(markdown);
    const headings = [];
    let index = 0;
    visit(tree, "heading", (node) => {
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
//# sourceMappingURL=headings.js.map