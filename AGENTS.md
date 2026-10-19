# AGENTS.md

Next.js (App Router) product site with cash-on-delivery ordering: a product page (`app/page.js`) and a separate `/order` checkout page (`app/order/page.js`), backed by libSQL via `@libsql/client` (Turso in the cloud, a local file in dev). Full env-var table and deploy notes are in `README.md`.

There is **no lint, test, typecheck, or formatter tooling** — do not invent `npm run lint` / `npm test`. `npm run build` is the only automated verification.

## Commands

- `npm run dev` — dev server, hot reload.
- `npm run build && npm run start` — production preview. `npm run start` fails unless you ran `build` first.
- `PORT=3111 npm run start` — pick a port so you don't collide with a server left running.

## Architecture

- `app/page.js` — the product page (server component, static, prerendered). All visible product-page content edits go here; its buy-box CTA links to `/order`.
- `app/order/page.js` — the `/order` checkout page (server component, noindexed): back link, order-summary card, and the form. Checkout-page copy edits go here.
- `app/OrderForm.js`, `app/Gallery.js` and `app/Combobox.js` — the only three `"use client"` files. OrderForm is the `/order` form (summary card, the read-only quantity it reads from `?qty`, and an in-place confirmation panel after success; it also owns the page `<h1>`, so a placed order retitles the page instead of keeping "Complete your order") and posts JSON to `/api/orders`; the gallery owns the main-image and thumbnail-rail state; the combobox is the type-to-filter input used for district and village. Both lists open on focus; the village is scoped to the chosen district and offers closest-spelling suggestions when nothing matches exactly. Typing filters, but only a listed option may be submitted — free-typed locations are rejected client-side.
- `app/api/orders/route.js` — `POST` inserts an order; `GET` returns every order, requiring header `x-admin-key` to match `ADMIN_KEY`. `GET` returns 401 when `ADMIN_KEY` is unset — intentional, not a bug.
- `lib/config.js` — single source of truth for `PRODUCT` (`brand`, `name`, `shortName`, price, currency, `currencyCode`), `MAX_QTY` (the per-order cap, re-clamped server-side), plus optional `DELIVERY` and `CONTACT` blocks, and `SITE_URL`. Page prices, `app/layout.js` metadata, OpenGraph and the JSON-LD offer all derive from it; never hardcode the price or product name elsewhere. `PRODUCT.name` is the *product title* (a long Amazon-style title, and the `<h1>`); `PRODUCT.shortName` is the short label for the footer and the order receipt; `PRODUCT.brand` is the *brand* — JSON-LD uses `name` for `Product.name` and `brand` for `Brand.name`, and the footer's © line shows `brand`. `DELIVERY.fee`/`DELIVERY.note` are display strings surfaced in the buy box's Delivery row and in the `/order` delivery row; empty means the row is absent.
- `lib/db.js` — manages database connection via `@libsql/client`. Supports cloud Turso (`TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`) for Vercel and local file fallback (`orders.db`). Runs `CREATE TABLE IF NOT EXISTS` automatically.
- `lib/notify.js` — best-effort new-order notification; every error is swallowed so it can never fail an order.
- `lib/rateLimit.js` — in-memory sliding-window limiter, not shared across replicas.
- Path alias `@/*` → repo root (`jsconfig.json`), e.g. `@/lib/config`.

## Editing content

- The FAQ ("Common Questions") section was removed: there is no `FAQPage` JSON-LD anymore. If it is ever re-added, wire the same array to **both** the `<details>` markup and the JSON-LD so they cannot drift apart.
- JSON-LD must stay a **single root object with `@graph`** — a top-level array is valid JSON-LD but makes consumers that call `node["@context"]` throw. Keep the `<` → `\u003c` escape when stringifying.
- Gallery images come from the `PHOTOS` array in the same file (also feeds the JSON-LD `image` list); files live in `public/`. Those photos are **not tracked in git** — do not delete them. Current shots are placeholders — re-check alt text on reshoot. The brief for the real shoot is `SHOTLIST.md` (five 4:5 shots at 1200×1500 plus a 1200×630 OG card); its filenames differ from the placeholders, so the reshoot also updates `PHOTOS` and the OG image in `app/layout.js`.
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
