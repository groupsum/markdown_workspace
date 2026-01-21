import React from 'react';

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

  return (
    <div className={`chassis-root ${modeClass} ${className}`}>
      <div className="texture-overlay" aria-hidden="true" />
      <div 
        className="chassis-scaler"
        style={{ 
          transform: `scale(${zoom})`,
          transformOrigin: 'top center',
          width: `${100 / zoom}%`,
          height: `${100 / zoom}%`
        }}
      >
        <div className="chassis-body">
             {children}
        </div>
      </div>
    </div>
  );
};