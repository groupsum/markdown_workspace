import type {
  MarkdownCustomParserProfileId,
  MarkdownCustomPreviewerProfileId,
  MarkdownHtmlHandlingMode,
  MarkdownOptionalProfileId,
  MarkdownProfileId,
} from './types.js';

export interface MarkdownOptionalProfileDefinition {
  readonly id: MarkdownOptionalProfileId;
  readonly name: string;
  readonly status: 'in-scope' | 'experimental' | 'out-of-scope';
  readonly previewRequiresTrustedHtml?: boolean;
  readonly exportRequiresTrustedHtml?: boolean;
  readonly notes?: readonly string[];
}

export interface MarkdownCustomParserProfileDefinition {
  readonly id: MarkdownCustomParserProfileId;
  readonly name: string;
  readonly baseProfile: MarkdownProfileId;
  readonly extensions: readonly MarkdownOptionalProfileId[];
  readonly notes?: readonly string[];
}

export interface MarkdownCustomPreviewerProfileDefinition {
  readonly id: MarkdownCustomPreviewerProfileId;
  readonly name: string;
  readonly parserProfile: MarkdownCustomParserProfileId;
  readonly htmlHandling: MarkdownHtmlHandlingMode;
  readonly extensions: readonly MarkdownOptionalProfileId[];
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

export const MARKDOWN_CUSTOM_PARSER_PROFILE_DEFINITIONS = Object.freeze([
  {
    id: 'mdwrk-cfm-parser',
    name: 'MdWrk CFM Parser',
    baseProfile: 'gfm-default',
    extensions: Object.freeze([
      'front-matter',
      'footnotes',
      'definition-lists',
      'math',
      'citations',
      'superscript',
      'subscript',
      'smart-punctuation',
      'markdown-in-html',
    ] as MarkdownOptionalProfileId[]),
    notes: [
      'Composes the MdWrk custom-flavored Markdown parser profile from GFM plus supported optional profile extensions.',
    ],
  },
] as const satisfies readonly MarkdownCustomParserProfileDefinition[]);

export const MARKDOWN_CUSTOM_PREVIEWER_PROFILE_DEFINITIONS = Object.freeze([
  {
    id: 'mdwrk-cfm-previewer',
    name: 'MdWrk CFM Previewer',
    parserProfile: 'mdwrk-cfm-parser',
    htmlHandling: 'sanitize',
    extensions: Object.freeze([] as MarkdownOptionalProfileId[]),
    notes: [
      'Uses the MdWrk CFM parser profile while sanitizing raw HTML for safe preview surfaces.',
    ],
  },
  {
    id: 'mdwrk-cfm-trusted-previewer',
    name: 'MdWrk Trusted CFM Previewer',
    parserProfile: 'mdwrk-cfm-parser',
    htmlHandling: 'allow-trusted',
    extensions: Object.freeze([] as MarkdownOptionalProfileId[]),
    notes: [
      'Uses the MdWrk CFM parser profile and interprets trusted markdown-in-HTML containers.',
    ],
  },
] as const satisfies readonly MarkdownCustomPreviewerProfileDefinition[]);

const OPTIONAL_PROFILE_ID_SET = new Set<MarkdownOptionalProfileId>(MARKDOWN_OPTIONAL_PROFILE_IDS);
const CUSTOM_PARSER_PROFILE_ID_SET = new Set<MarkdownCustomParserProfileId>(
  MARKDOWN_CUSTOM_PARSER_PROFILE_DEFINITIONS.map((definition) => definition.id),
);
const CUSTOM_PREVIEWER_PROFILE_ID_SET = new Set<MarkdownCustomPreviewerProfileId>(
  MARKDOWN_CUSTOM_PREVIEWER_PROFILE_DEFINITIONS.map((definition) => definition.id),
);

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

export function isMarkdownCustomParserProfileId(value: unknown): value is MarkdownCustomParserProfileId {
  return typeof value === 'string' && CUSTOM_PARSER_PROFILE_ID_SET.has(value as MarkdownCustomParserProfileId);
}

export function isMarkdownCustomPreviewerProfileId(value: unknown): value is MarkdownCustomPreviewerProfileId {
  return typeof value === 'string' && CUSTOM_PREVIEWER_PROFILE_ID_SET.has(value as MarkdownCustomPreviewerProfileId);
}

export function getMarkdownCustomParserProfileDefinition(
  id: MarkdownCustomParserProfileId,
): MarkdownCustomParserProfileDefinition | undefined {
  return MARKDOWN_CUSTOM_PARSER_PROFILE_DEFINITIONS.find((definition) => definition.id === id);
}

export function getMarkdownCustomPreviewerProfileDefinition(
  id: MarkdownCustomPreviewerProfileId,
): MarkdownCustomPreviewerProfileDefinition | undefined {
  return MARKDOWN_CUSTOM_PREVIEWER_PROFILE_DEFINITIONS.find((definition) => definition.id === id);
}

export function resolveMarkdownCustomParserProfile(
  value: MarkdownCustomParserProfileId | null | undefined,
): MarkdownCustomParserProfileDefinition | undefined {
  return isMarkdownCustomParserProfileId(value) ? getMarkdownCustomParserProfileDefinition(value) : undefined;
}

export function resolveMarkdownCustomPreviewerProfile(
  value: MarkdownCustomPreviewerProfileId | null | undefined,
): MarkdownCustomPreviewerProfileDefinition | undefined {
  return isMarkdownCustomPreviewerProfileId(value) ? getMarkdownCustomPreviewerProfileDefinition(value) : undefined;
}
