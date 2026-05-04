export interface PlaintextSelection {
  readonly start: number;
  readonly end: number;
}

export type ProjectionConfidence = "exact" | "nearest" | "retained";

export interface ProjectionRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export interface ProjectedCaret {
  readonly plaintextLine: number;
  readonly plaintextChar: number;
  readonly renderedLine: number;
  readonly renderedChar: number;
  readonly blockIndex: number;
  readonly renderedLineInBlock: number;
  readonly blankLineIndex: number;
  readonly isBlankLine: boolean;
}

export interface RenderedCaret extends ProjectedCaret {
  readonly visible: boolean;
  readonly left: number;
  readonly top: number;
  readonly height: number;
  readonly confidence: ProjectionConfidence;
}

export interface ProjectionResult {
  readonly caret: RenderedCaret;
  readonly selectionRects: readonly ProjectionRect[];
  readonly confidence: ProjectionConfidence;
}

interface RenderedTarget {
  readonly target: HTMLElement;
  readonly caret: ProjectedCaret;
}

export function getLineStartOffsets(markdown: string): number[] {
  const offsets = [0];
  for (let index = 0; index < markdown.length; index += 1) {
    if (markdown[index] === "\n") {
      offsets.push(index + 1);
    }
  }
  return offsets;
}

export function getRenderedCharForPlaintextLine(line: string, plaintextChar: number): number {
  const headingMatch = /^(#{1,6})([ \t]+)(.*)$/.exec(line);
  if (headingMatch) {
    return Math.max(0, plaintextChar - headingMatch[1].length - headingMatch[2].length);
  }

  const unorderedListMatch = /^([ \t]*)([-+*])([ \t]+)(.*)$/.exec(line);
  if (unorderedListMatch) {
    return Math.max(0, plaintextChar - unorderedListMatch[1].length - unorderedListMatch[2].length - unorderedListMatch[3].length);
  }

  const orderedListMatch = /^([ \t]*)(\d+\.)([ \t]+)(.*)$/.exec(line);
  if (orderedListMatch) {
    return Math.max(0, plaintextChar - orderedListMatch[1].length - orderedListMatch[2].length - orderedListMatch[3].length);
  }

  const blockquoteMatch = /^([ \t]*>)([ \t]?)(.*)$/.exec(line);
  if (blockquoteMatch) {
    return Math.max(0, plaintextChar - blockquoteMatch[1].length - blockquoteMatch[2].length);
  }

  return plaintextChar;
}

function getPlaintextCharForRenderedLine(line: string, renderedChar: number): number {
  const headingMatch = /^(#{1,6})([ \t]+)(.*)$/.exec(line);
  if (headingMatch) {
    return Math.min(line.length, renderedChar + headingMatch[1].length + headingMatch[2].length);
  }

  const unorderedListMatch = /^([ \t]*)([-+*])([ \t]+)(.*)$/.exec(line);
  if (unorderedListMatch) {
    return Math.min(line.length, renderedChar + unorderedListMatch[1].length + unorderedListMatch[2].length + unorderedListMatch[3].length);
  }

  const orderedListMatch = /^([ \t]*)(\d+\.)([ \t]+)(.*)$/.exec(line);
  if (orderedListMatch) {
    return Math.min(line.length, renderedChar + orderedListMatch[1].length + orderedListMatch[2].length + orderedListMatch[3].length);
  }

  const blockquoteMatch = /^([ \t]*>)([ \t]?)(.*)$/.exec(line);
  if (blockquoteMatch) {
    return Math.min(line.length, renderedChar + blockquoteMatch[1].length + blockquoteMatch[2].length);
  }

  return Math.min(line.length, renderedChar);
}

function getRenderedBlockIndex(lines: string[], lineIndex: number): number {
  let blockIndex = -1;
  let inBlock = false;

  for (let index = 0; index <= lineIndex; index += 1) {
    const line = lines[index] ?? "";
    if (line.trim() === "") {
      inBlock = false;
      continue;
    }
    if (!inBlock) {
      blockIndex += 1;
      inBlock = true;
    }
  }

  return Math.max(0, blockIndex);
}

function getRenderedLineInBlock(lines: string[], lineIndex: number): number {
  let lineInBlock = 0;
  for (let index = lineIndex - 1; index >= 0; index -= 1) {
    if ((lines[index] ?? "").trim() === "") break;
    lineInBlock += 1;
  }
  return lineInBlock;
}

function getPlaintextLineForRenderedBlockLine(lines: string[], blockIndex: number, renderedLineInBlock: number): number {
  let currentBlock = -1;
  let inBlock = false;
  let currentLineInBlock = 0;

  for (let index = 0; index < lines.length; index += 1) {
    if ((lines[index] ?? "").trim() === "") {
      inBlock = false;
      currentLineInBlock = 0;
      continue;
    }
    if (!inBlock) {
      currentBlock += 1;
      currentLineInBlock = 0;
      inBlock = true;
    }
    if (currentBlock === blockIndex && currentLineInBlock === renderedLineInBlock) {
      return index;
    }
    currentLineInBlock += 1;
  }

  return Math.max(0, lines.length - 1);
}

export function getProjectedCaret(markdown: string, selectionStart: number): ProjectedCaret {
  const lines = markdown.split("\n");
  const lineStartOffsets = getLineStartOffsets(markdown);
  const offset = Math.max(0, Math.min(selectionStart, markdown.length));
  let lineIndex = lineStartOffsets.length - 1;

  for (let index = 0; index < lineStartOffsets.length; index += 1) {
    const nextStart = lineStartOffsets[index + 1] ?? Number.POSITIVE_INFINITY;
    if (offset >= lineStartOffsets[index] && offset < nextStart) {
      lineIndex = index;
      break;
    }
  }

  const line = lines[lineIndex] ?? "";
  const plaintextChar = offset - (lineStartOffsets[lineIndex] ?? 0);
  const isBlankLine = line.trim() === "";

  return {
    plaintextLine: lineIndex + 1,
    plaintextChar: plaintextChar + 1,
    renderedLine: lineIndex + 1,
    renderedChar: getRenderedCharForPlaintextLine(line, plaintextChar) + 1,
    blockIndex: getRenderedBlockIndex(lines, lineIndex),
    renderedLineInBlock: getRenderedLineInBlock(lines, lineIndex),
    blankLineIndex: lines.slice(0, lineIndex + 1).filter((candidate) => candidate.trim() === "").length - 1,
    isBlankLine,
  };
}

function getContentRoot(surface: HTMLElement): HTMLElement {
  return surface.querySelector<HTMLElement>(".markdown-body") ?? surface;
}

function getRenderedBlocks(contentRoot: HTMLElement): HTMLElement[] {
  return Array.from(contentRoot.children).filter((child): child is HTMLElement => (
    child instanceof HTMLElement
    && !child.classList.contains("markdown-edit-in-renderer-blank-line")
  ));
}

function getRenderedTarget(surface: HTMLElement, caret: ProjectedCaret): RenderedTarget | null {
  const contentRoot = getContentRoot(surface);
  const renderedBlocks = getRenderedBlocks(contentRoot);
  const blankLines = Array.from(contentRoot.querySelectorAll<HTMLElement>(".markdown-edit-in-renderer-blank-line"));
  const target = caret.isBlankLine ? blankLines[caret.blankLineIndex] : renderedBlocks[caret.blockIndex];
  return target ? { target, caret } : null;
}

function findTextNode(root: Node, lineIndex: number, offset: number): { node: Node; offset: number } | null {
  const ownerDocument = root.ownerDocument ?? document;
  const defaultView = ownerDocument.defaultView;
  const walker = ownerDocument.createTreeWalker(
    root,
    (defaultView?.NodeFilter.SHOW_TEXT ?? 4) | (defaultView?.NodeFilter.SHOW_ELEMENT ?? 1),
  );
  let currentLine = 0;
  let remaining = Math.max(0, offset);
  let current = walker.nextNode();
  let lastTextNode: Text | null = null;
  let lineStart: { node: Node; offset: number } | null = null;

  while (current) {
    if (defaultView && current instanceof defaultView.HTMLBRElement) {
      if (currentLine === lineIndex && remaining <= 0 && current.parentNode) {
        return { node: current.parentNode, offset: Array.prototype.indexOf.call(current.parentNode.childNodes, current) };
      }
      currentLine += 1;
      remaining = Math.max(0, offset);
      if (currentLine === lineIndex && current.parentNode) {
        lineStart = {
          node: current.parentNode,
          offset: Array.prototype.indexOf.call(current.parentNode.childNodes, current) + 1,
        };
      }
    } else if (defaultView && current.nodeType === defaultView.Node.TEXT_NODE && currentLine === lineIndex) {
      const text = current.textContent ?? "";
      lastTextNode = current as Text;
      if (remaining <= text.length) {
        return { node: current, offset: remaining };
      }
      remaining -= text.length;
    }
    current = walker.nextNode();
  }

  if (lastTextNode && currentLine === lineIndex) {
    return { node: lastTextNode, offset: lastTextNode.data.length };
  }

  return lineStart;
}

function createRangeForCaret(target: HTMLElement, caret: ProjectedCaret): Range {
  const ownerDocument = target.ownerDocument;
  const textTarget = findTextNode(target, caret.renderedLineInBlock, caret.renderedChar - 1);
  const range = ownerDocument.createRange();

  if (textTarget) {
    const maxOffset = textTarget.node.nodeType === textTarget.node.ownerDocument?.defaultView?.Node.TEXT_NODE
      ? textTarget.node.textContent?.length ?? 0
      : textTarget.node.childNodes.length;
    range.setStart(textTarget.node, Math.min(textTarget.offset, maxOffset));
  } else {
    range.selectNodeContents(target);
    range.collapse(false);
  }

  range.collapse(true);
  return range;
}

function rectToSurfaceRect(rect: DOMRect | ClientRect, surfaceRect: DOMRect, surface: HTMLElement): ProjectionRect {
  return {
    left: rect.left - surfaceRect.left + surface.scrollLeft,
    top: rect.top - surfaceRect.top + surface.scrollTop,
    width: rect.width,
    height: rect.height,
  };
}

function projectCaret(surface: HTMLElement, caret: ProjectedCaret, previousCaret: RenderedCaret, visible: boolean): RenderedCaret {
  const renderedTarget = getRenderedTarget(surface, caret);
  if (!renderedTarget) {
    return {
      ...previousCaret,
      ...caret,
      visible,
      confidence: "retained",
    };
  }

  const range = createRangeForCaret(renderedTarget.target, caret);
  const surfaceRect = surface.getBoundingClientRect();
  const rangeRect = typeof range.getBoundingClientRect === "function"
    ? range.getBoundingClientRect()
    : { left: 0, top: 0, width: 0, height: 0 };
  const fallbackRect = renderedTarget.target.getBoundingClientRect();
  const usableRect = rangeRect.width || rangeRect.height ? rangeRect : fallbackRect;
  const projectedRect = rectToSurfaceRect(usableRect, surfaceRect, surface);

  return {
    ...caret,
    visible,
    left: projectedRect.left,
    top: projectedRect.top,
    height: projectedRect.height || fallbackRect.height || 16,
    confidence: rangeRect.width || rangeRect.height ? "exact" : "nearest",
  };
}

export function projectSelectionRects(surface: HTMLElement, markdown: string, selection: PlaintextSelection): ProjectionRect[] {
  const start = Math.min(selection.start, selection.end);
  const end = Math.max(selection.start, selection.end);
  if (start === end) return [];

  const startCaret = getProjectedCaret(markdown, start);
  const endCaret = getProjectedCaret(markdown, end);
  const startTarget = getRenderedTarget(surface, startCaret);
  const endTarget = getRenderedTarget(surface, endCaret);
  if (!startTarget || !endTarget || startTarget.target !== endTarget.target) {
    return projectLineSelectionRects(surface, markdown, start, end);
  }

  const range = surface.ownerDocument.createRange();
  const startNode = findTextNode(startTarget.target, startCaret.renderedLineInBlock, startCaret.renderedChar - 1);
  const endNode = findTextNode(endTarget.target, endCaret.renderedLineInBlock, endCaret.renderedChar - 1);
  if (!startNode || !endNode) return projectLineSelectionRects(surface, markdown, start, end);

  range.setStart(startNode.node, Math.min(startNode.offset, startNode.node.nodeType === startNode.node.ownerDocument?.defaultView?.Node.TEXT_NODE ? startNode.node.textContent?.length ?? 0 : startNode.node.childNodes.length));
  range.setEnd(endNode.node, Math.min(endNode.offset, endNode.node.nodeType === endNode.node.ownerDocument?.defaultView?.Node.TEXT_NODE ? endNode.node.textContent?.length ?? 0 : endNode.node.childNodes.length));

  const surfaceRect = surface.getBoundingClientRect();
  return Array.from(range.getClientRects()).map((rect) => rectToSurfaceRect(rect, surfaceRect, surface));
}

function projectLineSelectionRects(surface: HTMLElement, markdown: string, start: number, end: number): ProjectionRect[] {
  const rects: ProjectionRect[] = [];
  const lineStartOffsets = getLineStartOffsets(markdown);
  for (let index = 0; index < lineStartOffsets.length; index += 1) {
    const lineStart = lineStartOffsets[index] ?? 0;
    const nextLineStart = lineStartOffsets[index + 1] ?? markdown.length + 1;
    const lineEnd = Math.max(lineStart, nextLineStart - 1);
    const rangeStart = Math.max(start, lineStart);
    const rangeEnd = Math.min(end, lineEnd);
    if (rangeStart >= rangeEnd) continue;
    const lineSelection = { start: rangeStart, end: rangeEnd };
    rects.push(...projectSelectionRects(surface, markdown, lineSelection));
  }
  return rects;
}

export function projectMarkdownState(
  surface: HTMLElement,
  markdown: string,
  selection: PlaintextSelection,
  previousCaret: RenderedCaret,
  visible: boolean,
): ProjectionResult {
  const projectedCaret = getProjectedCaret(markdown, selection.start);
  const caret = projectCaret(surface, projectedCaret, previousCaret, visible);
  const selectionRects = projectSelectionRects(surface, markdown, selection);
  return {
    caret,
    selectionRects,
    confidence: caret.confidence,
  };
}

export function plaintextOffsetFromRenderedPoint(surface: HTMLElement, markdown: string, clientX: number, clientY: number): number {
  const lines = markdown.split("\n");
  const lineStartOffsets = getLineStartOffsets(markdown);
  const contentRoot = getContentRoot(surface);
  const blocks = getRenderedBlocks(contentRoot);
  if (blocks.length === 0) return Math.min(markdown.length, Math.max(0, lineStartOffsets[0] ?? 0));

  let nearestBlockIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;
  blocks.forEach((block, index) => {
    const rect = block.getBoundingClientRect();
    const verticalDistance = clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0;
    if (verticalDistance < nearestDistance) {
      nearestDistance = verticalDistance;
      nearestBlockIndex = index;
    }
  });

  const block = blocks[nearestBlockIndex];
  if (!block) return markdown.length;

  const lineRects = collectRenderedLineRects(block);
  let renderedLineInBlock = 0;
  let lineDistance = Number.POSITIVE_INFINITY;
  lineRects.forEach((rect, index) => {
    const distance = clientY < rect.top ? rect.top - clientY : clientY > rect.bottom ? clientY - rect.bottom : 0;
    if (distance < lineDistance) {
      lineDistance = distance;
      renderedLineInBlock = index;
    }
  });

  const renderedChar = renderedCharFromPoint(block, renderedLineInBlock, clientX);
  const plaintextLineIndex = getPlaintextLineForRenderedBlockLine(lines, nearestBlockIndex, renderedLineInBlock);
  const line = lines[plaintextLineIndex] ?? "";
  const plaintextChar = getPlaintextCharForRenderedLine(line, renderedChar);
  return Math.max(0, Math.min(markdown.length, (lineStartOffsets[plaintextLineIndex] ?? 0) + plaintextChar));
}

function collectRenderedLineRects(block: HTMLElement): DOMRect[] {
  const ownerDocument = block.ownerDocument;
  const range = ownerDocument.createRange();
  const rects: DOMRect[] = [];
  const walker = ownerDocument.createTreeWalker(block, (ownerDocument.defaultView?.NodeFilter.SHOW_TEXT ?? 4) | (ownerDocument.defaultView?.NodeFilter.SHOW_ELEMENT ?? 1));
  let currentLine = 0;
  let current = walker.nextNode();

  while (current) {
    if (ownerDocument.defaultView && current instanceof ownerDocument.defaultView.HTMLBRElement) {
      currentLine += 1;
    } else if (ownerDocument.defaultView && current.nodeType === ownerDocument.defaultView.Node.TEXT_NODE) {
      range.selectNodeContents(current);
      const nodeRects = Array.from(range.getClientRects());
      if (nodeRects.length > 0) {
        rects[currentLine] = unionRects(rects[currentLine], nodeRects[0]);
      }
    }
    current = walker.nextNode();
  }

  return rects.length > 0 ? rects : [block.getBoundingClientRect()];
}

function unionRects(left: DOMRect | undefined, right: DOMRect): DOMRect {
  if (!left) return right;
  const x1 = Math.min(left.left, right.left);
  const y1 = Math.min(left.top, right.top);
  const x2 = Math.max(left.right, right.right);
  const y2 = Math.max(left.bottom, right.bottom);
  return DOMRect.fromRect({ x: x1, y: y1, width: x2 - x1, height: y2 - y1 });
}

function renderedCharFromPoint(block: HTMLElement, renderedLineInBlock: number, clientX: number): number {
  const ownerDocument = block.ownerDocument;
  const walker = ownerDocument.createTreeWalker(block, (ownerDocument.defaultView?.NodeFilter.SHOW_TEXT ?? 4) | (ownerDocument.defaultView?.NodeFilter.SHOW_ELEMENT ?? 1));
  let currentLine = 0;
  let renderedChar = 0;
  let bestChar = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  let current = walker.nextNode();

  while (current) {
    if (ownerDocument.defaultView && current instanceof ownerDocument.defaultView.HTMLBRElement) {
      if (currentLine === renderedLineInBlock) break;
      currentLine += 1;
      renderedChar = 0;
    } else if (ownerDocument.defaultView && current.nodeType === ownerDocument.defaultView.Node.TEXT_NODE && currentLine === renderedLineInBlock) {
      const text = current.textContent ?? "";
      for (let offset = 0; offset <= text.length; offset += 1) {
        const range = ownerDocument.createRange();
        range.setStart(current, offset);
        range.collapse(true);
        const rect = range.getBoundingClientRect();
        const distance = Math.abs(rect.left - clientX);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestChar = renderedChar + offset;
        }
      }
      renderedChar += text.length;
    }
    current = walker.nextNode();
  }

  return bestChar;
}
