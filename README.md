# Hairbrush site
Next.js (App Router) + route handlers + SQLite via `@libsql/client` — Turso in the cloud, or a local `orders.db` file.
1. `npm install && npm run dev`
2. Set the brand, product name, price and currency in `lib/config.js`; put your photo in `public/` and swap it into `app/page.js`.

## Environment
Set these where you deploy (a `.env.local` works locally):

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | production | Canonical URL used for metadata, `robots.txt` and `sitemap.xml` (e.g. `https://example.com`) |
| `ADMIN_KEY` | to read orders | `GET /api/orders` with header `x-admin-key` |
| `DB_PATH` | no | Where `orders.db` lives (defaults to the project root) |
| `TURSO_DATABASE_URL` | for cloud | Turso/libSQL connection string (`libsql://…`). Unset = falls back to a local `orders.db` file |
| `TURSO_AUTH_TOKEN` | with `TURSO_DATABASE_URL` | Turso API token; required for any `libsql://` URL |
| `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID` | no | New-order message on Telegram |
| `ORDER_WEBHOOK_URL` | no | Fallback: `POST { event: "order.created", order }` to your own endpoint |
| `PLAUSIBLE_DOMAIN` | no | Plausible site domain (e.g. `example.com`). Unset = no analytics tag is injected at all |
| `PLAUSIBLE_SCRIPT` | no | Custom Plausible script URL for self-hosted instances; defaults to `https://plausible.io/js/script.js` |

New orders are written to the database and, if `TELEGRAM_*` or `ORDER_WEBHOOK_URL` is set, announced right away. Without either, orders just accumulate until you read them.

A successful order also fires an `Order Completed` event to Plausible when `PLAUSIBLE_DOMAIN` is set. That count is the baseline to compare any page change against.

`lib/config.js` also holds two optional blocks — `DELIVERY` (`fee`, `note`) and `CONTACT` (`phone`, `whatsapp`). Leave them empty and nothing renders; fill them in and the trust row and footer pick them up with no other edits.

`POST /api/orders` is rate limited to 3 requests per minute per IP and has a honeypot field for bots.

## Deploy
Cloud sqlite database Turso or Google cloud sql for sqlite database and cloud storage for images and frontend on Vercel.
