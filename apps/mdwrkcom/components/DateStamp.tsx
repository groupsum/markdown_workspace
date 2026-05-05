import React from 'react';

interface DateStampProps {
  date?: string;
  displayDate?: string;
  label?: string;
  className?: string;
  textClassName?: string;
  labelClassName?: string;
  icon?: React.ReactNode;
}

export const DateStamp: React.FC<DateStampProps> = ({
  date,
  displayDate,
  label,
  className = 'date-stamp',
  textClassName = 'date-stamp-text',
  labelClassName = 'date-stamp-label',
  icon,
}) => {
  if (!date && !displayDate) return null;

  return (
    <span className={className}>
      {icon}
      <span className={textClassName}>
        {label ? <span className={labelClassName}>{label}</span> : null}
        <time dateTime={date}>{displayDate || date}</time>
      </span>
    </span>
  );
};
