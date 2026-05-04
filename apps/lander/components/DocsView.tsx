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
  extractFirstImage,
  removeFirstImage
} from '../utils/pageMetadata';
import { MarkdownViewer } from './MarkdownViewer';
import { FeaturedImage } from './FeaturedImage';
import { AnswerBlocks, extractTerminalAnswerBlocks, type AnswerBlock } from './AnswerBlocks';
import { ChevronRight, ChevronDown, Book } from 'lucide-react';

interface DocItem {
  id: string;
  title: string;
  children?: DocItem[];
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

const packagePattern = /`(@mdwrk\/[^`]+)`/g;

const collectRelatedApis = (content: string, metadata: Record<string, string>) => {
  const explicit = metadata.relatedApis
    ?.split(',')
    .map(item => item.trim())
    .filter(Boolean);
  if (explicit?.length) return explicit;

  const discovered = Array.from(content.matchAll(packagePattern)).map(match => match[1]);
  return Array.from(new Set(discovered)).slice(0, 5);
};

const buildAnswerBlocks = ({
  title,
  section,
  content,
  excerpt,
  metadata,
}: {
  title: string;
  section: string;
  content: string;
  excerpt: string;
  metadata: Record<string, string>;
}) => {
  const relatedApis = collectRelatedApis(content, metadata);
  const relatedApiText = relatedApis.length ? relatedApis.map(api => `- \`${api}\``).join('\n') : '- MdWrk client workspace\n- MdWrk Markdown editor and renderer packages';
  const primaryExample = relatedApis[0] || '@mdwrk/mdwrkspace';

  return [
    {
      title: 'What This Does',
      content: excerpt,
    },
    {
      title: 'When To Use It',
      content: `Use this page when you need ${title.toLowerCase()} guidance for the MdWrk ${section.toLowerCase()} surface.`,
    },
    {
      title: 'How It Works',
      content: 'MdWrk keeps the workflow grounded in local Markdown files, browser-managed workspace state, reusable packages, and explicit extension or theme contracts where they apply.',
    },
    {
      title: 'Example',
      content: `Start from this page, then use the related MdWrk surface such as \`${primaryExample}\` in the client, package, or extension flow it documents.`,
    },
    {
      title: 'Common Errors',
      content: 'Common issues usually come from choosing the wrong surface, expecting cloud sync for local-only content, or enabling extension/theme behavior without the matching package and trust configuration.',
    },
    {
      title: 'Related APIs',
      content: relatedApiText,
      defaultOpen: true,
    },
  ] satisfies AnswerBlock[];
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
  const renderedContent = removeDuplicateLeadingHeading(currentDoc?.content || '# Document Not Found', currentDoc?.title);
  const extractedAnswerContent = extractTerminalAnswerBlocks(renderedContent);
  const articleContent = extractedAnswerContent.articleContent;
  const excerpt = extractExcerpt(articleContent, currentDoc?.metadata.excerpt);
  const generatedAnswerBlocks = currentDoc
    ? buildAnswerBlocks({
        title: currentDoc.title,
        section: currentDoc.section,
        content: articleContent,
        excerpt,
        metadata: currentDoc.metadata,
      })
    : [];
  const answerBlocks = [...extractedAnswerContent.answerBlocks, ...generatedAnswerBlocks];
  const headings = extractHeadings(articleContent);
  const featuredImage = extractFirstImage(articleContent);
  const contentWithoutFeaturedImage = featuredImage ? removeFirstImage(articleContent) : articleContent;
  const buildDocNavLinkClassName = (isActive: boolean) => ['docs-nav-link', isActive ? 'is-active' : 'is-inactive'].join(' ');
  const currentPath = currentDoc ? `/docs/${currentDoc.slug}` : '/docs/';
  const keywords = currentDoc
    ? deriveKeywords(currentDoc.title, currentDoc.section, excerpt, headings.join(' '), currentDoc.metadata.relatedApis)
    : deriveKeywords('MdWrk documentation');

  usePageMetadata({
    title: currentDoc?.title || 'MdWrk Docs',
    description: excerpt,
    image: featuredImage?.src,
    imageAlt: featuredImage?.alt || currentDoc?.title,
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
          buildFaqSchema([
            { question: `What does ${currentDoc.title} do?`, answer: excerpt },
            { question: `When should I use ${currentDoc.title}?`, answer: `Use it when you need ${currentDoc.title.toLowerCase()} guidance for MdWrk.` },
          ]),
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
                        <span>{currentDoc.metadata.date}</span>
                      </>
                    )}
                  </div>
                  <h1 className="docs-title">
                    {currentDoc.title}
                  </h1>
                </header>
              )}
              {featuredImage?.src ? (
                <FeaturedImage
                  src={featuredImage.src}
                  alt={featuredImage.alt || currentDoc?.title || 'MdWrk document featured image'}
                />
              ) : null}
              <MarkdownViewer content={contentWithoutFeaturedImage} />
            </div>
            <AnswerBlocks blocks={answerBlocks} />
          </div>

          {currentDoc?.metadata.toc === 'true' && headings.length > 0 && (
            <aside className="docs-toc">
              <div className="docs-toc-inner">
                <h4 className="docs-toc-heading">On this page</h4>
                <nav className="docs-toc-nav">
                  {headings.map((h, idx) => (
                    <a
                      key={idx}
                      href={`#${h.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`}
                      className="docs-toc-link"
                      title={h}
                    >
                      {h}
                    </a>
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
