# AGENTS.md

Single-page Next.js (App Router) product site with cash-on-delivery ordering, backed by libSQL via `@libsql/client` (Turso in the cloud, a local file in dev). Full env-var table and deploy notes are in `README.md`.

There is **no lint, test, typecheck, or formatter tooling** — do not invent `npm run lint` / `npm test`. `npm run build` is the only automated verification.

## Commands

- `npm run dev` — dev server, hot reload.
- `npm run build && npm run start` — production preview. `npm run start` fails unless you ran `build` first.
- `PORT=3111 npm run start` — pick a port so you don't collide with a server left running.

## Architecture

- `app/page.js` — the entire site in one server component (static, prerendered). All visible content edits go here.
- `app/OrderForm.js` and `app/Gallery.js` — the only two `"use client"` files. The form posts JSON to `/api/orders`; the gallery owns the main-image and thumbnail-rail state.
- `app/api/orders/route.js` — `POST` inserts an order; `GET` returns every order, requiring header `x-admin-key` to match `ADMIN_KEY`. `GET` returns 401 when `ADMIN_KEY` is unset — intentional, not a bug.
- `lib/config.js` — single source of truth for `PRODUCT` (`brand`, `name`, price, currency, `currencyCode`), plus optional `DELIVERY` and `CONTACT` blocks, and `SITE_URL`. Page prices, `app/layout.js` metadata, OpenGraph and the JSON-LD offer all derive from it; never hardcode the price or product name elsewhere. `PRODUCT.name` is the *product* ("Double Bristle Vented Brush"); `PRODUCT.brand` is the *brand* — JSON-LD uses `name` for `Product.name` and `brand` for `Brand.name`, and the footer shows `brand`.
- `lib/db.js` — manages database connection via `@libsql/client`. Supports cloud Turso (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`) for Vercel and local file fallback (`orders.db`). Runs `CREATE TABLE IF NOT EXISTS` automatically.
- `lib/notify.js` — best-effort new-order notification; every error is swallowed so it can never fail an order.
- `lib/rateLimit.js` — in-memory sliding-window limiter, not shared across replicas.
- Path alias `@/*` → repo root (`jsconfig.json`), e.g. `@/lib/config`.

## Editing content

- The FAQ is one `FAQ` array in `app/page.js` feeding **both** the `<details>` markup and the `FAQPage` JSON-LD. Edit the array, never just the HTML, or the two drift apart.
- JSON-LD must stay a **single root object with `@graph`** — a top-level array is valid JSON-LD but makes consumers that call `node["@context"]` throw. Keep the `<` → `\u003c` escape when stringifying.
- Gallery images come from the `PHOTOS` array in the same file (also feeds the JSON-LD `image` list); files live in `public/`. Those photos are **not tracked in git** — do not delete them. Current shots are placeholders — re-check alt text on reshoot.
- Stack is Next 16 / React 19.

## Environment (`.env.local`, gitignored)

- `SITE_URL` — **required in production.** Defaults to `http://localhost:3000`, so canonical, OG and sitemap URLs silently point at localhost without it.
- `ADMIN_KEY` — enables `GET /api/orders`.
- `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`, or `ORDER_WEBHOOK_URL` — optional new-order notification. Without either, orders just accumulate in the DB with no signal.

## Gotchas when testing

- `POST /api/orders` allows **3 requests/minute per IP**, then returns `429`. It's in-memory, so restarting the server clears it — otherwise space out curl tests.
- The honeypot field `website` returns `{"ok":true}` **without writing a row**. Don't mistake it for a successful insert.
- Test orders land in the real `orders.db`, and there is no delete endpoint or admin UI. Remove your rows yourself when done.
- Notification problems only show up as `[notify]` lines in server logs; the order still succeeds.
- `orders.db` must live on a persistent disk (VPS, Railway, Render + disk). Vercel has none — Postgres there instead.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
