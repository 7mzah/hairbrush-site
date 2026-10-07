import { getDb } from "@/lib/db";
import { PRODUCT } from "@/lib/config";
import { notifyNewOrder } from "@/lib/notify";
import { rateLimit, clientIp } from "@/lib/rateLimit";
export const runtime = "nodejs";
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (b.website) return Response.json({ ok: true }); // honeypot: pretend it worked

  if (!rateLimit(`order:${clientIp(req)}`))
    return Response.json(
      { error: "Too many orders just now. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": "60" } }
    );

  const name = clean(b.name, 80), phone = clean(b.phone, 20), city = clean(b.city, 60), address = clean(b.address, 200);
  const qty = Math.min(Math.max(parseInt(b.qty, 10) || 1, 1), 10);
  if (!name || !city || !address || phone.replace(/\D/g, "").length < 7)
    return Response.json({ error: "Please fill in every field with a valid phone number." }, { status: 400 });

  const total = qty * PRODUCT.price;
  const db = await getDb();
  const info = await db.execute({
    sql: "INSERT INTO orders(name,phone,city,address,qty,total) VALUES (?,?,?,?,?,?)",
    args: [name, phone, city, address, qty, total],
  });
  const order = { id: Number(info.lastInsertRowid), name, phone, city, address, qty, total, currency: PRODUCT.currency };

  void notifyNewOrder(order); // never blocks or fails the order
  return Response.json({ ok: true, id: order.id });
}

export async function GET(req) { // view orders: send header x-admin-key
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const db = await getDb();
  const result = await db.execute("SELECT * FROM orders ORDER BY id DESC");
  return Response.json(result.rows);
}
