import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_DESKTOP_WINDOW_STATE,
  normalizeDesktopWindowState,
  serializeDesktopWindowState,
} from '../dist/windowState.js';

test('desktop window state normalizes persisted values to supported bounds', () => {
  const state = normalizeDesktopWindowState({
    width: 400,
    height: 300,
    x: 12,
    y: 24,
    isMaximized: true,
  });

  assert.equal(state.width, 1100);
  assert.equal(state.height, 760);
  assert.equal(state.x, 12);
  assert.equal(state.y, 24);
  assert.equal(state.isMaximized, true);
});

test('desktop window state serialization remains stable', () => {
  const payload = serializeDesktopWindowState(DEFAULT_DESKTOP_WINDOW_STATE);
  assert.match(payload, /"width": 1600/);
  assert.match(payload, /"height": 1024/);
});
