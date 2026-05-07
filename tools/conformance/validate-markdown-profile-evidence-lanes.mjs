import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const registryPath = path.join(repoRoot, '.ssot', 'registry.json');
const reportPath = path.join(repoRoot, '.ssot', 'reports', 'markdown-profile-evidence-lanes.md');

const registry = JSON.parse(readFileSync(registryPath, 'utf8'));

const lanes = [
  {
    id: 'cm-core',
    title: 'CommonMark curated core lane',
    features: ['feat:commonmark-core-subset'],
    tests: ['tst:packages-renderer-markdown-renderer-core-tests-commonmark-core-corpus.mjs'],
    evidence: ['evd:markdown-profile-commonmark-core-corpus'],
  },
  {
    id: 'cm-official',
    title: 'CommonMark official corpus lane',
    features: ['feat:commonmark-official-corpus'],
    tests: ['tst:packages-renderer-markdown-renderer-core-tests-commonmark-official-corpus.mjs'],
    evidence: ['evd:markdown-profile-commonmark-official-corpus'],
  },
  {
    id: 'gfm-default',
    title: 'GFM default profile lane',
    features: ['feat:gfm-default-profile-subset'],
    tests: ['tst:packages-renderer-markdown-renderer-core-tests-gfm-default-profile.mjs'],
    evidence: ['evd:markdown-profile-gfm-default-profile'],
  },
  {
    id: 'gfm-official',
    title: 'GFM official corpus lane',
    features: ['feat:gfm-official-corpus'],
    tests: ['tst:packages-renderer-markdown-renderer-core-tests-gfm-official-corpus.mjs'],
    evidence: ['evd:markdown-profile-gfm-official-corpus'],
  },
  {
    id: 'cfm-optional',
    title: 'CFM optional profile lane',
    features: [
      'feat:mdwrk-profile-front-matter',
      'feat:mdwrk-profile-footnotes',
      'feat:mdwrk-profile-definition-lists',
      'feat:mdwrk-profile-math',
      'feat:mdwrk-profile-citations',
      'feat:mdwrk-profile-superscript',
      'feat:mdwrk-profile-subscript',
      'feat:mdwrk-profile-smart-punctuation',
      'feat:mdwrk-profile-markdown-in-html',
    ],
    tests: ['tst:packages-renderer-markdown-renderer-core-tests-optional-profiles.mjs'],
    evidence: ['evd:markdown-profile-mdwrk-optional-profiles'],
  },
  {
    id: 'cfm-parser',
    title: 'CFM custom parser behavior lane',
    features: ['feat:mdwrk-custom-parser-profile'],
    tests: ['tst:packages-renderer-markdown-renderer-core-tests-custom-parser-profile.mjs'],
    evidence: ['evd:markdown-profile-custom-parser-profile'],
  },
  {
    id: 'cfm-previewer',
    title: 'CFM custom previewer behavior lane',
    features: ['feat:mdwrk-custom-previewer-profiles'],
    tests: ['tst:packages-renderer-markdown-renderer-core-tests-custom-previewer-profiles.mjs'],
    evidence: ['evd:markdown-profile-custom-previewer-profiles'],
  },
];

const features = new Map(registry.features.map((entry) => [entry.id, entry]));
const tests = new Map(registry.tests.map((entry) => [entry.id, entry]));
const evidence = new Map(registry.evidence.map((entry) => [entry.id, entry]));

const failures = [];

function expectPresent(collection, id, kind, lane) {
  const entry = collection.get(id);
  if (!entry) {
    failures.push(`${lane.id}: missing ${kind} ${id}`);
  }
  return entry;
}

function includesAll(values, expected, label, lane) {
  const valueSet = new Set(values ?? []);
  for (const id of expected) {
    if (!valueSet.has(id)) {
      failures.push(`${lane.id}: ${label} does not include ${id}`);
    }
  }
}

for (const lane of lanes) {
  for (const featureId of lane.features) {
    const feature = expectPresent(features, featureId, 'feature', lane);
    if (feature) {
      includesAll(feature.test_ids, lane.tests, `feature ${featureId} test_ids`, lane);
    }
  }

  for (const testId of lane.tests) {
    const test = expectPresent(tests, testId, 'test', lane);
    if (test) {
      if (test.status !== 'passing') {
        failures.push(`${lane.id}: test ${testId} is ${test.status}, expected passing`);
      }
      includesAll(test.feature_ids, lane.features, `test ${testId} feature_ids`, lane);
      includesAll(test.evidence_ids, lane.evidence, `test ${testId} evidence_ids`, lane);
    }
  }

  for (const evidenceId of lane.evidence) {
    const item = expectPresent(evidence, evidenceId, 'evidence', lane);
    if (item) {
      if (item.status !== 'passed') {
        failures.push(`${lane.id}: evidence ${evidenceId} is ${item.status}, expected passed`);
      }
      includesAll(item.test_ids, lane.tests, `evidence ${evidenceId} test_ids`, lane);
      if (!item.path) {
        failures.push(`${lane.id}: evidence ${evidenceId} has no artifact path`);
      }
    }
  }
}

const lines = [
  '# Markdown Profile Evidence Lanes',
  '',
  `- Result: ${failures.length === 0 ? 'passing' : 'failing'}`,
  `- Lane count: ${lanes.length}`,
  `- Validator: \`node tools/conformance/validate-markdown-profile-evidence-lanes.mjs\``,
  '',
  '| Lane | Features | Tests | Evidence |',
  '| --- | --- | --- | --- |',
  ...lanes.map((lane) => [
    lane.title,
    lane.features.map((id) => `\`${id}\``).join('<br>'),
    lane.tests.map((id) => `\`${id}\``).join('<br>'),
    lane.evidence.map((id) => `\`${id}\``).join('<br>'),
  ].join(' | ')).map((row) => `| ${row} |`),
];

if (failures.length > 0) {
  lines.push('', '## Failures', '', ...failures.map((failure) => `- ${failure}`));
}

writeFileSync(reportPath, `${lines.join('\n')}\n`, 'utf8');

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`markdown profile evidence lanes passed: ${lanes.length}/${lanes.length}`);
