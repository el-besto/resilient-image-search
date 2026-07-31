import { describe, expect, it } from 'vitest';
import { normalizeUnsplashSearch } from './normalize.js';

// Example test — proves the Vitest setup works and demonstrates the kind of
// thing worth testing on the backend (a pure transform of untrusted input).
// Replace/extend with tests for whatever normalizer and behaviors you build.
describe('normalizeUnsplashSearch', () => {
  it('maps upstream fields onto the domain shape and falls back for missing descriptions', () => {
    const upstream = {
      total_pages: 5,
      results: [
        {
          id: 'abc',
          description: null,
          alt_description: 'a cat on a wall',
          width: 4000,
          height: 3000,
          blur_hash: 'LKO2?U',
          urls: { small: 'https://img/small.jpg', regular: 'https://img/regular.jpg' },
          user: { name: 'Ada L.' },
        },
      ],
    };

    const result = normalizeUnsplashSearch(upstream, 'cat', 1);

    expect(result).toEqual({
      query: 'cat',
      page: 1,
      totalPages: 5,
      results: [
        {
          id: 'abc',
          description: 'a cat on a wall',
          width: 4000,
          height: 3000,
          thumbUrl: 'https://img/small.jpg',
          fullUrl: 'https://img/regular.jpg',
          blurHash: 'LKO2?U',
          author: 'Ada L.',
        },
      ],
    });
  });
});
