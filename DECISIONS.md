# Decisions

## Data source

> Which API did you use, and why?

I kept the starter's Unsplash integration because it offers real pagination, intrinsic image
dimensions, responsive image URLs, and a low request quota that makes cache policy meaningful.
The API key remains server-side behind the existing Express proxy.

## Depth areas

> Which depth areas did you pick (need ≥2), and why those?

I chose the client-side data layer and accessibility pass. They reinforce the assignment's core
search flow and its highest-weight evaluation areas without adding a second product surface.
The client data layer owns request caching, de-duplication, and cancellation. The accessibility
work covers semantic results, status announcements, keyboard operation, visible focus, and reduced
motion.

## Key trade-offs

> The decisions you're most and least sure about, and the alternatives you rejected.

The URL owns the committed query and page while the form owns only the transient draft. Typing
commits after 500 milliseconds with history replacement; explicit submission and pagination push
meaningful history entries. Previous/next pagination keeps the view shareable and avoids
infinite-scroll and scroll-restoration complexity.

The client cache improves revisit UX, while the server cache protects provider quota across
browsers and refreshes. The server keeps successful normalized pages in a bounded five-minute LRU
and separately coalesces concurrent same-key misses. Each miss gets one three-second server-owned
provider attempt with no automatic retry; recovery is explicitly user-triggered. Browser
cancellation cannot cancel shared upstream work still needed by another caller.

TanStack Query keys browser data by normalized query and page, treats it as fresh for five minutes,
and retains unused entries for 30 minutes. Automatic retry and focus/reconnect refetching are
disabled. An uncached navigation removes the prior page's cards instead of presenting mismatched
results while the destination loads.

The submission uses Node.js 22 so development and final verification run on a supported LTS line
rather than the starter's older convenience pin.

## What I deliberately did NOT do

> What you skipped, and what you'd do next with another day. (Naming your own gaps scores higher than hiding them.)

I am not building favorites, virtualization, filters, authentication, a database, or deployment
infrastructure. I am also leaving the detail-route stub out of the selected scope. With another
day, I would implement the routed detail experience first, including deliberate focus entry,
Escape handling, and focus return.

Frontend automation intentionally covers the two highest-value integration scenarios: stale-result
protection and deep-link cache reuse. Error-to-Retry recovery is manually verified; with another
day, I would automate that path before adding lower-value state permutations.

## AI usage

> Where you used AI tooling, if you did, and where you overrode it.

I used Codex to inspect and reconcile the challenge, implementation plan, and starter; establish
the runtime baseline; and assist with implementation and focused regression checks. I reviewed
each gated change and kept scope, dependency, and resilience decisions human-approved rather
than accepting generated content by default.
