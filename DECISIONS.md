# Decisions

## Data source

I kept Unsplash because it provides pagination, intrinsic dimensions, responsive URLs, and a
low quota that rewards caching. The access key stays behind the Express proxy. I used native
`fetch` rather than `unsplash-js`; with one read-only endpoint, an SDK would not remove the need to
own validation, timeouts, normalization, and errors. I would reconsider it for multiple provider
operations or user authorization.

## Depth areas

I chose the client-side data layer and accessibility pass because they strengthen the core search
flow without adding a second product surface. The data layer handles caching, de-duplication, and
cancellation; the accessibility work covers semantics, status announcements, keyboard operation,
and visible focus. The UI has no animation or transitions, so it respects
`prefers-reduced-motion` without an override.

## Key trade-offs

I am most confident in making the URL own the committed query and page while the form owns only the
draft. Typing commits after 500 milliseconds with history replacement; submission and pagination
push history entries. Previous/next pagination stays shareable without infinite-scroll and
scroll-restoration complexity.

The client cache improves revisit UX, while the server cache protects provider quota across
browsers and refreshes. The server keeps successful pages in a bounded five-minute LRU and
coalesces concurrent same-key misses. Each miss makes one provider attempt with a three-second
timeout; recovery is user-triggered. The choice I am least sure about is omitting automatic retry.
Selective retry could help, but it spends quota and needs failure classification and a larger
latency budget.

TanStack Query keys browser data by normalized query and page, treats it as fresh for five minutes,
and retains unused entries for 30 minutes. Automatic retry and focus/reconnect refetches are off.
An uncached navigation removes cards that no longer match the destination URL.

The browser is outside the server's trust boundary, so the proxy validates query and page even
though the UI constrains them. Small guards validate the provider envelope and essential photo
fields; an unusable item is omitted so valid siblings survive. This keeps the per-item failure
policy explicit without adding a schema dependency. A schema library (e.g. Valibot, Zod) becomes
worthwhile with more endpoints or shared schemas, after deciding whether invalid data should reject
one item or the whole page.

Results use a semantic list of figures instead of an ARIA grid and custom keyboard model. A grid
would require managed focus plus arrow, Home, and End behavior without helping this document-style
flow. Larger images open in a new tab to preserve the query, page, cache, and scroll position; the
accessible name announces that change. Intrinsic dimensions reserve space, two provider sizes
support responsive loading, and only the first four images load eagerly. I skipped blur-up effects
to keep this implementation small and inspectable.

Node.js 22 keeps development and verification on a supported LTS release.

## What I deliberately did NOT do

I did not build favorites, virtualization, filters, authentication, a database, deployment
infrastructure, or routed detail, and removed the unused detail stub. With another day, I would
work in this order:

- **Add routed detail:** Build either a modal with focus entry, trapping, return, and Escape or a
  page, with direct-link support and a larger-image loading state.
- **Close test gaps:** Automate failure → Retry → success and axe checks for initial, populated, and
  recoverable-error states while keeping manual keyboard and VoiceOver review.
- **Harden the provider boundary:** Evaluate Cockatiel after defining retryable failures and a
  quota/latency budget; adopt Valibot or Zod when schema reuse justifies the dependency, preserving
  per-item omission.
- **Improve observability:** Add request IDs and structured tracing across the browser, proxy, and
  provider call; consider Sentry breadcrumbs after defining privacy and redaction boundaries.

## AI usage

I used Codex to reconcile the challenge and plan, establish the runtime, and assist with
implementation and tests. I reviewed each change and made the final calls on scope,
dependencies, and resilience.

CSS is not my strongest area, so I relied heavily on Codex for the responsive gallery and focus
styles. I kept those rules small enough to inspect and validate manually instead of adding a
framework I could not defend.
