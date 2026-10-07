"use client";
import { useState } from "react";
const money = (n, c) => c + new Intl.NumberFormat("en-US").format(n);

// Analytics must never be able to fail an order, so swallow everything.
function track(name) {
  try { window.plausible?.(name); } catch {}
}
export default function OrderForm({ price, currency }) {
  const [qty, setQty] = useState(1);
  const [state, setState] = useState({ status: "idle", msg: "" });
  async function submit(e) {
    e.preventDefault();
    const form = e.target; // hold onto it: e.target is not reliable after await
    setState({ status: "sending", msg: "" });
    try {
      const data = Object.fromEntries(new FormData(form));
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset(); setQty(1);
        setState({ status: "done", msg: "Order received. We will call you to confirm delivery." });
        track("Order Completed"); // the conversion event
      }
      else setState({ status: "error", msg: out.error || "Something went wrong. Please try again." });
    } catch {
      setState({ status: "error", msg: "We could not reach the server. Check your connection and try again." });
    }
  }
  return (
    <form onSubmit={submit} className="form">
      <label>Full name<input name="name" required autoComplete="name" placeholder="Sara Haddad…" /></label>
      <label>Phone number<input name="phone" type="tel" inputMode="tel" required autoComplete="tel" placeholder="03 123 456…" /></label>
      <div className="row">
        <label>City or town<input name="city" required autoComplete="address-level2" placeholder="Zahlé…" /></label>
        <div className="qty-wrap">
          <span className="qty-cap">Quantity</span>
          <div className="qty" role="group" aria-label="Quantity">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={Number(qty) <= 1}
              onClick={() => setQty((n) => Math.max(1, (Number(n) || 1) - 1))}
            >
              −
            </button>
            <output aria-live="polite">{qty}</output>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={Number(qty) >= 10}
              onClick={() => setQty((n) => Math.min(10, (Number(n) || 1) + 1))}
            >
              +
            </button>
          </div>
          {/* the stepper is not a native input, so carry the value explicitly */}
          <input type="hidden" name="qty" value={qty} />
        </div>
      </div>
      <label>Delivery address<textarea name="address" rows="2" required autoComplete="street-address" placeholder="Street, building, floor…" /></label>
      <input name="website" className="hp" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <button disabled={state.status === "sending"}>
        <span className="cta-main">{state.status === "sending" ? "Sending…" : "Order now"}</span>
        <span className="cta-sub">Pay {money((Number(qty) || 1) * price, currency)} on delivery</span>
      </button>
      <p role="status" aria-live="polite" className={state.status}>{state.msg}</p>
    </form>
  );
}
