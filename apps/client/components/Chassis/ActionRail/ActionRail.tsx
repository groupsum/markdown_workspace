import React from 'react';
import type { ActionRailGroup } from '@mdwrk/extension-manifest';

export interface ActionRailItemModel {
  readonly id: string;
  readonly title: string;
  readonly icon: React.ReactNode;
  readonly onClick: () => void | Promise<void>;
  readonly active?: boolean;
  readonly disabled?: boolean;
  readonly badge?: number | null;
  readonly className?: string;
  readonly group?: ActionRailGroup;
}

interface ActionRailProps {
  readonly items: readonly ActionRailItemModel[];
  readonly ariaLabel?: string;
  readonly className?: string;
  readonly displayMode?: 'icon-only' | 'labeled';
}

interface ToolbarButtonProps extends ActionRailItemModel {
  readonly displayMode?: 'icon-only' | 'labeled';
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  active,
  disabled,
  onClick,
  icon,
  title,
  badge,
  className = '',
  displayMode = 'icon-only',
}) => (
  <button
    className={`rail-btn ${active ? 'is-active' : ''} ${className}`}
    onClick={() => {
      void onClick();
    }}
    title={title}
    aria-label={title}
    aria-pressed={active === undefined ? undefined : active}
    disabled={disabled}
    type="button"
  >
    {icon}
    {displayMode === 'labeled' && <span className="rail-btn-label">{title}</span>}
    {typeof badge === 'number' && badge > 0 && <span className="rail-btn-badge">{badge}</span>}
  </button>
);

const isTopGroup = (group: ActionRailGroup | undefined) => group === 'workspace.primary' || group === 'assistant';

export const ActionRail: React.FC<ActionRailProps> = ({ items, ariaLabel = 'Primary Actions', className = '', displayMode = 'icon-only' }) => {
  const topItems = items.filter((item) => isTopGroup(item.group));
  const bottomItems = items.filter((item) => !isTopGroup(item.group));

  return (
    <nav className={`action-rail ${className}`} aria-label={ariaLabel}>
      <div className="rail-group rail-group--top">
        {topItems.map((item) => (
          <ToolbarButton key={item.id} {...item} displayMode={displayMode} />
        ))}
      </div>

      <div className="rail-spacer" />

      <div className="rail-group rail-group--bottom">
        {bottomItems.map((item) => (
          <ToolbarButton key={item.id} {...item} displayMode={displayMode} />
        ))}
      </div>
    </nav>
  );
};
