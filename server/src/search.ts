import { type Request, type Response, Router } from 'express';
import {
  createSearchCache,
  createSearchService,
  fetchUnsplash,
  parseSearchInput,
  translateSearchError,
  UpstreamHttpError,
} from './search-service.js';

const router = Router();
const getSearchResults = createSearchService({
  cache: createSearchCache(),
  upstream: fetchUnsplash,
});

/**
 * GET /api/search?query=cats&page=1
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const input = parseSearchInput({
      query: req.query.query,
      page: req.query.page,
    });
    const result = await getSearchResults(input);

    if (res.destroyed) {
      return;
    }

    return res.json(result);
  } catch (error) {
    const translated = translateSearchError(error);

    if (translated.status >= 500 && translated.body.error.code === 'INTERNAL_ERROR') {
      console.error('[server] unexpected search failure', error);
    } else if (translated.status >= 500 || translated.status === 429) {
      console.warn('[server] image provider request failed', {
        code: translated.body.error.code,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        status: translated.status,
        ...(error instanceof UpstreamHttpError ? { upstreamStatus: error.status } : {}),
      });
    }

    if (res.destroyed) {
      return;
    }

    if (translated.retryAfter) {
      res.set('Retry-After', translated.retryAfter);
    }

    return res.status(translated.status).json(translated.body);
  }
});

export default router;
