import Gallery from "./Gallery";
import QtyPicker from "./QtyPicker";
import { PRODUCT, DELIVERY, SITE_URL } from "@/lib/config";
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
        {/* The photo and the buy box travel together. They share a row from
            768px up, and the card sticks to the viewport top while the much
            taller photo scrolls past it — so this wrapper is what the card is
            allowed to travel within. Without it the card's sticky containing
            block is .product itself, and it slides over the copy below (measured
            at up to 256px of overlap at 640-767px). Keep them wrapped. */}
        <div className="buyrow">
          <Gallery photos={PHOTOS} />

          <div id="order" className="buybox" tabIndex={-1}>
            <p className="price">
              <span className="cur">{currency}</span>
              {price.toFixed(2)}
            </p>
            {/* Availability sits with the price, where the shopper asks it. Stated
                in words and the brand's own confirmation tone: amber is spent on
                the one primary action below, so a borrowed "in stock" green (or a
                second amber mark) would pull attention off the CTA. Matches the
                offer's schema.org `InStock` availability. */}
            <p className="stock">In Stock</p>
            <QtyPicker />
            {/* The reassurances directly under the CTA. Plain <details> like the
                .acc rows, so this page stays a server component; <summary> holds
                an <h2> so heading navigation survives (same reasoning as the .acc
                rows above). Ships open: "cash on delivery" is the answer to the
                single biggest COD objection and it was the one line a shopper had
                to un-hide to find. */}
            <details className="bb-more" open>
              <summary>
                <h2>Returns, gift options &amp; payment</h2>
              </summary>
              <dl className="bb-rows">
                <div>
                  <dt>Returns</dt>
                  <dd>7-day replacement on defective items</dd>
                </div>
                <div>
                  <dt>Gift options</dt>
                  <dd>Available at checkout</dd>
                </div>
                <div>
                  <dt>Payment</dt>
                  <dd>Cash on delivery</dd>
                </div>
                {/* Only once lib/config's DELIVERY block is filled in — the
                    courier quote is still outstanding, so the row is absent
                    rather than saying "TBD". fee is a display string ("$3",
                    "Free"), so it is never added to a total. */}
                {(DELIVERY.fee || DELIVERY.note) && (
                  <div>
                    <dt>Delivery</dt>
                    <dd>{[DELIVERY.fee, DELIVERY.note].filter(Boolean).join(" — ")}</dd>
                  </div>
                )}
              </dl>
            </details>
          </div>
        </div>

        <div className="panel">
          <div className="titleblock">
            {/* Derived from lib/config: the h1 and PRODUCT.name can no longer
                drift apart the way they did when this was hardcoded. */}
            <h1>{name}</h1>
            {/* No price here. It used to reappear at >=1200px on the theory that
                the third column put the buy box "a screen away" from the title;
                measured at 1200x900 the two were 117px apart, both above the
                fold, at two different sizes — one number stated twice in a single
                viewport. The card carries it. */}
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
      </section>

    </main>
  );
}
