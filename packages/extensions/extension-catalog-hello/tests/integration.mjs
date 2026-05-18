import assert from 'node:assert/strict';
import extension from '../dist/index.js';

const registeredViews = [];
const registeredRailItems = [];
const registeredHooks = [];
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
  registerHook(hook) {
    registeredHooks.push(hook);
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
assert.equal(registeredHooks.length, 1);
assert.match(String(registeredViews[0].render()), /Hello from integration test/);
assert.equal(registeredHooks[0].id, 'external.catalog-hello.before-save');
assert.deepEqual(await registeredHooks[0].dispatch({ changed: true }), { changed: true });
assert.ok(notifications.some((entry) => entry.includes('Catalog Hello')));

console.log('extension-catalog-hello integration checks passed');
