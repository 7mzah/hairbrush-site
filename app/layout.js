import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import "./globals.css";
import { PRODUCT, SITE_URL } from "@/lib/config";

// Analytics is optional: unset PLAUSIBLE_DOMAIN and no tag is injected at all.
// A plain deferred tag (not next/script) so it loads without waiting on hydration.
const PLAUSIBLE_DOMAIN = process.env.PLAUSIBLE_DOMAIN;
const PLAUSIBLE_SCRIPT = process.env.PLAUSIBLE_SCRIPT || "https://plausible.io/js/script.js";
const head = Bricolage_Grotesque({ subsets: ["latin"], variable: "--f-head", weight: ["600", "800"] });
const body = DM_Sans({ subsets: ["latin"], variable: "--f-body" });

const title = `${PRODUCT.name} | ${PRODUCT.brand}`;
const description = `${PRODUCT.name} — a curved, vented detangling brush for wet or dry hair, with a mix of nylon and boar bristles. ${PRODUCT.currency}${PRODUCT.price}, cash on delivery.`;

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
    images: [{ url: "/brush-bristles.jpg", width: 900, height: 1125, alt: `${PRODUCT.name} held in one hand` }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/brush-bristles.jpg"] },
};
export const viewport = { themeColor: "#f6efeb" };
export default function RootLayout({ children }) {
  return <html lang="en"><body className={`${head.variable} ${body.variable}`}><a className="skip" href="#order">Skip to order form</a>{PLAUSIBLE_DOMAIN ? <script defer data-domain={PLAUSIBLE_DOMAIN} src={PLAUSIBLE_SCRIPT} /> : null}{children}</body></html>;
}
