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
