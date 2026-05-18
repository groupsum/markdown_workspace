import { validateMdwrkDocsGovernance } from './mdwrk-docs-governance.mjs';

const result = await validateMdwrkDocsGovernance();

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (result.passed) {
  console.log('MdWrk docs governance validation passed.');
} else {
  for (const failure of result.failures) {
    console.error(failure);
  }
  process.exit(1);
}
