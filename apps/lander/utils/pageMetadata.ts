const siteUrl = (import.meta.env.VITE_SITE_URL?.trim() || 'https://mdwrk.com').replace(/\/+$/, '');
const defaultTitle = 'MdWrk';
const defaultDescription =
  'MdWrk is a privacy-first, offline-capable Markdown workspace for writing, previewing, and managing Markdown on your device.';
const defaultImage = `${siteUrl}/og-image.png`;
const defaultImageAlt = 'MdWrk Markdown workspace preview image';
const markdownImagePattern = /!\[([^\]]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/;
const htmlImagePattern = /<img[^>]*src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>|<img[^>]*alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>|<img[^>]*src=["']([^"']+)["'][^>]*>/i;

const stripMarkdown = (content: string) =>
  content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

export const extractFirstImage = (content: string) => {
  const markdownMatch = content.match(markdownImagePattern);
  if (markdownMatch) {
    return {
      src: markdownMatch[2],
      alt: markdownMatch[1]?.trim() || '',
    };
  }

  const htmlMatch = content.match(htmlImagePattern);
  if (htmlMatch) {
    return {
      src: htmlMatch[1] || htmlMatch[4] || htmlMatch[5] || '',
      alt: htmlMatch[2] || htmlMatch[3] || '',
    };
  }

  return null;
};

export const removeFirstImage = (content: string) => {
  if (markdownImagePattern.test(content)) {
    return content.replace(markdownImagePattern, '').replace(/\n{3,}/g, '\n\n').trim();
  }

  if (htmlImagePattern.test(content)) {
    return content.replace(htmlImagePattern, '').replace(/\n{3,}/g, '\n\n').trim();
  }

  return content;
};

export const extractExcerpt = (content: string, preferredExcerpt?: string | null, maxLength = 180) => {
  const normalizedPreferredExcerpt = preferredExcerpt?.trim();
  if (normalizedPreferredExcerpt) return normalizedPreferredExcerpt;

  const paragraphs = content
    .split(/\n\s*\n/g)
    .map(segment => stripMarkdown(segment))
    .filter(Boolean);

  const firstParagraph = paragraphs[0];
  if (!firstParagraph) return defaultDescription;
  if (firstParagraph.length <= maxLength) return firstParagraph;
  return `${firstParagraph.slice(0, maxLength).trimEnd()}...`;
};

const toAbsoluteUrl = (value?: string | null) => {
  if (!value) return defaultImage;
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteUrl}/${value.replace(/^\/+/, '')}`;
};

export const summarizeMarkdown = (content: string, maxLength = 180) => {
  const plain = stripMarkdown(content);
  if (!plain) return defaultDescription;
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
};

interface PageMetadataInput {
  title?: string;
  description?: string;
  image?: string | null;
  imageAlt?: string | null;
  path?: string;
  structuredData?: JsonLdInput | JsonLdInput[] | null;
}

export type JsonLdInput = Record<string, unknown>;

export const buildPageMetadata = ({
  title,
  description,
  image,
  imageAlt,
  path = '/',
}: PageMetadataInput) => {
  const normalizedTitle = title?.trim() || defaultTitle;
  const normalizedDescription = description?.trim() || defaultDescription;
  const normalizedImage = toAbsoluteUrl(image);
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const canonicalUrl = `${siteUrl}${normalizedPath === '/' ? '/' : normalizedPath}`;
  const normalizedImageAlt = image?.trim()
    ? (imageAlt?.trim() || `${normalizedTitle} feature image`)
    : defaultImageAlt;

  return {
    title: normalizedTitle,
    description: normalizedDescription,
    url: canonicalUrl,
    image: normalizedImage,
    imageAlt: normalizedImageAlt || defaultImageAlt,
  };
};

const compactJsonLd = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(compactJsonLd).filter(item => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, entryValue]) => {
      const compacted = compactJsonLd(entryValue);
      if (compacted !== undefined && compacted !== null && compacted !== '') {
        acc[key] = compacted;
      }
      return acc;
    }, {});
  }

  return value;
};

export const buildSoftwareApplicationSchema = () => compactJsonLd({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'MdWrk',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Web, Windows, macOS, Linux, Android',
  url: `${siteUrl}/`,
  image: defaultImage,
  description: defaultDescription,
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
});

export const buildTechArticleSchema = ({
  title,
  description,
  path,
  datePublished,
}: {
  title: string;
  description: string;
  path: string;
  datePublished?: string;
}) => compactJsonLd({
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: title,
  description,
  url: `${siteUrl}${path}`,
  datePublished,
  dateModified: datePublished,
  about: {
    '@type': 'SoftwareApplication',
    name: 'MdWrk',
    url: `${siteUrl}/`,
  },
  mainEntityOfPage: `${siteUrl}${path}`,
});

export const buildBreadcrumbSchema = (items: Array<{ name: string; path: string }>) => compactJsonLd({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: `${siteUrl}${item.path}`,
  })),
});

export const buildFaqSchema = (items: Array<{ question: string; answer: string }>) => compactJsonLd({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
});

export const normalizeStructuredData = (structuredData?: JsonLdInput | JsonLdInput[] | null) => {
  if (!structuredData) return null;
  const items = Array.isArray(structuredData) ? structuredData : [structuredData];
  const compactedItems = items.map(compactJsonLd).filter(item => item && Object.keys(item as Record<string, unknown>).length > 0);
  if (compactedItems.length === 0) return null;
  return compactedItems.length === 1 ? compactedItems[0] : compactedItems;
};

export const pageMetadataDefaults = {
  title: defaultTitle,
  description: defaultDescription,
  image: defaultImage,
  imageAlt: defaultImageAlt,
  siteUrl,
};
