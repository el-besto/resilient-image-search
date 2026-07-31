import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { SearchResponse } from '../lib/types';
import { deferred, renderAtRoute } from '../test/test-utils';
import SearchPage from './SearchPage';

function searchResponse(query: string, page: number, description: string): Response {
  const body: SearchResponse = {
    query,
    page,
    totalPages: 3,
    results: [
      {
        id: `${query}-${page}`,
        contentDescription: description,
        width: 1200,
        height: 800,
        thumbUrl: `https://images.example/${query}-${page}-small.jpg`,
        fullUrl: `https://images.example/${query}-${page}-regular.jpg`,
        attribution: {
          creatorName: 'Ada L.',
          creatorUrl: 'https://unsplash.com/@ada',
          sourceName: 'Unsplash',
          sourceUrl: 'https://unsplash.com/',
        },
      },
    ],
  };

  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function requestUrl(input: RequestInfo | URL): URL {
  return new URL(typeof input === 'string' ? input : input.toString(), 'http://localhost');
}

describe('SearchPage', () => {
  it('debounces URL commits, aborts obsolete work, and never renders stale results', async () => {
    const catRequest = deferred<Response>();
    const dogRequest = deferred<Response>();
    const catSignals: AbortSignal[] = [];
    const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
      const query = requestUrl(input).searchParams.get('query');

      if (query === 'cat') {
        if (init?.signal instanceof AbortSignal) {
          catSignals.push(init.signal);
        }
        return catRequest.promise;
      }

      return dogRequest.promise;
    });
    vi.stubGlobal('fetch', fetchMock);
    const rendered = renderAtRoute(<SearchPage />);
    const user = userEvent.setup();
    const input = screen.getByRole('searchbox', { name: 'Search images' });

    await user.type(input, 'cat');
    expect(fetchMock).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(rendered.router.state.location.search).toBe('?query=cat&page=1');
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    await user.clear(input);
    await user.type(input, 'dog');
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(rendered.router.state.location.search).toBe('?query=dog&page=1');
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(catSignals[0]?.aborted).toBe(true);
    });

    await act(async () => {
      dogRequest.resolve(searchResponse('dog', 1, 'a dog'));
      await Promise.resolve();
    });
    expect(
      await screen.findByRole('link', { name: 'View larger image: a dog' }),
    ).toBeInTheDocument();

    await act(async () => {
      catRequest.resolve(searchResponse('cat', 1, 'a cat'));
      await Promise.resolve();
    });
    expect(
      screen.queryByRole('link', { name: 'View larger image: a cat' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View larger image: a dog' })).toBeInTheDocument();

    rendered.unmount();
    rendered.queryClient.clear();
  });

  it('restores a fresh deep-linked page without another request', async () => {
    const pageOneRequest = deferred<Response>();
    const fetchMock = vi.fn((input: RequestInfo | URL) => {
      const url = requestUrl(input);
      const page = Number(url.searchParams.get('page'));

      if (page === 1) {
        return pageOneRequest.promise;
      }

      return Promise.resolve(searchResponse('cats', 2, 'cats page 2'));
    });
    vi.stubGlobal('fetch', fetchMock);
    const rendered = renderAtRoute(<SearchPage />, '/?query=cats&page=2');
    const user = userEvent.setup();

    expect(
      await screen.findByRole('link', { name: 'View larger image: cats page 2' }),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: 'Previous page, page 1' }));

    expect(await screen.findByText('Loading page 1 for “cats”…')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'View larger image: cats page 2' }),
    ).not.toBeInTheDocument();
    expect(rendered.router.state.location.search).toBe('?query=cats&page=1');
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await act(async () => {
      pageOneRequest.resolve(searchResponse('cats', 1, 'cats page 1'));
    });
    expect(
      await screen.findByRole('link', { name: 'View larger image: cats page 1' }),
    ).toBeInTheDocument();

    await act(async () => {
      await rendered.router.navigate(-1);
    });

    expect(
      await screen.findByRole('link', { name: 'View larger image: cats page 2' }),
    ).toBeInTheDocument();
    expect(rendered.router.state.location.search).toBe('?query=cats&page=2');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
