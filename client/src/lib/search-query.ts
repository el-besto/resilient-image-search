import { useQuery } from '@tanstack/react-query';
import { fetchSearch } from './api';
import { photoKeys } from './query-client';

export function usePhotoSearch(normalizedQuery: string, page: number) {
  return useQuery({
    queryKey: photoKeys.search(normalizedQuery, page),
    queryFn: ({ signal }) => fetchSearch(normalizedQuery, page, signal),
    enabled: normalizedQuery.length > 0,
  });
}
