import { QueryClient } from '@tanstack/react-query';

const FIVE_MINUTES = 5 * 60_000;
const THIRTY_MINUTES = 30 * 60_000;

export const photoKeys = {
  all: ['photos'] as const,
  search: (normalizedQuery: string, page: number) =>
    [...photoKeys.all, normalizedQuery, page] as const,
};

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: FIVE_MINUTES,
        gcTime: THIRTY_MINUTES,
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
      },
    },
  });
}
