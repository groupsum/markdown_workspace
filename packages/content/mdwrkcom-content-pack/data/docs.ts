import { parseMarkdown } from '../utils/markdownParser';
import { isPublishedMetadata } from '../utils/publication';

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

const toCompareSlug = (slug: string) =>
  `compare/${slug
    .replace(/^comparisons\//, '')
    .replace(/^mdwrk-vs-/, '')
    .replace(/^mdwrk-vs/i, '')
    .replace(/^vs-/, '')
    .replace(/^vscode$/, 'vs-code')}`;

const toFeatureSlug = (slug: string) =>
  `features/${slug
    .replace(/^product\//, '')
    .replace(/^usage\//, '')}`;

const rawDocs = import.meta.glob('./markdown/docs/**/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
});

const docEntries = Object.entries(rawDocs).map(([path, raw]) => {
  const { metadata, content } = parseMarkdown(raw as string);
  const rawTitle = metadata.title || path.split('/').pop()?.replace('.md', '') || 'Document';
  const title = toTitleCase(String(rawTitle));
  const section = metadata.section || 'Docs';
  const rawSlug = metadata.slug || slugify(title);
  const isComparison = section === 'Compares' || String(rawSlug).startsWith('comparisons/');
  const isFeature = section === 'Features';
  const slug = isComparison ? toCompareSlug(String(rawSlug)) : isFeature ? toFeatureSlug(String(rawSlug)) : rawSlug;
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
}).filter((entry) => isPublishedMetadata(entry.metadata));

export const compareDocs = docEntries
  .filter((entry) => entry.section === 'Compares' || entry.slug.startsWith('compare/'))
  .slice()
  .sort((a, b) => a.sectionOrder - b.sectionOrder || a.order - b.order || a.title.localeCompare(b.title));

export const compareDocsBySlug = compareDocs.reduce<Record<string, DocEntry>>((acc, doc) => {
  acc[doc.slug.replace(/^compare\//, '')] = doc;
  return acc;
}, {});

export const featureDocs = docEntries
  .filter((entry) => entry.section === 'Features' || entry.slug.startsWith('features/'))
  .slice()
  .sort((a, b) => a.sectionOrder - b.sectionOrder || a.order - b.order || a.title.localeCompare(b.title));

export const featureDocsBySlug = featureDocs.reduce<Record<string, DocEntry>>((acc, doc) => {
  acc[doc.slug.replace(/^features\//, '')] = doc;
  return acc;
}, {});

export const docs = docEntries
  .filter((entry) => entry.section !== 'Compares' && !entry.slug.startsWith('compare/') && entry.section !== 'Features' && !entry.slug.startsWith('features/'))
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
