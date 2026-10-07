// Best-effort "a new order arrived" notification. Set one of:
//   TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID  -> Telegram message
//   ORDER_WEBHOOK_URL                       -> JSON POST to your own endpoint
// Nothing here may ever block or fail an order, so every error is swallowed.
const timeout = () => (typeof AbortSignal !== "undefined" && AbortSignal.timeout ? AbortSignal.timeout(5000) : undefined);

function telegramText(o) {
  return [
    `New order #${o.id}`,
    `Name: ${o.name}`,
    `Phone: ${o.phone}`,
    `City: ${o.city}`,
    `Address: ${o.address}`,
    `Qty: ${o.qty} | Total: ${o.currency}${o.total}`,
  ].join("\n");
}

export async function notifyNewOrder(order) {
  const { TELEGRAM_BOT_TOKEN: token, TELEGRAM_CHAT_ID: chat, ORDER_WEBHOOK_URL: hook } = process.env;
  const promises = [];

  // Diagnostic only: without these a missing/misconfigured channel is
  // completely invisible in the logs, which is exactly the hard-to-debug case.
  if (!token && !chat && !hook)
    console.warn("[notify] skipped: TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID and ORDER_WEBHOOK_URL are all unset");
  else if (!!token !== !!chat)
    console.warn(`[notify] partial config: ${token ? "TELEGRAM_CHAT_ID is missing" : "TELEGRAM_BOT_TOKEN is missing"}`);

  if (token && chat) {
    promises.push(
      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chat, text: telegramText(order) }),
        cache: "no-store",
        signal: timeout(),
      }).then(async (res) => {
        if (!res.ok) console.error(`[notify:telegram] ${res.status}: ${await res.text().catch(() => "")}`);
        else console.log(`[notify:telegram] ok (order #${order.id})`);
      }).catch((err) => {
        console.error("[notify:telegram] failed:", err?.message || err);
      })
    );
  }

  if (hook) {
    promises.push(
      fetch(hook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: "order.created", order }),
        cache: "no-store",
        signal: timeout(),
      }).then(async (res) => {
        if (!res.ok) console.error(`[notify:webhook] ${res.status}: ${await res.text().catch(() => "")}`);
        else console.log(`[notify:webhook] ok (order #${order.id})`);
      }).catch((err) => {
        console.error("[notify:webhook] failed:", err?.message || err);
      })
    );
  }

  if (promises.length > 0) {
    await Promise.allSettled(promises);
  }
}
