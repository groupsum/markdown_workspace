import type { MarkdownRendererProps } from "./types.js";
export declare function renderMarkdownToStaticHtml(props: MarkdownRendererProps): string;
export declare function renderMarkdownToStaticHtmlDocument(props: MarkdownRendererProps & {
    readonly title: string;
    readonly lang?: string;
    readonly dataTheme?: string;
    readonly bodyClassName?: string;
    readonly htmlClassName?: string;
    readonly stylesheets?: readonly string[];
}): string;
//# sourceMappingURL=server.d.ts.map