# Buzz Solutions — Image Search Challenge

A production-minded image search app: search, share a URL, page through results, and recover when
the image provider has a bad day.

See [`CHALLENGE.md`](./CHALLENGE.md) for the original prompt and
[`DECISIONS.md`](./DECISIONS.md) for scope, trade-offs, omissions, and AI usage.

## What is implemented

- Debounced search with query and page state owned by the URL.
- Explicit pagination with browser-history support and fresh-page cache reuse.
- TanStack Query caching, request de-duplication, stale-response protection, and cancellation.
- Intentional initial, loading, refreshing, empty, error, Retry, and results states.
- A responsive semantic image gallery with reserved image space, responsive sources, lazy loading,
  native larger-image links, and visible Unsplash attribution.
- An Express proxy that validates requests, keeps the access key server-side, normalizes Unsplash
  responses, coalesces same-key misses, caches successful pages, bounds upstream requests with a
  timeout, and returns a stable error contract.

The selected depth areas are the **client-side data layer** and **accessibility pass**. The former
owns async correctness and browser caching; the latter favors semantic HTML, native keyboard
behavior, live status messages, visible focus, and a deliberately simple interaction model.

## Architecture

```text
React + URL state + TanStack Query
                │
                │ GET /api/search?query=...&page=...
                ▼
Express validation + normalization + bounded LRU
                │
                ▼
             Unsplash
```

The browser cache makes recent navigation immediate and de-duplicates component reads. The server
cache protects the shared Unsplash quota across browser refreshes and sessions. Both use a
five-minute freshness window, but they solve different problems. Automatic retries are disabled;
recovery is an explicit user action.

## Setup

Requires **Node.js 22+**. The repository includes an `.nvmrc` for the supported Node.js 22 line.

```bash
nvm use # if you use nvm
npm install
cp .env.example server/.env
```

Add an [Unsplash demo access key](https://unsplash.com/developers) to `server/.env`:

```dotenv
UNSPLASH_ACCESS_KEY=your_key_here
```

Then start both workspaces:

```bash
npm run dev
```

Open <http://localhost:5173>. The Vite client runs on port 5173 and proxies `/api` requests to the
Express server on port 5174.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run the client and server together |
| `npm run check` | Run Biome formatting, lint, and import checks |
| `npm test` | Run the client and server Vitest suites once |
| `npm run typecheck` | Type-check both workspaces |
| `npm run build` | Build the server and production client |
| `npm run format` | Format supported project files with Biome |

Per-workspace commands are also available, such as `npm run test -w client` and
`npm run dev -w server`.

## Testing strategy

The automated suite concentrates on regressions that would be expensive or easy to miss manually:

- Debounce, cancellation, and stale-result protection across rapid searches.
- Deep-linked pagination and fresh client-cache reuse through browser history.
- Defensive client parsing of structured and malformed error responses.
- Server input validation, successful-response caching, same-key request coalescing, failure
  cleanup, rate-limit translation, timeout mapping, and the one-attempt upstream boundary.
- Provider-to-domain normalization, nullable descriptions, unusable-item omission, and required
  attribution parameters.
- The empty-results pagination boundary.

The final manual test plan covers keyboard and screen-reader behavior, an automated browser audit,
zoom, responsive layouts, and slow-network image loading rather than adding a large set of shallow
rendering tests.

## Deliberate scope

This submission does not implement favorites, a routed detail experience, filters, virtualization,
authentication, persistence, deployment infrastructure, or a component library. Result images
instead use native links to their larger provider-hosted source. These omissions preserve the
timebox for async correctness, image performance, accessibility, tests, and documentation.

The reasoning—and what would come next with another day—is in [`DECISIONS.md`](./DECISIONS.md).
