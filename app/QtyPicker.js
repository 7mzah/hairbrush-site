"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
      <Link className="btn" href={`/order?qty=${qty}`} ref={ctaRef} onClick={markFromProduct}>
        Order now
      </Link>
      {/* Same destination as the button above; hidden from tab order and
          assistive tech until it is actually on screen. */}
      <div className={`sticky-cta${barOn ? " is-on" : ""}`} aria-hidden={!barOn}>
        <Link className="btn" href={`/order?qty=${qty}`} tabIndex={barOn ? 0 : -1} onClick={markFromProduct}>
          Order now
        </Link>
      </div>
    </div>
  );
}
