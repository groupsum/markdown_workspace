export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getListContinuationPrefix = (line: string): string | null => {
  const checkbox = line.match(/^(\s*[-*+]\s+)\[[ xX]\]\s+/);
  if (checkbox) {
    return `${checkbox[1]}[ ] `;
  }

  const unordered = line.match(/^(\s*[-*+]\s+)/);
  if (unordered) {
    return unordered[1];
  }

  const ordered = line.match(/^(\s*)(\d+)\.\s+/);
  if (ordered) {
    const next = Number(ordered[2]) + 1;
    return `${ordered[1]}${next}. `;
  }

  return null;
};

export const isEmptyListItemLine = (line: string): boolean => {
  return /^\s*(?:[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+)$/.test(line);
};

export const normalizeEmptyListItemsForPreview = (markdown: string): string => {
  const lines = markdown.split('\n');
  let inFence = false;
  let fenceMarker = '';

  return lines
    .map((line) => {
      const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})/);
      if (fenceMatch) {
        const marker = fenceMatch[2][0];
        if (!inFence) {
          inFence = true;
          fenceMarker = marker;
        } else if (marker === fenceMarker) {
          inFence = false;
          fenceMarker = '';
        }
        return line;
      }

      if (inFence) return line;

      if (/^[\t ]*[-+*][\t ]*$/.test(line)) {
        return line.replace(/^([\t ]*[-+*])([\t ]*)$/, '$1 &nbsp;');
      }

      return line;
    })
    .join('\n');
};
