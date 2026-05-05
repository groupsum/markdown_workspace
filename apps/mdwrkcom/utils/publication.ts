const normalizeStatus = (value: unknown) =>
  typeof value === 'string' ? value.trim().toLowerCase() : '';

const normalizeIsoDate = (value: unknown) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return null;
  return trimmed;
};

const toLocalIsoDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const isPublishedMetadata = (
  metadata: Record<string, unknown>,
  now: Date = new Date(),
) => {
  if (normalizeStatus(metadata.status) !== 'published') {
    return false;
  }

  const publishDate = normalizeIsoDate(metadata.date);
  if (!publishDate) {
    return false;
  }

  return publishDate <= toLocalIsoDate(now);
};
