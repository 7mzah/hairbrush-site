"use client";
import { useEffect, useRef, useState } from "react";
import { markFromProduct } from "@/lib/navState";

const clamp = (n) => Math.min(10, Math.max(1, Number(n) || 1));

// The quantity choice lives in the buy box; "Order now" hands it to the
// checkout as ?qty=N so /order opens with the same count in its summary.
// The picker prints no price of its own: the buy box states it once, and a
// running total appearing on the button — and again in the sticky bar — as the
// count changed was noise beside a figure the shopper had already read.
export default function QtyPicker() {
  const [qty, setQty] = useState(1);
  const ctaRef = useRef(null);
  // Below 640px the buy box sits ~800px down the page, so once it scrolls
  // away the only CTA is far above the thumb. A slim sticky bar (the Amazon/
  // Shopify mobile pattern) appears only after the real CTA leaves the
  // viewport — not before, so it never competes with the buy box itself.
  const [barOn, setBarOn] = useState(false);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setBarOn(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div className="qty-wrap">
      <span>Quantity</span>
      <div className="qty" role="group" aria-label="Quantity">
        <button
          type="button"
          aria-label="Decrease quantity"
          disabled={qty <= 1}
          onClick={() => setQty((n) => clamp(n - 1))}
        >
          −
        </button>
        <output aria-live="polite">{qty}</output>
        <button
          type="button"
          aria-label="Increase quantity"
          disabled={qty >= 10}
          onClick={() => setQty((n) => clamp(n + 1))}
        >
          +
        </button>
      </div>
      {/* A real navigation, not next/link — deliberate, don't convert it back.
          The browser must create the checkout's history entry itself, in
          response to this click. A client-side navigation creates that entry
          with a scripted pushState instead, and browsers record an early
          scripted push as a replacement rather than an addition: Chromium
          within 5s of the load event, Firefox before it, and Safari once the
          click's activation has lapsed — which a slow connection guarantees,
          since the router waits for the checkout's data while the page is
          still loading. The product page then loses its entry, and the
          browser's back button skips straight past it, out of the store. A
          document load always pushes an entry. */}
      <a className="btn" href={`/order?qty=${qty}`} ref={ctaRef} onClick={markFromProduct}>
        Order now
      </a>
      {/* Same destination and same real-navigation reason as the button above;
          hidden from tab order and assistive tech until it is actually on
          screen. */}
      <div className={`sticky-cta${barOn ? " is-on" : ""}`} aria-hidden={!barOn}>
        <a className="btn" href={`/order?qty=${qty}`} tabIndex={barOn ? 0 : -1} onClick={markFromProduct}>
          Order now
        </a>
      </div>
    </div>
  );
}
