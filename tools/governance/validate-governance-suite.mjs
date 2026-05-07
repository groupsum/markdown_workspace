import fs from 'node:fs';
import { fail, repoRoot } from './common.mjs';

const packageJson = JSON.parse(fs.readFileSync(repoRoot('package.json'), 'utf8'));
const scripts = packageJson.scripts ?? {};

const requiredScripts = [
  'validate:tree',
  'validate:doc-pointers',
  'validate:doc-feature-pages',
  'validate:root-clutter',
  'validate:generated-artifacts',
  'lint:claim-language',
  'validate:wip-notes',
  'validate:release-notes',
  'validate:spec-coverage',
  'validate:ssot-graph',
  'validate:release-snapshots',
  'validate:governance-suite',
];

for (const name of requiredScripts) {
  if (!scripts[name]) {
    fail(`package.json is missing required governance script: ${name}`);
  }
}

const governanceCommand = scripts['ci:governance'];
if (!governanceCommand) {
  fail('package.json is missing required script: ci:governance');
}

for (const name of requiredScripts) {
  if (!governanceCommand.includes(`npm run ${name}`)) {
    fail(`ci:governance is missing required step: npm run ${name}`);
  }
}

console.log('Governance suite validation passed.');
