import { useEffect } from 'react';
import { buildPageMetadata } from '../utils/pageMetadata';

type MetadataInput = Parameters<typeof buildPageMetadata>[0];

const ensureMetaTag = (selector: string, attrs: Record<string, string>) => {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }
  return element;
};

const setMetaContent = (selector: string, attrs: Record<string, string>, content: string) => {
  const element = ensureMetaTag(selector, attrs);
  element.setAttribute('content', content);
};

const setLinkHref = (selector: string, attrs: Record<string, string>, href: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(selector);
  if (!element) {
    element = document.createElement('link');
    Object.entries(attrs).forEach(([key, value]) => element?.setAttribute(key, value));
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
};

export const usePageMetadata = (input: MetadataInput) => {
  useEffect(() => {
    const metadata = buildPageMetadata(input);
    document.title = metadata.title;

    setMetaContent('meta[name="description"]', { name: 'description' }, metadata.description);
    setMetaContent('meta[property="og:title"]', { property: 'og:title' }, metadata.title);
    setMetaContent('meta[property="og:description"]', { property: 'og:description' }, metadata.description);
    setMetaContent('meta[property="og:url"]', { property: 'og:url' }, metadata.url);
    setMetaContent('meta[property="og:image"]', { property: 'og:image' }, metadata.image);
    setMetaContent('meta[property="og:image:alt"]', { property: 'og:image:alt' }, metadata.imageAlt);
    setMetaContent('meta[name="twitter:title"]', { name: 'twitter:title' }, metadata.title);
    setMetaContent('meta[name="twitter:description"]', { name: 'twitter:description' }, metadata.description);
    setMetaContent('meta[name="twitter:image"]', { name: 'twitter:image' }, metadata.image);
    setMetaContent('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt' }, metadata.imageAlt);
    setLinkHref('link[rel="canonical"]', { rel: 'canonical' }, metadata.url);
  }, [input.description, input.image, input.imageAlt, input.path, input.title]);
};
