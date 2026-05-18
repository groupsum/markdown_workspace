import { validateMdwrkLanderPackageSuite } from './mdwrk-lander-package-suite.mjs';

const result = await validateMdwrkLanderPackageSuite();

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (result.passed) {
  console.log('MdWrk lander package suite validation passed.');
} else {
  for (const failure of result.failures) {
    console.error(failure);
  }
  process.exit(1);
}
