import { validateMdwrkcomThinHost } from './mdwrkcom-thin-host.mjs';

const result = await validateMdwrkcomThinHost();

if (process.argv.includes('--json')) {
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} else if (result.passed) {
  console.log('mdwrkcom thin-host validation passed.');
} else {
  for (const failure of result.failures) {
    console.error(failure);
  }
  process.exit(1);
}
