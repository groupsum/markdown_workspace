import { unified } from "unified";
import type { MarkdownRendererClassNames, RenderMarkdownToHtmlOptions } from "./types.js";
export declare function getDefaultMarkdownRemarkPlugins(): unknown[];
export declare function createMarkdownProcessor(options?: RenderMarkdownToHtmlOptions): {
    processor: ReturnType<typeof unified>;
    classNames: MarkdownRendererClassNames;
};
export declare function renderMarkdownToHtml(markdown: string, options?: RenderMarkdownToHtmlOptions): Promise<string>;
//# sourceMappingURL=pipeline.d.ts.map