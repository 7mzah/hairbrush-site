export const PRODUCT = {
  brand: "Silk & Bristle",
  name: "Double Bristle Vented Brush",
  price: 7,
  currency: "$",
  currencyCode: "USD",
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
