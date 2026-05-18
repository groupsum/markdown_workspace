import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const landerRoot = path.resolve(__dirname, '..');
const schemaPath = path.join(landerRoot, 'data', 'article-metadata.schema.json');
const docsDir = path.join(landerRoot, 'data', 'markdown', 'docs');
const blogDir = path.join(landerRoot, 'data', 'markdown', 'blog');

const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const collectMarkdownFiles = (dir) => {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectMarkdownFiles(filePath);
    return entry.name.endsWith('.md') ? [filePath] : [];
  });
};

const parseFrontmatter = (raw) => {
  const normalizedRaw = raw.replace(/^\uFEFF/, '');
  const match = normalizedRaw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;

  return match[1]
    .split(/\r?\n/)
    .reduce((metadata, line) => {
      const separator = line.indexOf(':');
      if (separator === -1) return metadata;
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      if (key) metadata[key] = value;
      return metadata;
    }, {});
};

const docProperties = schema.oneOf[0].properties;
const blogProperties = schema.oneOf[1].properties;
const docRequired = schema.oneOf[0].required;
const blogRequired = schema.oneOf[1].required;

const validators = {
  nonEmptyString: (value) => typeof value === 'string' && value.trim().length > 0,
  excerpt: (value) => typeof value === 'string' && value.trim().length >= 40 && value.trim().length <= 280,
  isoDate: (value) => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim()),
  integerString: (value) => typeof value === 'string' && /^\d+$/.test(value.trim()),
  numericString: (value) => typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value.trim()),
  articleStatus: (value) => typeof value === 'string' && ['draft', 'published'].includes(value.trim()),
  commaList: (value) => typeof value === 'string' && value.trim().length > 0,
  imagePath: (value) => typeof value === 'string' && /^(https?:\/\/|\/)[^\s]+$/.test(value.trim()),
  slug: (value) => typeof value === 'string' && /^[a-z0-9][a-z0-9/-]*$/.test(value.trim()),
  toc: (value) => typeof value === 'string' && ['true', 'false'].includes(value.trim()),
};

const resolveValidator = (propertySchema, key) => {
  if (propertySchema?.$ref?.endsWith('/nonEmptyString')) return validators.nonEmptyString;
  if (propertySchema?.$ref?.endsWith('/excerpt')) return validators.excerpt;
  if (propertySchema?.$ref?.endsWith('/isoDate')) return validators.isoDate;
  if (propertySchema?.$ref?.endsWith('/integerString')) return validators.integerString;
  if (propertySchema?.$ref?.endsWith('/numericString')) return validators.numericString;
  if (propertySchema?.$ref?.endsWith('/articleStatus')) return validators.articleStatus;
  if (propertySchema?.$ref?.endsWith('/commaList')) return validators.commaList;
  if (propertySchema?.$ref?.endsWith('/imagePath')) return validators.imagePath;
  if (key === 'slug') return validators.slug;
  if (key === 'toc') return validators.toc;
  return validators.nonEmptyString;
};

const validateMetadata = ({ filePath, metadata, required, properties }) => {
  const relativePath = path.relative(landerRoot, filePath).replace(/\\/g, '/');
  const failures = [];
  if (!metadata) return [`${relativePath}: missing YAML frontmatter block`];

  for (const key of required) {
    if (!Object.prototype.hasOwnProperty.call(metadata, key) || String(metadata[key]).trim() === '') {
      failures.push(`${relativePath}: missing required metadata field "${key}"`);
    }
  }

  for (const key of Object.keys(metadata)) {
    if (!Object.prototype.hasOwnProperty.call(properties, key)) {
      failures.push(`${relativePath}: unsupported metadata field "${key}"`);
      continue;
    }
    const validate = resolveValidator(properties[key], key);
    if (!validate(metadata[key])) {
      failures.push(`${relativePath}: invalid metadata field "${key}"`);
    }
  }

  return failures;
};

const failures = [
  ...collectMarkdownFiles(docsDir).flatMap((filePath) =>
    validateMetadata({
      filePath,
      metadata: parseFrontmatter(fs.readFileSync(filePath, 'utf8')),
      required: docRequired,
      properties: docProperties,
    })
  ),
  ...collectMarkdownFiles(blogDir).flatMap((filePath) =>
    validateMetadata({
      filePath,
      metadata: parseFrontmatter(fs.readFileSync(filePath, 'utf8')),
      required: blogRequired,
      properties: blogProperties,
    })
  ),
];

if (failures.length > 0) {
  console.error('Article metadata validation failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Article metadata validation passed.');
