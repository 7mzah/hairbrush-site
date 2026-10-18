import { PRODUCT, CONTACT, DELIVERY } from "@/lib/config";
import BackToProduct from "./BackToProduct";
import OrderForm from "../OrderForm";

// The checkout is kept out of the sitemap on purpose: this single-product
// store's canonical page is the product page, and /order is the step after
// "Order now" — not a second entry point to be indexed. The noindex comes from
// this metadata block (`robots: { index: false }`), not from a header rule:
// next.config.mjs sets cache headers only. app/sitemap.js omits /order. Do not
// add /order to the sitemap while `index: false` is here.
export const metadata = {
  title: "Complete your order",
  description: "Cash on delivery — order now and we call you to confirm.",
  alternates: { canonical: "/order" },
  robots: { index: false, follow: true },
};

export default function OrderPage() {
  return (
    // A real <main> landmark (the product page has one; a checkout page on an
    // anonymous landmark is worse) — also the flex child that pins the
    // footer to the bottom of short viewports.
    <main className="orderpage">
      {/* The one way back to the product page. This used to be a text link here
          plus a copy at the foot of the order summary under a different name
          ("Return to product") — the summary copy is gone, so this is now the
          single exit at every width. BackToProduct owns the click, so the exit
          follows browser history rather than stacking a second checkout. */}
      <BackToProduct />
      <h1>Complete your order</h1>

      <OrderForm
        productName={PRODUCT.shortName}
        image={PRODUCT.image}
        price={PRODUCT.price}
        currency={PRODUCT.currency}
        deliveryFee={DELIVERY.fee}
      />

      {CONTACT?.phone ? <p className="co-help">Prefer to talk? Call us on <strong>{CONTACT.phone}</strong>.</p> : null}
    </main>
  );
}
