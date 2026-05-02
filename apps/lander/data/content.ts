import { parseMarkdown } from '../utils/markdownParser';
import { isPublishedMetadata } from '../utils/publication';
import sitemapRaw from './content-sitemap.yaml?raw';

interface ContentSitemapEntry {
  id: string;
  file: string;
}

const parseContentSitemap = (raw: string): ContentSitemapEntry[] => {
  const entries: ContentSitemapEntry[] = [];
  const lines = raw.split('\n').map(line => line.trim()).filter(Boolean);

  let current: Partial<ContentSitemapEntry> = {};

  for (const line of lines) {
    if (line.startsWith('- id:')) {
      if (current.id && current.file) {
        entries.push({ id: current.id, file: current.file });
      }
      current = { id: line.replace('- id:', '').trim() };
      continue;
    }

    if (line.startsWith('file:')) {
      current.file = line.replace('file:', '').trim();
    }
  }

  if (current.id && current.file) {
    entries.push({ id: current.id, file: current.file });
  }

  return entries;
};

const rawContentFiles = import.meta.glob('./markdown/**/*.{md,mdx}', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>;

const sitemapEntries = parseContentSitemap(sitemapRaw);

export const contentFiles = sitemapEntries.reduce<Record<string, string>>((acc, entry) => {
  const content = rawContentFiles[entry.file];
  if (content) {
    const { metadata } = parseMarkdown(content);
    if (!isPublishedMetadata(metadata)) {
      return acc;
    }
    acc[entry.id] = content;
  }
  return acc;
}, {});
