import { QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { createQueryClient } from '../lib/query-client';

export function renderAtRoute(element: ReactElement, initialEntry = '/') {
  const queryClient = createQueryClient();
  const router = createMemoryRouter([{ path: '/', element }], {
    initialEntries: [initialEntry],
  });
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider future={{ v7_startTransition: true }} router={router} />
    </QueryClientProvider>,
  );

  return { ...result, queryClient, router };
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });

  return { promise, resolve, reject };
}
