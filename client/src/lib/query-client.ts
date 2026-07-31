import { QueryClient } from '@tanstack/react-query';

const FIVE_MINUTES = 5 * 60_000;
const THIRTY_MINUTES = 30 * 60_000;

export const photoKeys = {
  all: ['photos'] as const,
  search: (normalizedQuery: string, page: number) =>
    [...photoKeys.all, normalizedQuery, page] as const,
};

/**
 * Creates the browser cache with the search flow's deliberate request policy.
 * Pages remain fresh for five minutes so recent navigation is instant, while a
 * 30-minute retention window keeps useful inactive pages without retaining them
 * indefinitely. Automatic retries and focus/reconnect refetches are disabled to
 * protect provider quota and keep recovery user-triggered. The default
 * refetch-on-mount behavior remains enabled so stale cached pages can revalidate.
 */
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
