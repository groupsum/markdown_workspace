export interface MarkdownHeading {
    readonly depth: number;
    readonly text: string;
    readonly slug: string;
    readonly index: number;
}
export interface ParseMarkdownDocumentOptions {
    readonly excerptSeparator?: string;
}
export interface ParsedMarkdownDocument {
    readonly raw: string;
    readonly content: string;
    readonly metadata: Readonly<Record<string, unknown>>;
    readonly headings: readonly MarkdownHeading[];
    readonly excerpt?: string;
}
export interface ExtractMarkdownHeadingsOptions {
    readonly minimumDepth?: number;
    readonly maximumDepth?: number;
}
export type MarkdownRendererClassNames = Readonly<{
    root: string;
    heading1: string;
    heading2: string;
    heading3: string;
    heading4: string;
    heading5: string;
    heading6: string;
    paragraph: string;
    strong: string;
    emphasis: string;
    hr: string;
    blockquote: string;
    listUnordered: string;
    listOrdered: string;
    listItem: string;
    taskListItem: string;
    checkbox: string;
    link: string;
    inlineCode: string;
    table: string;
    tableHead: string;
    tableBody: string;
    tableRow: string;
    tableHeader: string;
    tableCell: string;
    tableCaption: string;
    tableColumns: string;
    tableColumn: string;
    codeBlock: string;
    codeHeader: string;
    codeSurface: string;
}>;
export interface MarkdownRenderHooks {
    readonly remarkPlugins?: readonly unknown[];
    readonly rehypePlugins?: readonly unknown[];
}
export interface RenderMarkdownToHtmlOptions extends MarkdownRenderHooks {
    readonly classNames?: Partial<MarkdownRendererClassNames>;
}
export interface HtmlDocumentOptions {
    readonly title: string;
    readonly bodyHtml: string;
    readonly lang?: string;
    readonly dataTheme?: string;
    readonly htmlClassName?: string;
    readonly bodyClassName?: string;
    readonly stylesheets?: readonly string[];
}
export interface RenderMarkdownToHtmlDocumentOptions extends RenderMarkdownToHtmlOptions {
    readonly title: string;
    readonly lang?: string;
    readonly dataTheme?: string;
    readonly htmlClassName?: string;
    readonly bodyClassName?: string;
    readonly stylesheets?: readonly string[];
}
//# sourceMappingURL=types.d.ts.map