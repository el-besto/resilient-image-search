/** The frontend-owned domain contract, decoupled from the provider's raw payload. */
export interface PhotoAttribution {
  creatorName: string;
  creatorUrl: string;
  sourceName: string;
  sourceUrl: string;
}

export interface Photo {
  id: string;
  contentDescription: string | null;
  /** Intrinsic dimensions, so the client can reserve space and avoid layout shift. */
  width: number;
  height: number;
  /** A small/thumbnail source for the grid. */
  thumbUrl: string;
  /** A larger source opened from the results gallery. */
  fullUrl: string;
  attribution: PhotoAttribution;
}

export interface SearchResponse {
  query: string;
  page: number;
  /** Total pages available upstream, if known. */
  totalPages: number | null;
  results: Photo[];
}
