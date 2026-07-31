import type { SearchResponse } from './types';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null,
    message: string,
    readonly retryAfter?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isApiErrorBody(value: unknown): value is {
  error: {
    code: string;
    message: string;
  };
} {
  if (!isRecord(value) || !isRecord(value.error)) {
    return false;
  }

  return (
    typeof value.error.code === 'string' &&
    value.error.code.trim().length > 0 &&
    typeof value.error.message === 'string' &&
    value.error.message.trim().length > 0
  );
}

export async function parseSearchResponse(response: Response): Promise<SearchResponse> {
  const body: unknown = await response.json().catch(() => null);

  if (response.ok) {
    return body as SearchResponse;
  }

  const retryAfter = response.headers.get('Retry-After') ?? undefined;

  if (isApiErrorBody(body)) {
    throw new ApiError(response.status, body.error.code, body.error.message, retryAfter);
  }

  throw new ApiError(
    response.status,
    null,
    `Request failed with HTTP ${response.status}.`,
    retryAfter,
  );
}

export async function fetchSearch(
  query: string,
  page: number,
  signal: AbortSignal,
): Promise<SearchResponse> {
  const params = new URLSearchParams({ query, page: String(page) });
  const response = await fetch(`/api/search?${params}`, { signal });

  return parseSearchResponse(response);
}
