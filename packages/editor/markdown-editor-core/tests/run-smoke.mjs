import assert from 'node:assert/strict';
import {
  applyBuiltinMarkdownCommand,
  canRedoHistory,
  canUndoHistory,
  computeCursorPosition,
  computeSelectionFormatState,
  createHistoryState,
  getListContinuationPrefix,
  insertListContinuation,
  normalizeSelection,
  pushHistoryEntry,
  redoHistory,
  undoHistory,
  wrapSelection,
} from '../dist/index.js';
import { renderMarkdownToHtmlSync } from '@mdwrk/markdown-renderer-core';

const checks = [
  {
    id: 'bold-command',
    description: 'bold command wraps selected content in strong markers',
    test() {
      const bold = applyBuiltinMarkdownCommand('bold', 'portable', { start: 0, end: 8 });
      assert.equal(bold.value, '**portable**');
      assert.deepEqual(bold.selection, { start: 2, end: 10, direction: 'none' });
    },
  },
  {
    id: 'bullet-list-selection',
    description: 'bullet-list command toggles unordered list prefixes for selected lines',
    test() {
      const bulletList = applyBuiltinMarkdownCommand('bullet-list', 'alpha\nbeta', { start: 0, end: 10 });
      assert.equal(bulletList.value, '- alpha\n- beta');
      assert.equal(bulletList.selection.end, 14);
    },
  },
  {
    id: 'task-list-selection',
    description: 'task-list command prefixes each selected line with unchecked task syntax',
    test() {
      const taskList = applyBuiltinMarkdownCommand('task-list', 'alpha\nbeta', { start: 0, end: 10 });
      assert.equal(taskList.value, '- [ ] alpha\n- [ ] beta');
      assert.equal(taskList.selection.end, 22);
    },
  },
  {
    id: 'task-list-upgrade',
    description: 'task-list command upgrades existing list items in place',
    test() {
      const upgraded = applyBuiltinMarkdownCommand('task-list', '- alpha', { start: 2, end: 2 });
      assert.equal(upgraded.value, '- [ ] alpha');
      assert.equal(upgraded.selection.start, 6);
    },
  },
  {
    id: 'list-continuation',
    description: 'Enter continuation inserts or terminates list prefixes deterministically',
    test() {
      assert.equal(getListContinuationPrefix('- alpha'), '- ');
      assert.equal(getListContinuationPrefix('1. alpha'), '2. ');
      assert.equal(getListContinuationPrefix('- [x] alpha'), '- [ ] ');
      assert.equal(insertListContinuation('- alpha', { start: 7, end: 7 }).value, '- alpha\n- ');
      assert.equal(insertListContinuation('- [ ] ', { start: 6, end: 6 }).value, '');
    },
  },
  {
    id: 'optional-profile-commands',
    description: 'optional-profile commands emit structural Markdown syntax',
    test() {
      assert.equal(applyBuiltinMarkdownCommand('inline-math', 'E=mc2', { start: 0, end: 5 }).value, '$E=mc2$');
      assert.equal(applyBuiltinMarkdownCommand('superscript', '2', { start: 0, end: 1 }).value, '^2^');
      assert.equal(applyBuiltinMarkdownCommand('subscript', '2', { start: 0, end: 1 }).value, '~2~');
      assert.equal(applyBuiltinMarkdownCommand('citation', 'smith2024', { start: 0, end: 9 }).value, '[@smith2024]');
    },
  },
  {
    id: 'front-matter-command',
    description: 'front-matter command inserts a YAML front matter scaffold at the top of the document',
    test() {
      const scaffold = applyBuiltinMarkdownCommand('front-matter', '# Title', { start: 0, end: 0 });
      assert.match(scaffold.value, /^---\ntitle: \n---\n\n# Title/);
    },
  },
  {
    id: 'indent-outdent',
    description: 'indent and outdent commands preserve line structure',
    test() {
      const indented = applyBuiltinMarkdownCommand('indent', 'a\nb', { start: 0, end: 3 });
      assert.equal(indented.value, '\ta\n\tb');
      const outdented = applyBuiltinMarkdownCommand('outdent', '\ta\n\tb', { start: 1, end: 5 });
      assert.equal(outdented.value, 'a\nb');
    },
  },
  {
    id: 'selection-state',
    description: 'selection formatting helpers detect inline wrappers and list state',
    test() {
      const boldState = computeSelectionFormatState('**bold**', { start: 2, end: 6 });
      assert.equal(boldState.bold, true);
      const bulletState = computeSelectionFormatState('- alpha', { start: 3, end: 3 });
      assert.equal(bulletState.bulletList, true);
      const taskState = computeSelectionFormatState('- [ ] alpha', { start: 6, end: 6 });
      assert.equal(taskState.taskList, true);
    },
  },
  {
    id: 'selection-and-cursor-helpers',
    description: 'selection normalization and cursor helpers remain stable',
    test() {
      assert.deepEqual(normalizeSelection({ start: 8, end: 2 }, 10), { start: 2, end: 8, direction: 'none' });
      assert.deepEqual(computeCursorPosition('one\ntwo', 5), { offset: 5, line: 2, column: 2 });
      assert.equal(wrapSelection('hello world', { start: 0, end: 5 }, '**', '**').value, '**hello** world');
    },
  },
  {
    id: 'history',
    description: 'history push/undo/redo remains operational',
    test() {
      const initial = createHistoryState('one');
      const next = pushHistoryEntry(initial, 'two', { start: 3, end: 3 });
      assert.equal(canUndoHistory(next), true);
      const undone = undoHistory(next);
      assert.equal(undone.present.value, 'one');
      assert.equal(canRedoHistory(undone), true);
      const redone = redoHistory(undone);
      assert.equal(redone.present.value, 'two');
    },
  },
  {
    id: 'renderer-roundtrip',
    description: 'editor output round-trips through the renderer core',
    test() {
      const html = renderMarkdownToHtmlSync(applyBuiltinMarkdownCommand('bold', 'roundtrip', { start: 0, end: 9 }).value, {
        profile: 'gfm-default',
      });
      assert.match(html, /<strong/);
      assert.match(html, /roundtrip/);
    },
  },
];

const results = [];
let passed = 0;
for (const check of checks) {
  try {
    check.test();
    results.push({ id: check.id, description: check.description, passed: true });
    passed += 1;
  } catch (error) {
    results.push({ id: check.id, description: check.description, passed: false, message: error.message });
  }
}

const summary = {
  total: results.length,
  passed,
  failed: results.length - passed,
  results,
};

if (process.argv.includes('--json')) {
  process.stdout.write(JSON.stringify(summary, null, 2));
} else {
  assert.equal(summary.failed, 0, `editor-core smoke failures: ${summary.failed}`);
  console.log('editor-core smoke tests passed');
}
