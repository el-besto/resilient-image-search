import type { Photo, SearchResponse } from './types.js';

/**
 * Example normalizer for the Unsplash `GET /search/photos` response.
 *
 * This exists so you have a reference for the "normalize the upstream payload
 * into a stable shape you own" requirement — and so there's something for the
 * example test to exercise. If you pick TMDB or the Art Institute of Chicago,
 * write the equivalent for that API and delete this.
 *
 * `unknown` in, typed `Photo[]` out — treat upstream data as untrusted.
 */
interface UnsplashPhoto {
  id: string;
  description: string | null;
  alt_description: string | null;
  width: number;
  height: number;
  blur_hash: string | null;
  urls: { small: string; regular: string };
  user: { name: string } | null;
}

interface UnsplashSearchBody {
  total_pages: number;
  results: UnsplashPhoto[];
}

export function normalizeUnsplashSearch(
  raw: unknown,
  query: string,
  page: number,
): SearchResponse {
  // Upstream is untrusted — cast at the boundary. A stricter implementation
  // would validate this (e.g. with zod) rather than trust the shape.
  const body = raw as UnsplashSearchBody;
  const results: Photo[] = (body.results ?? []).map((p) => ({
    id: p.id,
    description: p.description ?? p.alt_description ?? 'Untitled',
    width: p.width,
    height: p.height,
    thumbUrl: p.urls.small,
    fullUrl: p.urls.regular,
    blurHash: p.blur_hash,
    author: p.user?.name ?? null,
  }));

  return {
    query,
    page,
    totalPages: body.total_pages ?? null,
    results,
  };
}
