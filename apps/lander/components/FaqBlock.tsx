import React from 'react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqBlockProps {
  items: FaqItem[];
  heading?: string;
  headingId?: string;
  className?: string;
}

export const FaqBlock: React.FC<FaqBlockProps> = ({
  items,
  heading = 'Frequently Asked Questions',
  headingId = 'faq-heading',
  className = 'faq-section',
}) => {
  if (items.length === 0) return null;

  return (
    <section className={className} aria-labelledby={headingId}>
      <h2 id={headingId} className="faq-section-heading">{heading}</h2>
      <div className="faq-list">
        {items.map(faq => (
          <details key={faq.question} className="faq-accordion">
            <summary className="faq-summary">{faq.question}</summary>
            <div className="faq-content">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};
