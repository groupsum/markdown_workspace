import {
  extractMarkdownHeadings,
  parseMarkdownDocument,
  type ParsedMarkdownDocument,
} from '@mdwrk/markdown-renderer-core';

export interface ParsedMarkdown {
  metadata: Record<string, any>;
  content: string;
}

export const parseMarkdown = (raw: string): ParsedMarkdown => {
  const parsed: ParsedMarkdownDocument = parseMarkdownDocument(raw);
  return {
    metadata: { ...(parsed.metadata as Record<string, any>) },
    content: parsed.content,
  };
};

export const extractHeadings = (content: string) => {
  return extractMarkdownHeadings(content, { minimumDepth: 2 }).map((heading) => heading.text);
};
