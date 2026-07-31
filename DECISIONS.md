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
The planned data layer owns request caching, de-duplication, and cancellation. The accessibility
work covers semantic results, status announcements, keyboard operation, visible focus, and
reduced motion.

## Key trade-offs

> The decisions you're most and least sure about, and the alternatives you rejected.

The URL will own the committed query and page while the form owns only the transient draft.
Explicit previous/next pagination keeps the view shareable, restores cleanly through browser
history, and avoids infinite-scroll and scroll-restoration complexity. Client and server caches
serve different purposes: the client makes revisits immediate, while the server protects the
shared provider quota across refreshes and browser sessions.

The submission uses Node.js 22 so development and final verification run on a supported LTS line
rather than the starter's older convenience pin.

## What I deliberately did NOT do

> What you skipped, and what you'd do next with another day. (Naming your own gaps scores higher than hiding them.)

I am not building favorites, virtualization, filters, authentication, a database, or deployment
infrastructure. I am also leaving the detail-route stub out of the selected scope. With another
day, I would implement the routed detail experience first, including deliberate focus entry,
Escape handling, and focus return.

## AI usage

> Where you used AI tooling, if you did, and where you overrode it.

I used Codex to inspect and reconcile the challenge, implementation plan, and starter; establish
the runtime baseline; and assist with implementation and focused regression checks. I reviewed
each gated change and kept scope, dependency, and resilience decisions human-approved rather
than accepting generated content by default.
