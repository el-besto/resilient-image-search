import type { SearchResponse } from './types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Minimal typed client for the backend proxy. It accepts an AbortSignal so you
 * can cancel stale requests — wiring that up (and any caching/dedup) is your job.
 */
export async function fetchSearch(
  query: string,
  page = 1,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ query, page: String(page) });
  const res = await fetch(`/api/search?${params}`, { signal });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(body?.error ?? `Request failed (${res.status})`, res.status);
  }

  return (await res.json()) as SearchResponse;
}
