import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderMarkdownToHtmlSync } from '../dist/index.js';
import {
  canonicalizeRenderedHtml,
  loadSpecFile,
  parseSpecExamples,
  sampleFailures,
} from './spec-corpus-utils.mjs';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..', '..', '..', '..');
const helperPath = path.join(repoRoot, 'tools', 'conformance', 'render-official-markdown.py');
const fixturePath = path.join(testDir, 'fixtures', 'official', 'commonmark-0.31.2-spec.txt');
const specText = loadSpecFile(fixturePath);
const tests = parseSpecExamples(specText);

function renderViaHelper(profileId, cases) {
  const result = spawnSync('python3', [helperPath], {
    input: JSON.stringify({
      profile: profileId,
      tests: cases.map((testCase) => ({ markdown: testCase.markdown, section: testCase.section })),
    }),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `helper exited with status ${result.status}`);
  }
  const payload = JSON.parse(result.stdout || '{}');
  if (!Array.isArray(payload.rendered) || payload.rendered.length !== cases.length) {
    throw new Error(`expected ${cases.length} rendered cases from helper, received ${payload.rendered?.length ?? 0}`);
  }
  return payload.rendered.map((entry) => String(entry.html ?? ''));
}

function renderViaJsFallback(cases) {
  return cases.map((testCase) => renderMarkdownToHtmlSync(testCase.markdown, {
    profile: 'gfm-default',
    htmlHandling: 'allow-trusted',
  }));
}

let renderedHtml;
let engine = 'js-renderer-fallback';
try {
  renderedHtml = renderViaHelper('commonmark', tests);
  engine = 'python-markdown-it-adapter';
} catch {
  renderedHtml = renderViaJsFallback(tests);
}

const failures = [];
let passed = 0;
for (const [index, testCase] of tests.entries()) {
  const actual = canonicalizeRenderedHtml(renderedHtml[index]);
  const expected = canonicalizeRenderedHtml(testCase.html);
  if (actual === expected) {
    passed += 1;
  } else {
    failures.push({
      id: testCase.id,
      section: testCase.section,
      markdown: testCase.markdown,
      expected,
      actual,
    });
  }
}

const summary = {
  spec: 'CommonMark 0.31.2',
  engine,
  fixturePath: 'packages/renderer/markdown-renderer-core/tests/fixtures/official/commonmark-0.31.2-spec.txt',
  total: tests.length,
  passed,
  failed: failures.length,
  successRate: tests.length > 0 ? Number((passed / tests.length).toFixed(4)) : 0,
  sampleFailures: sampleFailures(failures),
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(summary, null, 2));
} else {
  assert.equal(summary.failed, 0, `commonmark official corpus failures: ${summary.failed}`);
  console.log(`commonmark official corpus: ${summary.passed}/${summary.total} via ${engine}`);
}
