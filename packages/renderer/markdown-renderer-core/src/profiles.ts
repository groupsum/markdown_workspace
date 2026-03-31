import type { MarkdownOptionalProfileId } from './types.js';

export interface MarkdownOptionalProfileDefinition {
  readonly id: MarkdownOptionalProfileId;
  readonly name: string;
  readonly status: 'in-scope' | 'experimental' | 'out-of-scope';
  readonly previewRequiresTrustedHtml?: boolean;
  readonly exportRequiresTrustedHtml?: boolean;
  readonly notes?: readonly string[];
}

export const MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS = Object.freeze([
  {
    id: 'front-matter',
    name: 'Metadata / Front Matter',
    status: 'in-scope',
    notes: [
      'Front matter is parsed into document metadata and omitted from rendered Markdown output.',
    ],
  },
  {
    id: 'footnotes',
    name: 'Footnotes',
    status: 'in-scope',
    notes: [
      'Footnote references and definitions render into linked footnote sections.',
    ],
  },
  {
    id: 'definition-lists',
    name: 'Definition Lists',
    status: 'in-scope',
    notes: [
      'Definition lists render into <dl>/<dt>/<dd> structures.',
    ],
  },
  {
    id: 'math',
    name: 'Math',
    status: 'in-scope',
    notes: [
      'Math rendering is structural in this checkpoint; equations are not typeset with KaTeX/MathJax.',
    ],
  },
  {
    id: 'citations',
    name: 'Citations',
    status: 'experimental',
    notes: [
      'Citation keys render structurally, but bibliography resolution remains outside the certification boundary.',
    ],
  },
  {
    id: 'superscript',
    name: 'Superscript',
    status: 'in-scope',
  },
  {
    id: 'subscript',
    name: 'Subscript',
    status: 'in-scope',
  },
  {
    id: 'smart-punctuation',
    name: 'Smart Punctuation',
    status: 'in-scope',
  },
  {
    id: 'markdown-in-html',
    name: 'Markdown in HTML',
    status: 'experimental',
    previewRequiresTrustedHtml: true,
    exportRequiresTrustedHtml: true,
    notes: [
      'Only trusted HTML containers explicitly marked with markdown/data-markdown are interpreted in this checkpoint.',
    ],
  },
] as const satisfies readonly MarkdownOptionalProfileDefinition[]);

export const MARKDOWN_OPTIONAL_PROFILE_IDS = Object.freeze(
  MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS.map((definition) => definition.id),
) as readonly MarkdownOptionalProfileId[];

const OPTIONAL_PROFILE_ID_SET = new Set<MarkdownOptionalProfileId>(MARKDOWN_OPTIONAL_PROFILE_IDS);

export function isMarkdownOptionalProfileId(value: unknown): value is MarkdownOptionalProfileId {
  return typeof value === 'string' && OPTIONAL_PROFILE_ID_SET.has(value as MarkdownOptionalProfileId);
}

export function resolveMarkdownOptionalProfiles(
  value: readonly MarkdownOptionalProfileId[] | null | undefined,
): readonly MarkdownOptionalProfileId[] {
  if (!value || value.length === 0) {
    return Object.freeze([] as MarkdownOptionalProfileId[]);
  }
  const deduped = Array.from(new Set(value.filter(isMarkdownOptionalProfileId)));
  return Object.freeze(deduped);
}

export function getMarkdownOptionalProfileDefinition(id: MarkdownOptionalProfileId): MarkdownOptionalProfileDefinition | undefined {
  return MARKDOWN_OPTIONAL_PROFILE_DEFINITIONS.find((definition) => definition.id === id);
}
