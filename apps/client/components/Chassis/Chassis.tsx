import React, { useEffect } from 'react';

interface ChassisProps {
  children: React.ReactNode;
  zoom: number;
  mode?: 'selector' | 'project';
  className?: string;
}

/**
 * The Chassis provides the high-level layout skeleton.
 * Theme variables are inherited from document.documentElement.
 */
export const Chassis: React.FC<ChassisProps> = ({ 
  children, 
  zoom, 
  mode = 'project',
  className = "" 
}) => {
  const modeClass = `mode-${mode}`;

  useEffect(() => {
    document.documentElement.style.setProperty('--ui-scale', String(zoom));
  }, [zoom]);

  return (
    <div className={`chassis-root ${modeClass} ${className}`}>
      <div className="texture-overlay" aria-hidden="true" />
      <div className="chassis-scaler">
        <div className="chassis-body">
             {children}
        </div>
      </div>
    </div>
  );
};
