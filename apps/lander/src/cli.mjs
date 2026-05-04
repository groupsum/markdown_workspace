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
  entity: frontmatter.entity,
  intent: frontmatter.intent,
  contentType: frontmatter.contentType,
  updatedAt: frontmatter.updatedAt,
  publishedAt: frontmatter.publishedAt,
  answer: frontmatter.answer,
  faqs: Object.freeze(frontmatter.faqs ?? []),
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

const slugifyAnswerBlock = (value) => slugify(value);

const extractTerminalAnswerBlocks = (content) => {
  const source = String(content ?? '').trim();
  const terminalPattern = /^##\s+(Quick Reference|Article Guide)\s*$/gm;
  const matches = Array.from(source.matchAll(terminalPattern));
  if (!matches.length) return { articleContent: source, answerBlocks: [] };

  const firstIndex = matches[0].index ?? -1;
  if (firstIndex < 0) return { articleContent: source, answerBlocks: [] };

  const answerSource = source.slice(firstIndex);
  const answerHeadings = Array.from(answerSource.matchAll(terminalPattern));
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
    articleContent: source.slice(0, firstIndex).trim(),
    answerBlocks,
  };
};

const renderAnswerBlocksSection = (id, title, blocks) => {
  const visibleBlocks = (blocks ?? []).filter(block => String(block.content ?? '').trim());
  if (!visibleBlocks.length) return '';
  const sectionId = slugifyAnswerBlock(id || title);
  return `<section id="${escapeAttribute(sectionId)}" class="answer-blocks" aria-label="${escapeAttribute(title)}">
                    <h2 class="answer-blocks-heading">${escapeHtml(title)}</h2>
                    <div class="answer-blocks-list">
                      ${visibleBlocks.map(block => {
                        const blockId = `${sectionId}-${slugifyAnswerBlock(block.title)}`;
                        return `<details class="answer-block-accordion"${block.defaultOpen ? ' open' : ''}>
                        <summary id="${escapeAttribute(blockId)}" class="answer-block-summary">${escapeHtml(block.title)}</summary>
                        <div class="answer-block-content">
                          <div class="markdown-renderer-host lander-markdown">
                            ${renderMarkdown(block.content).html}
                          </div>
                        </div>
                      </details>`;
                      }).join('\n                      ')}
                    </div>
                  </section>`;
};

const collectRelatedApis = (content, metadata) => {
  const explicit = String(metadata.relatedApis ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  if (explicit.length) return explicit;

  const discovered = Array.from(String(content ?? '').matchAll(/`(@mdwrk\/[^`]+)`/g)).map(match => match[1]);
  return Array.from(new Set(discovered)).slice(0, 5);
};

const buildGeneratedDocAnswerBlocks = ({ title, section, content, excerpt, metadata }) => {
  const relatedApis = collectRelatedApis(content, metadata);
  const relatedApiText = relatedApis.length
    ? relatedApis.map(api => `- \`${api}\``).join('\n')
    : '- MdWrk client workspace\n- MdWrk Markdown editor and renderer packages';
  const primaryExample = relatedApis[0] || '@mdwrk/mdwrkspace';

  return [
    { title: 'What This Does', content: excerpt },
    { title: 'When To Use It', content: `Use this page when you need ${title.toLowerCase()} guidance for the MdWrk ${String(section ?? 'documentation').toLowerCase()} surface.` },
    { title: 'How It Works', content: 'MdWrk keeps the workflow grounded in local Markdown files, browser-managed workspace state, reusable packages, and explicit extension or theme contracts where they apply.' },
    { title: 'Example', content: `Start from this page, then use the related MdWrk surface such as \`${primaryExample}\` in the client, package, or extension flow it documents.` },
    { title: 'Common Errors', content: 'Common issues usually come from choosing the wrong surface, expecting cloud sync for local-only content, or enabling extension/theme behavior without the matching package and trust configuration.' },
    { title: 'Related APIs', content: relatedApiText, defaultOpen: true },
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
  intent,
  contentType,
  updatedAt,
  body,
  html,
  answer,
  tags = [],
  related = [],
  parent,
  afterArticleHtml = '',
  renderMetadataAnswer = true,
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
      entity: 'MdWrk',
      intent,
      contentType,
      updatedAt,
      answer,
      faqs: [],
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
    renderMetadataAnswer,
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
    const articleSource = removeDuplicateLeadingHeading(body, title);
    const extracted = extractTerminalAnswerBlocks(articleSource);
    const excerpt = summarizeContent(extracted.articleContent, frontmatter.excerpt);
    const quickReferenceHtml = renderAnswerBlocksSection('quick-reference', 'Quick Reference', extracted.answerBlocks);
    const answerBlocksHtml = renderAnswerBlocksSection(
      'answer-blocks',
      'Answer Blocks',
      buildGeneratedDocAnswerBlocks({
        title,
        section,
        content: extracted.articleContent,
        excerpt,
        metadata: frontmatter,
      }),
    );

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
      articleContent: extracted.articleContent,
      entry: createStaticEntry({
        sourcePath,
        sourceHash: sha256(raw),
        slug: `/docs/${slug}/`,
        title: `${title} | MdWrk Docs`,
        description: excerpt,
        h1: title,
        intent: `learn ${title.toLowerCase()} in MdWrk`,
        contentType: 'docs',
        updatedAt: frontmatter.date,
        body: extracted.articleContent,
        html: renderMarkdown(extracted.articleContent).html,
        answer: excerpt,
        tags: ['docs', section],
        parent: '/docs/',
        afterArticleHtml: `${quickReferenceHtml}\n                  ${answerBlocksHtml}`,
        renderMetadataAnswer: false,
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
    intent: `read ${title.toLowerCase()} posts from MdWrk`,
    contentType: 'blog',
    updatedAt: posts[0]?.date || toLocalIsoDate(),
    body,
    html: `${eyebrow ? `<div class="blog-list-eyebrow">${escapeHtml(eyebrow)}</div>` : ''}
                  ${renderCardGrid(blogCardItems(posts), 'blog')}`,
    answer: description,
    tags: ['blog'],
    renderMetadataAnswer: true,
  });
};

const createBlogPostEntry = (post) => {
  const articleSource = removeDuplicateLeadingHeading(post.body, post.title);
  const extracted = extractTerminalAnswerBlocks(articleSource);
  const articleGuideHtml = renderAnswerBlocksSection('article-guide', 'Article Guide', extracted.answerBlocks);
  return createStaticEntry({
    sourcePath: post.sourcePath,
    sourceHash: sha256(post.raw),
    slug: `/blog/${post.slug}/`,
    title: `${post.title} | MdWrk Blog`,
    description: post.excerpt,
    h1: post.title,
    intent: `read about ${post.title.toLowerCase()}`,
    contentType: 'blog',
    updatedAt: post.date,
    body: extracted.articleContent,
    html: `<div class="blog-post-meta">
                    <a href="/blog/archive/${escapeAttribute(post.monthSlug)}/" class="blog-post-meta-item blog-post-meta-link"><time dateTime="${escapeAttribute(post.date)}">${escapeHtml(toDisplayDate(post.date))}</time></a>
                    <a href="/blog/author/${escapeAttribute(post.authorSlug)}/" class="blog-post-meta-item blog-post-meta-link">${escapeHtml(post.author)}</a>
                  </div>
                  ${renderMarkdown(extracted.articleContent).html}`,
    answer: post.excerpt,
    tags: ['blog'],
    parent: '/blog/',
    afterArticleHtml: articleGuideHtml,
    renderMetadataAnswer: true,
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
    intent: `read ${title.toLowerCase()}`,
    contentType: 'privacy',
    updatedAt: source.frontmatter.date,
    body,
    answer: description,
    tags: ['legal'],
    related: ['/privacy/', '/security/'],
    renderMetadataAnswer: true,
  });
};

const readDataStaticEntries = () => {
  const docs = loadDataDocs();
  const contentSources = loadContentMarkdown();
  const blogPosts = buildBlogPosts(contentSources);
  const legalEntries = contentSources
    .filter(source => source.id.startsWith('legal/'))
    .map(createLegalEntry);

  const docCards = docs.map(doc => ({
    title: doc.title,
    description: doc.excerpt,
    href: `/docs/${doc.slug}/`,
    date: doc.date,
  }));
  const docsIndexBody = [
    '# MdWrk Documentation',
    '',
    'Browse the MdWrk public documentation by product surface, setup path, authoring surface, extension model, and comparison guide.',
    '',
    ...docs.map(doc => `- [${doc.title}](/docs/${doc.slug}/) - ${doc.excerpt}`),
  ].join('\n');
  const docsIndex = createStaticEntry({
    sourcePath: 'data/markdown/docs',
    sourceHash: sha256(docs.map(doc => `${doc.slug}:${doc.sourceHash}`).join('\n')),
    slug: '/docs/',
    title: 'MdWrk Documentation',
    description: 'Browse MdWrk docs for installation, local-first Markdown authoring, package surfaces, extensions, themes, comparisons, and static public content.',
    h1: 'MdWrk Documentation',
    intent: 'browse MdWrk documentation',
    contentType: 'docs',
    updatedAt: docs[0]?.date || toLocalIsoDate(),
    body: docsIndexBody,
    html: renderCardGrid(docCards, 'docs'),
    answer: 'MdWrk documentation explains how to install, use, extend, theme, and evaluate the local-first Markdown workspace and its reusable package surfaces.',
    tags: ['docs'],
    renderMetadataAnswer: true,
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
  if (entry.frontmatter.faqs.length) {
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

const renderStaticCloudOffIcon = () => `<svg class="navbar-brand-icon static-navbar-brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="m2 2 20 20"></path>
                <path d="M5.8 5.8A4.5 4.5 0 0 0 2 10.2c0 2.3 1.8 4.2 4 4.2h6"></path>
                <path d="M10.9 4.2A5.8 5.8 0 0 1 18 10c2.2.2 4 2.1 4 4.4 0 .7-.2 1.4-.5 2"></path>
              </svg>`;

const renderStaticThemeIcon = () => `<svg class="navbar-theme-icon static-theme-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
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
      return groupA.localeCompare(groupB) || a.frontmatter.h1.localeCompare(b.frontmatter.h1);
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
              <a class="docs-nav-link ${currentSlug === '/docs/' ? 'is-active' : 'is-inactive'}" href="/docs/"><span class="docs-nav-link-label">All Docs</span></a>
              ${Array.from(groups.entries()).map(([group, items]) => `<details class="docs-nav-item static-docs-nav-section" open>
                <summary class="docs-nav-section-button"><span class="docs-nav-section-label">${escapeHtml(group)}</span></summary>
                <div class="docs-nav-children">
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
  if (entry.afterArticleHtml?.includes('id="quick-reference"')) {
    children.push({ title: 'Quick Reference', href: '#quick-reference', depth: 2 });
  }
  if (entry.afterArticleHtml?.includes('id="answer-blocks"')) {
    children.push({ title: 'Answer Blocks', href: '#answer-blocks', depth: 2 });
  }
  if (entry.afterArticleHtml?.includes('id="article-guide"')) {
    children.push({ title: 'Article Guide', href: '#article-guide', depth: 2 });
  }
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

const renderMetadataAnswerBlocks = (entry, registry) => {
  const blocks = [];
  if (entry.renderMetadataAnswer !== false && entry.frontmatter.answer) {
    blocks.push({ title: 'What This Does', content: entry.frontmatter.answer });
  }
  const answerHtml = blocks.length
    ? renderAnswerBlocksSection('answer-blocks', 'Answer Blocks', blocks)
    : '';
  const faqHtml = entry.frontmatter.faqs.length
    ? `<section class="answer-blocks static-faq" aria-labelledby="faq-heading">
                    <h2 id="faq-heading" class="answer-blocks-heading">Frequently Asked Questions</h2>
                    <div class="answer-blocks-list">${entry.frontmatter.faqs.map(faq => `<details class="answer-block-accordion"><summary class="answer-block-summary">${escapeHtml(faq.question)}</summary><div class="answer-block-content"><p>${escapeHtml(faq.answer)}</p></div></details>`).join('\n                      ')}</div>
                  </section>`
    : '';
  const relatedHtml = entry.frontmatter.related.length
    ? `<section class="answer-blocks static-related" aria-labelledby="related-heading">
                    <h2 id="related-heading" class="answer-blocks-heading">Related Pages</h2>
                    <ul>${entry.frontmatter.related.map(slug => {
              const target = registry.bySlug.get(slug);
              return `<li><a href="${slug}">${escapeHtml(target?.frontmatter.h1 ?? slug)}</a></li>`;
            }).join('')}</ul>
                  </section>`
    : '';
  return [answerHtml, faqHtml, relatedHtml].filter(Boolean).join('\n                  ');
};

const renderArticleCard = (entry, registry) => {
  const metaLabel = entry.frontmatter.contentType === 'blog' ? 'Blog' : entry.frontmatter.contentType;
  const isBlogPost = entry.frontmatter.contentType === 'blog' && entry.frontmatter.slug !== '/blog/' && !entry.frontmatter.slug.includes('/archive/') && !entry.frontmatter.slug.includes('/author/');
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
                      <span>${escapeHtml(entry.frontmatter.updatedAt)}</span>
                    </div>
                    <h1 class="${articleClass === 'blog-post-card' ? 'blog-post-title' : 'docs-title'}">${escapeHtml(entry.frontmatter.h1)}</h1>
                  </header>
                  ${renderMarkdownHost(entry.rendered.html)}
                </article>
                ${entry.afterArticleHtml ?? ''}
                ${renderMetadataAnswerBlocks(entry, registry)}
              </div>`;
};

const renderHtmlPage = (entry, registry, assetTags = '') => {
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
  entry.frontmatter.answer ?? entry.frontmatter.description,
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
      entry.frontmatter.answer ?? entry.frontmatter.description,
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
    if ((html.match(/<h1\b/gi) ?? []).length !== 1) failures.push(`${entry.frontmatter.slug}: must contain exactly one H1`);
    if (!html.includes(`<title>${escapeHtml(entry.frontmatter.title)}</title>`)) failures.push(`${entry.frontmatter.slug}: missing title`);
    if (!html.includes('name="description"')) failures.push(`${entry.frontmatter.slug}: missing meta description`);
    if (!html.includes(`rel="canonical" href="${escapeAttribute(entry.frontmatter.canonical)}"`)) failures.push(`${entry.frontmatter.slug}: canonical mismatch`);
    if (!html.includes('type="application/ld+json"')) failures.push(`${entry.frontmatter.slug}: missing JSON-LD`);
    if (!entry.frontmatter.noindex && !entry.frontmatter.answer) failures.push(`${entry.frontmatter.slug}: indexable page missing answer block`);
    if (entry.frontmatter.answer && !html.includes(escapeHtml(entry.frontmatter.answer))) failures.push(`${entry.frontmatter.slug}: answer not visibly rendered`);
    if (entry.frontmatter.answer && html.includes('</article>') && !html.slice(html.indexOf('</article>')).includes(escapeHtml(entry.frontmatter.answer))) failures.push(`${entry.frontmatter.slug}: answer block must be grouped below the article content`);
    if (entry.frontmatter.faqs.length && !html.includes('Frequently Asked Questions')) failures.push(`${entry.frontmatter.slug}: FAQ frontmatter exists but FAQ is not visible`);
    if (entry.frontmatter.faqs.length && !html.includes('"@type":"FAQPage"')) failures.push(`${entry.frontmatter.slug}: FAQ content is visible but FAQ JSON-LD is missing`);
    if (!entry.frontmatter.faqs.length && html.includes('"@type":"FAQPage"')) failures.push(`${entry.frontmatter.slug}: FAQ JSON-LD exists without visible FAQ content`);
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
