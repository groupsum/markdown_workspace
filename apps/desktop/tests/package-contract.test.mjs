import test from 'node:test';
import assert from 'node:assert/strict';
import packageJson from '../package.json' with { type: 'json' };

test('desktop package declares explicit packaging and publish metadata', () => {
  assert.equal(packageJson.build.productName, 'MdWrk Desktop');
  assert.equal(packageJson.build.artifactName, '${productName}-${version}-${os}-${arch}.${ext}');
  assert.equal(packageJson.build.publish[0].provider, 'github');
  assert.equal(packageJson.build.files.some((entry) => typeof entry === 'object' && entry.from === '../client/dist'), true);
});
