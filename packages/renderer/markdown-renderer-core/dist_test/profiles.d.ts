import type { MarkdownOptionalProfileId } from './types.js';
export interface MarkdownOptionalProfileDefinition {
    readonly id: MarkdownOptionalProfileId;
    readonly name: string;
    readonly status: 'in-scope' | 'experimental' | 'out-of-scope';
    readonly previewRequiresTrustedHtml?: boolean;
    readonly exportRequiresTrustedHtml?: boolean;
    readonly notes?: readonly string[];
}
export declare const MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS: readonly [{
    readonly id: "front-matter";
    readonly name: "Metadata / Front Matter";
    readonly status: "in-scope";
    readonly notes: readonly ["Front matter is parsed into document metadata and omitted from rendered Markdown output."];
}, {
    readonly id: "footnotes";
    readonly name: "Footnotes";
    readonly status: "in-scope";
    readonly notes: readonly ["Footnote references and definitions render into linked footnote sections."];
}, {
    readonly id: "definition-lists";
    readonly name: "Definition Lists";
    readonly status: "in-scope";
    readonly notes: readonly ["Definition lists render into <dl>/<dt>/<dd> structures."];
}, {
    readonly id: "math";
    readonly name: "Math";
    readonly status: "in-scope";
    readonly notes: readonly ["Math rendering is structural in this checkpoint; equations are not typeset with KaTeX/MathJax."];
}, {
    readonly id: "citations";
    readonly name: "Citations";
    readonly status: "experimental";
    readonly notes: readonly ["Citation keys render structurally, but bibliography resolution remains outside the certification boundary."];
}, {
    readonly id: "superscript";
    readonly name: "Superscript";
    readonly status: "in-scope";
}, {
    readonly id: "subscript";
    readonly name: "Subscript";
    readonly status: "in-scope";
}, {
    readonly id: "smart-punctuation";
    readonly name: "Smart Punctuation";
    readonly status: "in-scope";
}, {
    readonly id: "markdown-in-html";
    readonly name: "Markdown in HTML";
    readonly status: "experimental";
    readonly previewRequiresTrustedHtml: true;
    readonly exportRequiresTrustedHtml: true;
    readonly notes: readonly ["Only trusted HTML containers explicitly marked with markdown/data-markdown are interpreted in this checkpoint."];
}];
export declare const MARKDOWN_OPTIONAL_PROFILE_IDS: readonly MarkdownOptionalProfileId[];
export declare function isMarkdownOptionalProfileId(value: unknown): value is MarkdownOptionalProfileId;
export declare function resolveMarkdownOptionalProfiles(value: readonly MarkdownOptionalProfileId[] | null | undefined): readonly MarkdownOptionalProfileId[];
export declare function getMarkdownOptionalProfileDefinition(id: MarkdownOptionalProfileId): MarkdownOptionalProfileDefinition | undefined;
//# sourceMappingURL=profiles.d.ts.map