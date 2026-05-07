import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesktopAccessPolicy } from '../dist/accessPolicy.js';

test('desktop access policy allows registered file paths and project roots only', () => {
  const policy = createDesktopAccessPolicy();
  policy.registerProjectRoot('C:/workspace/project');
  policy.registerFilePath('C:/imports/notes.md');

  assert.equal(policy.isPathAllowed('C:/workspace/project/README.md'), true);
  assert.equal(policy.isPathAllowed('C:/imports/notes.md'), true);
  assert.equal(policy.isPathAllowed('C:/outside/other.md'), false);
  assert.throws(() => policy.assertAllowed('C:/outside/other.md', 'save markdown file'), /permission denied/i);
});
