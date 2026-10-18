export const PRODUCT = {
  brand: "Silk & Bristle",
  name: "Silk & Bristle Curved Vented Hairbrush with Dual Boar & Nylon Detangling Bristles – Coffee Material + ABS Paddle, Fast Blow-Dry Styling",
  // Short label for the footer and the order receipt. `name` is a 140-character
  // title and reads badly as "1 × …" on a confirmation or as a page footer.
  shortName: "Double Bristle Vented Brush",
  price: 7,
  currency: "$",
  currencyCode: "USD",
  // thumbnail shown in the /order summary card; must be a file in public/
  image: "/brush-bristles.jpg",
}; // edit brand/name/price here

// Delivery — leave both empty and no delivery line is rendered anywhere.
// Fill these in once Wakilni has quoted you; no code changes needed.
export const DELIVERY = {
  fee: "", // e.g. "Free" or "$3" — surfaced in the buy box
  note: "", // e.g. "Free delivery across Lebanon" — surfaced in the trust row
};

// Contact — leave empty and the footer/trust line stays hidden.
// whatsapp: country code + number with no + or spaces, e.g. "9613123456"
export const CONTACT = { phone: "", whatsapp: "" };

const rawUrl = process.env.SITE_URL || "http://localhost:3000";
export const SITE_URL = (/^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`).replace(/\/+$/, "");
