/**
 * Mirror of the backend's domain contract (server/src/types.ts). The frontend
 * owns this shape — if you change one side, change the other.
 */
export interface PhotoAttribution {
  creatorName: string;
  creatorUrl: string;
  sourceName: string;
  sourceUrl: string;
}

export interface Photo {
  id: string;
  contentDescription: string | null;
  width: number;
  height: number;
  thumbUrl: string;
  fullUrl: string;
  blurHash?: string | null;
  attribution: PhotoAttribution;
}

export interface SearchResponse {
  query: string;
  page: number;
  totalPages: number | null;
  results: Photo[];
}
