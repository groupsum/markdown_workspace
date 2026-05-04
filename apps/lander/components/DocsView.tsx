import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { docs, docSections, docsBySlug } from '../data/docs';
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
import { MarkdownViewer } from './MarkdownViewer';
import { FeaturedImage } from './FeaturedImage';
import { ChevronRight, ChevronDown, Book } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  children?: DocItem[];
}

interface TocItem {
  title: string;
  href: string;
  children?: TocItem[];
}

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

const slugifyHeading = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const toDisplayDate = (date?: string) => {
  const match = date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return date || '';
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || !Number.isFinite(day)) return date || '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, monthIndex, day));
};

const buildDocsFaqItems = (title: string, excerpt: string) => {
  const comparisonTarget = /^MdWrk\s+V(?:s|S)\s+(.+)$/i.exec(title)?.[1]?.trim();
  if (comparisonTarget) {
    return [
      { question: `How does MdWrk compare with ${comparisonTarget}?`, answer: excerpt },
      {
        question: `What should teams review before comparing MdWrk and ${comparisonTarget}?`,
        answer: 'Review file ownership, offline behavior, preview fidelity, workspace organization, extension boundaries, export needs, and whether the workflow should be centered on portable Markdown files.',
      },
    ];
  }
  if (title === 'Getting Started') {
    return [
      { question: 'How do I start using MdWrk?', answer: excerpt },
      {
        question: 'Which MdWrk setup path should I choose first?',
        answer: 'Choose browser use for the fastest start, PWA installation for an app-like shell, local setup for development control, or standalone modules when you want package-level adoption.',
      },
    ];
  }
  return [
    { question: `What will I learn from ${title}?`, answer: excerpt },
    {
      question: `Who should read ${title}?`,
      answer: `Read this page if you need practical MdWrk guidance for ${title.toLowerCase()}, including the relevant workflow, product surface, and follow-up documentation paths.`,
    },
  ];
};

export const DocsView: React.FC = () => {
  const { '*': slugParam } = useParams();
  const navigate = useNavigate();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    if (!slugParam && docs.length > 0) {
      navigate(`/docs/${docs[0].slug}`, { replace: true });
    }
  }, [slugParam, navigate]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const sections = useMemo(() => {
    return Object.entries(docSections)
      .map(([section, items]) => ({
        id: section.toLowerCase().replace(/\s+/g, '-'),
        title: section,
        order: Math.min(...items.map(item => item.sectionOrder)),
        children: items.map(item => ({
          id: item.slug,
          title: item.title
        }))
      }))
      .sort((a, b) => a.order - b.order);
  }, []);

  useEffect(() => {
    if (sections.length > 0 && expandedCategories.length === 0) {
      setExpandedCategories(sections.map(section => section.id));
    }
  }, [sections, expandedCategories.length]);

  const docStructure: DocItem[] = sections.map(section => ({
    id: section.id,
    title: section.title,
    children: section.children
  }));

  const activeSlug = slugParam || docs[0]?.slug;
  const currentDoc = (activeSlug && docsBySlug[activeSlug]) || docs[0];
  const renderedContent = stripLegacyAeoSections(removeDuplicateLeadingHeading(currentDoc?.content || '# Document Not Found', currentDoc?.title));
  const articleContent = renderedContent;
  const excerpt = extractExcerpt(articleContent, currentDoc?.metadata.excerpt);
  const headings = extractHeadings(articleContent);
  const tocItems: TocItem[] = [
    ...headings.map(heading => ({
      title: heading,
      href: `#${slugifyHeading(heading)}`,
    })),
  ];
  const featuredImage = getExplicitFeaturedImage(currentDoc?.metadata);
  const metadataImage = getArticleMetadataImage(currentDoc?.metadata, articleContent);
  const buildDocNavLinkClassName = (isActive: boolean) => ['docs-nav-link', isActive ? 'is-active' : 'is-inactive'].join(' ');
  const currentPath = currentDoc ? `/docs/${currentDoc.slug}` : '/docs/';
  const keywords = currentDoc
    ? deriveKeywords(currentDoc.title, currentDoc.section, excerpt, headings.join(' '), currentDoc.metadata.relatedApis)
    : deriveKeywords('MdWrk documentation');

  usePageMetadata({
    title: currentDoc?.title || 'MdWrk Docs',
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
            { name: 'Documentation', path: '/docs/' },
            { name: currentDoc.section, path: currentPath },
            { name: currentDoc.title, path: currentPath },
          ]),
          buildFaqSchema(buildDocsFaqItems(currentDoc.title, excerpt)),
        ]
      : null,
  });

  const renderNav = (items: DocItem[], level = 0) => {
    return items.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedCategories.includes(item.id);
      const isActive = activeSlug === item.id;

      return (
        <div key={item.id} className="docs-nav-item">
          {hasChildren ? (
            <div>
              <button
                onClick={() => toggleCategory(item.id)}
                className="docs-nav-section-button"
                style={{ paddingLeft: `${level * 12 + 12}px` }}
              >
                <span className="docs-nav-section-label">
                  {item.title}
                </span>
                {isExpanded ? <ChevronDown className="docs-nav-section-icon" /> : <ChevronRight className="docs-nav-section-icon" />}
              </button>
              {isExpanded && (
                <div className="docs-nav-children">
                  {renderNav(item.children!, level + 1)}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to={`/docs/${item.id}`}
              className={buildDocNavLinkClassName(isActive)}
              style={{ paddingLeft: `${level * 12 + 12}px` }}
            >
              {isActive && <div className="docs-nav-link-dot" />}
              <span className="docs-nav-link-label">{item.title}</span>
            </NavLink>
          )}
        </div>
      );
    });
  };

  return (
    <div className="docs-layout">
      <aside className="docs-sidebar">
        <div className="docs-sidebar-inner">
          <h3 className="docs-sidebar-heading">
            <Book className="docs-sidebar-icon" /> Documentation
          </h3>
          <nav className="docs-nav">
            {renderNav(docStructure)}
          </nav>
        </div>
      </aside>

      <main className="docs-main">
        <div className="docs-content-wrap">
          <div className="docs-article-column">
            <div className="lander-content-card docs-content-card">
              {currentDoc && (
                <header className="docs-header">
                  <div className="docs-meta">
                    <span>{currentDoc.section}</span>
                    {currentDoc.metadata.date && (
                      <>
                        <span className="docs-meta-divider">/</span>
                        <time dateTime={currentDoc.metadata.date}>{toDisplayDate(currentDoc.metadata.date)}</time>
                      </>
                    )}
                  </div>
                  <h1 className="docs-title">
                    {currentDoc.title}
                  </h1>
                  {currentDoc.metadata.subtitle ? (
                    <p className="docs-subtitle">{currentDoc.metadata.subtitle}</p>
                  ) : null}
                </header>
              )}
              {featuredImage?.src ? (
                <FeaturedImage
                  src={featuredImage.src}
                  alt={featuredImage.alt || currentDoc?.title || 'MdWrk document featured image'}
                />
              ) : null}
              <MarkdownViewer content={articleContent} />
            </div>
          </div>

          {currentDoc?.metadata.toc === 'true' && tocItems.length > 0 && (
            <aside className="docs-toc">
              <div className="docs-toc-inner">
                <h4 className="docs-toc-heading">On this page</h4>
                <nav className="docs-toc-nav">
                  {tocItems.map(item => (
                    <div key={item.href} className="docs-toc-item">
                      <a href={item.href} className="docs-toc-link" title={item.title}>
                        {item.title}
                      </a>
                      {item.children?.length ? (
                        <div className="docs-toc-children">
                          {item.children.map(child => (
                            <a key={child.href} href={child.href} className="docs-toc-link docs-toc-link-child" title={child.title}>
                              {child.title}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};
