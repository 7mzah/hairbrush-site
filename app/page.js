import OrderForm from "./OrderForm";
import Gallery from "./Gallery";
import { PRODUCT, SITE_URL, DELIVERY, CONTACT } from "@/lib/config";
const { price, currency, currencyCode, name, brand } = PRODUCT;

// Single source for the gallery AND the JSON-LD image list.
// Placeholder shots — alt text must be re-checked on reshoot.
const PHOTOS = [
  ["brush-bristles", "Curved vented paddle hairbrush held in one hand"],
  ["brush-front", "Front of the paddle showing the ball-tipped bristle rows"],
  ["brush-curve", "Angled view showing the curve of the paddle"],
  ["brush-side", "Back of the paddle showing the vent slots"],
  ["brush-back", "Bristle face showing the mixed nylon and boar bristles"],
];

// Product details table. Sourced from the supplier spec sheet, except Brand
// (lib/config) and the Shape/Bristles/Water resistance wording, which repeats
// the approved copy. "Coffee Material + ABS" is the supplier's own term — keep
// it: an ABS body and a plastic handle are the same claim stated twice, so the
// spec table does not need to re-describe it. FAQ #1 is where it gets spelled
// out for the customer.
// Do not add Alibaba sales counts, store ratings or supplier reviews here —
// those are the supplier's metrics, not ours.
const DETAILS = [
  ["Brand", brand],
  ["Material", "Coffee Material + ABS"],
  ["Shape", "Curved, vented paddle"],
  ["Bristles", "Ball-tipped nylon pins with boar bristles"],
  ["Water resistance", "Waterproof body"],
  ["Hair type", "Wet or dry hair"],
];

// Supplier's "single package size" / "single gross weight" — the box, not the
// brush, which is why the row is titled "Package Size & Weight".
const PACKAGE = [
  ["Size", "26.9 × 10.3 × 9.3 cm"],
  ["Weight", "85 g"],
];

// The FAQ feeds the <details> markup AND the FAQPage JSON-LD — edit here, never
// the HTML beside it. The last answer is conditional for the same reason TRUST
// is: without a phone number, "call us" would be an instruction the reader
// cannot follow.
const FAQ = [
  [
    "What is it made of?",
    "An ABS plastic body and handle, with a mix of nylon and boar bristles.",
  ],
  ["How do I pay?", "Cash on delivery. You pay when the brush is in your hands."],
  ["How much is delivery?", "We tell you the delivery price when we call to confirm your order."],
  [
    "How long does delivery take?",
    "You agree on a delivery time when we call, so you know when to expect it.",
  ],
  [
    "What if I change my mind?",
    CONTACT.phone
      ? `Tell the courier before paying, or call ${CONTACT.phone} before it goes out and we will cancel it.`
      : "Tell the courier before paying. You are not charged if you refuse it.",
  ],
];

// Reassurance shown next to the CTA. Conditional rows drop out when their
// config value is empty, so an unfilled slot never renders as a placeholder.
const TRUST = [
  "Cash on delivery",
  DELIVERY.note,
  CONTACT.phone ? `Questions? Call ${CONTACT.phone}` : null,
].filter(Boolean);

function Trust() {
  if (TRUST.length === 0) return null;
  return (
    <ul className="trust">
      {TRUST.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

// One root object with @graph: valid JSON-LD, and it survives naive consumers
// that do node["@context"] on the root (a top-level array makes those throw).
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Product",
      name,
      description: "A curved, vented detangling brush safe on wet or dry hair, with ball-tipped nylon pins and boar bristles.",
      brand: { "@type": "Brand", name: brand },
      image: PHOTOS.map(([f]) => `${SITE_URL}/${f}.jpg`),
      offers: {
        "@type": "Offer",
        url: SITE_URL,
        priceCurrency: currencyCode,
        price: String(price),
        availability: "https://schema.org/InStock",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(([q, a]) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
  ],
};
const jsonLd = JSON.stringify(structuredData).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <header className="site">
        <div className="inner">
          <a className="wordmark" href="/" translate="no">
            {brand}
          </a>
        </div>
      </header>

      <section className="product">
        <Gallery photos={PHOTOS} />

        <div className="panel">
          <div className="titleblock">
            <h1>
              Double Bristle Vented Detangling Brush for Wet or Dry Hair, Curved Paddle with Two
              Bristle Types for Knots &amp; Smooth Hair
            </h1>
            {/* The lede sits under the title rather than after the byline: the h1
                is 21 words of keyword formula, so the plain-language benefit
                sentence should be the very next thing the reader hits. */}
            <p className="lede">A curved, vented brush that dries and detangles wet hair in one pass.</p>
            <p className="byline">
              by <span translate="no">{brand}</span>
            </p>
            {/* Desktop only (>=1000px). The buy box already carries $7 and on
                narrower screens it sits right under the title, so a second price
                there is noise rather than information. */}
            <p className="price">
              <span className="cur">{currency}</span>
              {price}
            </p>
          </div>

          <div className="copyblock">
            {/* One column of disclosure rows. <summary> holds an <h2> so heading
                navigation survives (HTML allows summary to contain exactly one
                h1-h6) while the whole row stays clickable. Non-exclusive by
                design: plain <details>, no JS, so this stays a server component. */}
            <div className="acc">
              <details>
                <summary>
                  <h2>About This Item</h2>
                </summary>
                <ul className="bullets">
                  <li>
                    <b>Curved head.</b> The paddle follows the scalp, so one stroke covers more
                    of it.
                  </li>
                  <li>
                    <b>Vented slots.</b> Blow-dryer heat reaches the hair underneath while you
                    brush.
                  </li>
                  <li>
                    <b>Two bristle types.</b> Ball-tipped nylon pins clear the knots, boar
                    bristles smooth the hair.
                  </li>
                </ul>
              </details>

              <details>
                <summary>
                  <h2>Product Details</h2>
                </summary>
                <dl className="spec">
                  {DETAILS.map(([label, value]) => (
                    <div className="spec-row" key={label}>
                      <dt>{label}</dt>
                      {/* brand names should not be machine-translated */}
                      <dd translate={label === "Brand" ? "no" : undefined}>{value}</dd>
                    </div>
                  ))}
                </dl>
              </details>

              <details>
                <summary>
                  <h2>Package Size &amp; Weight</h2>
                </summary>
                <dl className="spec">
                  {PACKAGE.map(([label, value]) => (
                    <div className="spec-row" key={label}>
                      <dt>{label}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            </div>
          </div>
        </div>

        <div id="order" className="buybox" tabIndex={-1}>
          <p className="price">
            <span className="cur">{currency}</span>
            {price}
          </p>
          <h2>Order in One Minute</h2>
          <p className="reassure">
            Fill in your details and we will call to confirm, then deliver to you.
          </p>
          <OrderForm price={price} currency={currency} />
          <Trust />
        </div>
      </section>

      <section className="faq">
        <h2>Common Questions</h2>
        {FAQ.map(([q, a]) => (
          <details key={q}>
            <summary>{q}</summary>
            <p>{a}</p>
          </details>
        ))}
      </section>

      <footer>
        <p className="foot-product" translate="no">
          {name}
        </p>
        {/* the year is rendered at build time and again on hydration, so a year
            rollover between the two must not raise a mismatch */}
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} <span translate="no">{PRODUCT.brand}</span>
        </p>
        {(CONTACT.phone || CONTACT.whatsapp) && (
          <p className="contact">
            {CONTACT.phone ? (
              <a href={`tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`}>{CONTACT.phone}</a>
            ) : null}
            {CONTACT.phone && CONTACT.whatsapp ? " · " : null}
            {CONTACT.whatsapp ? (
              <a
                href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </a>
            ) : null}
          </p>
        )}
      </footer>
    </main>
  );
}
