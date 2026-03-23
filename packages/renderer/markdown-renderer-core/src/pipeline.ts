import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import remarkSupersub from "remark-supersub";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { slugifyHeading } from "./slug.js";
import { resolveMarkdownRendererClassNames } from "./class-names.js";
import type { MarkdownRendererClassNames, RenderMarkdownToHtmlOptions } from "./types.js";

function appendClassName(node: Record<string, any>, className: string | undefined): void {
  if (!className) return;
  const properties = (node.properties ??= {});
  const current = properties.className;
  if (Array.isArray(current)) {
    if (!current.includes(className)) current.push(className);
    return;
  }
  if (typeof current === "string" && current.length > 0) {
    properties.className = Array.from(new Set(`${current} ${className}`.split(/\s+/g))).filter(Boolean);
    return;
  }
  properties.className = [className];
}

function isExternalHref(href: string | undefined): boolean {
  return Boolean(href && /^(https?:)?\/\//i.test(href));
}

function textFromChildren(children: any[] | undefined): string {
  return (children ?? [])
    .map((child) => {
      if (typeof child?.value === "string") return child.value;
      if (Array.isArray(child?.children)) return textFromChildren(child.children);
      return "";
    })
    .join(" ")
    .trim();
}

function rehypeApplyMarkdownClasses(classNames: MarkdownRendererClassNames) {
  return function applyMarkdownClassesPlugin() {
    return (tree: any) => {
      visit(tree, "element", (node: any) => {
        switch (node.tagName) {
          case "h1":
            appendClassName(node, classNames.heading1);
            node.properties.id ??= slugifyHeading(textFromChildren(node.children));
            break;
          case "h2":
            appendClassName(node, classNames.heading2);
            node.properties.id ??= slugifyHeading(textFromChildren(node.children));
            break;
          case "h3":
            appendClassName(node, classNames.heading3);
            node.properties.id ??= slugifyHeading(textFromChildren(node.children));
            break;
          case "h4":
            appendClassName(node, classNames.heading4);
            node.properties.id ??= slugifyHeading(textFromChildren(node.children));
            break;
          case "h5":
            appendClassName(node, classNames.heading5);
            node.properties.id ??= slugifyHeading(textFromChildren(node.children));
            break;
          case "h6":
            appendClassName(node, classNames.heading6);
            node.properties.id ??= slugifyHeading(textFromChildren(node.children));
            break;
          case "p":
            appendClassName(node, classNames.paragraph);
            break;
          case "strong":
            appendClassName(node, classNames.strong);
            break;
          case "em":
            appendClassName(node, classNames.emphasis);
            break;
          case "hr":
            appendClassName(node, classNames.hr);
            break;
          case "blockquote":
            appendClassName(node, classNames.blockquote);
            break;
          case "ul":
            appendClassName(node, classNames.listUnordered);
            break;
          case "ol":
            appendClassName(node, classNames.listOrdered);
            break;
          case "li": {
            appendClassName(node, classNames.listItem);
            const firstChild = node.children?.[0];
            const looksTask = firstChild?.tagName === "input" && firstChild?.properties?.type === "checkbox";
            if (looksTask) appendClassName(node, classNames.taskListItem);
            break;
          }
          case "input":
            if (node.properties?.type === "checkbox") appendClassName(node, classNames.checkbox);
            break;
          case "a": {
            appendClassName(node, classNames.link);
            const href = typeof node.properties?.href === "string" ? node.properties.href : undefined;
            if (isExternalHref(href)) {
              node.properties.target ??= "_blank";
              node.properties.rel ??= "noopener noreferrer";
            }
            break;
          }
          case "code":
            appendClassName(node, classNames.inlineCode);
            break;
          case "table":
            appendClassName(node, classNames.table);
            break;
          case "thead":
            appendClassName(node, classNames.tableHead);
            break;
          case "tbody":
            appendClassName(node, classNames.tableBody);
            break;
          case "tr":
            appendClassName(node, classNames.tableRow);
            break;
          case "th":
            appendClassName(node, classNames.tableHeader);
            break;
          case "td":
            appendClassName(node, classNames.tableCell);
            break;
          case "caption":
            appendClassName(node, classNames.tableCaption);
            break;
          case "colgroup":
            appendClassName(node, classNames.tableColumns);
            break;
          case "col":
            appendClassName(node, classNames.tableColumn);
            break;
          case "pre": {
            const codeChild = node.children?.find((child: any) => child.tagName === "code");
            const className = Array.isArray(codeChild?.properties?.className)
              ? codeChild.properties.className.join(" ")
              : typeof codeChild?.properties?.className === "string"
                ? codeChild.properties.className
                : "";
            const language = className.match(/language-([a-z0-9_-]+)/i)?.[1];
            appendClassName(node, classNames.codeBlock);
            if (language) {
              node.children = [
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: [classNames.codeHeader] },
                  children: [{ type: "text", value: language }],
                },
                {
                  type: "element",
                  tagName: "div",
                  properties: { className: [classNames.codeSurface] },
                  children: node.children,
                },
              ];
            } else {
              appendClassName(node, classNames.codeSurface);
            }
            break;
          }
          default:
            break;
        }
      });
    };
  };
}

export function getDefaultMarkdownRemarkPlugins(): unknown[] {
  return [remarkGfm, remarkSupersub];
}

export function createMarkdownProcessor(
  options: RenderMarkdownToHtmlOptions = {},
): { processor: ReturnType<typeof unified>; classNames: MarkdownRendererClassNames } {
  const classNames = resolveMarkdownRendererClassNames(options.classNames);
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkSupersub) as ReturnType<typeof unified>;

  for (const plugin of options.remarkPlugins ?? []) {
    (processor as any).use(plugin as any);
  }

  (processor as any).use(remarkRehype);

  for (const plugin of options.rehypePlugins ?? []) {
    (processor as any).use(plugin as any);
  }

  (processor as any).use(rehypeApplyMarkdownClasses(classNames) as any);
  (processor as any).use(rehypeStringify as any, { allowDangerousHtml: false });

  return { processor, classNames };
}

export async function renderMarkdownToHtml(
  markdown: string,
  options: RenderMarkdownToHtmlOptions = {},
): Promise<string> {
  const { processor, classNames } = createMarkdownProcessor(options);
  const file = await processor.process(markdown);
  return `<div class="${classNames.root}">${String(file)}</div>`;
}
