import { validateMdwrkPackageCrOrder } from './mdwrk-package-cr-order.mjs';

const result = await validateMdwrkPackageCrOrder();

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (result.passed) {
  console.log('MdWrk package CR order validation passed.');
} else {
  for (const failure of result.failures) {
    console.error(failure);
  }
  process.exit(1);
}
