import { describe, expect, it } from 'vitest';
import { getListContinuationPrefix, isEmptyListItemLine } from './formatting';

describe('getListContinuationPrefix', () => {
  it('continues unordered lists', () => {
    expect(getListContinuationPrefix('- item')).toBe('- ');
    expect(getListContinuationPrefix('  * nested')).toBe('  * ');
  });

  it('continues ordered lists with incremented index', () => {
    expect(getListContinuationPrefix('1. alpha')).toBe('2. ');
    expect(getListContinuationPrefix('  8. nested')).toBe('  9. ');
  });

  it('continues checkbox lists as unchecked items', () => {
    expect(getListContinuationPrefix('- [x] done')).toBe('- [ ] ');
    expect(getListContinuationPrefix('  - [ ] todo')).toBe('  - [ ] ');
  });

  it('returns null for non-list lines', () => {
    expect(getListContinuationPrefix('plain text')).toBeNull();
  });
});


describe('isEmptyListItemLine', () => {
  it('detects empty unordered, ordered, and checkbox list items', () => {
    expect(isEmptyListItemLine('- ')).toBe(true);
    expect(isEmptyListItemLine('  * ')).toBe(true);
    expect(isEmptyListItemLine('1. ')).toBe(true);
    expect(isEmptyListItemLine('  9. ')).toBe(true);
    expect(isEmptyListItemLine('- [ ] ')).toBe(true);
    expect(isEmptyListItemLine('  - [x] ')).toBe(true);
  });

  it('returns false when list item has content', () => {
    expect(isEmptyListItemLine('- item')).toBe(false);
    expect(isEmptyListItemLine('2. value')).toBe(false);
    expect(isEmptyListItemLine('- [ ] task')).toBe(false);
  });
});
