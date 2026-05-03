const siteUrl = (import.meta.env.VITE_SITE_URL?.trim() || 'https://mdwrk.com').replace(/\/+$/, '');
const defaultTitle = 'MdWrk';
const defaultDescription =
  'MdWrk is a privacy-first, offline-capable Markdown workspace for writing, previewing, and managing Markdown on your device.';
const defaultImage = `${siteUrl}/favicon.svg`;
const defaultImageAlt = 'MdWrk favicon logo with layered Markdown panels';
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
}

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

export const pageMetadataDefaults = {
  title: defaultTitle,
  description: defaultDescription,
  image: defaultImage,
  imageAlt: defaultImageAlt,
  siteUrl,
};
