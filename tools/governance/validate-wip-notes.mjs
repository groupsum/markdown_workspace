import fs from 'node:fs';
import { fail } from './common.mjs';

const rootEntries = fs.readdirSync('.', { withFileTypes: true });
const offenders = rootEntries
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)
  .filter((name) => /^wip.*\.md$/i.test(name) || /^.*wip.*\.md$/i.test(name));

if (offenders.length) {
  fail(`WIP notes must not be stored at repository root: ${offenders.join(', ')}`);
}

console.log('WIP notes validation passed.');
