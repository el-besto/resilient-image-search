import type { Photo, SearchResponse } from './types.js';

const ATTRIBUTION_PARAMS = {
  utm_source: 'buzz_image_search',
  utm_medium: 'referral',
} as const;

export class InvalidUnsplashPayloadError extends Error {
  constructor() {
    super('Unsplash returned an invalid search payload.');
    this.name = 'InvalidUnsplashPayloadError';
  }
}

interface UnsplashPhoto {
  id: string;
  description?: unknown;
  alt_description?: unknown;
  width: number;
  height: number;
  blur_hash?: unknown;
  urls: {
    small: string;
    regular: string;
  };
  user: {
    name: string;
    links: {
      html: string;
    };
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function nonEmptyText(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  return value.trim() || null;
}

function isPositiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) > 0;
}

function isHttpsUrl(value: unknown): value is string {
  const text = nonEmptyText(value);

  if (!text) {
    return false;
  }

  try {
    const url = new URL(text);
    return url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isUnsplashPhoto(value: unknown): value is UnsplashPhoto {
  if (!isRecord(value) || !isRecord(value.urls) || !isRecord(value.user)) {
    return false;
  }

  if (!isRecord(value.user.links)) {
    return false;
  }

  return (
    nonEmptyText(value.id) !== null &&
    isPositiveSafeInteger(value.width) &&
    isPositiveSafeInteger(value.height) &&
    isHttpsUrl(value.urls.small) &&
    isHttpsUrl(value.urls.regular) &&
    nonEmptyText(value.user.name) !== null &&
    isHttpsUrl(value.user.links.html)
  );
}

function withAttributionParams(value: string): string {
  const url = new URL(value);

  for (const [name, parameter] of Object.entries(ATTRIBUTION_PARAMS)) {
    url.searchParams.set(name, parameter);
  }

  return url.toString();
}

const UNSPLASH_SOURCE_URL = withAttributionParams('https://unsplash.com/');

function normalizePhoto(raw: unknown): Photo | null {
  if (!isUnsplashPhoto(raw)) {
    return null;
  }

  return {
    id: raw.id.trim(),
    contentDescription: nonEmptyText(raw.alt_description) ?? nonEmptyText(raw.description),
    width: raw.width,
    height: raw.height,
    thumbUrl: new URL(raw.urls.small).toString(),
    fullUrl: new URL(raw.urls.regular).toString(),
    blurHash: nonEmptyText(raw.blur_hash),
    attribution: {
      creatorName: raw.user.name.trim(),
      creatorUrl: withAttributionParams(raw.user.links.html),
      sourceName: 'Unsplash',
      sourceUrl: UNSPLASH_SOURCE_URL,
    },
  };
}

export function normalizeUnsplashSearch(raw: unknown, query: string, page: number): SearchResponse {
  if (
    !isRecord(raw) ||
    !Number.isSafeInteger(raw.total_pages) ||
    Number(raw.total_pages) < 0 ||
    !Array.isArray(raw.results)
  ) {
    throw new InvalidUnsplashPayloadError();
  }

  return {
    query,
    page,
    totalPages: raw.total_pages as number,
    results: raw.results.flatMap((result) => {
      const photo = normalizePhoto(result);
      return photo ? [photo] : [];
    }),
  };
}
