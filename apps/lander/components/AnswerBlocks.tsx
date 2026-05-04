import React from 'react';
import { MarkdownViewer } from './MarkdownViewer';

export interface AnswerBlock {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export const slugifyAnswerBlock = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const terminalAnswerHeadingPattern = /^##\s+(Quick Reference|Article Guide)\s*$/gm;

export const extractTerminalAnswerBlocks = (content: string) => {
  const matches = Array.from(content.matchAll(terminalAnswerHeadingPattern));
  if (!matches.length) {
    return {
      articleContent: content.trim(),
      answerBlocks: [] as AnswerBlock[],
    };
  }

  const firstTerminalMatch = matches[0];
  const firstTerminalIndex = firstTerminalMatch.index ?? -1;
  if (firstTerminalIndex < 0) {
    return {
      articleContent: content.trim(),
      answerBlocks: [] as AnswerBlock[],
    };
  }

  const answerSource = content.slice(firstTerminalIndex);
  const answerHeadings = Array.from(answerSource.matchAll(terminalAnswerHeadingPattern));
  const answerBlocks = answerHeadings
    .map((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = index + 1 < answerHeadings.length ? answerHeadings[index + 1].index ?? answerSource.length : answerSource.length;
      return {
        title: match[1],
        content: answerSource.slice(start, end).trim(),
        defaultOpen: false,
      };
    })
    .filter(block => block.content.length > 0);

  return {
    articleContent: content.slice(0, firstTerminalIndex).trim(),
    answerBlocks,
  };
};

export const AnswerBlocks: React.FC<{
  blocks: AnswerBlock[];
  id?: string;
  title?: string;
}> = ({ blocks, id, title = 'Answer Blocks' }) => {
  if (blocks.length === 0) return null;

  const sectionId = id ?? slugifyAnswerBlock(title);

  return (
    <section id={sectionId} className="answer-blocks" aria-label={title}>
      <h2 className="answer-blocks-heading">{title}</h2>
      <div className="answer-blocks-list">
        {blocks.map(block => (
          <details
            key={block.title}
            className="answer-block-accordion"
            open={block.defaultOpen}
          >
            <summary id={`${sectionId}-${slugifyAnswerBlock(block.title)}`} className="answer-block-summary">{block.title}</summary>
            <div className="answer-block-content">
              <MarkdownViewer content={block.content} />
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};
