import { describe, expect, it, vi } from 'vitest';
import {
  createSearchCache,
  createSearchService,
  fetchUnsplash,
  InvalidSearchRequestError,
  parseSearchInput,
  type SearchInput,
  translateSearchError,
  UpstreamHttpError,
  UpstreamTimeoutError,
} from './search-service.js';
import type { SearchResponse } from './types.js';

function response(input: SearchInput): SearchResponse {
  return {
    query: input.query,
    page: input.page,
    totalPages: 3,
    results: [],
  };
}

describe('parseSearchInput', () => {
  it('normalizes whitespace and parses a positive page', () => {
    expect(parseSearchInput({ query: '  snow   leopard  ', page: '2' })).toEqual({
      query: 'snow leopard',
      page: 2,
    });
  });

  it.each([
    { query: undefined, page: '1' },
    { query: ['cat', 'dog'], page: '1' },
    { query: '', page: '1' },
    { query: 'x'.repeat(101), page: '1' },
    { query: 'cat', page: undefined },
    { query: 'cat', page: ['1', '2'] },
    { query: 'cat', page: '0' },
    { query: 'cat', page: '-1' },
    { query: 'cat', page: '+1' },
    { query: 'cat', page: '01' },
    { query: 'cat', page: '1.5' },
    { query: 'cat', page: String(Number.MAX_SAFE_INTEGER + 1) },
  ])('rejects malformed input %#', (input) => {
    expect(() => parseSearchInput(input)).toThrow(InvalidSearchRequestError);
  });
});

describe('search service', () => {
  it('coalesces same-key misses, caches successes, and separates pages', async () => {
    let resolveFirst!: (value: SearchResponse) => void;
    const firstResult = response({ query: 'cat', page: 1 });
    const firstRequest = new Promise<SearchResponse>((resolve) => {
      resolveFirst = resolve;
    });
    const upstream = vi.fn((input: SearchInput) => {
      return input.page === 1 ? firstRequest : Promise.resolve(response(input));
    });
    const search = createSearchService({
      cache: createSearchCache(),
      upstream,
    });

    const first = search({ query: 'cat', page: 1 });
    const concurrent = search({ query: 'cat', page: 1 });

    expect(upstream).toHaveBeenCalledTimes(1);
    resolveFirst(firstResult);
    await expect(Promise.all([first, concurrent])).resolves.toEqual([firstResult, firstResult]);

    await expect(search({ query: 'cat', page: 1 })).resolves.toBe(firstResult);
    expect(upstream).toHaveBeenCalledTimes(1);

    await expect(search({ query: 'cat', page: 2 })).resolves.toMatchObject({ page: 2 });
    expect(upstream).toHaveBeenCalledTimes(2);
  });

  it('removes rejected requests so a later attempt can succeed', async () => {
    const input = { query: 'cat', page: 1 };
    const upstream = vi
      .fn<(input: SearchInput) => Promise<SearchResponse>>()
      .mockRejectedValueOnce(new Error('temporary failure'))
      .mockResolvedValueOnce(response(input));
    const search = createSearchService({
      cache: createSearchCache(),
      upstream,
    });

    await expect(search(input)).rejects.toThrow('temporary failure');
    await expect(search(input)).resolves.toEqual(response(input));
    expect(upstream).toHaveBeenCalledTimes(2);
  });
});

describe('translateSearchError', () => {
  it('preserves retry guidance for provider rate limiting', () => {
    expect(translateSearchError(new UpstreamHttpError(429, '60'))).toEqual({
      status: 429,
      retryAfter: '60',
      body: {
        error: {
          code: 'IMAGE_PROVIDER_RATE_LIMITED',
          message: 'The image provider is rate limited. Try again later.',
        },
      },
    });
  });

  it('maps the native timeout to a stable 504 response', () => {
    expect(translateSearchError(new UpstreamTimeoutError(new Error('aborted')))).toMatchObject({
      status: 504,
      body: {
        error: {
          code: 'IMAGE_PROVIDER_UNAVAILABLE',
        },
      },
    });
  });
});

describe('fetchUnsplash', () => {
  it('makes one provider attempt and leaves recovery to the caller', async () => {
    const previousAccessKey = process.env.UNSPLASH_ACCESS_KEY;
    process.env.UNSPLASH_ACCESS_KEY = 'test-key';
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    try {
      await expect(fetchUnsplash({ query: 'cat', page: 1 })).rejects.toMatchObject({
        status: 503,
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      vi.unstubAllGlobals();

      if (previousAccessKey === undefined) {
        delete process.env.UNSPLASH_ACCESS_KEY;
      } else {
        process.env.UNSPLASH_ACCESS_KEY = previousAccessKey;
      }
    }
  });
});
