import React from 'react';

export interface TableOfContentsItem {
  title: string;
  href: string;
  children?: TableOfContentsItem[];
}

interface TableOfContentsProps {
  items: TableOfContentsItem[];
  heading?: string;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  items,
  heading = 'On this page',
}) => {
  if (items.length === 0) return null;

  return (
    <aside className="docs-toc">
      <div className="docs-toc-inner">
        <h4 className="docs-toc-heading">{heading}</h4>
        <nav className="docs-toc-nav" aria-label={heading}>
          {items.map(item => (
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
  );
};
