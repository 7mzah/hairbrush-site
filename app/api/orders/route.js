import { after } from "next/server";
import { getDb } from "@/lib/db";
import { PRODUCT, clampQty } from "@/lib/config";
import { notifyNewOrder } from "@/lib/notify";
import { rateLimit, clientIp } from "@/lib/rateLimit";
import AREAS from "@/lib/areas.json";
export const runtime = "nodejs";
const clean = (v, max) => String(v ?? "").trim().slice(0, max);
// The form sends a district id; store the human name in the order.
const districtName = (id) => AREAS.districts.find((d) => d.id === id)?.name || "";

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  // honeypot: pretend it worked so bots learn nothing — but say so in the logs,
  // otherwise a dropped order looks identical to a missing notification.
  if (b.website) {
    console.warn(`[orders] honeypot filled by ${clientIp(req)} — faked success, not saved`);
    return Response.json({ ok: true });
  }

  if (!rateLimit(`order:${clientIp(req)}`)) {
    console.warn(`[orders] rate limited: ${clientIp(req)}`);
    return Response.json(
      { error: "Too many orders just now. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const name = clean(b.name, 80), phone = clean(b.phone, 20), city = clean(b.city, 60), address = clean(b.address, 200);
  // The form sends a district id, or an explicit null when the typed village
  // isn't in our dataset (the courier sorts those out on the confirmation
  // call). A tab opened before this deploy sends no district key at all —
  // that customer filled in every field they could see, so accept all of
  // these (district stays null) rather than bounce a real order with a 400
  // they cannot diagnose. An id we don't know is still garbage: reject that.
  const legacyClient = b.district === undefined;
  const rawDistrict = clean(b.district, 40);
  const district = rawDistrict ? districtName(rawDistrict) : "";
  // Same helper the checkout uses: a whole number in [1, MAX_QTY], whatever the
  // request body claims.
  const qty = clampQty(b.qty);
  const phoneDigits = phone.replace(/\D/g, "").length;
  if (!name || !city || !address || (rawDistrict && !district) || phoneDigits < 7) {
    console.warn(
      `[orders] rejected 400: ${[!name && "name", !city && "city", !address && "address", rawDistrict && !district && "unknown district", phoneDigits < 7 && "phone"].filter(Boolean).join(", ")}`
    );
    return Response.json({ error: "Please fill in every field with a valid phone number." }, { status: 400 });
  }
  if (!district) {
    if (legacyClient) console.warn(`[orders] order from a pre-district client — stored without a district`);
    else console.warn(`[orders] village not in the dataset — stored without a district`);
  }

  const total = qty * PRODUCT.price;
  const db = await getDb();
  const info = await db.execute({
    sql: "INSERT INTO orders(name,phone,district,city,address,qty,total) VALUES (?,?,?,?,?,?,?)",
    args: [name, phone, district || null, city, address, qty, total],
  });
  const order = { id: Number(info.lastInsertRowid), name, phone, district: district || null, city, address, qty, total, currency: PRODUCT.currency };

  // Start the notification now, and hand the promise to `after()` so the
  // serverless invocation stays alive until it settles (Vercel waitUntil).
  // Without this the function can freeze right after the response and the
  // Telegram send is silently dropped. Never blocks or fails the order.
  const notify = notifyNewOrder(order);
  after(() => notify);
  return Response.json({ ok: true, id: order.id });
}

export async function GET(req) { // view orders: send header x-admin-key
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const result = await db.execute("SELECT * FROM orders ORDER BY id DESC");
  return Response.json(result.rows);
}
