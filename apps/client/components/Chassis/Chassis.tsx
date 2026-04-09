import React from 'react';

interface ChassisProps {
  children: React.ReactNode;
  zoom: number;
  mode?: 'selector' | 'project';
  className?: string;
}

const getZoomScaleClassName = (zoom: number): string => {
  const clamped = Math.min(1.5, Math.max(0.7, zoom));
  return `ui-scale-${Math.round(clamped * 100)}`;
};

export const Chassis: React.FC<ChassisProps> = ({ 
  children, 
  zoom, 
  mode = 'project',
  className = "" 
}) => {
  const modeClass = `mode-${mode}`;
  const zoomClass = getZoomScaleClassName(zoom);

  return (
    <div className={`chassis-root ${modeClass} ${zoomClass} ${className}`}>
      <div className="texture-overlay" aria-hidden="true" />
      <div className="chassis-scaler">
        <div className="chassis-body">
             {children}
        </div>
      </div>
    </div>
  );
};
