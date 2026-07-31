import { type FormEvent, useState } from 'react';
import { ApiError, fetchSearch } from '../lib/api';
import { pluralize } from '../lib/format';
import type { Photo } from '../lib/types';

/**
 * ⚠️ INTENTIONALLY NAIVE BASELINE — this is your starting point, not the goal.
 *
 * It fetches on submit and dumps thumbnails into a grid so the app boots
 * end-to-end. It gets almost everything "senior" wrong on purpose. Your job is
 * to fix it. Non-exhaustive list of what's missing / broken here:
 *
 *   • No debounce and no stale-response handling — fire two searches quickly and
 *     the slower one can overwrite the newer results (race condition).
 *   • No request cancellation, caching, or de-duplication.
 *   • Search state lives in component state, not the URL — refresh/share loses it.
 *   • No pagination / load-more.
 *   • Images cause layout shift and load full-size thumbs with no lazy loading.
 *   • Loading / empty / error states are barely handled.
 *   • The grid isn't keyboard-navigable and has no detail view wired up.
 *   • No meaningful tests.
 *
 * Re-architect as you see fit — you are not required to keep any of this code.
 */
export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Photo[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setStatus('loading');
    setError(null);
    try {
      const data = await fetchSearch(query.trim());
      setResults(data.results);
      setStatus('idle');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong.');
      setStatus('error');
    }
  }

  return (
    <div className="search">
      <form className="search__form" onSubmit={onSubmit}>
        <input
          className="search__input"
          type="search"
          placeholder="Search images…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search images"
        />
        <button className="search__button" type="submit">
          Search
        </button>
      </form>

      {status === 'loading' && <p>Loading…</p>}
      {status === 'error' && <p role="alert">{error}</p>}
      {status === 'idle' && results.length > 0 && (
        <p className="search__count">{pluralize(results.length, 'result')}</p>
      )}

      <ul className="grid">
        {results.map((photo) => (
          <li key={photo.id} className="grid__item">
            <img className="grid__img" src={photo.thumbUrl} alt={photo.contentDescription ?? ''} />
          </li>
        ))}
      </ul>
    </div>
  );
}
