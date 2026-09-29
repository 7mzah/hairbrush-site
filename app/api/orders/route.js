import db from "@/lib/db";
import { PRODUCT } from "@/lib/config";
export const runtime = "nodejs";
const clean = (v, max) => String(v ?? "").trim().slice(0, max);

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (b.website) return Response.json({ ok: true }); // honeypot
  const name = clean(b.name, 80), phone = clean(b.phone, 20), city = clean(b.city, 60), address = clean(b.address, 200);
  const qty = Math.min(Math.max(parseInt(b.qty) || 1, 1), 10);
  if (!name || !city || !address || phone.replace(/\D/g, "").length < 7)
    return Response.json({ error: "Please fill in every field with a valid phone number." }, { status: 400 });
  const info = db.prepare("INSERT INTO orders(name,phone,city,address,qty,total) VALUES (?,?,?,?,?,?)")
    .run(name, phone, city, address, qty, qty * PRODUCT.price);
  return Response.json({ ok: true, id: info.lastInsertRowid });
}

export async function GET(req) { // view orders: send header x-admin-key
  if (!process.env.ADMIN_KEY || req.headers.get("x-admin-key") !== process.env.ADMIN_KEY)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(db.prepare("SELECT * FROM orders ORDER BY id DESC").all());
}
