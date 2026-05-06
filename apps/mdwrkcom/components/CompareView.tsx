import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Scale } from 'lucide-react';
import { compareDocs, compareDocsBySlug } from '../data/docs';
import { extractHeadings } from '../utils/markdownParser';
import { usePageMetadata } from '../hooks/usePageMetadata';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildTechArticleSchema,
  deriveKeywords,
  extractExcerpt,
  getArticleMetadataImage
} from '../utils/pageMetadata';
import { MarkdownViewer } from './MarkdownViewer';
import { Breadcrumbs } from './Breadcrumbs';
import { SectionMenu } from './SectionMenu';

const normalizeTitle = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s\-]+/g, ' ');

const removeDuplicateLeadingHeading = (content: string, title?: string) => {
  if (!title) return content;
  const headingMatch = content.match(/^#\s+(.+)\n*/);
  if (!headingMatch) return content;
  const headingText = headingMatch[1]?.trim() ?? '';
  if (normalizeTitle(headingText) !== normalizeTitle(title)) return content;
  return content.slice(headingMatch[0].length).trim();
};

const stripLegacyAeoSections = (content: string) => {
  const match = /^##\s+(Quick Reference|Article Guide)\s*$/m.exec(content.trim());
  if (!match || match.index === undefined) return content.trim();
  return content.slice(0, match.index).trim();
};

const toDisplayDate = (date?: string) => {
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return date || '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
};

const buildCompareFaqItems = (title: string, excerpt: string) => {
  const comparisonTarget = /^MdWrk\s+V(?:s|S)\s+(.+)$/i.exec(title)?.[1]?.trim();
  return [
    { question: comparisonTarget ? `How does MdWrk compare with ${comparisonTarget}?` : `How does ${title} compare?`, answer: excerpt },
    {
      question: comparisonTarget ? `What should teams review before comparing MdWrk and ${comparisonTarget}?` : 'What should teams review before choosing a Markdown workspace?',
      answer: 'Review file ownership, offline behavior, preview fidelity, workspace organization, extension boundaries, export needs, and whether the workflow should be centered on portable Markdown files.',
    },
  ];
};

export const CompareView: React.FC = () => {
  const { '*': slugParam } = useParams();
  const activeSlug = slugParam || '';
  const currentDoc = activeSlug ? compareDocsBySlug[activeSlug] : undefined;
  const indexContent = [
    'Compare MdWrk by the boundaries that matter for Markdown work: local-first authoring, browser delivery, package reuse, extension trust, preview behavior, and machine-readable proof.',
    '',
    '## Comparison pages',
    '',
    ...compareDocs.map(doc => `- [${doc.title}](/${doc.slug}): ${extractExcerpt(stripLegacyAeoSections(removeDuplicateLeadingHeading(doc.content, doc.title)), doc.metadata.excerpt)}`),
  ].join('\n');
  const articleContent = currentDoc
    ? stripLegacyAeoSections(removeDuplicateLeadingHeading(currentDoc.content, currentDoc.title))
    : indexContent;
  const pageTitle = currentDoc?.title || 'Compare MdWrk';
  const pageSubtitle = currentDoc?.metadata.subtitle || 'Use this comparison hub to choose the right Markdown workspace by storage defaults, authoring model, extension boundaries, and public proof.';
  const excerpt = extractExcerpt(articleContent, currentDoc?.metadata.excerpt);
  const headings = extractHeadings(articleContent);
  const metadataImage = getArticleMetadataImage(currentDoc?.metadata, articleContent);
  const currentPath = currentDoc ? `/${currentDoc.slug}` : '/compare/';
  const keywords = currentDoc
    ? deriveKeywords(currentDoc.title, 'Compares', excerpt, headings.join(' '), currentDoc.metadata.relatedApis)
    : deriveKeywords('MdWrk comparisons');

  usePageMetadata({
    title: currentDoc?.title || 'MdWrk Compares',
    description: excerpt,
    image: metadataImage?.src,
    imageAlt: metadataImage?.alt || pageTitle,
    keywords,
    path: currentPath,
    structuredData: [
      buildTechArticleSchema({
        title: pageTitle,
        description: excerpt,
        path: currentPath,
        datePublished: currentDoc?.metadata.date,
      }),
      buildBreadcrumbSchema(currentDoc
        ? [
            { name: 'MdWrk', path: '/' },
            { name: 'Compares', path: '/compare/' },
            { name: currentDoc.title, path: currentPath },
          ]
        : [
            { name: 'MdWrk', path: '/' },
            { name: 'Compares', path: '/compare/' },
          ]),
      buildFaqSchema(buildCompareFaqItems(pageTitle, excerpt)),
    ],
  });

  const compareNavItems = useMemo(() => compareDocs.map(doc => ({
    id: doc.slug.replace(/^compare\//, ''),
    slug: doc.slug.replace(/^compare\//, ''),
    href: `/${doc.slug}`,
    title: doc.title,
  })), []);

  return (
    <div className="docs-layout compare-layout">
      <aside className="docs-sidebar compare-sidebar">
        <div className="docs-sidebar-inner">
          <SectionMenu
            items={compareNavItems}
            activeId={activeSlug}
            heading="Compares"
            icon={<Scale className="docs-sidebar-icon" />}
            ariaLabel="Comparison navigation"
          />
        </div>
      </aside>

      <main className="docs-main compare-main">
        <div className="docs-content-wrap">
          <div className="docs-article-column">
            <div className="lander-content-card docs-content-card compare-content-card">
              {currentDoc && (
                <header className="docs-header compare-header">
                  <Breadcrumbs
                    items={[
                      { label: 'MdWrk', href: '/' },
                      { label: 'Compares', href: '/compare/' },
                      { label: currentDoc.title },
                    ]}
                  />
                  <h1 className="docs-title">{currentDoc.title}</h1>
                  {currentDoc.metadata.subtitle ? (
                    <p className="docs-subtitle">{currentDoc.metadata.subtitle}</p>
                  ) : null}
                </header>
              )}
              {!currentDoc && (
                <header className="docs-header compare-header">
                  <Breadcrumbs
                    items={[
                      { label: 'MdWrk', href: '/' },
                      { label: 'Compares' },
                    ]}
                  />
                  <h1 className="docs-title">{pageTitle}</h1>
                  <p className="docs-subtitle">{pageSubtitle}</p>
                </header>
              )}
              <MarkdownViewer content={articleContent} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
