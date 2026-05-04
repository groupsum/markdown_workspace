import React from 'react';

interface AuthorDetailsProps {
  author?: string;
  label?: string;
  className?: string;
  textClassName?: string;
  labelClassName?: string;
  icon?: React.ReactNode;
}

export const AuthorDetails: React.FC<AuthorDetailsProps> = ({
  author,
  label,
  className = 'author-details',
  textClassName = 'author-details-text',
  labelClassName = 'author-details-label',
  icon,
}) => {
  if (!author) return null;

  return (
    <span className={className}>
      {icon}
      <span className={textClassName}>
        {label ? <span className={labelClassName}>{label}</span> : null}
        <span>{author}</span>
      </span>
    </span>
  );
};
