import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const sourceRoots = [
  resolve(__dirname, '../components'),
  resolve(__dirname, '../src'),
  resolve(__dirname, '../../../packages/extensions'),
];

const sourceExtensions = new Set(['.ts', '.tsx']);
const ignoredSegments = new Set(['dist', 'dist_test', 'node_modules', 'tests']);
const disallowedTokens = new Set([
  'flex',
  'grid',
  'flex-col',
  'items-center',
  'justify-center',
  'justify-between',
  'uppercase',
  'font-bold',
]);
const disallowedPrefixes = [
  'gap-',
  'p-',
  'px-',
  'py-',
  'm-',
  'mx-',
  'my-',
  'text-[',
  'bg-',
  'border-',
  'rounded',
  'shadow',
  'w-',
  'h-',
  'overflow-',
];

const extensionOf = (path: string) => {
  const index = path.lastIndexOf('.');
  return index === -1 ? '' : path.slice(index);
};

function collectSourceFiles(root: string, files: string[] = []): string[] {
  for (const entry of readdirSync(root)) {
    if (ignoredSegments.has(entry)) continue;
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      collectSourceFiles(path, files);
      continue;
    }
    if (sourceExtensions.has(extensionOf(path))) {
      files.push(path);
    }
  }
  return files;
}

function extractClassNameTokens(source: string): string[] {
  const tokens: string[] = [];
  const patterns = [
    /className\s*=\s*"([^"]+)"/g,
    /className\s*=\s*'([^']+)'/g,
    /className\s*=\s*\{`([^`]+)`\}/g,
  ];

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const value = match[1] ?? '';
      tokens.push(...value.split(/\s+/g).filter(Boolean));
    }
  }

  return tokens.filter((token) => !token.startsWith('${'));
}

const isDisallowedUtilityToken = (token: string) =>
  disallowedTokens.has(token) || disallowedPrefixes.some((prefix) => token.startsWith(prefix));

describe('component className policy', () => {
  it('keeps Tailwind-style utility classes out of app and extension component sources', () => {
    const violations = sourceRoots
      .flatMap((root) => collectSourceFiles(root))
      .flatMap((file) => {
        const source = readFileSync(file, 'utf8');
        return extractClassNameTokens(source)
          .filter(isDisallowedUtilityToken)
          .map((token) => `${relative(resolve(__dirname, '../../..'), file)} -> ${token}`);
      });

    expect(violations).toEqual([]);
  });
});
