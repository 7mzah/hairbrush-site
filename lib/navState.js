// One-shot flag shared between the buy box and the checkout's back pill.
//
// The pill has two jobs depending on how /order was reached: if the shopper
// came from the product page it should behave like the browser's back button
// (return to the entry they came from, and leave no second checkout behind it);
// if they landed on /order directly — an ad click, a link in a chat app — there
// is nothing in-site to go back to, so it must navigate to the product page
// instead. Only the click that leaves the product page knows which case it is,
// so it leaves this mark and the pill reads it once.
//
// sessionStorage, not localStorage: it is per tab, so a fresh tab opening
// /order from an ad never sees a mark left by an earlier tab.
const KEY = "hb:came-from-product";

// Called from the product page's "Order now" links, just before they navigate.
export function markFromProduct() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    // Private modes can refuse storage. The only cost is that the pill falls
    // back to plain navigation, so this must never break the click.
  }
}

// Called once, when /order mounts. Consuming on read keeps it one-shot: a later
// arrival in the same tab — a reload, or an ad landing — is not mistaken for an
// in-site one, and so gets the history guard the pill needs to land on the
// product page.
export function consumeFromProduct() {
  try {
    if (sessionStorage.getItem(KEY) !== "1") return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
