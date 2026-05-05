import React from 'react';

interface TagProps {
  children: React.ReactNode;
  className?: string;
}

export const Tag: React.FC<TagProps> = ({ children, className = 'lander-tag' }) => (
  <span className={className}>{children}</span>
);
