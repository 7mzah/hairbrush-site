"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { consumeFromProduct } from "@/lib/navState";

// The checkout's single exit.
//
// Plain href="/" made this a trap: it pushed, so the shopper who left the
// checkout with it and then pressed the browser's back button was sent back
// into the checkout — the one direction back must never point. Both branches
// below fix that by not leaving a second checkout behind:
//
//   arrived from the product page -> history.back(), landing on the exact entry
//                                    they came from (gallery photo and all).
//   landed on /order directly     -> Link's replace, so the checkout entry
//                                    becomes the product page and back goes to
//                                    wherever they arrived from.
//
// The chevron is the same authored polyline the lightbox ships (stroke 2.4)
// rather than an "←" glyph: the craft floor refuses Unicode standing in for an
// icon system, and the site already has one drawn set.
export default function BackToProduct() {
  const router = useRouter();
  return (
    <Link
      href="/"
      replace
      className="backlink"
      onClick={(event) => {
        if (!consumeFromProduct()) return;
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
