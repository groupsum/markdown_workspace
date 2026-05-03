import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { docs, docSections, docsBySlug } from '../data/docs';
import { extractHeadings } from '../utils/markdownParser';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { extractFirstImage, summarizeMarkdown } from '../utils/pageMetadata';
import { MarkdownViewer } from './MarkdownViewer';
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
  const headings = extractHeadings(renderedContent);
  const featuredImage = extractFirstImage(renderedContent);
  const buildDocNavLinkClassName = (isActive: boolean) => ['docs-nav-link', isActive ? 'is-active' : 'is-inactive'].join(' ');

  usePageMetadata({
    title: currentDoc ? `${currentDoc.title} | MdWrk Docs` : 'MdWrk Docs',
    description: currentDoc?.metadata.excerpt?.trim() || summarizeMarkdown(renderedContent),
    image: featuredImage?.src,
    imageAlt: featuredImage?.alt || currentDoc?.title,
    path: currentDoc ? `/docs/${currentDoc.slug}` : '/docs/',
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
            <MarkdownViewer content={renderedContent} />
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
