import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { featureDocs, featureDocsBySlug } from '../data/docs';
import { extractHeadings } from '../utils/markdownParser';
import { usePageMetadata } from '../hooks/usePageMetadata';
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildTechArticleSchema,
  deriveKeywords,
  extractExcerpt,
  getArticleMetadataImage,
  getExplicitFeaturedImage
} from '../utils/pageMetadata';
import { FeaturedImage } from './FeaturedImage';
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

const buildFeatureFaqItems = (title: string, excerpt: string) => [
  { question: `What does ${title} cover?`, answer: excerpt },
  {
    question: `Who should review ${title}?`,
    answer: `Review this feature page if you need practical MdWrk product context for ${title.toLowerCase()}, including the workflow boundary, package surface, and related setup paths.`,
  },
];

export const FeatureView: React.FC = () => {
  const { '*': slugParam } = useParams();
  const navigate = useNavigate();
  const activeSlug = slugParam || featureDocs[0]?.slug.replace(/^features\//, '');
  const currentDoc = (activeSlug && featureDocsBySlug[activeSlug]) || featureDocs[0];

  useEffect(() => {
    if (!slugParam && featureDocs.length > 0) {
      navigate(`/${featureDocs[0].slug}`, { replace: true });
    }
  }, [slugParam, navigate]);

  const articleContent = stripLegacyAeoSections(removeDuplicateLeadingHeading(currentDoc?.content || '# Feature Not Found', currentDoc?.title));
  const excerpt = extractExcerpt(articleContent, currentDoc?.metadata.excerpt);
  const headings = extractHeadings(articleContent);
  const featuredImage = getExplicitFeaturedImage(currentDoc?.metadata);
  const metadataImage = getArticleMetadataImage(currentDoc?.metadata, articleContent);
  const currentPath = currentDoc ? `/${currentDoc.slug}` : '/features/';
  const keywords = currentDoc
    ? deriveKeywords(currentDoc.title, 'Features', excerpt, headings.join(' '), currentDoc.metadata.relatedApis)
    : deriveKeywords('MdWrk features');

  usePageMetadata({
    title: currentDoc?.title || 'MdWrk Features',
    description: excerpt,
    image: metadataImage?.src,
    imageAlt: metadataImage?.alt || currentDoc?.title,
    keywords,
    path: currentPath,
    structuredData: currentDoc
      ? [
          buildTechArticleSchema({
            title: currentDoc.title,
            description: excerpt,
            path: currentPath,
            datePublished: currentDoc.metadata.date,
          }),
          buildBreadcrumbSchema([
            { name: 'MdWrk', path: '/' },
            { name: 'Features', path: '/features/' },
            { name: currentDoc.title, path: currentPath },
          ]),
          buildFaqSchema(buildFeatureFaqItems(currentDoc.title, excerpt)),
        ]
      : null,
  });

  const featureNavItems = useMemo(() => featureDocs.map(doc => ({
    id: doc.slug.replace(/^features\//, ''),
    slug: doc.slug.replace(/^features\//, ''),
    href: `/${doc.slug}`,
    title: doc.title,
  })), []);

  return (
    <div className="docs-layout feature-layout">
      <aside className="docs-sidebar feature-sidebar">
        <div className="docs-sidebar-inner">
          <SectionMenu
            items={featureNavItems}
            activeId={activeSlug}
            heading="Features"
            icon={<Sparkles className="docs-sidebar-icon" />}
            ariaLabel="Feature navigation"
          />
        </div>
      </aside>

      <main className="docs-main feature-main">
        <div className="docs-content-wrap">
          <div className="docs-article-column">
            <div className="lander-content-card docs-content-card feature-content-card">
              {currentDoc && (
                <header className="docs-header feature-header">
                  <Breadcrumbs
                    items={[
                      { label: 'MdWrk', href: '/' },
                      { label: 'Features', href: '/features/' },
                      { label: currentDoc.title },
                    ]}
                  />
                  <h1 className="docs-title">{currentDoc.title}</h1>
                  {currentDoc.metadata.subtitle ? (
                    <p className="docs-subtitle">{currentDoc.metadata.subtitle}</p>
                  ) : null}
                </header>
              )}
              {featuredImage?.src ? (
                <FeaturedImage
                  src={featuredImage.src}
                  alt={featuredImage.alt || currentDoc?.title || 'MdWrk feature image'}
                />
              ) : null}
              <MarkdownViewer content={articleContent} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
