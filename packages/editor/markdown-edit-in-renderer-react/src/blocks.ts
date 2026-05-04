export interface MarkdownEditBlock {
  readonly id: string;
  readonly markdown: string;
  readonly start: number;
  readonly end: number;
  readonly ordinal: number;
}

function nextBlockEnd(markdown: string, start: number): number {
  let cursor = start;
  let inFence = false;
  let fenceMarker = "";

  while (cursor < markdown.length) {
    const lineEnd = markdown.indexOf("\n", cursor);
    const nextLineEnd = lineEnd === -1 ? markdown.length : lineEnd;
    const line = markdown.slice(cursor, nextLineEnd);
    const trimmed = line.trimStart();
    const fenceMatch = trimmed.match(/^(`{3,}|~{3,})/);

    if (fenceMatch) {
      const marker = fenceMatch[1][0];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
    }

    const nextCursor = lineEnd === -1 ? markdown.length : lineEnd + 1;
    if (!inFence && line.trim() === "") {
      return nextCursor;
    }

    cursor = nextCursor;
  }

  return markdown.length;
}

export function splitMarkdownEditBlocks(markdown: string): readonly MarkdownEditBlock[] {
  if (markdown.length === 0) {
    return [{ id: "block-1", markdown: "", start: 0, end: 0, ordinal: 0 }];
  }

  const blocks: MarkdownEditBlock[] = [];
  let cursor = 0;

  while (cursor < markdown.length) {
    const end = nextBlockEnd(markdown, cursor);
    const source = markdown.slice(cursor, end);
    blocks.push({
      id: `block-${blocks.length + 1}`,
      markdown: source,
      start: cursor,
      end,
      ordinal: blocks.length,
    });
    cursor = end;
  }

  return blocks;
}

export function replaceMarkdownEditBlock(
  markdown: string,
  block: Pick<MarkdownEditBlock, "start" | "end">,
  nextBlockMarkdown: string,
): string {
  return `${markdown.slice(0, block.start)}${nextBlockMarkdown}${markdown.slice(block.end)}`;
}
