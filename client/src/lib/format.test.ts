import { describe, expect, it } from 'vitest';
import { pluralize } from './format';

// Example test — confirms Vitest + jsdom are wired up. Delete or extend it.
// The tests that earn points are the ones covering YOUR logic: the debounce /
// stale-response handling, the data cache, a reducer or hook, etc.
describe('pluralize', () => {
  it('keeps the noun singular for exactly one', () => {
    expect(pluralize(1, 'result')).toBe('1 result');
  });

  it('pluralizes for zero and many', () => {
    expect(pluralize(0, 'result')).toBe('0 results');
    expect(pluralize(12, 'result')).toBe('12 results');
  });
});
