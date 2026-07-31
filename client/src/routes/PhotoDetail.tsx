import { Link, useParams } from 'react-router-dom';

/**
 * Stub for the "image detail view" depth area. A route already exists at
 * /photo/:id. If you take this on, decide: routed page vs. modal over the grid?
 * Either way we're looking for real focus management (focus moves in, is
 * trapped, returns to the trigger on close), Esc support, and a graceful
 * blur-up / skeleton while the larger image loads.
 *
 * You'll also need to get the photo's data here — via router state, a shared
 * cache, or a `GET /api/photo/:id` endpoint. That choice is yours to justify.
 */
export default function PhotoDetail() {
  const { id } = useParams();
  return (
    <div className="detail">
      <Link to="/">← Back</Link>
      <p>TODO: detail view for photo “{id}”.</p>
    </div>
  );
}
