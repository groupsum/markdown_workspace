import assert from 'node:assert/strict';
import {
  COMPONENT_INTENT_KINDS,
  STRUCTURED_DATA_INTENT_KINDS,
  isComponentIntentKind,
  isStructuredDataIntentKind,
  validateComponentIntent,
  validateStructuredDataIntent,
} from '../dist/index.js';

assert.equal(STRUCTURED_DATA_INTENT_KINDS.length, 42);
assert.ok(isStructuredDataIntentKind('SoftwareApplication'));
assert.ok(isStructuredDataIntentKind('WebPage'));
assert.ok(!isStructuredDataIntentKind('UnsupportedType'));

assert.ok(COMPONENT_INTENT_KINDS.includes('page_shell'));
assert.ok(COMPONENT_INTENT_KINDS.includes('structured_data_graph'));
assert.ok(isComponentIntentKind('hero'));
assert.ok(!isComponentIntentKind('unknown_component'));

assert.deepEqual(validateStructuredDataIntent({ kind: 'FAQPage', data: { name: 'FAQ' } }), []);
assert.deepEqual(validateComponentIntent({ id: 'intent:hero', kind: 'hero', sourceId: 'hero' }), []);
assert.match(validateStructuredDataIntent({ kind: 'UnsupportedType' })[0], /unsupported structured-data intent kind/);
assert.match(validateComponentIntent({ id: '', kind: 'hero' })[0], /component intent id is required/);
