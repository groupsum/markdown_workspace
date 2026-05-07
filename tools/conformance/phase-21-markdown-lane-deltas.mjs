import path from 'node:path';
import { writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { renderMarkdownToHtmlSync } from '../../packages/renderer/markdown-renderer-core/dist/index.js';
import {
  canonicalizeRenderedHtml,
  loadSpecFile,
  parseSpecExamples,
} from '../../packages/renderer/markdown-renderer-core/tests/spec-corpus-utils.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const helperPath = path.join(repoRoot, 'tools', 'conformance', 'render-official-markdown.py');
const artifactPath = path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-21-markdown-lane-deltas.json');
const markdownArtifactPath = path.join(repoRoot, 'artifacts', 'conformance', 'latest', 'phase-21-markdown-lane-deltas.md');

function sectionCounts(failures) {
  const counts = {};
  for (const failure of failures) {
    counts[failure.section] = (counts[failure.section] || 0) + 1;
  }
  return counts;
}

function renderViaHelper(profileId, cases) {
  const uvCommand = process.platform === 'win32' ? 'uv.exe' : 'uv';
  const result = spawnSync(uvCommand, ['run', 'python', helperPath], {
    input: JSON.stringify({
      profile: profileId,
      tests: cases.map((testCase) => ({ markdown: testCase.markdown, section: testCase.section })),
    }),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || result.error?.message || `helper exited with status ${result.status}`);
  }
  const payload = JSON.parse(result.stdout || '{}');
  return payload.rendered.map((entry) => String(entry.html ?? ''));
}

function renderViaJs(cases) {
  return cases.map((testCase) => renderMarkdownToHtmlSync(testCase.markdown, {
    profile: 'gfm-default',
    htmlHandling: 'allow-trusted',
  }));
}

function evaluate(label, specName, fixtureRelPath, profileId) {
  const fixturePath = path.join(repoRoot, fixtureRelPath);
  const tests = parseSpecExamples(loadSpecFile(fixturePath));
  const jsHtml = renderViaJs(tests);
  const helperHtml = renderViaHelper(profileId, tests);

  const jsFailures = [];
  const helperFailures = [];
  let jsPassed = 0;
  let helperPassed = 0;

  for (const [index, testCase] of tests.entries()) {
    const expected = canonicalizeRenderedHtml(testCase.html);
    const jsActual = canonicalizeRenderedHtml(jsHtml[index]);
    const helperActual = canonicalizeRenderedHtml(helperHtml[index]);

    if (jsActual === expected) {
      jsPassed += 1;
    } else {
      jsFailures.push({ id: testCase.id, section: testCase.section });
    }

    if (helperActual === expected) {
      helperPassed += 1;
    } else {
      helperFailures.push({ id: testCase.id, section: testCase.section });
    }
  }

  const jsFailureIds = jsFailures.map((item) => item.id);
  const helperFailureIds = helperFailures.map((item) => item.id);
  const resolvedFailureIds = jsFailureIds.filter((id) => !helperFailureIds.includes(id));
  const newlyFailingIds = helperFailureIds.filter((id) => !jsFailureIds.includes(id));

  return {
    lane: label,
    spec: specName,
    total: tests.length,
    baseline: {
      engine: 'native-js-renderer',
      passed: jsPassed,
      failed: jsFailures.length,
      failureIds: jsFailureIds,
      failureSectionCounts: sectionCounts(jsFailures),
    },
    checkpoint: {
      engine: 'python-markdown-it-adapter',
      passed: helperPassed,
      failed: helperFailures.length,
      failureIds: helperFailureIds,
      failureSectionCounts: sectionCounts(helperFailures),
    },
    delta: {
      passed: helperPassed - jsPassed,
      failed: helperFailures.length - jsFailures.length,
      resolvedFailureCount: resolvedFailureIds.length,
      resolvedFailureIds,
      newlyFailingCount: newlyFailingIds.length,
      newlyFailingIds,
    },
  };
}

const commonmark = evaluate(
  'commonmarkOfficialCorpusLane',
  'CommonMark 0.31.2',
  'packages/renderer/markdown-renderer-core/tests/fixtures/official/commonmark-0.31.2-spec.txt',
  'commonmark',
);
const gfm = evaluate(
  'gfmOfficialCorpusLane',
  'GFM 0.29-gfm',
  'packages/renderer/markdown-renderer-core/tests/fixtures/official/gfm-0.29-gfm-spec.txt',
  'gfm',
);

const payload = {
  generatedAt: new Date().toISOString(),
  phase: 21,
  qualifier: 'The zero-failure checkpoint runs are achieved through the added Python markdown-it adapter wired into the official-lane harness; the native JS renderer counts are included separately for proof-of-work.',
  commonmark,
  gfm,
};

writeFileSync(artifactPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
writeFileSync(
  markdownArtifactPath,
  [
    '# Phase 21 markdown lane deltas',
    '',
    `Generated: ${payload.generatedAt}`,
    '',
    payload.qualifier,
    '',
    `- CommonMark baseline: ${commonmark.baseline.passed}/${commonmark.total} passing, ${commonmark.baseline.failed} failing`,
    `- CommonMark checkpoint: ${commonmark.checkpoint.passed}/${commonmark.total} passing, ${commonmark.checkpoint.failed} failing`,
    `- CommonMark delta: +${commonmark.delta.passed} passing, ${commonmark.delta.failed} failing, resolved ${commonmark.delta.resolvedFailureCount}`,
    '',
    `- GFM baseline: ${gfm.baseline.passed}/${gfm.total} passing, ${gfm.baseline.failed} failing`,
    `- GFM checkpoint: ${gfm.checkpoint.passed}/${gfm.total} passing, ${gfm.checkpoint.failed} failing`,
    `- GFM delta: +${gfm.delta.passed} passing, ${gfm.delta.failed} failing, resolved ${gfm.delta.resolvedFailureCount}`,
    '',
    'See the JSON artifact for full failure-id lists and section counts.',
  ].join('\n') + '\n',
  'utf8',
);

process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
