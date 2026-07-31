/**
 * The domain shape YOUR frontend consumes. This is intentionally decoupled from
 * whatever upstream API you chose — the frontend should never see the vendor's
 * raw payload. Add/trim fields to fit your product, but keep this the contract.
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
  /** Intrinsic dimensions, so the client can reserve space and avoid layout shift. */
  width: number;
  height: number;
  /** A small/thumbnail source for the grid. */
  thumbUrl: string;
  /** A larger source for the detail view. */
  fullUrl: string;
  /** Optional low-quality placeholder (e.g. Unsplash blur_hash) for blur-up. */
  blurHash?: string | null;
  attribution: PhotoAttribution;
}

export interface SearchResponse {
  query: string;
  page: number;
  /** Total pages available upstream, if known. */
  totalPages: number | null;
  results: Photo[];
}
