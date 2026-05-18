import React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

export interface SectionMenuItem {
  id: string;
  title: string;
  href?: string;
  children?: SectionMenuItem[];
}

interface SectionMenuProps {
  items: SectionMenuItem[];
  activeId?: string;
  expandedIds?: string[];
  onToggle?: (id: string) => void;
  heading: string;
  icon?: React.ReactNode;
  ariaLabel: string;
  className?: string;
}

const navLinkClassName = (isActive: boolean) => ['docs-nav-link', isActive ? 'is-active' : 'is-inactive'].join(' ');

export const SectionMenu: React.FC<SectionMenuProps> = ({
  items,
  activeId,
  expandedIds = [],
  onToggle,
  heading,
  icon,
  ariaLabel,
  className = 'docs-nav',
}) => {
  const renderItems = (sectionItems: SectionMenuItem[], level = 0): React.ReactNode =>
    sectionItems.map(item => {
      const hasChildren = Boolean(item.children?.length);
      const isExpanded = expandedIds.includes(item.id);
      const isActive = activeId === item.id;
      const levelClassName = `docs-nav-level-${Math.min(level, 4)}`;

      if (hasChildren) {
        return (
          <div key={item.id} className="docs-nav-item">
            <button
              type="button"
              onClick={() => onToggle?.(item.id)}
              className={`docs-nav-section-button ${levelClassName}`}
            >
              <span className="docs-nav-section-label">{item.title}</span>
              {isExpanded ? <ChevronDown className="docs-nav-section-icon" /> : <ChevronRight className="docs-nav-section-icon" />}
            </button>
            {isExpanded ? (
              <div className="docs-nav-children">
                {renderItems(item.children || [], level + 1)}
              </div>
            ) : null}
          </div>
        );
      }

      return (
        <div key={item.id} className="docs-nav-item">
          <NavLink
            to={item.href || item.id}
            className={({ isActive: routeIsActive }) => `${navLinkClassName(routeIsActive || isActive)} ${levelClassName}`}
          >
            {(isActive || activeId === item.id) ? <div className="docs-nav-link-dot" /> : null}
            <span className="docs-nav-link-label">{item.title}</span>
          </NavLink>
        </div>
      );
    });

  return (
    <>
      <h3 className="docs-sidebar-heading">
        {icon} {heading}
      </h3>
      <nav className={className} aria-label={ariaLabel}>
        {renderItems(items)}
      </nav>
    </>
  );
};
