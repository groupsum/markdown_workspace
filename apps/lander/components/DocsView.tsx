import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { docs, docSections, docsBySlug } from '../data/docs';
import { extractHeadings } from '../utils/markdownParser';
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

  const renderNav = (items: DocItem[], level = 0) => {
    return items.map(item => {
      const hasChildren = item.children && item.children.length > 0;
      const isExpanded = expandedCategories.includes(item.id);
      const isActive = activeSlug === item.id;

      return (
        <div key={item.id} className="mb-1">
          {hasChildren ? (
            <div>
              <button
                onClick={() => toggleCategory(item.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-between text-[var(--lander-fg)] hover:bg-[var(--lander-panel)]"
                style={{ paddingLeft: `${level * 12 + 12}px` }}
              >
                <span className="flex items-center gap-2">
                  {item.title}
                </span>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-[var(--lander-fg-subtle)]" /> : <ChevronRight className="w-4 h-4 text-[var(--lander-fg-subtle)]" />}
              </button>
              {isExpanded && (
                <div className="mt-1">
                  {renderNav(item.children!, level + 1)}
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to={`/docs/${item.id}`}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isActive
                  ? 'bg-[var(--lander-accent-soft)] text-[var(--lander-accent)]'
                  : 'text-[var(--lander-fg-muted)] hover:bg-[var(--lander-panel)]'
              }`}
              style={{ paddingLeft: `${level * 12 + 12}px` }}
            >
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[var(--lander-accent)] shrink-0" />}
              <span className="truncate">{item.title}</span>
            </NavLink>
          )}
        </div>
      );
    });
  };

  return (
    <div className="lander-doc-shell flex flex-col md:flex-row pt-16">
      <aside className="w-full md:w-72 border-r border-[var(--lander-border)] bg-[color:var(--lander-panel-muted)]/85 md:sticky md:top-16 self-start">
        <div className="p-6">
          <h3 className="text-xs font-bold text-[var(--lander-fg-subtle)] uppercase tracking-widest mb-4 flex items-center gap-2">
            <Book className="w-4 h-4" /> Documentation
          </h3>
          <nav className="space-y-1">
            {renderNav(docStructure)}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-3xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="lander-content-card flex-1 min-w-0 rounded-[24px] p-6 md:p-10">
            {currentDoc && (
              <header className="mb-8 border-b border-[var(--lander-border)] pb-8">
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-[var(--lander-fg-subtle)]">
                  <span>{currentDoc.section}</span>
                  {currentDoc.metadata.date && (
                    <>
                      <span className="text-[var(--lander-fg-subtle)]/60">/</span>
                      <span>{currentDoc.metadata.date}</span>
                    </>
                  )}
                </div>
                <h1 className="mt-4 text-4xl font-extrabold text-[var(--lander-fg)]">
                  {currentDoc.title}
                </h1>
              </header>
            )}
            <MarkdownViewer content={renderedContent} />
          </div>

          {currentDoc?.metadata.toc === 'true' && headings.length > 0 && (
            <aside className="hidden lg:block w-48 shrink-0">
              <div className="sticky top-8">
                <h4 className="text-xs font-bold text-[var(--lander-fg-subtle)] uppercase tracking-widest mb-4">On this page</h4>
                <nav className="space-y-3">
                  {headings.map((h, idx) => (
                    <a
                      key={idx}
                      href={`#${h.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`}
                      className="block text-xs text-[var(--lander-fg-muted)] hover:text-[var(--lander-accent)] transition-colors truncate"
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
