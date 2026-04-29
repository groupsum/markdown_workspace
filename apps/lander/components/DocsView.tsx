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
  const content = currentDoc?.content || '# Document Not Found';
  const headings = extractHeadings(content);

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
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
              >
                <span className="flex items-center gap-2">
                   {item.title}
                </span>
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
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
                  ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              style={{ paddingLeft: `${level * 12 + 12}px` }}
            >
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />}
              <span className="truncate">{item.title}</span>
            </NavLink>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] pt-16">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 md:h-[calc(100vh-64px)] md:sticky md:top-16 md:overflow-y-auto">
        <div className="p-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Book className="w-4 h-4" /> Documentation
          </h3>
          <nav className="space-y-1">
            {renderNav(docStructure)}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-3xl mx-auto flex flex-col lg:flex-row gap-12">
          <div className="flex-1 min-w-0">
            <MarkdownViewer content={content} />
          </div>

          {/* Table of Contents (Desktop) */}
          {currentDoc?.metadata.toc === 'true' && headings.length > 0 && (
            <aside className="hidden lg:block w-48 shrink-0">
              <div className="sticky top-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">On this page</h4>
                <nav className="space-y-3">
                  {headings.map((h, idx) => (
                    <a 
                      key={idx} 
                      href={`#${h.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`}
                      className="block text-xs text-slate-500 hover:text-indigo-500 transition-colors truncate"
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
