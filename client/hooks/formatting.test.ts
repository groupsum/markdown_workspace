import { describe, expect, it } from 'vitest';
import { getListContinuationPrefix } from './formatting';

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
