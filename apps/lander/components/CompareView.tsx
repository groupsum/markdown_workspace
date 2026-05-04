import React, { useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const activeSlug = slugParam || compareDocs[0]?.slug.replace(/^compare\//, '');
  const currentDoc = (activeSlug && compareDocsBySlug[activeSlug]) || compareDocs[0];

  useEffect(() => {
    if (!slugParam && compareDocs.length > 0) {
      navigate(`/${compareDocs[0].slug}`, { replace: true });
    }
  }, [slugParam, navigate]);

  const articleContent = stripLegacyAeoSections(removeDuplicateLeadingHeading(currentDoc?.content || '# Comparison Not Found', currentDoc?.title));
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
            { name: 'Compares', path: '/compare/' },
            { name: currentDoc.title, path: currentPath },
          ]),
          buildFaqSchema(buildCompareFaqItems(currentDoc.title, excerpt)),
        ]
      : null,
  });

  const compareNavItems = useMemo(() => compareDocs.map(doc => ({
    slug: doc.slug.replace(/^compare\//, ''),
    href: `/${doc.slug}`,
    title: doc.title,
  })), []);

  return (
    <div className="docs-layout compare-layout">
      <aside className="docs-sidebar compare-sidebar">
        <div className="docs-sidebar-inner">
          <h3 className="docs-sidebar-heading">
            <Scale className="docs-sidebar-icon" /> Compares
          </h3>
          <nav className="docs-nav" aria-label="Comparison navigation">
            <div className="docs-nav-children">
              {compareNavItems.map(item => (
                <NavLink
                  key={item.slug}
                  to={item.href}
                  className={({ isActive }) => ['docs-nav-link', isActive ? 'is-active' : 'is-inactive'].join(' ')}
                >
                  {activeSlug === item.slug && <div className="docs-nav-link-dot" />}
                  <span className="docs-nav-link-label">{item.title}</span>
                </NavLink>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      <main className="docs-main compare-main">
        <div className="docs-content-wrap">
          <div className="docs-article-column">
            <div className="lander-content-card docs-content-card compare-content-card">
              {currentDoc && (
                <header className="docs-header compare-header">
                  <div className="docs-meta">
                    <span>Compares</span>
                    {currentDoc.metadata.date && (
                      <>
                        <span className="docs-meta-divider">/</span>
                        <time dateTime={currentDoc.metadata.date}>{toDisplayDate(currentDoc.metadata.date)}</time>
                      </>
                    )}
                  </div>
                  <h1 className="docs-title">{currentDoc.title}</h1>
                  {currentDoc.metadata.subtitle ? (
                    <p className="docs-subtitle">{currentDoc.metadata.subtitle}</p>
                  ) : null}
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
