export interface MarkdownHeading {
    readonly depth: number;
    readonly text: string;
    readonly slug: string;
    readonly index: number;
}
export interface MarkdownPositionPoint {
    readonly line: number;
    readonly column: number;
    readonly offset?: number;
}
export interface MarkdownPosition {
    readonly start: MarkdownPositionPoint;
    readonly end: MarkdownPositionPoint;
}
export interface MarkdownInlineNode {
    readonly type: string;
    readonly value?: string;
    readonly alt?: string;
    readonly url?: string;
    readonly title?: string;
    readonly identifier?: string;
    readonly label?: string;
    readonly children?: readonly MarkdownInlineNode[];
    readonly position?: MarkdownPosition;
}
export interface MarkdownBlockNode {
    readonly type: string;
    readonly depth?: number;
    readonly text?: string;
    readonly term?: string;
    readonly info?: string;
    readonly value?: string;
    readonly identifier?: string;
    readonly fenced?: boolean;
    readonly ordered?: boolean;
    readonly start?: number;
    readonly tight?: boolean;
    readonly task?: boolean;
    readonly checked?: boolean;
    readonly children?: readonly MarkdownBlockNode[] | readonly MarkdownInlineNode[];
    readonly items?: readonly MarkdownBlockNode[];
    readonly header?: readonly Readonly<{
        text: string;
        align?: 'left' | 'center' | 'right';
    }>[];
    readonly rows?: readonly (readonly string[])[];
    readonly position?: MarkdownPosition;
}
export interface MarkdownFootnoteDefinition {
    readonly identifier: string;
    readonly label: string;
    readonly children: readonly MarkdownBlockNode[];
    readonly position?: MarkdownPosition;
}
export interface MarkdownProcessingWarning {
    readonly profileId: MarkdownOptionalProfileId;
    readonly severity: 'info' | 'warning';
    readonly code: string;
    readonly message: string;
}
export interface MarkdownAstRoot {
    readonly type: 'root';
    readonly children: readonly MarkdownBlockNode[];
    readonly references: Readonly<Record<string, {
        readonly url: string;
        readonly title?: string;
    }>>;
    readonly metadata?: Readonly<Record<string, unknown>>;
    readonly footnotes?: readonly MarkdownFootnoteDefinition[];
    readonly activeExtensions?: readonly MarkdownOptionalProfileId[];
    readonly warnings?: readonly MarkdownProcessingWarning[];
    readonly position?: MarkdownPosition;
}
export type MarkdownBaseProfileId = 'commonmark-core' | 'gfm-default';
export type MarkdownOptionalProfileId = 'front-matter' | 'footnotes' | 'definition-lists' | 'math' | 'citations' | 'superscript' | 'subscript' | 'smart-punctuation' | 'markdown-in-html';
export type MarkdownProfileId = MarkdownBaseProfileId;
export interface ParseMarkdownDocumentOptions {
    readonly excerptSeparator?: string;
    readonly htmlHandling?: MarkdownHtmlHandlingMode;
    readonly profile?: MarkdownProfileId;
    readonly extensions?: readonly MarkdownOptionalProfileId[];
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
    strikethrough: string;
    superscript: string;
    subscript: string;
    citation: string;
    footnoteReference: string;
    footnotes: string;
    footnoteBacklink: string;
    definitionList: string;
    definitionTerm: string;
    definitionDescription: string;
    mathInline: string;
    mathBlock: string;
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
export type MarkdownHtmlHandlingMode = 'escape' | 'sanitize' | 'allow-trusted';
export interface MarkdownLinkAttributeResult {
    readonly target?: string;
    readonly rel?: string;
}
export interface MarkdownRenderHooks {
    readonly remarkPlugins?: readonly unknown[];
    readonly rehypePlugins?: readonly unknown[];
}
export interface RenderMarkdownToHtmlOptions extends MarkdownRenderHooks {
    readonly classNames?: Partial<MarkdownRendererClassNames>;
    readonly htmlHandling?: MarkdownHtmlHandlingMode;
    readonly profile?: MarkdownProfileId;
    readonly extensions?: readonly MarkdownOptionalProfileId[];
    readonly sourcePositionAttributes?: boolean;
    readonly preserveSoftLineBreaks?: boolean;
    readonly getLinkAttributes?: (href?: string) => MarkdownLinkAttributeResult | undefined;
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
