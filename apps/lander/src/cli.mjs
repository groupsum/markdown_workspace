#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const landerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoRoot = path.resolve(landerRoot, '..', '..');
const contentRoot = path.join(landerRoot, 'content');
const schemasRoot = path.join(landerRoot, 'schemas');
const publicRoot = path.join(landerRoot, 'public');
const distRoot = path.join(landerRoot, 'dist');
const schemaPath = path.join(schemasRoot, 'mdwrk.page.v1.schema.json');
const siteUrl = (process.env.MDWRK_SITE_URL || process.env.VITE_SITE_URL || 'https://mdwrk.com').replace(/\/+$/, '');
const allowNoindexLlmsInclude = process.env.MDWRK_ALLOW_NOINDEX_LLMS_INCLUDE === 'true';

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
const canonicalForSlug = (slug) => `${siteUrl}${slug}`;

const routeOutputDir = (slug) => slug === '/' ? distRoot : path.join(distRoot, slug.replace(/^\/|\/$/g, ''));

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

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
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/[*_~>#]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const renderMarkdown = (body) => {
  const lines = String(body ?? '').replace(/\r\n?/g, '\n').split('\n');
  const html = [];
  const headings = [];
  const links = [];
  let paragraph = [];
  let list = [];
  let listKind = 'ul';
  let code = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!list.length) return;
    html.push(`<${listKind}>${list.map(item => `<li>${renderInline(item)}</li>`).join('')}</${listKind}>`);
    list = [];
    listKind = 'ul';
  };
  const flushCode = () => {
    if (!code) return;
    html.push(`<pre><code${code.language ? ` class="language-${escapeAttribute(code.language)}"` : ''}>${escapeHtml(code.lines.join('\n'))}</code></pre>`);
    code = null;
  };

  for (const line of lines) {
    const fence = /^```([A-Za-z0-9_+-]*)?\s*$/.exec(line);
    if (fence) {
      if (code) flushCode();
      else {
        flushParagraph();
        flushList();
        code = { language: fence[1] || '', lines: [] };
      }
      continue;
    }
    if (code) {
      code.lines.push(line);
      continue;
    }
    const heading = /^(#{2,6})\s+(.+)$/.exec(line);
    if (heading) {
      flushParagraph();
      flushList();
      const depth = heading[1].length;
      const text = heading[2].trim();
      const id = slugify(text);
      headings.push({ depth, id, text });
      html.push(`<h${depth} id="${escapeAttribute(id)}">${renderInline(text)}</h${depth}>`);
      continue;
    }
    const listItem = /^[-*]\s+(.+)$/.exec(line);
    if (listItem) {
      flushParagraph();
      if (listKind !== 'ul') flushList();
      listKind = 'ul';
      list.push(listItem[1]);
      continue;
    }
    const orderedListItem = /^\d+\.\s+(.+)$/.exec(line);
    if (orderedListItem) {
      flushParagraph();
      if (listKind !== 'ol') flushList();
      listKind = 'ol';
      list.push(orderedListItem[1]);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line.trim());
  }
  flushCode();
  flushParagraph();
  flushList();

  const linkPattern = /\[([^\]]+)]\(([^)]+)\)/g;
  for (const match of String(body ?? '').matchAll(linkPattern)) {
    const href = match[2];
    links.push({ href, text: match[1], internal: href.startsWith('/') || href.startsWith('#') });
  }
  const text = stripMarkdown(body);
  const words = text ? text.split(/\s+/).length : 0;
  return {
    html: html.join('\n'),
    text,
    headings,
    links,
    wordCount: words,
  };
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

const renderNav = (registry) => {
  const links = [
    ['/', 'MdWrk'],
    ['/features/offline-markdown-editor/', 'Features'],
    ['/docs/quickstart/', 'Docs'],
    ['/compare/obsidian/', 'Compare'],
    ['/blog/launch/', 'Blog'],
    ['/privacy/', 'Privacy'],
  ];
  return links
    .filter(([slug]) => registry.bySlug.has(slug))
    .map(([slug, text]) => `<a href="${slug}">${text}</a>`)
    .join('\n        ');
};

const renderHtmlPage = (entry, registry) => {
  const robots = entry.frontmatter.noindex ? 'noindex,follow' : 'index,follow';
  const answerHtml = entry.frontmatter.answer
    ? `<section class="answer-summary" aria-label="Answer summary">\n          <p>${escapeHtml(entry.frontmatter.answer)}</p>\n        </section>`
    : '';
  const faqHtml = entry.frontmatter.faqs.length
    ? `<section class="faq" aria-labelledby="faq-heading">\n          <h2 id="faq-heading">Frequently Asked Questions</h2>\n          ${entry.frontmatter.faqs.map(faq => `<details open><summary>${escapeHtml(faq.question)}</summary><p>${escapeHtml(faq.answer)}</p></details>`).join('\n          ')}\n        </section>`
    : '';
  const relatedHtml = entry.frontmatter.related.length
    ? `<section class="related" aria-labelledby="related-heading">\n          <h2 id="related-heading">Related Pages</h2>\n          <ul>${entry.frontmatter.related.map(slug => {
            const target = registry.bySlug.get(slug);
            return `<li><a href="${slug}">${escapeHtml(target?.frontmatter.h1 ?? slug)}</a></li>`;
          }).join('')}</ul>\n        </section>`
    : '';
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(entry.frontmatter.title)}</title>
    <meta name="description" content="${escapeAttribute(entry.frontmatter.description)}">
    <link rel="canonical" href="${escapeAttribute(entry.frontmatter.canonical)}">
    <meta name="robots" content="${robots}">
    <script type="application/ld+json">${JSON.stringify(jsonLdFor(entry, registry))}</script>
    <style>
      body{font-family:Inter,Arial,sans-serif;margin:0;background:#f8fafc;color:#0f172a;line-height:1.65}
      a{color:#4338ca} .skip{position:absolute;left:-999px}.skip:focus{left:1rem;top:1rem;background:#fff;padding:.5rem}
      header,main,footer{max-width:72rem;margin:0 auto;padding:1.5rem} nav{display:flex;gap:1rem;flex-wrap:wrap}
      article{background:#fff;border:1px solid #dbe3ef;border-radius:8px;padding:2rem} h1{line-height:1.1}
      .answer-summary,.faq,.related{border:1px solid #dbe3ef;border-radius:8px;background:#f8fbff;padding:1rem;margin:1.25rem 0}
      code,pre{background:#0f172a;color:#f8fafc;border-radius:6px}code{padding:.15rem .35rem}pre{padding:1rem;overflow:auto}
    </style>
  </head>
  <body>
    <a class="skip" href="#content">Skip to content</a>
    <header>
      <nav aria-label="Main navigation">
        ${renderNav(registry)}
      </nav>
    </header>
    <main id="content">
      <article>
        <h1>${escapeHtml(entry.frontmatter.h1)}</h1>
        ${answerHtml}
        ${entry.rendered.html}
        ${faqHtml}
        ${relatedHtml}
      </article>
    </main>
    <footer>
      <p>MdWrk static lander content. Generated from Markdown.</p>
    </footer>
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

const writeFile = (filePath, content) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
};

const build = () => {
  const registry = readContentEntries();
  fs.rmSync(distRoot, { recursive: true, force: true });
  fs.mkdirSync(distRoot, { recursive: true });

  const indexable = registry.entries.filter(entry => !entry.frontmatter.noindex);
  const llmsEligible = indexable.filter(entry => entry.frontmatter.llmsInclude);

  for (const entry of registry.entries) {
    const dir = routeOutputDir(entry.frontmatter.slug);
    writeFile(path.join(dir, 'index.html'), renderHtmlPage(entry, registry));
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
  if (fs.existsSync(path.join(publicRoot, 'favicon.svg'))) {
    fs.copyFileSync(path.join(publicRoot, 'favicon.svg'), path.join(distRoot, 'favicon.svg'));
  }

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
  const registry = readContentEntries();
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
    if ((html.match(/<h1\b/gi) ?? []).length !== 1) failures.push(`${entry.frontmatter.slug}: must contain exactly one H1`);
    if (!html.includes(`<title>${escapeHtml(entry.frontmatter.title)}</title>`)) failures.push(`${entry.frontmatter.slug}: missing title`);
    if (!html.includes('name="description"')) failures.push(`${entry.frontmatter.slug}: missing meta description`);
    if (!html.includes(`rel="canonical" href="${escapeAttribute(entry.frontmatter.canonical)}"`)) failures.push(`${entry.frontmatter.slug}: canonical mismatch`);
    if (!html.includes('type="application/ld+json"')) failures.push(`${entry.frontmatter.slug}: missing JSON-LD`);
    if (!entry.frontmatter.noindex && !entry.frontmatter.answer) failures.push(`${entry.frontmatter.slug}: indexable page missing answer block`);
    if (entry.frontmatter.answer && !html.includes(escapeHtml(entry.frontmatter.answer))) failures.push(`${entry.frontmatter.slug}: answer not visibly rendered`);
    if (entry.frontmatter.answer && html.indexOf('<h2') !== -1 && html.indexOf(escapeHtml(entry.frontmatter.answer)) > html.indexOf('<h2')) failures.push(`${entry.frontmatter.slug}: direct answer must be visible before article sections`);
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
    if (/quickstart|tutorial|how to|how-to|start using/i.test(`${entry.frontmatter.intent} ${entry.frontmatter.title}`) && !/<ol>/i.test(html)) {
      failures.push(`${entry.frontmatter.slug}: tutorial/how-to page missing ordered steps`);
    }
    if (!entry.frontmatter.noindex && !sitemap.includes(canonicalForSlug(entry.frontmatter.slug))) failures.push(`${entry.frontmatter.slug}: missing from sitemap`);
    if (entry.frontmatter.noindex && sitemap.includes(canonicalForSlug(entry.frontmatter.slug))) failures.push(`${entry.frontmatter.slug}: noindex page appears in sitemap`);
    if (entry.frontmatter.llmsInclude && !entry.frontmatter.noindex) {
      if (!llms.includes(canonicalForSlug(entry.frontmatter.slug))) failures.push(`${entry.frontmatter.slug}: eligible page missing from llms.txt`);
      if (!fs.existsSync(mdPath)) failures.push(`${entry.frontmatter.slug}: missing Markdown mirror`);
      else if (stripMarkdown(fs.readFileSync(mdPath, 'utf8')).split(/\s+/).length < 40) failures.push(`${entry.frontmatter.slug}: empty or stale Markdown mirror`);
    }
    for (const link of entry.rendered.links.filter(link => link.internal && link.href.startsWith('/'))) {
      const targetSlug = link.href.split('#')[0].endsWith('/') ? link.href.split('#')[0] : `${link.href.split('#')[0]}/`;
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
  const registry = readContentEntries();
  console.log(`MdWrk static lander source validation passed: ${registry.entries.length} pages.`);
};

const command = process.argv[2] ?? 'validate';
if (command === 'validate') validate();
else if (command === 'build') build();
else if (command === 'verify') verify();
else if (command === 'clean') clean();
else fail(`Unknown command: ${command}`);
