import { parseMarkdown } from '../utils/markdownParser';

export interface DocEntry {
  slug: string;
  title: string;
  section: string;
  sectionOrder: number;
  order: number;
  content: string;
  metadata: Record<string, string>;
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s-/]/g, '')
    .trim()
    .replace(/\s+/g, '-');

const toTitleCase = (value: string) =>
  value
    .replace(/\bmdwrk\b/gim, 'MdWrk')
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      if (/^MdWrk$/.test(part)) return part;
      if (/^[A-Z0-9.-]+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(' ');

const rawDocs = import.meta.glob('./markdown/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

const docEntries = Object.entries(rawDocs).map(([path, raw]) => {
  const { metadata, content } = parseMarkdown(raw as string);
  const rawTitle = metadata.title || path.split('/').pop()?.replace('.md', '') || 'Document';
  const title = toTitleCase(String(rawTitle));
  const slug = metadata.slug || slugify(title);
  const section = metadata.section || 'Docs';
  const sectionOrder = Number(metadata.sectionOrder ?? 999);
  const order = Number(metadata.order ?? 999);

  return {
    slug,
    title,
    section,
    sectionOrder,
    order,
    content,
    metadata
  };
});

export const docs = docEntries
  .slice()
  .sort((a, b) => a.sectionOrder - b.sectionOrder || a.order - b.order || a.title.localeCompare(b.title));

export const docsBySlug = docs.reduce<Record<string, DocEntry>>((acc, doc) => {
  acc[doc.slug] = doc;
  return acc;
}, {});

export const docSections = docs.reduce<Record<string, DocEntry[]>>((acc, doc) => {
  if (!acc[doc.section]) {
    acc[doc.section] = [];
  }
  acc[doc.section].push(doc);
  return acc;
}, {});
