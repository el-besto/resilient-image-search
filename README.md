# Buzz Solutions — Frontend Challenge (starter)

A pre-wired monorepo so you spend your time on the interesting problems, not
boilerplate. **Read [`CHALLENGE.md`](./CHALLENGE.md) first** — it defines the
task, scope, and how you'll be scored.

## What's here

```
client/   Vite + React + TypeScript app (port 5173)
server/   Express + TypeScript proxy    (port 5174)
```

- The client dev server proxies `/api/*` to the Node server, which holds your
  API key and talks to the image provider. The key never reaches the browser.
- A **deliberately naive** search page (`client/src/routes/SearchPage.tsx`) and a
  **working reference proxy** (`server/src/search.ts`) let the app boot
  end-to-end. Both are starting points with `TODO`s — improving them is the job.
- One example test on each side shows the Vitest setup works
  (`client/src/lib/format.test.ts`, `server/src/normalize.test.ts`).

You are free to restructure anything, swap libraries, or replace the naive
baseline entirely. Nothing here is sacred.

## Setup

Requires **Node 22+** (`.nvmrc` pins the supported Node.js 22 LTS line).

> `npm install` may print an `npm audit` warning. It comes from dev-only build
> tooling (esbuild via Vite/Vitest) and doesn't affect the app you ship — safe
> to ignore for this exercise.

```bash
npm install                 # installs both workspaces
cp .env.example .env        # then add your key (see below)
npm run dev                 # runs client + server together
```

Open http://localhost:5173.

### API key

The reference proxy targets **Unsplash**. Grab a free demo key at
<https://unsplash.com/developers> and put it in `.env`:

```
UNSPLASH_ACCESS_KEY=your_key_here
```

Prefer TMDB or the (no-key) Art Institute of Chicago API? Swap the upstream call
in `server/src/search.ts` and the normalizer in `server/src/normalize.ts`, and
note the choice in `DECISIONS.md`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Run client + server with hot reload |
| `npm test` | Run all tests once |
| `npm run typecheck` | Type-check both workspaces |
| `npm run build` | Production build of both |

Per-workspace: `npm run test -w client`, `npm run dev -w server`, etc.

## Before you submit

- Fill in **`DECISIONS.md`** (see `CHALLENGE.md` — it's the most important
  artifact you'll produce).
- Make sure `npm install && npm run dev` works from a clean clone in under
  5 minutes, and that `npm test` and `npm run typecheck` pass.
- Small, meaningful commits > one big dump.
