import { type Request, type Response, Router } from 'express';
import { normalizeUnsplashSearch } from './normalize.js';

const router = Router();

const UNSPLASH_ENDPOINT = 'https://api.unsplash.com/search/photos';

/**
 * GET /api/search?query=cats&page=1
 *
 * This is a WORKING reference proxy for Unsplash so you can boot the app
 * end-to-end. It is deliberately minimal. To meet the backend requirement,
 * improve it — see the TODOs. If you chose TMDB / Art Institute of Chicago,
 * swap the upstream call and normalizer accordingly.
 */
router.get('/search', async (req: Request, res: Response) => {
  const query = String(req.query.query ?? '').trim();
  const page = Number(req.query.page ?? 1);

  // TODO (validation): reject empty query / non-positive / non-integer page
  // with a 400 and a message the client can render, instead of leaning on
  // upstream to complain.
  if (!query) {
    return res.status(400).json({ error: 'Missing required "query" parameter.' });
  }

  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) {
    return res.status(500).json({
      error: 'Server is missing UNSPLASH_ACCESS_KEY. Copy .env.example to .env and add a key.',
    });
  }

  // TODO (caching): Unsplash allows only ~50 requests/hour on a demo key.
  // Add a cache (keyed by query+page) so repeat searches don't burn quota.
  try {
    const url = new URL(UNSPLASH_ENDPOINT);
    url.searchParams.set('query', query);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', '24');

    const upstream = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
    });

    // TODO (error mapping): translate upstream failures into something your UI
    // can act on. A 429 (rate limited) and a 500 (upstream down) should not
    // look identical to the client. Right now everything non-OK becomes 502.
    if (!upstream.ok) {
      return res.status(502).json({ error: `Upstream error (${upstream.status}).` });
    }

    const body = await upstream.json();
    return res.json(normalizeUnsplashSearch(body, query, page));
  } catch (err) {
    console.error(err);
    return res.status(502).json({ error: 'Failed to reach the image provider.' });
  }
});

export default router;
