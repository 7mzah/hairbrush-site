"use client";
import { useState } from "react";
const money = (n, c) => c + new Intl.NumberFormat("en-US").format(n);
export default function OrderForm({ price, currency }) {
  const [qty, setQty] = useState(1);
  const [state, setState] = useState({ status: "idle", msg: "" });
  async function submit(e) {
    e.preventDefault();
    setState({ status: "sending", msg: "" });
    const data = Object.fromEntries(new FormData(e.target));
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    const out = await res.json().catch(() => ({}));
    if (res.ok) { e.target.reset(); setQty(1); setState({ status: "done", msg: "Order received. We will call you to confirm delivery." }); }
    else setState({ status: "error", msg: out.error || "Something went wrong. Please try again." });
  }
  return (
    <form onSubmit={submit} className="form">
      <label>Full name<input name="name" required autoComplete="name" placeholder="Sara Haddad…" /></label>
      <label>Phone number<input name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="03 123 456…" /></label>
      <div className="row">
        <label>City or town<input name="city" required autoComplete="address-level2" placeholder="Zahlé…" /></label>
        <label>Quantity<input name="qty" type="number" inputMode="numeric" min="1" max="10" autoComplete="off" value={qty} onChange={(e) => setQty(e.target.value)} /></label>
      </div>
      <label>Delivery address<textarea name="address" rows="2" required autoComplete="street-address" placeholder="Street, building, floor…" /></label>
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button disabled={state.status === "sending"}>{state.status === "sending" ? "Sending…" : `Order now, pay ${money((Number(qty) || 1) * price, currency)} on delivery`}</button>
      <p role="status" aria-live="polite" className={state.status}>{state.msg}</p>
    </form>
  );
}
