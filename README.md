# Hairbrush site
Next.js 14 (App Router) + route handlers + SQLite (better-sqlite3).
1. `npm install && npm run dev`
2. Set your product name in `lib/config.js`; put your photo in `public/` and swap it into `app/page.js`.
3. Orders are stored in `orders.db`. To view: set `ADMIN_KEY`, then `GET /api/orders` with header `x-admin-key`.
Deploy on a host with a persistent disk (VPS, Railway, Render + disk). Vercel has no persistent disk, so use Postgres there instead.
