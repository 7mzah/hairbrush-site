import Link from "next/link";

// The single way back to the product page. Two places render it — the top of
// the checkout and the foot of the order summary — and they used to be two
// names ("Back to product" / "Return to product") for one destination, each a
// ~20px-tall text target. One definition keeps the label, the hit area and the
// chevron identical wherever the control appears.
//
// The chevron is the same authored polyline the lightbox ships (stroke 2.4) and
// not a "←" glyph: the craft floor refuses Unicode standing in for an icon
// system, and the site already has one drawn set. Going back is the product
// page's only job here, so the icon points the way it travels.
export default function BackLink({ className = "" }) {
  return (
    <Link href="/" className={`backlink${className ? ` ${className}` : ""}`}>
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
