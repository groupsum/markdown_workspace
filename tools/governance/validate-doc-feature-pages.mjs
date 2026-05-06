import fs from 'node:fs';
import path from 'node:path';

const repoRoot = process.cwd();

const requiredDocs = [
  {
    featureId: 'feat:docs-checkbox-autocomplete',
    relativePath: 'data/markdown/docs/usage/checkbox-autocomplete.md',
    slug: 'usage/checkbox-autocomplete',
  },
  {
    featureId: 'feat:docs-desktop-app-boundary',
    relativePath: 'data/markdown/docs/product/desktop-app-boundary.md',
    slug: 'product/desktop-app-boundary',
  },
  {
    featureId: 'feat:docs-extension-authoring-guide',
    relativePath: 'data/markdown/docs/authoring/extension-authoring-guide.md',
    slug: 'authoring/extension-authoring-guide',
  },
  {
    featureId: 'feat:docs-markdown-profile-architecture',
    relativePath: 'data/markdown/docs/product/markdown-profile-architecture.md',
    slug: 'product/markdown-profile-architecture',
  },
  {
    featureId: 'feat:docs-text-wrap-previewer',
    relativePath: 'data/markdown/docs/usage/text-wrap-previewer.md',
    slug: 'usage/text-wrap-previewer',
  },
  {
    featureId: 'feat:docs-uix-responsive-contract',
    relativePath: 'data/markdown/docs/product/uix-responsive-contract.md',
    slug: 'product/uix-responsive-contract',
  },
  {
    featureId: 'feat:docs-view-toolbar',
    relativePath: 'data/markdown/docs/usage/view-toolbar.md',
    slug: 'usage/view-toolbar',
  },
];

const roots = ['apps/mdwrkcom'];

function readFrontmatter(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (!match) {
    throw new Error(`${filePath} is missing frontmatter`);
  }
  const frontmatter = Object.fromEntries(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([^:]+):\s*(.*)$/))
      .filter(Boolean)
      .map((lineMatch) => [lineMatch[1].trim(), lineMatch[2].trim().replace(/^"|"$/g, '')]),
  );
  return { content, frontmatter };
}

const failures = [];

for (const doc of requiredDocs) {
  for (const root of roots) {
    const filePath = path.join(repoRoot, root, doc.relativePath);
    if (!fs.existsSync(filePath)) {
      failures.push(`${doc.featureId}: missing ${path.relative(repoRoot, filePath)}`);
      continue;
    }

    const { content, frontmatter } = readFrontmatter(filePath);
    if (frontmatter.slug !== doc.slug) {
      failures.push(`${doc.featureId}: ${path.relative(repoRoot, filePath)} has slug ${frontmatter.slug}`);
    }
    if (frontmatter.status !== 'published') {
      failures.push(`${doc.featureId}: ${path.relative(repoRoot, filePath)} is not published`);
    }
    if (!content.includes('## Related Docs')) {
      failures.push(`${doc.featureId}: ${path.relative(repoRoot, filePath)} does not expose related docs`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Validated ${requiredDocs.length} docs feature pages across ${roots.length} content roots.`);
