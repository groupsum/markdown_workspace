import React from 'react';
import type { ActionRailGroup } from '@markdown-workspace/extension-manifest';

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
  readonly className?: string;
}

const ToolbarButton: React.FC<ActionRailItemModel> = ({
  active,
  disabled,
  onClick,
  icon,
  title,
  badge,
  className = '',
}) => (
  <button
    className={`rail-btn ${active ? 'is-active' : ''} ${className}`}
    onClick={() => {
      void onClick();
    }}
    title={title}
    aria-label={title}
    disabled={disabled}
    type="button"
  >
    {icon}
    {typeof badge === 'number' && badge > 0 && <span className="rail-btn-badge">{badge}</span>}
  </button>
);

const isTopGroup = (group: ActionRailGroup | undefined) => group === 'workspace.primary' || group === 'assistant';

export const ActionRail: React.FC<ActionRailProps> = ({ items, className = '' }) => {
  const topItems = items.filter((item) => isTopGroup(item.group));
  const bottomItems = items.filter((item) => !isTopGroup(item.group));

  return (
    <nav className={`action-rail ${className}`} aria-label="Primary Actions">
      <div className="rail-group rail-group--top">
        {topItems.map((item) => (
          <ToolbarButton key={item.id} {...item} />
        ))}
      </div>

      <div className="rail-spacer" />

      <div className="rail-group rail-group--bottom">
        {bottomItems.map((item) => (
          <ToolbarButton key={item.id} {...item} />
        ))}
      </div>
    </nav>
  );
};
