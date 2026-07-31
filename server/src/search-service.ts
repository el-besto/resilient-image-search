import { LRUCache } from 'lru-cache';
import { InvalidUnsplashPayloadError, normalizeUnsplashSearch } from './normalize.js';
import type { SearchResponse } from './types.js';

const UNSPLASH_ENDPOINT = 'https://api.unsplash.com/search/photos';
const SEARCH_CACHE_TTL_MS = 5 * 60_000;
const SEARCH_CACHE_MAX_ENTRIES = 100;
const UPSTREAM_TIMEOUT_MS = 3_000;
const MAX_QUERY_LENGTH = 100;
const POSITIVE_INTEGER = /^[1-9]\d*$/;

export const SEARCH_PAGE_SIZE = 24;
export const UNAVAILABLE_UPSTREAM_STATUSES = new Set([500, 502, 503, 504]);

export interface SearchInput {
  query: string;
  page: number;
}

export class InvalidSearchRequestError extends Error {
  constructor() {
    super('Invalid search request.');
    this.name = 'InvalidSearchRequestError';
  }
}

export class UpstreamHttpError extends Error {
  constructor(
    readonly status: number,
    readonly retryAfter: string | null,
  ) {
    super(`Unsplash returned HTTP ${status}.`);
    this.name = 'UpstreamHttpError';
  }
}

export class UpstreamNetworkError extends Error {
  constructor(cause: unknown) {
    super('Failed to reach Unsplash.', { cause });
    this.name = 'UpstreamNetworkError';
  }
}

export class UpstreamPayloadError extends Error {
  constructor(cause: unknown) {
    super('Unsplash returned an unusable response.', { cause });
    this.name = 'UpstreamPayloadError';
  }
}

export class UpstreamTimeoutError extends Error {
  constructor(cause: unknown) {
    super('The Unsplash request timed out.', { cause });
    this.name = 'UpstreamTimeoutError';
  }
}

class MissingAccessKeyError extends Error {
  constructor() {
    super('UNSPLASH_ACCESS_KEY is not configured.');
    this.name = 'MissingAccessKeyError';
  }
}

export function parseSearchInput(input: { query: unknown; page: unknown }): SearchInput {
  if (typeof input.query !== 'string' || typeof input.page !== 'string') {
    throw new InvalidSearchRequestError();
  }

  const query = input.query.trim().replace(/\s+/g, ' ');

  if (query.length === 0 || query.length > MAX_QUERY_LENGTH) {
    throw new InvalidSearchRequestError();
  }

  if (!POSITIVE_INTEGER.test(input.page)) {
    throw new InvalidSearchRequestError();
  }

  const page = Number(input.page);

  if (!Number.isSafeInteger(page)) {
    throw new InvalidSearchRequestError();
  }

  return { query, page };
}

export function createSearchCache(): LRUCache<string, SearchResponse> {
  return new LRUCache<string, SearchResponse>({
    max: SEARCH_CACHE_MAX_ENTRIES,
    ttl: SEARCH_CACHE_TTL_MS,
  });
}

function buildSearchCacheKey(input: SearchInput): string {
  return [
    'photos',
    `query=${encodeURIComponent(input.query)}`,
    `page=${input.page}`,
    `perPage=${SEARCH_PAGE_SIZE}`,
  ].join(':');
}

export type SearchUpstream = (input: SearchInput) => Promise<SearchResponse>;

/**
 * Adds successful-response caching and same-key request coalescing around an
 * upstream search boundary. The in-flight registry owns shared work independently
 * of any one browser request and always removes settled promises, so failures
 * cannot populate the cache or poison later attempts.
 */
export function createSearchService(options: {
  cache: LRUCache<string, SearchResponse>;
  upstream: SearchUpstream;
}): SearchUpstream {
  const inFlightSearches = new Map<string, Promise<SearchResponse>>();

  return (input) => {
    const cacheKey = buildSearchCacheKey(input);
    const cached = options.cache.get(cacheKey);

    if (cached !== undefined) {
      return Promise.resolve(cached);
    }

    const pending = inFlightSearches.get(cacheKey);

    if (pending) {
      return pending;
    }

    const request = options
      .upstream(input)
      .then((result) => {
        options.cache.set(cacheKey, result);
        return result;
      })
      .finally(() => {
        inFlightSearches.delete(cacheKey);
      });

    inFlightSearches.set(cacheKey, request);
    return request;
  };
}

/**
 * Makes one request to the fixed Unsplash search endpoint and returns the
 * normalized domain response. This boundary owns the upstream timeout, performs
 * no automatic retry, and classifies HTTP, transport, timeout, and payload
 * failures for the public error translator.
 */
export async function fetchUnsplash(input: SearchInput): Promise<SearchResponse> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    throw new MissingAccessKeyError();
  }

  const url = new URL(UNSPLASH_ENDPOINT);
  url.searchParams.set('query', input.query);
  url.searchParams.set('page', String(input.page));
  url.searchParams.set('per_page', String(SEARCH_PAGE_SIZE));

  const signal = AbortSignal.timeout(UPSTREAM_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      signal,
    });
  } catch (cause) {
    if (signal.aborted) {
      throw new UpstreamTimeoutError(cause);
    }

    throw new UpstreamNetworkError(cause);
  }

  if (!response.ok) {
    throw new UpstreamHttpError(response.status, response.headers.get('retry-after'));
  }

  let body: unknown;

  try {
    body = await response.json();
  } catch (cause) {
    throw new UpstreamPayloadError(cause);
  }

  try {
    return normalizeUnsplashSearch(body, input.query, input.page);
  } catch (cause) {
    if (cause instanceof InvalidUnsplashPayloadError) {
      throw new UpstreamPayloadError(cause);
    }

    throw cause;
  }
}

type SearchErrorCode =
  | 'INVALID_SEARCH_REQUEST'
  | 'IMAGE_PROVIDER_RATE_LIMITED'
  | 'IMAGE_PROVIDER_UNAVAILABLE'
  | 'INTERNAL_ERROR';

export interface SearchErrorResponse {
  status: number;
  body: {
    error: {
      code: SearchErrorCode;
      message: string;
    };
  };
  retryAfter?: string;
}

function applicationError(
  status: number,
  code: SearchErrorCode,
  message: string,
): SearchErrorResponse {
  return {
    status,
    body: { error: { code, message } },
  };
}

/**
 * Maps internal and provider failures to the stable, safe API error contract.
 * Provider details remain server-side; only actionable rate-limit guidance is
 * preserved through the optional Retry-After value.
 */
export function translateSearchError(error: unknown): SearchErrorResponse {
  if (error instanceof InvalidSearchRequestError) {
    return applicationError(
      400,
      'INVALID_SEARCH_REQUEST',
      'Enter a search term from 1 to 100 characters and a positive whole-number page.',
    );
  }

  if (error instanceof UpstreamHttpError && error.status === 429) {
    return {
      ...applicationError(
        429,
        'IMAGE_PROVIDER_RATE_LIMITED',
        'The image provider is rate limited. Try again later.',
      ),
      ...(error.retryAfter ? { retryAfter: error.retryAfter } : {}),
    };
  }

  if (error instanceof UpstreamTimeoutError) {
    return applicationError(
      504,
      'IMAGE_PROVIDER_UNAVAILABLE',
      'The image provider took too long to respond. Try again.',
    );
  }

  if (error instanceof UpstreamHttpError && UNAVAILABLE_UPSTREAM_STATUSES.has(error.status)) {
    return applicationError(
      503,
      'IMAGE_PROVIDER_UNAVAILABLE',
      'The image provider is temporarily unavailable.',
    );
  }

  if (error instanceof UpstreamNetworkError) {
    return applicationError(
      502,
      'IMAGE_PROVIDER_UNAVAILABLE',
      'The image provider could not be reached. Try again.',
    );
  }

  if (error instanceof UpstreamPayloadError || error instanceof UpstreamHttpError) {
    return applicationError(
      502,
      'IMAGE_PROVIDER_UNAVAILABLE',
      'The image provider returned an unusable response.',
    );
  }

  return applicationError(500, 'INTERNAL_ERROR', 'Something went wrong. Try again.');
}
