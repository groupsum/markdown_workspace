import { validateMdwrkExtensionContributions } from './mdwrk-extension-contributions.mjs';

const result = await validateMdwrkExtensionContributions();

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (result.passed) {
  console.log('MdWrk extension contribution validation passed.');
} else {
  for (const failure of result.failures) {
    console.error(failure);
  }
  process.exit(1);
}
