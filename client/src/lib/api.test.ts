import { describe, expect, it } from 'vitest';
import { parseSearchResponse } from './api';

describe('parseSearchResponse', () => {
  it('preserves the nested error contract and retry guidance', async () => {
    const response = new Response(
      JSON.stringify({
        error: {
          code: 'IMAGE_PROVIDER_RATE_LIMITED',
          message: 'The image provider is rate limited. Try again later.',
        },
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      },
    );

    await expect(parseSearchResponse(response)).rejects.toMatchObject({
      name: 'ApiError',
      status: 429,
      code: 'IMAGE_PROVIDER_RATE_LIMITED',
      message: 'The image provider is rate limited. Try again later.',
      retryAfter: '60',
    });
  });

  it('uses a safe fallback for a malformed error response', async () => {
    const response = new Response('not json', { status: 502 });

    await expect(parseSearchResponse(response)).rejects.toMatchObject({
      name: 'ApiError',
      status: 502,
      code: null,
      message: 'Request failed with HTTP 502.',
    });
  });
});
