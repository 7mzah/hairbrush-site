"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { consumeFromProduct } from "@/lib/navState";

// The checkout's exit — and the guard that makes the browser's own back button
// agree with it.
//
// Leaving /order was a one-way problem in two ways. href="/" pushed, so a
// shopper who left with the pill and then pressed back was sent *into* the
// checkout again. And a shopper who arrived on /order first — an ad click, a
// link in a chat app, a typed URL — had nothing of ours behind them, so back
// dropped them straight out of the store.
//
// Both are the same question, "what is behind this page?", so it is asked once
// on mount:
//
//   came from the product page — the buy box's Order now links mark the trip:
//     the real entry is behind us. Back goes to it, gallery photo and all.
//
//   landed on /order directly:
//     nothing is behind us. So push a second /order entry and intercept the pop
//     that reaches it, replacing that entry with the product page. Back now
//     lands on the product page, no second checkout is left behind us, and the
//     landing itself still renders the checkout straight away — no flash of a
//     page the shopper did not ask for.
//
// Either way the pill is a plain history.back(). null means the marker has not
// been read yet (server render, first paint) and the pill falls back to its
// replace Link.
//
// The chevron is the same authored polyline the lightbox ships (stroke 2.4)
// rather than an "←" glyph: the craft floor refuses Unicode standing in for an
// icon system, and the site already has one drawn set.
export default function BackToProduct() {
  const router = useRouter();
  const [fromProduct, setFromProduct] = useState(null);
  const readOnce = useRef();
  const seeded = useRef(false);

  useEffect(() => {
    // The read consumes the marker, so it must happen once per mount: React
    // double-invokes mount effects in development, and a second read would
    // report "landed here directly" and install a sentinel the shopper's real
    // product-page entry behind them does not need.
    if (readOnce.current === undefined) readOnce.current = consumeFromProduct();
    setFromProduct(readOnce.current);
  }, []);

  useEffect(() => {
    // Only the landing case needs a sentinel: when the real product entry is
    // behind us, back already lands on it.
    if (fromProduct !== false) return;
    if (!seeded.current) {
      seeded.current = true;
      window.history.pushState(window.history.state, "", window.location.href);
    }
    const onPop = () => router.replace("/");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [fromProduct, router]);

  return (
    <Link
      href="/"
      replace
      className="backlink"
      onClick={(event) => {
        if (fromProduct === null) return;
        event.preventDefault();
        router.back();
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="15 5 8 12 15 19" />
      </svg>
      Back to product
    </Link>
  );
}
