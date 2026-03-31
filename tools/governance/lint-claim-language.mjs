import { fail, readUtf8 } from './common.mjs';

const bannedPhrases = [
  'certifiably fully featured',
  'certifiably fully markdown spec compliant',
  'guaranteed fully compliant'
];

const targets = ['README.md'];
const offenders = [];

for (const target of targets) {
  const content = readUtf8(target).toLowerCase();
  for (const phrase of bannedPhrases) {
    if (content.includes(phrase)) {
      offenders.push(`${target} -> "${phrase}"`);
    }
  }
}

if (offenders.length) {
  fail(`Claim-language lint failed:\n${offenders.join('\n')}`);
}

console.log('Claim-language lint passed.');
