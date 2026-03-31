import assert from 'node:assert/strict';
import extension from '../dist/index.js';

const registeredViews = [];
const registeredRailItems = [];
const notifications = [];
const storage = new Map([['greeting', 'Hello from integration test']]);

const context = {
  manifest: extension.manifest,
  config: {
    async get(key) { return storage.get(key) ?? null; },
    async set(key, value) { storage.set(key, value); },
    async remove(key) { storage.delete(key); },
    watch() { return { dispose() {} }; },
  },
  registerView(view) {
    registeredViews.push(view);
    return { dispose() {} };
  },
  registerActionRailItem(item) {
    registeredRailItems.push(item);
    return { dispose() {} };
  },
  host: {
    notifications: {
      async info(message) {
        notifications.push(typeof message === 'string' ? message : message.defaultMessage);
      },
    },
  },
};

await extension.activate(context);

assert.equal(registeredViews.length, 1);
assert.equal(registeredRailItems.length, 1);
assert.match(String(registeredViews[0].render()), /Hello from integration test/);
assert.ok(notifications.some((entry) => entry.includes('Catalog Hello')));

console.log('extension-catalog-hello integration checks passed');
