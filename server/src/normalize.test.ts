import { describe, expect, it } from 'vitest';
import { InvalidUnsplashPayloadError, normalizeUnsplashSearch } from './normalize.js';

function photo(overrides: Record<string, unknown> = {}) {
  return {
    id: 'abc',
    description: 'fallback description',
    alt_description: 'a cat on a wall',
    width: 4000,
    height: 3000,
    urls: {
      small: 'https://images.example/small.jpg',
      regular: 'https://images.example/regular.jpg',
    },
    user: {
      name: 'Ada L.',
      links: { html: 'https://unsplash.com/@ada' },
    },
    ...overrides,
  };
}

describe('normalizeUnsplashSearch', () => {
  it('normalizes usable siblings, nullable descriptions, and required attribution', () => {
    const result = normalizeUnsplashSearch(
      {
        total_pages: 5,
        results: [
          photo(),
          photo({
            id: 'without-description',
            description: null,
            alt_description: null,
          }),
          photo({
            id: 'invalid',
            urls: { small: 'http://insecure.example/image.jpg' },
          }),
        ],
      },
      'cat',
      1,
    );

    expect(result.results).toHaveLength(2);
    expect(result.results[0]).toMatchObject({
      id: 'abc',
      contentDescription: 'a cat on a wall',
      attribution: {
        creatorName: 'Ada L.',
        sourceName: 'Unsplash',
      },
    });
    expect(result.results[1]?.contentDescription).toBeNull();

    const attribution = result.results[0]?.attribution;
    expect(attribution?.creatorUrl).toContain('utm_source=buzz_image_search');
    expect(attribution?.creatorUrl).toContain('utm_medium=referral');
    expect(attribution?.sourceUrl).toContain('utm_source=buzz_image_search');
    expect(attribution?.sourceUrl).toContain('utm_medium=referral');
  });

  it('rejects an unusable response envelope', () => {
    expect(() => normalizeUnsplashSearch({ total_pages: -1, results: [] }, 'cat', 1)).toThrow(
      InvalidUnsplashPayloadError,
    );
  });
});
