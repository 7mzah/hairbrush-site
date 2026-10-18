import Gallery from "./Gallery";
import QtyPicker from "./QtyPicker";
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
// (lib/config) and the Shape/Bristles wording, which repeats the approved copy.
// "Coffee Material + ABS" is the supplier's own term — keep it: an ABS body and
// a plastic handle are the same claim stated twice, so the spec table does not
// need to re-describe it.
// The resistance row states water + heat resistance. "Waterproof" is the
// supplier's documented term; the heat side stays qualitative on purpose — the
// spec sheet carries no heat rating, so no temperature figure is claimed.
// Do not add Alibaba sales counts, store ratings or supplier reviews here —
// those are the supplier's metrics, not ours.
const DETAILS = [
  ["Brand", brand],
  ["Material", "Coffee Material + ABS"],
  ["Shape", "Curved, vented paddle"],
  ["Bristles", "Ball-tipped nylon pins with boar bristles"],
  ["Water & heat resistance", "Waterproof and heat resistant body"],
  ["Hair compatibility", "Straight, Wavy, Curly, Coily, Fine, Thick, Extensions & Wigs"],
];

// Supplier's "single package size" / "single gross weight" — the box, not the
// brush, which is why the row is titled "Package Size & Weight".
const PACKAGE = [
  ["Size", "26.9 × 10.3 × 9.3 cm"],
  ["Weight", "85 g"],
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
      description: "A curved, vented paddle hairbrush with dual boar and nylon bristles that detangles while you blow-dry, on wet or dry hair.",
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
  ],
};
const jsonLd = JSON.stringify(structuredData).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      <section className="product">
        <Gallery photos={PHOTOS} />

        <div className="panel">
          <div className="titleblock">
            {/* Derived from lib/config: the h1 and PRODUCT.name can no longer
                drift apart the way they did when this was hardcoded. */}
            <h1>{name}</h1>
            {/* Desktop only (>=1000px). The buy box already carries $7.00 and on
                narrower screens it sits right under the title, so a second price
                there is noise rather than information. */}
            <p className="price">
              <span className="cur">{currency}</span>
              {price.toFixed(2)}
            </p>
          </div>

          <div className="copyblock">
            {/* One column of disclosure rows. <summary> holds an <h2> so heading
                navigation survives (HTML allows summary to contain exactly one
                h1-h6) while the whole row stays clickable. Non-exclusive by
                design: plain <details>, no JS, so this stays a server component.
                "About This Item" ships open: on a single-product Persuade page
                the bullets ARE the argument — closed by default they turned the
                middle column into empty rows and left the value case unstated
                until the buy box. The other two stay closed:
                spec-sheet detail is look-up material, not persuasion. */}
            <div className="acc">
              <details open>
                <summary>
                  <h2>About This Item</h2>
                </summary>
                <ul className="bullets">
                  <li>
                    <b>Dual Bristle Synergy.</b> Boar bristles evenly distribute scalp sebum for
                    frizz-free glossy shine, while elongated flexible nylon ball-tipped pins
                    glide painlessly through stubborn knots.
                  </li>
                  <li>
                    <b>Ergonomic Scalp-Hugging Contour.</b> Custom anatomical curvature
                    maximizes surface contact against the skull, delivering an invigorating
                    scalp massage while brushing.
                  </li>
                  <li>
                    <b>High-Velocity Blow Dryer Vents.</b> Geometric aerodynamic open back
                    channels allow blow-dryer airflow directly onto wet hair strands.
                  </li>
                  <li>
                    <b>Universal Hair Type Performance.</b> Ideal for wet or dry straight,
                    wavy, curly, thick, coarse, and textured hair without snagging or bristle
                    distortion.
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
            {price.toFixed(2)}
          </p>
          <h2>Order in One Minute</h2>
          <p className="reassure">
            Fill in your details and we will call to confirm, then deliver to you.
          </p>
          <QtyPicker price={price} currency={currency} />
          <Trust />
        </div>
      </section>

    </main>
  );
}
