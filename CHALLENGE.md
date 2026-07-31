# Buzz Solutions — Full-Stack Coding Challenge (Frontend-focused)

## Overview

Build a small but **production-quality** image search & browsing app.

This is deliberately scoped for a **senior frontend engineer**. The mechanics
(fetch some data, render a grid, add a search box) are intentionally easy — a
naive version can be built in an hour. We are **not** evaluating whether you can
render a list. We are evaluating the decisions a senior makes *around* that:
async correctness, performance under real image payloads, accessibility, state
that survives a refresh and a shared URL, testing, and — above all — how you
**prioritize and justify trade-offs under a time box**.

> **Time box: 3–4 focused hours.** The requirements below are *deliberately
> larger than fits in 3–4 hours.* That is the point. We want to see what you
> choose to build, what you choose to skip, and why. A focused, polished subset
> with clear reasoning beats a broad, shaky "everything half-done" submission.

---

## The product

A single-page app that lets a user **search** a large image collection and
**browse** results in a responsive grid, open an image for **detail**, and keep
a list of **favorites**. Think of it as the front door of an internal media
library.

### Data source

Pick **one**. All work through the same shell; the differences are in setup and
what backend responsibilities they force.

| API | Key? | Why it's interesting |
|---|---|---|
| **Unsplash API** *(recommended)* | Free demo key | Image-first; ships `blur_hash` for real blur-up placeholders; genuine pagination; **50 req/hr** limit makes your caching layer matter. |
| **TMDB (The Movie DB)** | Free key | Rich metadata, poster/backdrop paths (build your own `srcset`), higher rate limit, real pagination. |
| **Art Institute of Chicago API** | **No key** | Zero setup; IIIF image URLs (you construct sizes → responsive images), search + facets. Use this if you want to avoid signup. |

Whichever you pick, **your API key must never reach the browser** — that's one
reason the backend exists (below).

---

## Requirements

### 1. Core (expected of everyone)

- **Search**: a search input that queries the collection. Handle the full async
  lifecycle correctly — **debounce** input, **cancel or ignore stale responses**
  (typing "cat" fast must never render results for "ca"), and show distinct
  **loading / empty / error** states. Errors must be recoverable (retry), not a
  dead end.
- **Results grid**: responsive, image-first layout. Images must **not cause
  layout shift** as they load (reserve space using known aspect ratios), and
  must load efficiently (lazy loading, appropriately sized sources — `srcset` /
  `sizes` or the API's size params, not full-res everywhere).
- **Pagination**: load more results (infinite scroll *or* explicit pagination —
  your call, justify it). Loading more must not re-fetch or re-render everything.
- **Deep-linkable state**: the current search query (and page/filters, if you
  add them) must live in the **URL**. Refreshing or sharing the link restores the
  same view.

### 2. Depth areas — pick **at least 2**, do them well

Do not attempt all of these. Pick the two you can execute to a high standard and
say why in `DECISIONS.md`.

- **Client-side data layer**: request **caching + de-duplication** (re-searching
  a recent term is instant and fires no new request; two components asking for
  the same data share one request). You may use a library (React Query / SWR) —
  if you do, we'll expect you to configure it deliberately (stale times,
  cache keys, cancellation) rather than accept defaults.
- **Virtualization / large lists**: render thousands of results smoothly
  (windowing) without janking scroll.
- **Image detail view**: a routed detail view (modal *or* page) with correct
  **focus management** (focus moves in, is trapped, returns on close), keyboard
  and `Esc` support, and a graceful blur-up / skeleton while the larger image
  loads.
- **Favorites**: let users favorite images and persist them across reloads
  (localStorage, or a backend endpoint — see below). Handle the UI optimistically.
- **Accessibility pass**: keyboard-operable grid and controls, sensible ARIA for
  the results region and status updates (announce "12 results" / "loading"),
  visible focus, and `prefers-reduced-motion` respected.

### 3. Backend (keep it thin, but real)

A **Node.js** backend sits between the frontend and the third-party API. It is
intentionally lightweight, but it must justify its existence:

- **Proxy** the third-party API so the **API key stays server-side**.
- **Normalize** the upstream response into a stable shape your frontend owns
  (don't leak the vendor's payload straight through).
- Add **at least one** real backend behavior: response **caching** (respect the
  upstream rate limit), basic **input validation**, or sensible **error mapping**
  (upstream 429/5xx → meaningful status + message your UI can act on).
- If you chose the **Favorites** depth area and want it server-persisted, expose
  a small favorites endpoint (in-memory is fine; note it in `DECISIONS.md`).

> Backend depth is **not** where most of your points are. Don't build auth, a
> database, or microservices. A clean, well-typed proxy with one thoughtful
> behavior is exactly right.

### 4. Constraints (these are the interesting part)

- **TypeScript** on both frontend and backend. Types should model your domain,
  not be sprinkled `any`.
- **React** for the frontend, **Node.js** for the backend. Any build tool,
  router, styling approach, and libraries you like — but every non-trivial
  dependency should be a **defensible choice**, not reflexive.
- **No design mockup is provided.** Reasonable, clean product judgment is part of
  the evaluation. It doesn't need to be beautiful; it needs to be coherent and
  usable.

---

## Non-functional bar

- **Testing**: include tests that would actually catch a regression — e.g. the
  stale-response / debounce logic, the data-layer cache behavior, or a
  reducer/hook. We value a few **meaningful** tests over a high coverage number
  or a wall of shallow "renders without crashing" tests. Tell us your strategy.
- **Performance**: the grid should stay responsive with a few hundred images
  loaded. No obvious unnecessary re-renders, no full-res image bombs, no layout
  shift.
- **Accessibility**: keyboard-usable, and it shouldn't fail an automated axe pass
  on the main flows.
- **Resilience**: network failures, empty results, and rate-limit responses are
  handled deliberately, not left to a blank screen or an unhandled rejection.

---

## What we are **not** looking for

To protect your time — explicitly out of scope:

- Auth / login, user accounts, a real database, deployment/CI, Docker.
- Pixel-perfect visual design or a component library build-out.
- 100% test coverage or exhaustive feature completeness.

If you find yourself building any of the above, stop — you've left the assignment.

---

## Deliverables

1. A **public GitHub repository**. We look at your **commit history** — small,
   meaningful commits that tell the story of your work beat one giant "initial
   commit."
2. A **README** with: how to run it (frontend + backend), any env/key setup, and
   how to run the tests. We should be running your app in **under 5 minutes**.
3. A **`DECISIONS.md`** (½–1 page) — the most important document you'll write:
   - Which depth areas you chose and **why**.
   - Key trade-offs and the alternatives you rejected.
   - **What you deliberately did *not* do**, and what you'd do next with another
     day. (Listing your own known gaps scores *higher* than hiding them.)
   - Where and how you used AI tooling, if you did (see below).

---

## A note on AI assistance

Using AI tools (Copilot, Claude, etc.) is **allowed and expected** — it's how the
job actually works. But it changes what we assess. We are less interested in code
that *exists* and more interested in code you can **defend**. Concretely:

- In `DECISIONS.md`, note where you leaned on AI and where you overrode it.
- Expect a short follow-up conversation where we'll ask you to **walk through and
  extend** part of your submission live (e.g. change a behavior, explain why the
  cancellation logic is correct, add a small feature). Submissions that can't be
  explained by their author don't survive this step.

Optimize for a submission you fully understand, not the largest one.

---

## How you'll be scored

| Area | Weight | What "strong" looks like |
|---|---:|---|
| **Async & state correctness** | 25% | Stale responses impossible; clean loading/empty/error states; URL-synced state; no race conditions. |
| **Frontend architecture** | 20% | Clear component/data boundaries; reusable, testable units; state kept at the right level; no prop-drilling soup or god components. |
| **Performance & images** | 15% | No layout shift; right-sized images; lazy loading; no needless re-renders; smooth at scale. |
| **Accessibility & UX polish** | 15% | Keyboard-operable; sane ARIA/focus; coherent, usable product judgment. |
| **Testing** | 10% | A few tests that catch real regressions; articulated strategy. |
| **Backend & typing** | 10% | Thin, correct proxy; key hidden; domain-modeled types; one real behavior done well. |
| **Communication & judgment** | 5% | `DECISIONS.md`, commit history, and scoping reflect senior-level prioritization. |

A candidate who nails **Core + 2 depth areas + a sharp `DECISIONS.md`** scores
far higher than one who touches everything shallowly.
