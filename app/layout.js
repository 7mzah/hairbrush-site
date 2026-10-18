import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { PRODUCT, SITE_URL, CONTACT } from "@/lib/config";

// Analytics is optional: unset PLAUSIBLE_DOMAIN and no tag is injected at all.
// A plain deferred tag (not next/script) so it loads without waiting on hydration.
const PLAUSIBLE_DOMAIN = process.env.PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SCRIPT = process.env.PLAUSIBLE_SCRIPT || "https://plausible.io/js/script.js";
const head = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-head", weight: ["600", "800"] });
const body = DM_Sans({ subsets: ["latin"], variable: "--f-body" });

// The product name now carries the brand, so no `| ${PRODUCT.brand}` suffix —
// it would print "…Fast Blow-Dry Styling | Silk & Bristle" with the brand twice.
const title = PRODUCT.name;
const description = `Curved, vented brush with dual boar and nylon bristles — detangles while you blow-dry. ${PRODUCT.currency}${PRODUCT.price}, cash on delivery.`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: PRODUCT.brand,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: PRODUCT.brand,
    title,
    description,
    images: [{ url: "/brush-bristles.jpg", width: 900, height: 1125, alt: `${PRODUCT.brand} curved vented hairbrush with dual boar and nylon bristles` }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/brush-bristles.jpg"] },
};
export const viewport = { themeColor: "#f6efeb" };
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${head.variable} ${body.variable}`}>
        <a className="skip" href="#order">Skip to order form</a>
        {/* Brand chrome lives in the layout so /order — the highest-stakes
            page — carries the wordmark, contact and legal line too. A checkout
            that asks for a phone number and address on an anonymous page is
            asking for trust it has not earned. */}
        <header className="site">
          <div className="inner">
            <a className="wordmark" href="/" translate="no">
              {PRODUCT.brand}
            </a>
          </div>
        </header>
        {PLAUSIBLE_DOMAIN ? <script defer data-domain={PLAUSIBLE_DOMAIN} src={PLAUSIBLE_SCRIPT} /> : null}
        {children}
        <footer>
          <p className="foot-product" translate="no">
            {PRODUCT.shortName}
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
      </body>
    </html>
  );
}
