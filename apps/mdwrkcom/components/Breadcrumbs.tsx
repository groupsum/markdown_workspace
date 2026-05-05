import React from 'react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  label?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  className = 'lander-breadcrumbs',
  label = 'Breadcrumbs',
}) => {
  if (items.length === 0) return null;

  return (
    <nav className={className} aria-label={label}>
      <ol className="lander-breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="lander-breadcrumbs-item">
              {item.href && !isLast ? (
                <Link to={item.href} className="lander-breadcrumbs-link">
                  {item.label}
                </Link>
              ) : (
                <span className="lander-breadcrumbs-current">{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
