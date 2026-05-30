# bblist

A baby gift list ("Llista de regals del nadó") with a playful secret-name hero,
a guess-the-name game, and a one-tap reserve flow so guests don't double-buy.
Content is managed through an embedded Sanity Studio.

Built with [Astro](https://astro.build), [Sanity](https://www.sanity.io),
[Tailwind CSS](https://tailwindcss.com) and a React island for the registry UI,
deployed to Cloudflare Pages (with Pages Functions for guest submissions).

## Stack

- **Astro 6** — static site generation
- **Sanity** — headless CMS, with Studio embedded at `/studio` (hash routing)
- **React** — the interactive registry island (`src/components/Registry.tsx`)
- **Tailwind CSS 4** — used by the gift detail page
- **Cloudflare Pages Functions** — `functions/api/*` for name guesses & reservations
- **Núvol design system** — `src/styles/registry.css` (warm clay-coral + pastels,
  Bricolage Grotesque + Hanken Grotesk)

## Setup

Requires Node `>=22.12.0`.

```sh
pnpm install
cp .env.example .env
```

Fill in `.env` with values from [sanity.io/manage](https://sanity.io/manage):

| Variable                   | Purpose                                                   |
| :------------------------- | :-------------------------------------------------------- |
| `SANITY_STUDIO_PROJECT_ID` | Sanity project ID (required)                              |
| `SANITY_STUDIO_DATASET`    | Dataset name (defaults to `production`)                   |
| `SANITY_WRITE_TOKEN`       | Editor token — used by the gift script and the API functions |

## Commands

All commands are run from the project root:

| Command        | Action                                       |
| :------------- | :------------------------------------------- |
| `pnpm dev`     | Start the dev server at `localhost:4321`     |
| `pnpm build`   | Build the production site to `./dist/`       |
| `pnpm preview` | Preview the production build locally         |
| `pnpm astro`   | Run Astro CLI commands                       |

## Content

Edit gifts through the embedded Studio at `/studio` (e.g. `localhost:4321/studio`).

Each gift has a title, slug, description, image, external URL, approximate price,
category (`ropa`, `juguetes`, `libros`, `mobiliario`, `higiene`, `alimentacion`,
`otros`) and status (`available`, `purchased`, `hidden`). Only `available` gifts
are shown on the public site.

To bulk-add gifts, edit the `gifts` array in `scripts/add-gift.mjs` and run it
(needs `SANITY_WRITE_TOKEN`):

```sh
node scripts/add-gift.mjs
```

The script downloads each `imageUrl`, uploads it as a Sanity asset, and creates
the gift document with a generated slug.

## Reservations & name guesses

Guests can reserve a gift ("L'agafo jo") and propose a name. Both are handled by
Cloudflare Pages Functions in `functions/api/`, which write to Sanity using
`SANITY_WRITE_TOKEN` (kept server-side — it never reaches the browser):

| Endpoint             | Method | Effect                                                        |
| :------------------- | :----- | :------------------------------------------------------------ |
| `/api/reservations`  | GET    | Returns the current reservations (the live shared state)      |
| `/api/reserve`       | POST   | Reserves a gift; rejects with `409` if already taken          |
| `/api/release`       | POST   | Removes a reservation (the browser stores its own id)         |
| `/api/guess`         | POST   | Saves a name guess                                            |

Reservations are **shared across all visitors** (anti-double-buy): each one is a
`reservation` document, and a gift renders as "Ja triat" while a reservation for
its id exists. Name guesses become `nameGuess` documents. Both appear in Studio.

> Pages Functions don't run under `astro dev`/`astro preview` — the registry
> degrades gracefully (everything shows available) and the submissions no-op.
> To exercise them locally, build and run `npx wrangler pages dev ./dist` with
> the env vars set.

## Project structure

```text
/
├── functions/
│   └── api/                  # Cloudflare Pages Functions (reserve, release, guess…)
├── public/
├── scripts/
│   └── add-gift.mjs          # bulk gift importer
├── src/
│   ├── components/           # Registry island (home UI) + GiftCard (legacy)
│   ├── layouts/              # Base layout
│   ├── pages/                # index + regalo/[slug]
│   ├── sanity/               # client config, queries, categories, schema
│   └── styles/               # registry.css (Núvol) + global.css
├── astro.config.mjs
└── sanity.config.ts
```

## Deployment

Deployed to Cloudflare Pages, which serves the static Astro output and the
`functions/` directory automatically. The `_headers` file in `public/` sets HTTP
response headers. In the Cloudflare Pages project settings, set
`SANITY_STUDIO_PROJECT_ID`, `SANITY_STUDIO_DATASET` and `SANITY_WRITE_TOKEN` as
environment variables (the last is what lets the API functions write to Sanity).
