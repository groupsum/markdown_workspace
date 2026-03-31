const EXTERNAL_HREF_RE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
const MARKDOWN_FILE_EXTENSION_RE = /\.(?:md|markdown)(?=$|[#?])/i;

function splitHref(href) {
  const value = String(href ?? '');
  const hashIndex = value.indexOf('#');
  if (hashIndex === -1) {
    return { path: value, hash: '' };
  }
  return {
    path: value.slice(0, hashIndex),
    hash: value.slice(hashIndex + 1),
  };
}

function normalizePathLike(value) {
  const raw = String(value ?? '').replace(/\\/g, '/');
  const segments = raw.split('/');
  const normalized = [];
  for (const segment of segments) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      normalized.pop();
      continue;
    }
    normalized.push(segment);
  }
  return normalized.join('/');
}

function getNodeById(files, id) {
  return files.find((file) => file.id === id) ?? null;
}

export function getFilePath(file, files) {
  if (!file) return '';
  const segments = [file.name];
  let currentParentId = file.parentId;
  const visited = new Set();
  while (currentParentId) {
    if (visited.has(currentParentId)) break;
    visited.add(currentParentId);
    const parent = getNodeById(files, currentParentId);
    if (!parent) break;
    segments.unshift(parent.name);
    currentParentId = parent.parentId;
  }
  return segments.join('/');
}

function buildPathIndex(files) {
  const index = new Map();
  for (const file of files) {
    if (file.type !== 'file') continue;
    const path = normalizePathLike(getFilePath(file, files)).toLowerCase();
    if (path) {
      index.set(path, file);
    }
  }
  return index;
}

export function isExternalHref(href) {
  return EXTERNAL_HREF_RE.test(String(href ?? ''));
}

export function normalizeEmptyListItemsForPreview(markdown) {
  const lines = String(markdown ?? '').split('\n');
  let inFence = false;
  let fenceMarker = '';

  return lines
    .map((line) => {
      const fenceMatch = line.match(/^(\s*)(`{3,}|~{3,})/);
      if (fenceMatch) {
        const marker = fenceMatch[2][0];
        if (!inFence) {
          inFence = true;
          fenceMarker = marker;
        } else if (marker === fenceMarker) {
          inFence = false;
          fenceMarker = '';
        }
        return line;
      }

      if (inFence) return line;

      if (/^[\t ]*[-+*][\t ]*$/.test(line)) {
        return line.replace(/^([\t ]*[-+*])[\t ]*$/, '$1 &nbsp;');
      }

      if (/^[\t ]*\d+[.)][\t ]*$/.test(line)) {
        return line.replace(/^([\t ]*\d+[.)])[\t ]*$/, '$1 &nbsp;');
      }

      if (/^[\t ]*[-+*][\t ]+\[[ xX]\][\t ]*$/.test(line)) {
        return line.replace(/^([\t ]*[-+*][\t ]+\[[ xX]\])[\t ]*$/, '$1 &nbsp;');
      }

      return line;
    })
    .join('\n');
}

export function resolveMarkdownHtmlHandlingMode(config, _scope = 'preview') {
  return config?.trustedHtmlPreview ? 'allow-trusted' : 'sanitize';
}

export function resolveInternalMarkdownHref(href, files, currentFile = null) {
  if (!href || isExternalHref(href)) return null;

  const { path, hash } = splitHref(href);
  if (!path) {
    return hash ? { kind: 'hash', hash } : null;
  }

  const pathIndex = buildPathIndex(files);
  const normalizedExact = normalizePathLike(path).toLowerCase();
  const candidates = [];
  if (normalizedExact) {
    candidates.push(normalizedExact);
  }

  if (currentFile) {
    const currentPath = getFilePath(currentFile, files);
    const directory = currentPath.includes('/') ? currentPath.slice(0, currentPath.lastIndexOf('/')) : '';
    const relativeCandidate = normalizePathLike(directory ? `${directory}/${path}` : path).toLowerCase();
    if (relativeCandidate && !candidates.includes(relativeCandidate)) {
      candidates.push(relativeCandidate);
    }
  }

  const basename = normalizePathLike(path).split('/').pop();
  if (basename && !candidates.includes(basename.toLowerCase())) {
    candidates.push(basename.toLowerCase());
  }

  for (const candidate of candidates) {
    const direct = pathIndex.get(candidate);
    if (direct) {
      return { kind: 'file', fileId: direct.id, hash: hash || '' };
    }
  }

  for (const file of files) {
    if (file.type !== 'file') continue;
    if (file.name.toLowerCase() === path.toLowerCase()) {
      return { kind: 'file', fileId: file.id, hash: hash || '' };
    }
  }

  return null;
}

export function scrollPreviewHash(container, hash) {
  if (!container || !hash) return false;
  const targetId = decodeURIComponent(String(hash).replace(/^#/, ''));
  if (!targetId) return false;
  const escapedId = typeof CSS !== 'undefined' && typeof CSS.escape === 'function'
    ? CSS.escape(targetId)
    : targetId.replace(/([ #;?%&,.+*~\':"!^$\[\]()=>|\/])/g, '\\$1');
  const target = container.querySelector(`#${escapedId}, a[name="${escapedId}"]`);
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  target.scrollIntoView({ block: 'start', behavior: 'auto' });
  return true;
}

export function rewriteRenderedMarkdownLinksForHtmlExport(html) {
  return String(html ?? '').replace(/href="([^"]+)"/gi, (_match, href) => {
    if (!href || isExternalHref(href) || href.startsWith('#')) {
      return `href="${href}"`;
    }
    const { path, hash } = splitHref(href);
    if (!MARKDOWN_FILE_EXTENSION_RE.test(path)) {
      return `href="${href}"`;
    }
    const rewrittenPath = path.replace(/\.(md|markdown)$/i, '.html');
    const rewrittenHref = hash ? `${rewrittenPath}#${hash}` : rewrittenPath;
    return `href="${rewrittenHref}"`;
  });
}
