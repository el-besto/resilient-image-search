/**
 * Mirror of the backend's domain contract (server/src/types.ts). The frontend
 * owns this shape — if you change one side, change the other.
 */
export interface Photo {
  id: string;
  description: string;
  width: number;
  height: number;
  thumbUrl: string;
  fullUrl: string;
  blurHash?: string | null;
  author?: string | null;
}

export interface SearchResponse {
  query: string;
  page: number;
  totalPages: number | null;
  results: Photo[];
}
