#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractMarkdownHeadings,
  renderMarkdownToHtmlSync,
} from '@mdwrk/markdown-renderer-core';

const require = createRequire(import.meta.url);
const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(landerRoot, '..', '..');
const contentRoot = path.join(landerRoot, 'content');
const dataRoot = path.join(landerRoot, 'data');
const dataMarkdownRoot = path.join(dataRoot, 'markdown');
const dataDocsRoot = path.join(dataMarkdownRoot, 'docs');
const contentSitemapPath = path.join(dataRoot, 'content-sitemap.yaml');
const schemasRoot = path.join(landerRoot, 'schemas');
const publicRoot = path.join(landerRoot, 'public');
const schemaPath = path.join(schemasRoot, 'mdwrk.page.v1.schema.json');
const siteUrl = (process.env.MDWRK_SITE_URL || process.env.VITE_SITE_URL || 'https://mdwrk.com').replace(/\/+$/, '');
const allowNoindexLlmsInclude = process.env.MDWRK_ALLOW_NOINDEX_LLMS_INCLUDE === 'true';
const command = process.argv[2] ?? 'validate';
const getArgValue = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index === -1) return fallback;
  return process.argv[index + 1] && !process.argv[index + 1].startsWith('--')
    ? process.argv[index + 1]
    : fallback;
};
const outputDir = getArgValue('--out', process.env.MDWRK_STATIC_OUT || 'dist');
const preserveAssets = process.argv.includes('--preserve-assets');
const distRoot = path.resolve(landerRoot, outputDir);
const githubRepoUrl = process.env.VITE_GITHUB_REPO_URL || 'https://github.com/groupsum/markdown_workspace';

const CONTENT_TYPES = new Set([
  'landing',
  'feature',
  'docs',
  'blog',
  'comparison',
  'package',
  'privacy',
  'security',
  'changelog',
  'faq',
  'glossary',
]);

const MIN_WORDS = {
  landing: 80,
  feature: 80,
  docs: 70,
  blog: 100,
  comparison: 100,
  package: 70,
  privacy: 70,
  security: 70,
  changelog: 50,
  faq: 50,
  glossary: 40,
};

const DOC_SECTION_ORDER = [
  'Getting Started',
  'Quickstart',
  'Features',
  'Usage',
  'Extensions',
  'Integrations',
  'Authoring',
  'Compares',
  'Docs',
  'Archive',
];

const DOC_ITEM_ORDER = [
  '/docs/getting-started/installation/',
  '/docs/getting-started/browser-use/',
  '/docs/getting-started/pwa-installation/',
  '/docs/getting-started/local-setup/',
  '/docs/getting-started/configuration/',
  '/docs/getting-started/standalone-modules/',
  '/docs/product/offline-markdown-editor/',
  '/docs/product/local-first-markdown-workspace/',
  '/docs/product/privacy-first-markdown-editor/',
  '/docs/product/markdown-file-manager/',
  '/docs/product/markdown-preview-editor/',
  '/docs/product/extension-host/',
  '/docs/product/theme-packs/',
  '/docs/product/developer-documentation/',
  '/docs/extensions/extension-platform/',
  '/docs/extensions/theme-studio-and-host-surfaces/',
];

const docSectionRank = (section) => {
  const index = DOC_SECTION_ORDER.indexOf(section);
  return index === -1 ? DOC_SECTION_ORDER.length : index;
};

const docItemRank = (slug) => {
  const index = DOC_ITEM_ORDER.indexOf(slug);
  return index === -1 ? DOC_ITEM_ORDER.length : index;
};

const fail = (message, failures = []) => {
  console.error(message);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
};

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

let ajvValidator;
let ajvLoadAttempted = false;

const getAjvValidator = (schema) => {
  if (ajvLoadAttempted) return ajvValidator;
  ajvLoadAttempted = true;
  try {
    const ajvModule = require('ajv/dist/2020');
    const Ajv2020 = ajvModule.default ?? ajvModule;
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    ajv.addFormat('uri', {
      type: 'string',
      validate: (value) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
    });
    ajvValidator = ajv.compile(schema);
  } catch {
    ajvValidator = null;
  }
  return ajvValidator;
};

const formatAjvErrors = (sourcePath, errors = []) =>
  errors.map((error) => {
    const field = error.instancePath ? error.instancePath.slice(1).replace(/\//g, '.') : '$';
    const suffix = error.params?.additionalProperty ? ` (${error.params.additionalProperty})` : '';
    return `${sourcePath}: ${field} ${error.message}${suffix}`;
  });

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const escapeAttribute = escapeHtml;

const escapeXml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const slugify = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '');

const stripTrailingSlash = (value) => value === '/' ? '/' : value.replace(/\/+$/, '');
const normalizeRouteSlug = (value) => {
  const trimmed = String(value ?? '').trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
};
const canonicalForSlug = (slug) => `${siteUrl}${slug}`;

const routeOutputDir = (slug) => slug === '/' ? distRoot : path.join(distRoot, slug.replace(/^\/|\/$/g, ''));

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const extractViteAssetTags = () => {
  const indexPath = path.join(distRoot, 'index.html');
  if (!preserveAssets || !fs.existsSync(indexPath)) return '';
  const html = fs.readFileSync(indexPath, 'utf8');
  const tags = [
    ...html.matchAll(/<link\b[^>]*\bhref="\/assets\/[^"]+\.css"[^>]*>/gi),
  ].map(match => match[0]);
  return Array.from(new Set(tags)).join('\n    ');
};

const collectFiles = (dir, predicate) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectFiles(filePath, predicate);
    return predicate(filePath) ? [filePath] : [];
  });
};

const splitFrontmatter = (raw, sourcePath) => {
  const normalized = String(raw).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(normalized);
  if (!match) throw new Error(`${sourcePath}: missing YAML frontmatter`);
  return {
    frontmatter: match[1],
    body: normalized.slice(match[0].length).trim(),
  };
};

const parseScalar = (raw) => {
  const value = String(raw ?? '').trim();
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === '[]') return [];
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
};

const parseInlineArray = (raw) => {
  const trimmed = String(raw ?? '').trim();
  if (!trimmed.startsWith('[') || !trimmed.endsWith(']')) return null;
  const body = trimmed.slice(1, -1).trim();
  if (!body) return [];
  return body.split(',').map(item => parseScalar(item)).filter(Boolean);
};

const parseYamlFrontmatter = (yaml) => {
  const lines = String(yaml ?? '').split('\n');
  const data = {};
  let currentArrayKey = null;
  let currentObject = null;

  const commitObject = () => {
    if (currentArrayKey && currentObject) {
      data[currentArrayKey].push(currentObject);
      currentObject = null;
    }
  };

  for (const rawLine of lines) {
    if (!rawLine.trim() || rawLine.trim().startsWith('#')) continue;
    const line = rawLine.replace(/\s+$/, '');
    const topMatch = /^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/.exec(line);
    if (topMatch) {
      commitObject();
      currentArrayKey = null;
      const [, key, rest = ''] = topMatch;
      const inlineArray = parseInlineArray(rest);
      if (inlineArray) {
        data[key] = inlineArray;
      } else if (rest.trim() === '') {
        data[key] = [];
        currentArrayKey = key;
      } else {
        data[key] = parseScalar(rest);
      }
      continue;
    }

    const scalarArrayMatch = /^\s*-\s+(.+)$/.exec(line);
    if (currentArrayKey && scalarArrayMatch && !scalarArrayMatch[1].includes(':')) {
      commitObject();
      data[currentArrayKey].push(parseScalar(scalarArrayMatch[1]));
      continue;
    }

    const objectArrayStart = /^\s*-\s+([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (currentArrayKey && objectArrayStart) {
      commitObject();
      currentObject = {
        [objectArrayStart[1]]: parseScalar(objectArrayStart[2]),
      };
      continue;
    }

    const objectProp = /^\s+([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (currentArrayKey && currentObject && objectProp) {
      currentObject[objectProp[1]] = parseScalar(objectProp[2]);
      continue;
    }

    throw new Error(`Unsupported YAML frontmatter line: ${line}`);
  }

  commitObject();
  return data;
};

const validateJsonSchema = (value, schema, label) => {
  const failures = [];

  const visit = (nodeValue, nodeSchema, pathLabel) => {
    if (!nodeSchema || typeof nodeSchema !== 'object') return;

    if (nodeSchema.type) {
      const type = nodeSchema.type;
      const validType =
        (type === 'object' && isPlainObject(nodeValue)) ||
        (type === 'array' && Array.isArray(nodeValue)) ||
        (type === 'string' && typeof nodeValue === 'string') ||
        (type === 'boolean' && typeof nodeValue === 'boolean') ||
        (type === 'number' && typeof nodeValue === 'number') ||
        (type === 'integer' && Number.isInteger(nodeValue));
      if (!validType) {
        failures.push(`${label}: ${pathLabel} must be ${type}`);
        return;
      }
    }

    if (Object.prototype.hasOwnProperty.call(nodeSchema, 'const') && nodeValue !== nodeSchema.const) {
      failures.push(`${label}: ${pathLabel} must be ${JSON.stringify(nodeSchema.const)}`);
    }

    if (nodeSchema.enum && !nodeSchema.enum.includes(nodeValue)) {
      failures.push(`${label}: ${pathLabel} must be one of ${nodeSchema.enum.join(', ')}`);
    }

    if (typeof nodeValue === 'string') {
      if (nodeSchema.minLength !== undefined && nodeValue.length < nodeSchema.minLength) {
        failures.push(`${label}: ${pathLabel} must be at least ${nodeSchema.minLength} characters`);
      }
      if (nodeSchema.maxLength !== undefined && nodeValue.length > nodeSchema.maxLength) {
        failures.push(`${label}: ${pathLabel} must be at most ${nodeSchema.maxLength} characters`);
      }
      if (nodeSchema.pattern && !(new RegExp(nodeSchema.pattern).test(nodeValue))) {
        failures.push(`${label}: ${pathLabel} does not match ${nodeSchema.pattern}`);
      }
      if (nodeSchema.format === 'uri') {
        try {
          new URL(nodeValue);
        } catch {
          failures.push(`${label}: ${pathLabel} must be a valid URI`);
        }
      }
    }

    if (Array.isArray(nodeValue)) {
      for (const [index, item] of nodeValue.entries()) {
        visit(item, nodeSchema.items, `${pathLabel}[${index}]`);
      }
    }

    if (isPlainObject(nodeValue)) {
      const properties = nodeSchema.properties ?? {};
      for (const key of nodeSchema.required ?? []) {
        if (!Object.prototype.hasOwnProperty.call(nodeValue, key) || nodeValue[key] === '') {
          failures.push(`${label}: missing required field ${key}`);
        }
      }
      if (nodeSchema.additionalProperties === false) {
        for (const key of Object.keys(nodeValue)) {
          if (!Object.prototype.hasOwnProperty.call(properties, key)) {
            failures.push(`${label}: unsupported field ${key}`);
          }
        }
      }
      for (const [key, childSchema] of Object.entries(properties)) {
        if (Object.prototype.hasOwnProperty.call(nodeValue, key)) {
          visit(nodeValue[key], childSchema, pathLabel === '$' ? key : `${pathLabel}.${key}`);
        }
      }
    }
  };

  visit(value, schema, '$');
  return failures;
};

const validateSchemaShape = (frontmatter, sourcePath, schema) => {
  const validator = getAjvValidator(schema);
  const failures = validator
    ? (validator(frontmatter) ? [] : formatAjvErrors(sourcePath, validator.errors))
    : validateJsonSchema(frontmatter, schema, sourcePath);

  for (const key of ['related', 'tags']) {
    if (frontmatter[key] !== undefined && !Array.isArray(frontmatter[key])) {
      failures.push(`${sourcePath}: ${key} must be an array`);
    }
  }
  if (frontmatter.noindex === true && frontmatter.llmsInclude === true && !allowNoindexLlmsInclude) {
    failures.push(`${sourcePath}: noindex true cannot set llmsInclude true without MDWRK_ALLOW_NOINDEX_LLMS_INCLUDE=true`);
  }
  return failures;
};

const normalizeFrontmatter = (frontmatter) => ({
  schema: frontmatter.schema,
  slug: frontmatter.slug,
  title: frontmatter.title,
  description: frontmatter.description,
  h1: frontmatter.h1,
  subtitle: frontmatter.subtitle,
  entity: frontmatter.entity,
  intent: frontmatter.intent,
  contentType: frontmatter.contentType,
  updatedAt: frontmatter.updatedAt,
  publishedAt: frontmatter.publishedAt,
  faqs: Object.freeze(frontmatter.faqs ?? buildDefaultFaqs({
    title: frontmatter.h1 || frontmatter.title,
    description: frontmatter.description,
    contentType: frontmatter.contentType,
  })),
  parent: frontmatter.parent,
  related: Object.freeze(frontmatter.related ?? []),
  tags: Object.freeze(frontmatter.tags ?? []),
  canonical: frontmatter.canonical || canonicalForSlug(frontmatter.slug),
  noindex: frontmatter.noindex ?? false,
  llmsInclude: frontmatter.llmsInclude ?? true,
});

const renderInline = (value) => {
  let html = escapeHtml(value);
  html = html.replace(/!\[([^\]]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
};

const stripMarkdown = (value) =>
  String(value ?? '')
    .replace(/^---\n[\s\S]*?\n---\n?/, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeStatus = (value) => String(value ?? '').trim().toLowerCase();

const normalizeIsoDate = (value) => {
  const trimmed = String(value ?? '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) ? trimmed : null;
};

const toLocalIsoDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isPublishedFrontmatter = (frontmatter) => {
  if (normalizeStatus(frontmatter.status) !== 'published') return false;
  const date = normalizeIsoDate(frontmatter.date);
  return Boolean(date && date <= toLocalIsoDate());
};

const toTitleCase = (value) =>
  String(value ?? '')
    .replace(/\bmdwrk\b/gim, 'MdWrk')
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      if (/^MdWrk$/.test(part)) return part;
      if (/^[A-Z0-9.-]+$/.test(part)) return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join(' ');

const removeDuplicateLeadingHeading = (content, title) => {
  const headingMatch = String(content ?? '').match(/^#\s+(.+)\n*/);
  if (!headingMatch || !title) return String(content ?? '').trim();
  const normalize = (value) => String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, ' ');
  return normalize(headingMatch[1]) === normalize(title)
    ? String(content ?? '').slice(headingMatch[0].length).trim()
    : String(content ?? '').trim();
};

const stripLegacyAeoSections = (content) => {
  const source = String(content ?? '').trim();
  const match = /^##\s+(Quick Reference|Article Guide)\s*$/m.exec(source);
  if (!match || match.index === undefined) return source;
  return source.slice(0, match.index).trim();
};

const summarizeContent = (content, preferredExcerpt, maxLength = 220) => {
  const excerpt = String(preferredExcerpt ?? '').trim();
  if (excerpt) return excerpt;
  const plain = stripMarkdown(content);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trimEnd()}...`;
};

const renderMarkdown = (body) => {
  const links = [];
  const markdown = String(body ?? '');
  const html = renderMarkdownToHtmlSync(markdown, {
    htmlHandling: 'escape',
    profile: 'gfm-default',
  });
  const headings = extractMarkdownHeadings(markdown, { minimumDepth: 2 }).map(heading => ({
    depth: heading.depth,
    id: heading.slug,
    text: heading.text,
  }));
  const linkPattern = /\[([^\]]+)]\(([^)]+)\)/g;
  for (const match of markdown.matchAll(linkPattern)) {
    const href = match[2];
    links.push({ href, text: match[1], internal: href.startsWith('/') || href.startsWith('#') });
  }
  const text = stripMarkdown(markdown);
  const words = text ? text.split(/\s+/).length : 0;
  return {
    html,
    text,
    headings,
    links,
    wordCount: words,
  };
};

const buildDefaultFaqs = ({ title, description, contentType }) => {
  const normalizedTitle = String(title || 'this MdWrk page')
    .replace(/\s+\|\s+MdWrk.*$/i, '')
    .replace(/^MdWrk\s+Blog$/i, 'Blog')
    .trim();
  const answer = String(description || '').trim();
  if (!answer) return [];
  const lowerTitle = normalizedTitle.toLowerCase();
  const comparisonTarget = /^MdWrk\s+V(?:s|S)\s+(.+)$/i.exec(normalizedTitle)?.[1]?.trim();
  if (comparisonTarget) {
    return [
      {
        question: `How does MdWrk compare with ${comparisonTarget}?`,
        answer,
      },
      {
        question: `What should teams review before comparing MdWrk and ${comparisonTarget}?`,
        answer: 'Review file ownership, offline behavior, preview fidelity, workspace organization, extension boundaries, export needs, and whether the workflow should be centered on portable Markdown files.',
      },
    ];
  }
  if (contentType === 'blog') {
    return [
      {
        question: normalizedTitle === 'Blog' ? 'What does the MdWrk Blog cover?' : `What does this MdWrk article cover?`,
        answer,
      },
      {
        question: normalizedTitle === 'Blog' ? 'Where should readers start in the MdWrk Blog?' : 'What should readers take away from this article?',
        answer: normalizedTitle === 'Blog'
          ? 'Start with the newest posts, then follow author and monthly archive links when you want a release-focused view of MdWrk changes.'
          : `This article explains the MdWrk product change, the workflow it affects, and where readers can continue in the related documentation.`,
      },
    ];
  }
  if (normalizedTitle === 'Getting Started') {
    return [
      {
        question: 'How do I start using MdWrk?',
        answer,
      },
      {
        question: 'Which MdWrk setup path should I choose first?',
        answer: 'Choose browser use for the fastest start, PWA installation for an app-like shell, local setup for development control, or standalone modules when you want package-level adoption.',
      },
    ];
  }
  if (contentType === 'privacy') {
    return [
      {
        question: 'How does MdWrk handle privacy-sensitive Markdown work?',
        answer,
      },
      {
        question: 'Which privacy choices should MdWrk users review?',
        answer: 'Review local storage behavior, sync choices, extension trust boundaries, export paths, and any workflow that intentionally connects to an external service.',
      },
    ];
  }
  if (contentType === 'security') {
    return [
      {
        question: 'What security topics does this MdWrk page cover?',
        answer,
      },
      {
        question: 'Which MdWrk security boundaries should teams review?',
        answer: 'Review package boundaries, extension trust, static content verification, robots policy, deployable artifact checks, and any integration that crosses the local workspace boundary.',
      },
    ];
  }
  return [
    {
      question: `What will I learn from ${normalizedTitle}?`,
      answer,
    },
    {
      question: `Who should read ${normalizedTitle}?`,
      answer: `Read this page if you need practical MdWrk guidance for ${lowerTitle}, including the relevant workflow, product surface, and follow-up documentation paths.`,
    },
  ];
};

const readMarkdownSource = (filePath) => {
  const sourcePath = path.relative(landerRoot, filePath).replace(/\\/g, '/');
  const raw = fs.readFileSync(filePath, 'utf8');
  const split = splitFrontmatter(raw, sourcePath);
  return {
    sourcePath,
    raw,
    frontmatter: parseYamlFrontmatter(split.frontmatter),
    body: split.body,
  };
};

const createStaticEntry = ({
  sourcePath,
  sourceHash,
  slug,
  title,
  description,
  h1,
  subtitle,
  intent,
  contentType,
  updatedAt,
  body,
  html,
  faqs,
  tags = [],
  related = [],
  parent,
  afterArticleHtml = '',
}) => {
  const normalizedSlug = normalizeRouteSlug(slug);
  const rendered = renderMarkdown(body);
  return {
    sourcePath,
    sourceHash,
    frontmatter: normalizeFrontmatter({
      schema: 'mdwrk.page.v1',
      slug: normalizedSlug,
      title,
      description,
      h1,
      subtitle,
      entity: 'MdWrk',
      intent,
      contentType,
      updatedAt,
      faqs: faqs ?? buildDefaultFaqs({ title: h1, description, contentType }),
      parent,
      related,
      tags,
      canonical: canonicalForSlug(normalizedSlug),
      noindex: false,
      llmsInclude: true,
    }),
    body,
    rendered: {
      ...rendered,
      html: html ?? rendered.html,
    },
    afterArticleHtml,
  };
};

const buildRenderRegistry = (entries) => {
  const failures = [];
  const bySlug = new Map();
  const byContentType = new Map();
  for (const entry of entries) {
    if (bySlug.has(entry.frontmatter.slug)) {
      failures.push(`Duplicate generated static route ${entry.frontmatter.slug}`);
      continue;
    }
    bySlug.set(entry.frontmatter.slug, entry);
    const typed = byContentType.get(entry.frontmatter.contentType) ?? [];
    typed.push(entry);
    byContentType.set(entry.frontmatter.contentType, typed);
  }
  if (failures.length) fail('Static lander route registry validation failed:', failures);
  return { entries, bySlug, byContentType };
};

const toDisplayDate = (date) => {
  const match = String(date ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return String(date ?? '');
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
};

const toMonthLabel = (dateOrMonth) => {
  const match = String(dateOrMonth ?? '').match(/^(\d{4})-(\d{2})/);
  if (!match) return String(dateOrMonth ?? '');
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(Number(match[1]), Number(match[2]) - 1, 1));
};

const normalizeContentSlug = (entryId, metadata) => {
  const rawSlug = String(metadata.slug ?? '').trim();
  if (rawSlug) return rawSlug.replace(/^\/+|\/+$/g, '');
  return String(entryId ?? '').replace(/^\/+|\/+$/g, '');
};

const parseContentSitemapEntries = () => {
  if (!fs.existsSync(contentSitemapPath)) return [];
  const entries = [];
  let current = {};
  for (const rawLine of fs.readFileSync(contentSitemapPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.startsWith('- id:')) {
      if (current.id && current.file) entries.push(current);
      current = { id: line.replace('- id:', '').trim() };
      continue;
    }
    if (line.startsWith('file:')) current.file = line.replace('file:', '').trim();
  }
  if (current.id && current.file) entries.push(current);
  return entries;
};

const renderCardGrid = (items, type = 'blog') =>
  `<div class="${type === 'blog' ? 'blog-grid' : 'docs-index-grid'}">
                    ${items.map(item => `<article class="lander-content-card ${type === 'blog' ? 'blog-card' : 'docs-index-card'}">
                      ${type === 'blog' ? `<a class="blog-card-primary-link" href="${escapeAttribute(item.href)}" aria-label="Read ${escapeAttribute(item.title)}"></a>` : ''}
                      ${item.date ? `<a class="${type === 'blog' ? 'blog-card-date' : 'docs-meta'}" href="${escapeAttribute(item.dateHref ?? item.href)}"><time dateTime="${escapeAttribute(item.date)}">${escapeHtml(toDisplayDate(item.date))}</time></a>` : ''}
                      <h2 class="${type === 'blog' ? 'blog-card-title' : 'docs-index-card-title'}"><a class="${type === 'blog' ? 'blog-card-title-link' : 'docs-index-card-link'}" href="${escapeAttribute(item.href)}">${escapeHtml(item.title)}</a></h2>
                      <p class="${type === 'blog' ? 'blog-card-excerpt' : 'docs-index-card-excerpt'}">${escapeHtml(item.description)}</p>
                      ${item.author ? `<a class="blog-card-author" href="${escapeAttribute(item.authorHref)}">${escapeHtml(item.author)}</a>` : ''}
                    </article>`).join('\n                    ')}
                  </div>`;

const loadDataDocs = () => collectFiles(dataDocsRoot, file => file.endsWith('.md'))
  .sort()
  .map((filePath) => {
    const { sourcePath, raw, frontmatter, body } = readMarkdownSource(filePath);
    if (!isPublishedFrontmatter(frontmatter)) return null;
    const rawTitle = frontmatter.title || path.basename(filePath, '.md');
    const title = toTitleCase(rawTitle);
    const slug = String(frontmatter.slug || slugify(title)).replace(/^\/+|\/+$/g, '');
    const section = frontmatter.section || 'Docs';
    const sectionOrder = Number(frontmatter.sectionOrder ?? 999);
    const order = Number(frontmatter.order ?? 999);
    const articleSource = stripLegacyAeoSections(removeDuplicateLeadingHeading(body, title));
    const excerpt = summarizeContent(articleSource, frontmatter.excerpt);

    return {
      sourcePath,
      sourceHash: sha256(raw),
      title,
      slug,
      section,
      sectionOrder,
      order,
      date: frontmatter.date,
      excerpt,
      articleContent: articleSource,
      entry: createStaticEntry({
        sourcePath,
        sourceHash: sha256(raw),
        slug: `/docs/${slug}/`,
        title: `${title} | MdWrk Docs`,
        description: excerpt,
        h1: title,
        subtitle: frontmatter.subtitle,
        intent: `learn ${title.toLowerCase()} in MdWrk`,
        contentType: 'docs',
        updatedAt: frontmatter.date,
        body: articleSource,
        html: renderMarkdown(articleSource).html,
        tags: ['docs', section],
        parent: '/docs/',
      }),
    };
  })
  .filter(Boolean)
  .sort((a, b) => a.sectionOrder - b.sectionOrder || a.order - b.order || a.title.localeCompare(b.title));

const loadContentMarkdown = () => parseContentSitemapEntries()
  .map((entry) => {
    const filePath = path.resolve(dataRoot, entry.file.replace(/^\.\//, ''));
    if (!fs.existsSync(filePath)) return null;
    const source = readMarkdownSource(filePath);
    if (!isPublishedFrontmatter(source.frontmatter)) return null;
    return { ...entry, ...source };
  })
  .filter(Boolean);

const buildBlogPosts = (contentSources) => contentSources
  .filter(source => source.id.startsWith('blog/'))
  .map((source) => {
    const slug = normalizeContentSlug(source.id, source.frontmatter).replace(/^blog\//, '');
    const author = String(source.frontmatter.author ?? '').trim();
    const date = normalizeIsoDate(source.frontmatter.date);
    const excerpt = summarizeContent(source.body, source.frontmatter.excerpt);
    const title = String(source.frontmatter.title ?? slug).trim();
    return {
      ...source,
      slug,
      author,
      authorSlug: slugify(author),
      date,
      subtitle: source.frontmatter.subtitle,
      monthSlug: date ? date.slice(0, 7) : '',
      monthLabel: date ? toMonthLabel(date) : '',
      excerpt,
      title,
    };
  })
  .filter(post => post.title && post.excerpt && post.author && post.authorSlug && post.date && post.monthSlug)
  .sort((a, b) => String(b.date).localeCompare(String(a.date)) || b.title.localeCompare(a.title));

const blogCardItems = (posts) => posts.map(post => ({
  title: post.title,
  description: post.excerpt,
  href: `/blog/${post.slug}/`,
  date: post.date,
  dateHref: `/blog/archive/${post.monthSlug}/`,
  author: post.author,
  authorHref: `/blog/author/${post.authorSlug}/`,
}));

const createBlogListEntry = ({ slug, title, eyebrow, posts, sourcePath, sourceHash }) => {
  const description = posts[0]?.excerpt || `Read ${title} posts from MdWrk.`;
  const body = [
    `# ${title}`,
    '',
    description,
    '',
    ...posts.map(post => `- [${post.title}](/blog/${post.slug}/) - ${post.excerpt}`),
  ].join('\n');
  return createStaticEntry({
    sourcePath,
    sourceHash,
    slug,
    title: eyebrow ? `${title} | MdWrk Blog` : 'MdWrk Blog',
    description,
    h1: title,
    subtitle: eyebrow || description,
    intent: `read ${title.toLowerCase()} posts from MdWrk`,
    contentType: 'blog',
    updatedAt: posts[0]?.date || toLocalIsoDate(),
    body,
    html: `${eyebrow ? `<div class="blog-list-eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
                  ${renderCardGrid(blogCardItems(posts), 'blog')}`,
    tags: ['blog'],
  });
};

const createBlogPostEntry = (post) => {
  const articleSource = stripLegacyAeoSections(removeDuplicateLeadingHeading(post.body, post.title));
  return createStaticEntry({
    sourcePath: post.sourcePath,
    sourceHash: sha256(post.raw),
    slug: `/blog/${post.slug}/`,
    title: `${post.title} | MdWrk Blog`,
    description: post.excerpt,
    h1: post.title,
    subtitle: post.subtitle || post.excerpt,
    intent: `read about ${post.title.toLowerCase()}`,
    contentType: 'blog',
    updatedAt: post.date,
    body: articleSource,
    html: `<div class="blog-post-meta">
                    <a href="/blog/archive/${escapeAttribute(post.monthSlug)}/" class="blog-post-meta-item blog-post-meta-link"><time dateTime="${escapeAttribute(post.date)}">${escapeHtml(toDisplayDate(post.date))}</time></a>
                    <a href="/blog/author/${escapeAttribute(post.authorSlug)}/" class="blog-post-meta-item blog-post-meta-link">${escapeHtml(post.author)}</a>
                  </div>
                  ${renderMarkdown(articleSource).html}`,
    tags: ['blog'],
    parent: '/blog/',
  });
};

const createLegalEntry = (source) => {
  const title = String(source.frontmatter.title ?? source.id).trim();
  const slug = `/${source.id}/`;
  const body = removeDuplicateLeadingHeading(source.body, title);
  const description = summarizeContent(body, source.frontmatter.excerpt);
  return createStaticEntry({
    sourcePath: source.sourcePath,
    sourceHash: sha256(source.raw),
    slug,
    title: `${title} | MdWrk`,
    description,
    h1: title,
    subtitle: source.frontmatter.subtitle,
    intent: `read ${title.toLowerCase()}`,
    contentType: 'privacy',
    updatedAt: source.frontmatter.date,
    body,
    tags: ['legal'],
    related: ['/privacy/', '/security/'],
  });
};

const readDataStaticEntries = () => {
  const docs = loadDataDocs();
  const contentSources = loadContentMarkdown();
  const blogPosts = buildBlogPosts(contentSources);
  const legalEntries = contentSources
    .filter(source => source.id.startsWith('legal/'))
    .map(createLegalEntry);

  const gettingStartedDocs = docs.filter(doc => doc.section === 'Getting Started');
  const docsIndexDocs = gettingStartedDocs.length ? gettingStartedDocs : docs.slice(0, 6);
  const docsIndexBody = [
    '# Getting Started',
    '',
    'Start with the MdWrk setup paths that get the workspace running in a browser, as an installable PWA, from a local checkout, or through standalone packages.',
    '',
    '1. Choose the setup path that matches how you want to use MdWrk.',
    '2. Open the matching Getting Started article.',
    '3. Follow the article into configuration, local setup, PWA installation, or package use.',
    '',
    '## Choose a setup path',
    '',
    ...docsIndexDocs.map(doc => `- [${doc.title}](/docs/${doc.slug}/): ${doc.excerpt}`),
    '',
    '## What to read next',
    '',
    'After setup, continue into product docs for local-first workflow, editor and preview behavior, extension host boundaries, and theme packages.',
  ].join('\n');
  const docsIndexHtml = renderMarkdown([
    'Start with the MdWrk setup paths that get the workspace running in a browser, as an installable PWA, from a local checkout, or through standalone packages.',
    '',
    '1. Choose the setup path that matches how you want to use MdWrk.',
    '2. Open the matching Getting Started article.',
    '3. Follow the article into configuration, local setup, PWA installation, or package use.',
    '',
    '## Choose a setup path',
    '',
    ...docsIndexDocs.map(doc => `- [${doc.title}](/docs/${doc.slug}/): ${doc.excerpt}`),
    '',
    '## What to read next',
    '',
    'After setup, continue into product docs for local-first workflow, editor and preview behavior, extension host boundaries, and theme packages.',
  ].join('\n')).html;
  const docsIndex = createStaticEntry({
    sourcePath: 'data/markdown/docs',
    sourceHash: sha256(docsIndexDocs.map(doc => `${doc.slug}:${doc.sourceHash}`).join('\n')),
    slug: '/docs/',
    title: 'Getting Started | MdWrk Docs',
    description: 'Start using MdWrk with browser, PWA, local setup, configuration, and standalone package guidance.',
    h1: 'Getting Started',
    subtitle: 'Start using MdWrk with browser, PWA, local setup, configuration, and standalone package guidance.',
    intent: 'start using MdWrk',
    contentType: 'docs',
    updatedAt: docsIndexDocs[0]?.date || toLocalIsoDate(),
    body: docsIndexBody,
    html: docsIndexHtml,
    tags: ['docs'],
  });

  const blogList = createBlogListEntry({
    slug: '/blog/',
    title: 'Blog',
    posts: blogPosts,
    sourcePath: 'data/markdown/blog',
    sourceHash: sha256(blogPosts.map(post => `${post.slug}:${post.sourceHash}`).join('\n')),
  });
  const authorEntries = Array.from(new Map(blogPosts.map(post => [post.authorSlug, post])).values())
    .map(authorPost => {
      const posts = blogPosts.filter(post => post.authorSlug === authorPost.authorSlug);
      return createBlogListEntry({
        slug: `/blog/author/${authorPost.authorSlug}/`,
        title: authorPost.author,
        eyebrow: 'Author Archive',
        posts,
        sourcePath: `data/markdown/blog#author:${authorPost.authorSlug}`,
        sourceHash: sha256(posts.map(post => post.sourceHash).join('\n')),
      });
    });
  const archiveEntries = Array.from(new Map(blogPosts.map(post => [post.monthSlug, post])).values())
    .map(monthPost => {
      const posts = blogPosts.filter(post => post.monthSlug === monthPost.monthSlug);
      return createBlogListEntry({
        slug: `/blog/archive/${monthPost.monthSlug}/`,
        title: monthPost.monthLabel,
        eyebrow: 'Monthly Archive',
        posts,
        sourcePath: `data/markdown/blog#archive:${monthPost.monthSlug}`,
        sourceHash: sha256(posts.map(post => post.sourceHash).join('\n')),
      });
    });

  return [
    docsIndex,
    ...docs.map(doc => doc.entry),
    blogList,
    ...blogPosts.map(createBlogPostEntry),
    ...authorEntries,
    ...archiveEntries,
    ...legalEntries,
  ];
};

const readStaticRegistry = () => {
  const contentRegistry = readContentEntries();
  return buildRenderRegistry([
    ...contentRegistry.entries,
    ...readDataStaticEntries(),
  ]);
};

const readContentEntries = () => {
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
  if (schema.$schema !== 'https://json-schema.org/draft/2020-12/schema') {
    throw new Error('Schema must use JSON Schema Draft 2020-12');
  }

  const files = collectFiles(contentRoot, file => file.endsWith('.md')).sort();
  if (!files.length) throw new Error(`No Markdown content found under ${contentRoot}`);
  const failures = [];
  const entries = files.map((filePath) => {
    const sourcePath = path.relative(landerRoot, filePath).replace(/\\/g, '/');
    const raw = fs.readFileSync(filePath, 'utf8');
    let frontmatter;
    let body;
    try {
      const split = splitFrontmatter(raw, sourcePath);
      frontmatter = parseYamlFrontmatter(split.frontmatter);
      body = split.body;
    } catch (error) {
      failures.push(error.message);
      return null;
    }
    failures.push(...validateSchemaShape(frontmatter, sourcePath, schema));
    if (!body.trim()) failures.push(`${sourcePath}: empty Markdown body`);
    const normalized = normalizeFrontmatter(frontmatter);
    const rendered = renderMarkdown(body);
    return {
      sourcePath,
      sourceHash: sha256(raw),
      frontmatter: normalized,
      body,
      rendered,
    };
  }).filter(Boolean);

  if (failures.length) fail('Static lander source validation failed:', failures);
  return buildRegistry(entries);
};

const buildRegistry = (entries) => {
  const failures = [];
  const bySlug = new Map();
  const byCanonical = new Map();
  const byTitle = new Map();
  const byContentType = new Map();

  for (const entry of entries) {
    const { frontmatter } = entry;
    if (bySlug.has(frontmatter.slug)) failures.push(`Duplicate slug ${frontmatter.slug}`);
    bySlug.set(frontmatter.slug, entry);
    if (byCanonical.has(frontmatter.canonical)) failures.push(`Duplicate canonical ${frontmatter.canonical}`);
    byCanonical.set(frontmatter.canonical, entry);
    if (byTitle.has(frontmatter.title)) failures.push(`Duplicate title ${frontmatter.title}`);
    byTitle.set(frontmatter.title, entry);
    const typed = byContentType.get(frontmatter.contentType) ?? [];
    typed.push(entry);
    byContentType.set(frontmatter.contentType, typed);
  }

  for (const entry of entries) {
    const { frontmatter, rendered } = entry;
    if (frontmatter.parent && !bySlug.has(frontmatter.parent)) failures.push(`${entry.sourcePath}: missing parent target ${frontmatter.parent}`);
    for (const related of frontmatter.related) {
      if (!bySlug.has(related)) failures.push(`${entry.sourcePath}: missing related target ${related}`);
    }
    if (!rendered.text) failures.push(`${entry.sourcePath}: missing rendered body text`);
    if (!frontmatter.noindex && rendered.wordCount < (MIN_WORDS[frontmatter.contentType] ?? 50)) {
      failures.push(`${entry.sourcePath}: indexable body word count ${rendered.wordCount} is below threshold`);
    }
  }

  if (failures.length) fail('Static lander registry validation failed:', failures);
  return {
    entries,
    bySlug,
    byContentType,
  };
};

const breadcrumbsFor = (entry, registry) => {
  const items = [{ name: 'MdWrk', slug: '/' }];
  const seen = new Set([entry.frontmatter.slug]);
  let cursor = entry.frontmatter.parent;
  const chain = [];
  while (cursor && cursor !== '/' && !seen.has(cursor)) {
    seen.add(cursor);
    const parent = registry.bySlug.get(cursor);
    if (!parent) break;
    chain.unshift(parent);
    cursor = parent.frontmatter.parent;
  }
  for (const item of chain) items.push({ name: item.frontmatter.h1, slug: item.frontmatter.slug });
  if (entry.frontmatter.slug !== '/') items.push({ name: entry.frontmatter.h1, slug: entry.frontmatter.slug });
  return items;
};

const jsonLdFor = (entry, registry) => {
  const url = canonicalForSlug(entry.frontmatter.slug);
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: entry.frontmatter.title,
      headline: entry.frontmatter.h1,
      description: entry.frontmatter.description,
      dateModified: entry.frontmatter.updatedAt,
      inLanguage: 'en-US',
    },
  ];
  if (entry.frontmatter.slug === '/') {
    graph.push(
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'MdWrk',
        url: `${siteUrl}/`,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${siteUrl}/#software`,
        name: 'MdWrk',
        applicationCategory: 'ProductivityApplication',
        operatingSystem: 'Web',
        url: `${siteUrl}/`,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: 'MdWrk',
        url: `${siteUrl}/`,
      },
    );
  }
  const rendersVisibleFaqs = entry.frontmatter.slug !== '/' && entry.frontmatter.faqs.length;
  if (rendersVisibleFaqs) {
    graph.push({
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: entry.frontmatter.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer,
        },
      })),
    });
  }
  const crumbs = breadcrumbsFor(entry, registry);
  if (crumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumbs`,
      itemListElement: crumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: canonicalForSlug(crumb.slug),
      })),
    });
  }
  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
};

const renderTopNav = (registry, currentSlug) => {
  const links = [
    ['/', 'Home'],
    ['/docs/', 'Docs'],
    ['/blog/', 'Blog'],
    ['/features/offline-markdown-editor/', 'Features'],
    ['/compare/obsidian/', 'Compare'],
    ['/privacy/', 'Privacy'],
  ];
  return links
    .filter(([slug]) => registry.bySlug.has(slug))
    .map(([slug, text]) => {
      const active = slug === '/'
        ? currentSlug === '/'
        : currentSlug === slug || currentSlug.startsWith(slug);
      return `<li><a class="navbar-link ${active ? 'is-active' : 'is-inactive'}" href="${slug}">${text}</a></li>`;
    })
    .join('\n              ');
};

const renderThemeBootstrap = () => `<script>
      (() => {
        const key = 'mdwrk:lander-theme';
        const valid = new Set(['lander-light', 'lander-dark']);
        const requested = new URLSearchParams(window.location.search).get('theme');
        const stored = localStorage.getItem(key);
        const preferred = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'lander-light' : 'lander-dark';
        const requestedTheme = requested === 'dark' ? 'lander-dark' : requested === 'light' ? 'lander-light' : requested;
        const theme = valid.has(requestedTheme) ? requestedTheme : valid.has(stored) ? stored : preferred;
        document.documentElement.setAttribute('data-lander-theme', theme);
        document.documentElement.classList.toggle('dark', theme === 'lander-dark');
      })();
    </script>`;

const renderThemeToggleScript = () => `<script>
      (() => {
        const key = 'mdwrk:lander-theme';
        const button = document.querySelector('[data-static-theme-toggle]');
        const label = document.querySelector('[data-static-theme-label]');
        const apply = (theme) => {
          document.documentElement.setAttribute('data-lander-theme', theme);
          document.documentElement.classList.toggle('dark', theme === 'lander-dark');
          localStorage.setItem(key, theme);
          if (label) label.textContent = theme === 'lander-dark' ? 'Lander Dark' : 'Lander Light';
        };
        if (button) {
          button.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-lander-theme') === 'lander-dark' ? 'lander-dark' : 'lander-light';
            apply(current === 'lander-dark' ? 'lander-light' : 'lander-dark');
          });
          apply(document.documentElement.getAttribute('data-lander-theme') || 'lander-light');
        }
      })();
    </script>`;

const renderStaticDemoScript = () => `<script>
      (() => {
        const editor = document.querySelector('[data-static-demo-editor]');
        const preview = document.querySelector('[data-static-demo-preview]');
        const wordCounter = document.querySelector('[data-static-demo-words]');
        const charCounter = document.querySelector('[data-static-demo-chars]');
        if (!editor || !preview) return;

        const escapeHtml = (value) => String(value || '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');

        const slugify = (value) => String(value || '')
          .trim()
          .toLowerCase()
          .replace(/[^\\w\\s-]/g, '')
          .replace(/\\s+/g, '-')
          .replace(/^-+|-+$/g, '');

        const renderInline = (value) => escapeHtml(value)
          .replace(/\\*\\*([^*]+)\\*\\*/g, '<strong>$1</strong>')
          .replace(/\\*([^*]+)\\*/g, '<em>$1</em>')
          .replace(new RegExp('\\\\x60([^\\\\x60]+)\\\\x60', 'g'), '<code>$1</code>');

        const renderParagraph = (lines) => lines.length
          ? '<p class="md-paragraph">' + renderInline(lines.join(' ')) + '</p>'
          : '';

        const renderMarkdown = (markdown) => {
          const lines = String(markdown || '').replace(/\\r\\n?/g, '\\n').split('\\n');
          const html = [];
          let paragraph = [];
          let list = [];
          let table = [];
          let code = [];
          let inCode = false;
          let codeLanguage = '';

          const flushParagraph = () => {
            const rendered = renderParagraph(paragraph);
            if (rendered) html.push(rendered);
            paragraph = [];
          };
          const flushList = () => {
            if (!list.length) return;
            html.push('<ul class="md-list">' + list.map(item => '<li>' + renderInline(item) + '</li>').join('') + '</ul>');
            list = [];
          };
          const flushTable = () => {
            if (table.length < 2) {
              paragraph.push(...table);
              table = [];
              return;
            }
            const rows = table
              .filter((line, index) => index !== 1 || !/^\\s*\\|?\\s*:?-{3,}:?\\s*(\\|\\s*:?-{3,}:?\\s*)+\\|?\\s*$/.test(line))
              .map(line => line.trim().replace(/^\\||\\|$/g, '').split('|').map(cell => cell.trim()));
            const headers = rows.shift() || [];
            html.push('<table class="md-table"><thead><tr>' + headers.map(cell => '<th>' + renderInline(cell) + '</th>').join('') + '</tr></thead><tbody>' + rows.map(row => '<tr>' + row.map(cell => '<td>' + renderInline(cell) + '</td>').join('') + '</tr>').join('') + '</tbody></table>');
            table = [];
          };
          const flushBlocks = () => {
            flushParagraph();
            flushList();
            flushTable();
          };

          for (const line of lines) {
            const fence = new RegExp('^\\\\x60\\\\x60\\\\x60\\\\s*([\\\\w-]+)?\\\\s*$').exec(line);
            if (fence) {
              if (inCode) {
                html.push('<pre class="md-code-block"><code' + (codeLanguage ? ' class="language-' + escapeHtml(codeLanguage) + '"' : '') + '>' + escapeHtml(code.join('\\n')) + '</code></pre>');
                code = [];
                codeLanguage = '';
                inCode = false;
              } else {
                flushBlocks();
                inCode = true;
                codeLanguage = fence[1] || '';
              }
              continue;
            }
            if (inCode) {
              code.push(line);
              continue;
            }

            if (!line.trim()) {
              flushBlocks();
              continue;
            }

            const heading = /^(#{1,6})\\s+(.+)$/.exec(line);
            if (heading) {
              flushBlocks();
              const depth = heading[1].length;
              const text = heading[2].trim();
              const id = slugify(text);
              html.push('<h' + depth + ' class="md-h' + depth + '" id="' + escapeHtml(id) + '">' + renderInline(text) + '</h' + depth + '>');
              continue;
            }

            const listItem = /^-\\s+(?:\\[[ xX]\\]\\s+)?(.+)$/.exec(line);
            if (listItem) {
              flushParagraph();
              flushTable();
              list.push(listItem[1]);
              continue;
            }

            if (line.includes('|')) {
              flushParagraph();
              flushList();
              table.push(line);
              continue;
            }

            flushList();
            flushTable();
            paragraph.push(line.trim());
          }

          if (inCode) html.push('<pre class="md-code-block"><code>' + escapeHtml(code.join('\\n')) + '</code></pre>');
          flushBlocks();
          return '<div class="markdown-renderer-host lander-markdown">' + html.join('\\n') + '</div>';
        };

        const update = () => {
          const content = editor.value || '';
          preview.innerHTML = renderMarkdown(content);
          const words = content
            .replace(new RegExp('\\\\x60\\\\x60\\\\x60[\\\\s\\\\S]*?\\\\x60\\\\x60\\\\x60', 'g'), ' ')
            .replace(/[#*_|:[\\]()-]/g, ' ')
            .split(/\\s+/)
            .filter(Boolean).length;
          if (wordCounter) wordCounter.textContent = words + ' words';
          if (charCounter) charCounter.textContent = content.length + ' chars';
        };

        editor.addEventListener('input', update);
      })();
    </script>`;

const renderStaticCloudOffIcon = () => `<svg class="navbar-brand-icon static-navbar-brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m2 2 20 20"></path>
                <path d="M5.8 5.8A4.5 4.5 0 0 0 2 10.2c0 2.3 1.8 4.2 4 4.2h6"></path>
                <path d="M10.9 4.2A5.8 5.8 0 0 1 18 10c2.2.2 4 2.1 4 4.4 0 .7-.2 1.4-.5 2"></path>
              </svg>`;

const renderStaticThemeIcon = () => `<svg class="navbar-theme-icon static-theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                </svg>`;

const renderStaticStarIcon = () => `<svg class="navbar-github-icon static-github-star-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M11.5 2.3a.6.6 0 0 1 1 0l2.8 5.7 6.3.9a.6.6 0 0 1 .3 1l-4.6 4.5 1.1 6.3a.6.6 0 0 1-.9.6L12 18.4l-5.6 2.9a.6.6 0 0 1-.9-.6l1.1-6.3L2 9.9a.6.6 0 0 1 .3-1L8.6 8l2.9-5.7Z"></path>
                </svg>`;

const renderStaticNavbar = (registry, currentSlug) => `<nav class="navbar" aria-label="Main navigation">
          <div class="navbar-inner">
            <a href="/" class="navbar-brand">
              <div class="navbar-brand-mark">${renderStaticCloudOffIcon()}</div>
              <span class="navbar-brand-text">MdWrk</span>
            </a>
            <div class="navbar-actions">
              <button type="button" class="navbar-theme-toggle" data-static-theme-toggle aria-label="Toggle lander theme" title="Toggle lander theme">
                ${renderStaticThemeIcon()}
                <span class="sr-only" data-static-theme-label>Lander Theme</span>
              </button>
              <a href="${escapeAttribute(githubRepoUrl)}" target="_blank" rel="noopener noreferrer" class="navbar-github-link" aria-label="Open MdWrk GitHub repository" title="Open MdWrk GitHub repository">
                ${renderStaticStarIcon()}
                <span>Repo</span>
              </a>
            </div>
            <div class="navbar-menu-panel is-open" id="navbar-sticky">
              <ul class="navbar-menu-list">
                ${renderTopNav(registry, currentSlug)}
              </ul>
            </div>
          </div>
        </nav>`;

const renderDocsSidebar = (registry, currentSlug) => {
  const docs = registry.entries
    .filter(item => item.frontmatter.contentType === 'docs' && item.frontmatter.slug.startsWith('/docs/') && item.frontmatter.slug !== '/docs/')
    .slice()
    .sort((a, b) => {
      const groupA = a.frontmatter.tags[1] || 'Documentation';
      const groupB = b.frontmatter.tags[1] || 'Documentation';
      return docSectionRank(groupA) - docSectionRank(groupB)
        || docItemRank(a.frontmatter.slug) - docItemRank(b.frontmatter.slug)
        || a.frontmatter.h1.localeCompare(b.frontmatter.h1);
    });
  const groups = new Map();
  for (const doc of docs) {
    const group = doc.frontmatter.tags[1] || 'Documentation';
    const title = toTitleCase(group.replace(/[-_/]+/g, ' '));
    const items = groups.get(title) ?? [];
    items.push(doc);
    groups.set(title, items);
  }
  return `<aside class="docs-sidebar" aria-label="Documentation navigation">
          <div class="docs-sidebar-inner">
            <h3 class="docs-sidebar-heading">Documentation</h3>
            <nav class="docs-nav">
              ${Array.from(groups.entries()).sort(([groupA], [groupB]) => docSectionRank(groupA) - docSectionRank(groupB) || groupA.localeCompare(groupB)).map(([group, items]) => `<details class="docs-nav-item static-docs-nav-section" open>
                <summary class="docs-nav-section-button"><span class="docs-nav-section-label">${escapeHtml(group)}</span></summary>
                <div class="docs-nav-children">
                  ${group === 'Getting Started' ? `<a class="docs-nav-link ${currentSlug === '/docs/' ? 'is-active' : 'is-inactive'}" href="/docs/">
                    ${currentSlug === '/docs/' ? '<span class="docs-nav-link-dot"></span>' : ''}
                    <span class="docs-nav-link-label">Getting Started</span>
                  </a>` : ''}
                  ${items.map(item => `<a class="docs-nav-link ${item.frontmatter.slug === currentSlug ? 'is-active' : 'is-inactive'}" href="${item.frontmatter.slug}">
                    ${item.frontmatter.slug === currentSlug ? '<span class="docs-nav-link-dot"></span>' : ''}
                    <span class="docs-nav-link-label">${escapeHtml(item.frontmatter.h1)}</span>
                  </a>`).join('\n                  ')}
                </div>
              </details>`).join('\n              ')}
            </nav>
          </div>
        </aside>`;
};

const renderArticleToc = (entry) => {
  const children = entry.rendered.headings.map(heading => ({
    title: heading.text,
    href: `#${heading.id}`,
    depth: heading.depth,
  }));
  if (entry.frontmatter.faqs.length) {
    children.push({ title: 'Frequently Asked Questions', href: '#faq-heading', depth: 2 });
  }
  if (entry.frontmatter.related.length) {
    children.push({ title: 'Related Pages', href: '#related-heading', depth: 2 });
  }
  if (!children.length) return '';
  return `<aside class="docs-toc" aria-label="Article table of contents">
              <div class="docs-toc-inner">
                <h4 class="docs-toc-heading">On this page</h4>
                <nav class="docs-toc-nav">
                  ${children.map(item => `<div class="docs-toc-item"><a href="${escapeAttribute(item.href)}" class="docs-toc-link${item.depth > 2 ? ' docs-toc-link-child' : ''}" title="${escapeAttribute(item.title)}">${escapeHtml(item.title)}</a></div>`).join('\n                  ')}
                </nav>
              </div>
            </aside>`;
};

const renderMarkdownHost = (html) => `<div class="markdown-renderer-host lander-markdown">
                    ${html}
                  </div>`;

const renderSupplementarySections = (entry, registry) => {
  const faqHtml = entry.frontmatter.faqs.length
    ? `<section class="faq-section static-faq" aria-labelledby="faq-heading">
                    <h2 id="faq-heading" class="faq-section-heading">Frequently Asked Questions</h2>
                    <div class="faq-list">${entry.frontmatter.faqs.map(faq => `<details class="faq-accordion"><summary class="faq-summary">${escapeHtml(faq.question)}</summary><div class="faq-content"><p>${escapeHtml(faq.answer)}</p></div></details>`).join('\n                      ')}</div>
                  </section>`
    : '';
  const relatedHtml = entry.frontmatter.related.length
    ? `<section class="related-section static-related" aria-labelledby="related-heading">
                    <h2 id="related-heading" class="faq-section-heading">Related Pages</h2>
                    <ul>${entry.frontmatter.related.map(slug => {
              const target = registry.bySlug.get(slug);
              return `<li><a href="${slug}">${escapeHtml(target?.frontmatter.h1 ?? slug)}</a></li>`;
            }).join('')}</ul>
                  </section>`
    : '';
  return [faqHtml, relatedHtml].filter(Boolean).join('\n                  ');
};

const renderArticleCard = (entry, registry) => {
  const metaLabel = entry.frontmatter.contentType === 'blog' ? 'Blog' : entry.frontmatter.contentType;
  const isBlogPost = entry.frontmatter.contentType === 'blog' && entry.frontmatter.slug !== '/blog/' && !entry.frontmatter.slug.includes('/archive/') && !entry.frontmatter.slug.includes('/author/');
  const isBlogList = entry.frontmatter.contentType === 'blog' && !isBlogPost;
  if (isBlogList) {
    return `<div class="blog-list-column">
                <article class="blog-list-layout" aria-labelledby="blog-list-title">
                  <header class="blog-list-header">
                    ${entry.frontmatter.slug === '/blog/' ? '' : '<a href="/blog/" class="blog-back-button">Back to Blog</a>'}
                    <h1 id="blog-list-title" class="blog-list-title"><span class="blog-list-title-inner">${escapeHtml(entry.frontmatter.h1)}</span></h1>
                    ${entry.frontmatter.subtitle ? `<p class="blog-list-description">${escapeHtml(entry.frontmatter.subtitle)}</p>` : ''}
                  </header>
                  ${entry.rendered.html}
                </article>
                ${entry.afterArticleHtml ?? ''}
                ${renderSupplementarySections(entry, registry)}
              </div>`;
  }
  const articleClass = isBlogPost
    ? 'blog-post-card'
    : 'docs-content-card';
  return `<div class="docs-article-column">
                ${isBlogPost ? '<a href="/blog/" class="blog-back-button">Back to Blog</a>' : ''}
                <article class="${articleClass} lander-content-card">
                  <header class="${articleClass === 'blog-post-card' ? 'blog-post-header' : 'docs-header'}">
                    <div class="docs-meta">
                      <span>${escapeHtml(metaLabel)}</span>
                      <span class="docs-meta-divider">/</span>
                      <time datetime="${escapeAttribute(entry.frontmatter.updatedAt)}">${escapeHtml(toDisplayDate(entry.frontmatter.updatedAt))}</time>
                    </div>
                    <h1 class="${articleClass === 'blog-post-card' ? 'blog-post-title' : 'docs-title'}">${escapeHtml(entry.frontmatter.h1)}</h1>
                    ${entry.frontmatter.subtitle ? `<p class="${articleClass === 'blog-post-card' ? 'blog-post-subtitle' : 'docs-subtitle'}">${escapeHtml(entry.frontmatter.subtitle)}</p>` : ''}
                  </header>
                  ${renderMarkdownHost(entry.rendered.html)}
                </article>
                ${entry.afterArticleHtml ?? ''}
                ${renderSupplementarySections(entry, registry)}
              </div>`;
};

const homeDemoMarkdown = `# mdwrk client surface

The lander demonstrates the same shared packages that the mdwrk client uses.

## Shared packages
| Surface | Package | Notes |
| :--- | :---: | ---: |
| Editor | \`@mdwrk/markdown-editor-react\` | Live |
| Preview | \`@mdwrk/markdown-renderer-react\` | Shared |
| Themes | \`@mdwrk/theme-contract\` | Light + dark |
| Extensions | Runtime-backed | Governed |

## Workspace signals
- [x] Local-first persistence
- [x] Split editor and preview packages
- [x] Extension-ready client host
- [x] Shared theme rendering for docs and blog

## Authoring workflow
- Draft Markdown in the editor pane.
- Preview headings, tables, lists, and code in the rendered pane.
- Keep the source readable as plain text.
- Use the same renderer behavior that powers MdWrk docs and blog pages.

## Renderer workflow
- Parse Markdown through the shared renderer contract.
- Escape raw HTML by default for public content safety.
- Apply the lander light and lander dark theme tokens.
- Preserve semantic headings so crawlers and assistive technology can read the output.

## Extension workflow
- Keep extension boundaries visible.
- Use package-level contracts instead of one-off demo code.
- Verify theme behavior across both panes.
- Treat the rendered preview as the product surface, not a screenshot.

## Example
\`\`\`typescript
import { MarkdownSourceEditor } from "@mdwrk/markdown-editor-react";
import { MarkdownRenderer } from "@mdwrk/markdown-renderer-react";

const surface = {
  client: "@mdwrk/mdwrkspace",
  editor: "@mdwrk/markdown-editor-react",
  preview: "@mdwrk/markdown-renderer-react"
};
\`\`\`
`;

const homeFeatures = [
  ['Offline First', 'Built as a Progressive Web App. Install the MdWrk client once, keep working offline, and sync only when you choose to.'],
  ['Split Packages', 'The editor and previewer are separate MdWrk packages, so the client, examples, and docs consume the same public surfaces.'],
  ['Extension Ready', 'The client hosts bundled and external extensions through a governed runtime, manifest, settings, and trust policy stack.'],
  ['Zero Knowledge', 'No hosted authoring backend owns your Markdown. Data stays local unless you connect your own Git provider.'],
  ['Local Database', 'IndexedDB persistence keeps workspaces, sessions, themes, and extension state local to the device.'],
  ['GitHub Sync', 'Optional Git provider integration keeps repository operations additive instead of mandatory.'],
  ['Shared Themes', 'Renderer, editor, docs, blog, and client app all consume MdWrk theme contracts instead of forking per-surface styling.'],
  ['Blazing Fast', 'No network round trip for typing or previewing. The editor and preview pipeline stay local and responsive.'],
];

const renderStaticFeatureIcon = () => `<svg class="feature-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3v18"></path>
                  <path d="M3 12h18"></path>
                  <path d="m5 5 14 14"></path>
                  <path d="m19 5-14 14"></path>
                </svg>`;

const renderStaticHome = (entry, registry, assetTags = '') => {
  const demoPreview = renderMarkdown(homeDemoMarkdown).html;
  const demoWordCount = stripMarkdown(homeDemoMarkdown).split(/\s+/).filter(Boolean).length;
  return `<!doctype html>
<html lang="en" data-lander-theme="lander-light">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${renderThemeBootstrap()}
    <title>${escapeHtml(entry.frontmatter.title)}</title>
    <meta name="description" content="${escapeAttribute(entry.frontmatter.description)}">
    <link rel="canonical" href="${escapeAttribute(entry.frontmatter.canonical)}">
    <meta name="robots" content="${entry.frontmatter.noindex ? 'noindex,follow' : 'index,follow'}">
    <meta name="application-name" content="MdWrk">
    <meta property="og:site_name" content="MdWrk">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(entry, registry))}</script>
    ${assetTags}
  </head>
  <body>
    <div id="root">
      <div class="app-shell">
        ${renderStaticNavbar(registry, entry.frontmatter.slug)}
        <main id="content" class="app-main">
          <article class="static-home-article">
          <section class="hero-section">
            <div class="hero-blob hero-blob-indigo"></div>
            <div class="hero-blob hero-blob-emerald"></div>
            <div class="hero-blob hero-blob-cyan"></div>
            <div class="hero-inner">
              <div class="hero-eyebrow">
                <span class="hero-eyebrow-badge">Client</span>
                <a href="/docs/" class="hero-eyebrow-copy hero-eyebrow-link">mdwrk workspace, packages, and extensions documented here</a>
                <svg class="hero-eyebrow-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m2 2 20 20"></path><path d="M8.5 16.5a5 5 0 0 1 7 0"></path><path d="M5 13a10 10 0 0 1 3-2"></path><path d="M12 20h.01"></path><path d="M8.5 5.4A15 15 0 0 1 21 10"></path></svg>
              </div>
              <h1 class="hero-heading">The <span class="hero-heading-accent">Local-First</span> Markdown Workspace</h1>
              <p class="hero-copy home-subtitle">${escapeHtml(entry.frontmatter.subtitle || 'MdWrk is the workspace client, renderer/editor package family, and extension host for local-first Markdown work. The lander is the documentation and release surface.')}</p>
              <div class="hero-actions">
                <a href="/docs/getting-started/local-setup/" class="hero-primary-link">Deploy Locally
                  <svg class="hero-primary-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"></path><path d="m7 10 5 5 5-5"></path><path d="M5 21h14"></path></svg>
                </a>
                <a href="${escapeAttribute(process.env.VITE_APP_URL || 'https://app.mdwrk.com')}" class="hero-secondary-link" target="_blank" rel="noopener noreferrer">Install PWA</a>
              </div>
              <div class="hero-meta">
                <span class="hero-meta-label">ESM CDN</span>
                <a href="${escapeAttribute(process.env.VITE_NPM_ESM_CDN_URL || 'https://esm.sh/@mdwrk/mdwrkspace')}" target="_blank" rel="noopener noreferrer" class="hero-meta-link">${escapeHtml(process.env.VITE_NPM_ESM_CDN_URL || 'https://esm.sh/@mdwrk/mdwrkspace')}</a>
              </div>
            </div>
          </section>

          <section id="features" class="features-section">
            <div class="features-container">
              <div class="features-header">
                <h2 class="features-heading">Designed for <span class="features-heading-privacy">Privacy</span>, Built for <span class="features-heading-accent">Reusable Surfaces</span></h2>
                <p class="features-copy">The workspace client is the product surface. The lander is a guided window into the client, the shared packages, and the extension platform.</p>
              </div>
              <div class="features-grid">
                ${homeFeatures.map(([title, description]) => `<div class="feature-card">
                  <div class="feature-icon-wrap">${renderStaticFeatureIcon()}</div>
                  <h3 class="feature-title">${escapeHtml(title)}</h3>
                  <p class="feature-description">${escapeHtml(description)}</p>
                </div>`).join('\n                ')}
              </div>
            </div>
          </section>

          <section id="demo" class="demo-section">
            <div class="demo-backdrop"></div>
            <div class="demo-container">
              <div class="demo-header">
                <h2 class="demo-heading">One Editor Package. One Preview Package. <span class="demo-heading-accent">Shared Everywhere.</span></h2>
                <p class="demo-copy">The lander demo runs through the same public MdWrk editor and renderer package surfaces that the client ships.</p>
              </div>
              <div class="demo-frame">
                <div class="demo-toolbar">
                  <div class="demo-toolbar-lights"><div class="demo-light demo-light-red"></div><div class="demo-light demo-light-yellow"></div><div class="demo-light demo-light-green"></div></div>
                  <div class="demo-tablist">
                    <button type="button" class="demo-tab-button is-active"><svg class="demo-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m16 18 6-6-6-6"></path><path d="m8 6-6 6 6 6"></path></svg> Editor</button>
                    <button type="button" class="demo-tab-button is-active"><svg class="demo-tab-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2.1 12a10 10 0 0 1 19.8 0 10 10 0 0 1-19.8 0Z"></path><circle cx="12" cy="12" r="3"></circle></svg> Preview</button>
                  </div>
                  <div class="demo-filename"><svg class="demo-filename-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path></svg> demo_showcase.md</div>
                </div>
                <div class="demo-body static-demo-body">
                  <div class="demo-editor-pane is-editor-visible">
                    <textarea class="lander-editor static-demo-editor" data-static-demo-editor aria-label="Static Markdown editor demo" spellcheck="false">${escapeHtml(homeDemoMarkdown)}</textarea>
                  </div>
                  <div class="demo-preview-pane is-preview-visible" data-static-demo-preview>
                    ${renderMarkdownHost(demoPreview)}
                  </div>
                </div>
                <div class="demo-statusbar">
                  <span class="demo-status-primary"><svg class="demo-status-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 17 6-6-6-6"></path><path d="M12 19h8"></path></svg> Render Engine: @mdwrk/markdown-renderer-core</span>
                  <span class="demo-status-secondary"><span data-static-demo-words>${demoWordCount} words</span><span data-static-demo-chars>${homeDemoMarkdown.length} chars</span></span>
                </div>
              </div>
            </div>
          </section>

          <section id="privacy" class="privacy-section">
            <div class="privacy-container">
              <h2 class="privacy-heading">Your Data Stays on <span class="privacy-heading-accent">Your Device</span></h2>
              <p class="privacy-copy">MdWrk uses IndexedDB to store your workspaces directly in your browser. No AI servers scan your content, and no trackers follow your keys.</p>
              <div class="privacy-badge"><div class="privacy-badge-dot"></div>Privacy Standard: Verified Local</div>
            </div>
          </section>
          </article>
        </main>
        <footer class="footer">
          <div class="footer-inner">
            <div class="footer-layout">
              <div class="footer-brand-block"><a href="/" class="footer-brand-link"><span class="footer-brand-text">MdWrk</span></a><p class="footer-copy">The local-first Markdown workspace. Your data, your device, your rules.</p></div>
              <div class="footer-nav-grid">
                <div><h2 class="footer-section-heading">Resources</h2><ul class="footer-link-list"><li><a href="/docs/quickstart/" class="footer-link">Documentation</a></li><li><a href="/blog/launch/" class="footer-link">Blog</a></li><li><a href="${escapeAttribute(process.env.VITE_APP_URL || 'https://app.mdwrk.com')}" class="footer-link">Live Demo</a></li></ul></div>
                <div><h2 class="footer-section-heading">Legal</h2><ul class="footer-link-list"><li><a href="/privacy/" class="footer-link">Privacy</a></li><li><a href="/security/" class="footer-link">Security</a></li></ul></div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    ${renderThemeToggleScript()}
    ${renderStaticDemoScript()}
  </body>
</html>
`;
};

const renderHtmlPage = (entry, registry, assetTags = '') => {
  if (entry.frontmatter.slug === '/') return renderStaticHome(entry, registry, assetTags);
  const robots = entry.frontmatter.noindex ? 'noindex,follow' : 'index,follow';
  const isDocs = entry.frontmatter.slug.startsWith('/docs/');
  const sidebar = isDocs ? renderDocsSidebar(registry, entry.frontmatter.slug) : '';
  const toc = renderArticleToc(entry);
  return `<!doctype html>
<html lang="en" data-lander-theme="lander-light">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${renderThemeBootstrap()}
    <title>${escapeHtml(entry.frontmatter.title)}</title>
    <meta name="description" content="${escapeAttribute(entry.frontmatter.description)}">
    <link rel="canonical" href="${escapeAttribute(entry.frontmatter.canonical)}">
    <meta name="robots" content="${robots}">
    <meta name="application-name" content="MdWrk">
    <meta property="og:site_name" content="MdWrk">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(entry, registry))}</script>
    ${assetTags}
  </head>
  <body>
    <div id="root">
      <div class="app-shell">
        ${renderStaticNavbar(registry, entry.frontmatter.slug)}
        <main id="content" class="app-main">
          <div class="lander-doc-shell docs-layout">
            ${sidebar}
            <section class="docs-main">
              <div class="docs-content-wrap">
                ${renderArticleCard(entry, registry)}
                ${toc}
              </div>
            </section>
          </div>
        </main>
        <footer class="footer">
          <div class="footer-inner">
            <div class="footer-layout">
              <div class="footer-brand-block">
                <a href="/" class="footer-brand-link">
                  <span class="footer-brand-text">MdWrk</span>
                </a>
                <p class="footer-copy">The local-first Markdown workspace. Your data, your device, your rules.</p>
              </div>
              <div class="footer-nav-grid">
                <div>
                  <h2 class="footer-section-heading">Resources</h2>
                  <ul class="footer-link-list">
                    <li><a href="/docs/quickstart/" class="footer-link">Documentation</a></li>
                    <li><a href="/blog/launch/" class="footer-link">Blog</a></li>
                  </ul>
                </div>
                <div>
                  <h2 class="footer-section-heading">Legal</h2>
                  <ul class="footer-link-list">
                    <li><a href="/privacy/" class="footer-link">Privacy</a></li>
                    <li><a href="/security/" class="footer-link">Security</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
    ${renderThemeToggleScript()}
  </body>
</html>
`;
};

const renderMarkdownMirror = (entry) => [
  `# ${entry.frontmatter.h1}`,
  '',
  entry.frontmatter.subtitle ?? entry.frontmatter.description,
  '',
  entry.body,
  '',
  ...(entry.frontmatter.faqs.length ? [
    '## Frequently Asked Questions',
    '',
    ...entry.frontmatter.faqs.flatMap(faq => [`### ${faq.question}`, '', faq.answer, '']),
  ] : []),
].join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n';

const normalizeGeneratedFile = (content) => String(content).replace(/[ \t]+$/gm, '');

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, normalizeGeneratedFile(content));
};

const copyDir = (source, target) => {
  if (!fs.existsSync(source)) return;
  fs.mkdirSync(target, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    if (entry.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
};

const build = () => {
  const registry = readStaticRegistry();
  const assetTags = extractViteAssetTags();
  if (!preserveAssets) fs.rmSync(distRoot, { recursive: true, force: true });
  fs.mkdirSync(distRoot, { recursive: true });
  copyDir(publicRoot, distRoot);

  const indexable = registry.entries.filter(entry => !entry.frontmatter.noindex);
  const llmsEligible = indexable.filter(entry => entry.frontmatter.llmsInclude);

  for (const entry of registry.entries) {
    const dir = routeOutputDir(entry.frontmatter.slug);
    writeFile(path.join(dir, 'index.html'), renderHtmlPage(entry, registry, assetTags));
    if (!entry.frontmatter.noindex && entry.frontmatter.llmsInclude) {
      writeFile(path.join(dir, 'index.md'), renderMarkdownMirror(entry));
    }
  }

  writeFile(path.join(distRoot, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexable.map(entry => `  <url><loc>${escapeXml(canonicalForSlug(entry.frontmatter.slug))}</loc><lastmod>${entry.frontmatter.updatedAt}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  writeFile(path.join(distRoot, 'robots.txt'), `User-agent: *\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  writeFile(path.join(distRoot, 'content-index.json'), JSON.stringify(indexable.map(entry => ({
    slug: entry.frontmatter.slug,
    url: canonicalForSlug(entry.frontmatter.slug),
    title: entry.frontmatter.title,
    description: entry.frontmatter.description,
    h1: entry.frontmatter.h1,
    subtitle: entry.frontmatter.subtitle,
    intent: entry.frontmatter.intent,
    contentType: entry.frontmatter.contentType,
    updatedAt: entry.frontmatter.updatedAt,
    tags: entry.frontmatter.tags,
    llmsInclude: entry.frontmatter.llmsInclude,
  })), null, 2) + '\n');
  writeFile(path.join(distRoot, 'content-registry.json'), JSON.stringify(registry.entries.map(entry => ({
    sourcePath: entry.sourcePath,
    sourceHash: entry.sourceHash,
    frontmatter: entry.frontmatter,
    rendered: {
      text: entry.rendered.text,
      headings: entry.rendered.headings,
      links: entry.rendered.links,
      wordCount: entry.rendered.wordCount,
    },
  })), null, 2) + '\n');
  writeFile(path.join(distRoot, 'jsonld-graph.json'), JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': registry.entries.flatMap(entry => jsonLdFor(entry, registry)['@graph']),
  }, null, 2) + '\n');
  writeFile(path.join(distRoot, 'llms.txt'), [
    '# MdWrk',
    '',
    'MdWrk is a local-first Markdown workspace with static, verifiable public documentation.',
    '',
    ...llmsEligible.map(entry => `- [${entry.frontmatter.h1}](${canonicalForSlug(entry.frontmatter.slug)}) - ${entry.frontmatter.description}`),
    '',
  ].join('\n'));
  writeFile(path.join(distRoot, 'llms-full.txt'), [
    '# MdWrk Full Content',
    '',
    ...llmsEligible.flatMap(entry => [
      `## ${entry.frontmatter.h1}`,
      '',
      `URL: ${canonicalForSlug(entry.frontmatter.slug)}`,
      '',
      entry.frontmatter.subtitle ?? entry.frontmatter.description,
      '',
      entry.rendered.text,
      '',
    ]),
  ].join('\n'));
  console.log(`Built MdWrk static lander: ${registry.entries.length} pages -> ${path.relative(repoRoot, distRoot)}`);
};

const extractMainText = (html) => {
  const main = /<main[\s\S]*?>([\s\S]*?)<\/main>/i.exec(html)?.[1] ?? '';
  return main
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const verify = () => {
  const registry = readStaticRegistry();
  const failures = [];
  const indexable = registry.entries.filter(entry => !entry.frontmatter.noindex);
  const llmsEligible = indexable.filter(entry => entry.frontmatter.llmsInclude);
  const distFiles = collectFiles(distRoot, file => true);
  if (!distFiles.length) failures.push('dist is empty or missing');
  for (const required of ['sitemap.xml', 'robots.txt', 'llms.txt', 'llms-full.txt', 'content-index.json', 'content-registry.json', 'jsonld-graph.json']) {
    if (!fs.existsSync(path.join(distRoot, required))) failures.push(`missing dist/${required}`);
  }
  const sitemap = fs.existsSync(path.join(distRoot, 'sitemap.xml')) ? fs.readFileSync(path.join(distRoot, 'sitemap.xml'), 'utf8') : '';
  const robots = fs.existsSync(path.join(distRoot, 'robots.txt')) ? fs.readFileSync(path.join(distRoot, 'robots.txt'), 'utf8') : '';
  const llms = fs.existsSync(path.join(distRoot, 'llms.txt')) ? fs.readFileSync(path.join(distRoot, 'llms.txt'), 'utf8') : '';
  const hasViteCssAssets = fs.existsSync(path.join(distRoot, 'assets')) && collectFiles(path.join(distRoot, 'assets'), file => file.endsWith('.css')).length > 0;
  if (!robots.includes('User-agent: OAI-SearchBot')) failures.push('robots.txt missing OAI-SearchBot policy');
  if (!robots.includes('User-agent: GPTBot')) failures.push('robots.txt missing GPTBot policy');

  for (const entry of registry.entries) {
    const htmlPath = path.join(routeOutputDir(entry.frontmatter.slug), 'index.html');
    const mdPath = path.join(routeOutputDir(entry.frontmatter.slug), 'index.md');
    if (!fs.existsSync(htmlPath)) {
      failures.push(`${entry.frontmatter.slug}: missing index.html`);
      continue;
    }
    const html = fs.readFileSync(htmlPath, 'utf8');
    const mainText = extractMainText(html);
    if (!html.startsWith('<!doctype html>')) failures.push(`${entry.frontmatter.slug}: missing doctype`);
    if (!/<main\b/i.test(html)) failures.push(`${entry.frontmatter.slug}: missing main`);
    if (!/<article\b/i.test(html)) failures.push(`${entry.frontmatter.slug}: missing article`);
    if (hasViteCssAssets && !/href="\/assets\/[^"]+\.css"/i.test(html)) failures.push(`${entry.frontmatter.slug}: missing compiled lander stylesheet link`);
    if (/src="\/assets\/[^"]+\.js"/i.test(html)) failures.push(`${entry.frontmatter.slug}: static route includes SPA JavaScript bundle`);
    const pageTitleH1Count = (html.match(/<h1\b[^>]*class="[^"]*(?:hero-heading|docs-title|blog-post-title|blog-list-title)[^"]*"/gi) ?? []).length;
    if (pageTitleH1Count !== 1) failures.push(`${entry.frontmatter.slug}: must contain exactly one page title H1`);
    if (!html.includes(`<title>${escapeHtml(entry.frontmatter.title)}</title>`)) failures.push(`${entry.frontmatter.slug}: missing title`);
    if (!html.includes('name="description"')) failures.push(`${entry.frontmatter.slug}: missing meta description`);
    if (!html.includes(`rel="canonical" href="${escapeAttribute(entry.frontmatter.canonical)}"`)) failures.push(`${entry.frontmatter.slug}: canonical mismatch`);
    if (!html.includes('type="application/ld+json"')) failures.push(`${entry.frontmatter.slug}: missing JSON-LD`);
    const shouldRenderFaqs = entry.frontmatter.slug !== '/' && entry.frontmatter.faqs.length;
    if (!entry.frontmatter.noindex && entry.frontmatter.slug !== '/' && !entry.frontmatter.faqs.length) failures.push(`${entry.frontmatter.slug}: indexable page missing FAQs`);
    if (shouldRenderFaqs && !html.includes('Frequently Asked Questions')) failures.push(`${entry.frontmatter.slug}: FAQ frontmatter exists but FAQ is not visible`);
    if (shouldRenderFaqs && !html.includes('"@type":"FAQPage"')) failures.push(`${entry.frontmatter.slug}: FAQ content is visible but FAQ JSON-LD is missing`);
    if (!shouldRenderFaqs && html.includes('"@type":"FAQPage"')) failures.push(`${entry.frontmatter.slug}: FAQ JSON-LD exists without visible FAQ content`);
    if (mainText.split(/\s+/).length < 40) failures.push(`${entry.frontmatter.slug}: too little readable main text`);
    if (html.includes('<div id="root"></div>') && mainText.split(/\s+/).length < 80) failures.push(`${entry.frontmatter.slug}: primary content appears to require JavaScript`);
    for (const anchor of html.matchAll(/<a\b([^>]*)>/gi)) {
      if (!/\shref=/.test(anchor[1])) failures.push(`${entry.frontmatter.slug}: internal anchor without href`);
    }
    if (!entry.frontmatter.noindex) {
      const internalLinks = entry.rendered.links.filter(link => link.internal).length + entry.frontmatter.related.length + (entry.frontmatter.parent ? 1 : 0);
      if (internalLinks === 0) failures.push(`${entry.frontmatter.slug}: indexable page has no internal links`);
    }
    if (entry.frontmatter.contentType === 'comparison' && !/compare|comparison|versus|difference|different|vs\.| vs /i.test(`${entry.frontmatter.title} ${entry.frontmatter.intent} ${entry.rendered.text}`)) {
      failures.push(`${entry.frontmatter.slug}: comparison page missing comparison structure`);
    }
    if (/quickstart|tutorial|how to|how-to|start using/i.test(`${entry.frontmatter.intent} ${entry.frontmatter.title}`) && !/<ol\b/i.test(html)) {
      failures.push(`${entry.frontmatter.slug}: tutorial/how-to page missing ordered steps`);
    }
    if (!entry.frontmatter.noindex && !sitemap.includes(canonicalForSlug(entry.frontmatter.slug))) failures.push(`${entry.frontmatter.slug}: missing from sitemap`);
    if (entry.frontmatter.noindex && sitemap.includes(canonicalForSlug(entry.frontmatter.slug))) failures.push(`${entry.frontmatter.slug}: noindex page appears in sitemap`);
    if (entry.frontmatter.llmsInclude && !entry.frontmatter.noindex) {
      if (!llms.includes(canonicalForSlug(entry.frontmatter.slug))) failures.push(`${entry.frontmatter.slug}: eligible page missing from llms.txt`);
      if (!fs.existsSync(mdPath)) failures.push(`${entry.frontmatter.slug}: missing Markdown mirror`);
      else if (stripMarkdown(fs.readFileSync(mdPath, 'utf8')).split(/\s+/).length < 40) failures.push(`${entry.frontmatter.slug}: empty or stale Markdown mirror`);
    }
    for (const link of entry.rendered.links.filter(link => link.internal && link.href.startsWith('/') && /^\/(docs|blog|legal|privacy|security|features|compare)\b/.test(link.href))) {
      const targetPath = link.href.split('#')[0];
      if (/\.[A-Za-z0-9]{2,8}$/.test(targetPath)) {
        if (!fs.existsSync(path.join(distRoot, targetPath.replace(/^\/+/, '')))) failures.push(`${entry.sourcePath}: broken static asset link ${link.href}`);
        continue;
      }
      const targetSlug = targetPath.endsWith('/') ? targetPath : `${targetPath}/`;
      if (!registry.bySlug.has(targetSlug)) failures.push(`${entry.sourcePath}: broken internal link ${link.href}`);
    }
  }
  for (const entry of llmsEligible) {
    if (entry.frontmatter.noindex) failures.push(`${entry.frontmatter.slug}: llms includes noindex page`);
  }
  if (failures.length) fail('MdWrk static lander verification failed:', failures);
  console.log('MdWrk static lander verification passed.');
};

const clean = () => {
  fs.rmSync(distRoot, { recursive: true, force: true });
  console.log(`Removed ${path.relative(repoRoot, distRoot)}`);
};

const validate = () => {
  const registry = readStaticRegistry();
  console.log(`MdWrk static lander source validation passed: ${registry.entries.length} pages.`);
};

if (command === 'validate') validate();
else if (command === 'build') build();
else if (command === 'verify') verify();
else if (command === 'clean') clean();
else fail(`Unknown command: ${command}`);
