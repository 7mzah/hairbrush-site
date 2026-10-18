"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AREAS from "@/lib/areas.json";
import { norm } from "@/lib/norm";
import Combobox from "./Combobox";

// Two decimals throughout the checkout, the way Shopify prints prices.
const money = (n, c) =>
  c + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// District suggestions, in dataset order bucketed under their governorate
// (Map keeps first-seen governorate order) so the list can show headings.
const DISTRICTS = [...AREAS.districts.reduce((map, d) => {
  if (!map.has(d.governorate)) map.set(d.governorate, []);
  map.get(d.governorate).push(d);
  return map;
}, new Map())].flatMap(([governorate, ds]) =>
  ds.map((d) => ({
    key: d.id,
    id: d.id,
    name: d.name,
    nameAr: d.nameAr,
    text: `${d.name} — ${d.nameAr}`,
    group: `${governorate} — ${ds[0].governorateAr}`,
  }))
);

// Every village in the country, each carrying its district. `hay` is the
// pre-normalized contains-search string; `fz` is the flattened (no spaces)
// form used for closest-spelling matching — both computed once at load so
// per-keystroke filtering over 2,713 rows stays a cheap scan. Key is
// namespaced by district because one village name occurs in two districts.
const VILLAGES = AREAS.districts.flatMap((d) =>
  d.villages.map((v) => ({
    key: `${d.id}:${v.name}`,
    name: v.name,
    nameAr: v.nameAr,
    districtId: d.id,
    text: `${v.name} — ${v.nameAr}`,
    group: `${d.name} — ${d.nameAr}`,
    hay: norm(`${v.name} ${v.nameAr}`),
    fz: [norm(v.name).replace(/ /g, ""), norm(v.nameAr).replace(/ /g, "")],
  }))
);

// Typing filters the lists, but only a listed option may be submitted: what
// the customer typed counts only if it names exactly one option — the full
// display text ("Zahle — زحلة"), the plain name, or the Arabic name.
const resolveExact = (items, text) => {
  const q = norm(text);
  if (!q) return null;
  const hits = items.filter(
    (it) => norm(it.text) === q || norm(it.name) === q || norm(it.nameAr) === q
  );
  return hits.length === 1 ? hits[0] : null;
};

export default function OrderForm({ productName, image, price, currency }) {
  const [qty, setQty] = useState(1);
  const [state, setState] = useState({ status: "idle", msg: "" });
  const [districtText, setDistrictText] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [villageText, setVillageText] = useState("");
  const [villageName, setVillageName] = useState(""); // canonical, once picked
  const [sumOpen, setSumOpen] = useState(false); // mobile "Order summary" accordion
  // Field-level validation: each failing field gets its own message rendered
  // inside its own combobox, with aria-invalid and focus moved to it — one
  // red line at the bottom of the page told the user something was wrong but
  // not where, ~300px from the button they had just pressed.
  const [fieldErr, setFieldErr] = useState({}); // { district?, village?, phone? }
  const [villageCleared, setVillageCleared] = useState(false); // district change wiped the pick
  const [receipt, setReceipt] = useState(null); // order # + what was ordered, kept across the reset
  const districtRef = useRef(null);
  const villageRef = useRef(null);
  const phoneRef = useRef(null);

  // "Order now" on the product page carries its quantity as ?qty=N. Read it
  // after mount so /order stays statically prerendered (no useSearchParams
  // CSR bailout); the summary picks the number up a frame later.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("qty");
    setQty(Math.min(10, Math.max(1, Number(q) || 1)));
  }, []);

  const selected =
    (districtId && DISTRICTS.find((d) => d.id === districtId)) || resolveExact(DISTRICTS, districtText);
  const district = selected ? AREAS.districts.find((d) => d.id === selected.id) : null;

  // The village list is always scoped to the chosen district.
  const villageItems = useMemo(
    () => (district ? VILLAGES.filter((v) => v.districtId === district.id) : []),
    [district]
  );

  // Editing the district invalidates both its pick and any village chosen
  // under the old district: what is in the boxes at submit time is what is sent.
  // Clearing a real pick is announced (a silent wipe reads as data loss), and
  // any field error dies the moment its field is edited again.
  const changeDistrict = (text) => {
    setDistrictText(text);
    if (fieldErr.district) setFieldErr((e) => ({ ...e, district: undefined }));
    if (districtId) setDistrictId("");
    if (villageText) { setVillageText(""); setVillageName(""); setVillageCleared(true); }
  };
  const pickDistrict = (item) => {
    setDistrictText(item.text);
    setDistrictId(item.id);
    if (fieldErr.district) setFieldErr((e) => ({ ...e, district: undefined }));
    const hadVillage = !!villageName || !!villageText;
    setVillageText("");
    setVillageName("");
    setVillageCleared(hadVillage);
  };
  const changeVillage = (text) => {
    setVillageText(text);
    if (villageName) setVillageName("");
    if (fieldErr.village) setFieldErr((e) => ({ ...e, village: undefined }));
  };
  const pickVillage = (item) => {
    setVillageText(item.text);
    setVillageName(item.name);
    setVillageCleared(false);
    if (fieldErr.village) setFieldErr((e) => ({ ...e, village: undefined }));
  };

  const total = (Number(qty) || 1) * price;
  const buyButton = (
    <button className="btn co-buy" disabled={state.status === "sending"}>
      <span className="cta-main">{state.status === "sending" ? "Confirming…" : "Confirm order"}</span>
      {/* "+ delivery" because the delivery price is quoted on the confirmation
          call — promising a flat on-delivery amount here trained distrust the
          moment the courier asked for more. */}
      <span className="cta-sub">Pay {money(total, currency)} + delivery</span>
    </button>
  );

  async function submit(e) {
    e.preventDefault();
    const form = e.target; // hold onto it: e.target is not reliable after await
    const data = Object.fromEntries(new FormData(form));

    // Validate before sending, and fail at the field that is wrong — not in a
    // detached line at the bottom of the page. Focus moves to the first
    // offender so keyboard and screen-reader users land where the work is.
    const errs = {};
    const phoneDigits = String(data.phone ?? "").replace(/\D/g, "").length;
    if (phoneDigits < 7) errs.phone = "Enter a full phone number, e.g. 03 123 456.";
    if (!String(data.firstName ?? "").trim()) errs.firstName = "Enter your first name.";
    if (!String(data.lastName ?? "").trim()) errs.lastName = "Enter your last name.";
    if (!String(data.address ?? "").trim()) errs.address = "Add a street address so the courier can find you.";
    const chosenDistrict =
      (districtId && DISTRICTS.find((d) => d.id === districtId)) || resolveExact(DISTRICTS, districtText);
    if (!chosenDistrict) errs.district = "Please choose your district from the list.";
    let chosenVillage = null;
    if (chosenDistrict) {
      const scoped = VILLAGES.filter((v) => v.districtId === chosenDistrict.id);
      chosenVillage =
        (villageName && scoped.find((v) => v.name === villageName)) || resolveExact(scoped, data.city);
      if (!chosenVillage) errs.village = "Please choose your village from the list.";
    }
    if (Object.keys(errs).length) {
      // No global message here: each failing field renders its own (role=
      // alert) and takes focus, so a screen reader hears the problem at the
      // field instead of a detached line repeating it.
      setState({ status: "error", msg: "" });
      setFieldErr(errs);
      // let the error render before pulling focus to it
      requestAnimationFrame(() => {
        // DOM order: phone → names → address → district → village
        if (errs.phone) phoneRef.current?.focus();
        else if (errs.firstName) form.elements.firstName?.focus();
        else if (errs.lastName) form.elements.lastName?.focus();
        else if (errs.address) form.elements.address?.focus();
        else if (errs.district) districtRef.current?.focus();
        else if (errs.village) villageRef.current?.focus();
      });
      return;
    }
    setFieldErr({});
    data.district = chosenDistrict.id;
    data.city = chosenVillage.name; // canonical spelling, whatever they typed
    // split name fields, one name for the API/notification/courier — after
    // validation, which reads the individual fields
    data.name = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
    delete data.firstName;
    delete data.lastName;

    setState({ status: "sending", msg: "" });
    try {
      // The honeypot can get filled by Android/desktop autofill or a password
      // manager even for a real customer. Never let that drop a human's order:
      // strip it here, while the server still rejects anything that POSTs it
      // directly without running this code.
      if (data.website) {
        console.warn("[order] honeypot field was autofilled; clearing before submit");
        delete data.website;
      }
      const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const out = await res.json().catch(() => ({}));
      if (res.ok) {
        // Capture the receipt before the reset: when the confirmation call
        // comes, the customer needs the order number and what they ordered —
        // the summary card is unmounted in this branch, so grab it first.
        setReceipt({ id: out.id, qty, total, productName });
        // form.reset() alone is not enough: these fields are controlled by
        // React state, which survives a native reset.
        form.reset(); setQty(1); setSumOpen(false);
        setDistrictText(""); setDistrictId(""); setVillageText(""); setVillageName("");
        setState({ status: "done", msg: "We will call you shortly to confirm delivery." });
      }
      else setState({ status: "error", msg: out.error || "Something went wrong. Please try again." });
    } catch {
      setState({
        status: "error",
        msg: "We could not reach the server, so your order may not have gone through. Check your connection and try again.",
      });
    }
  }

  // Order placed: the checkout is replaced in place by the confirmation.
  if (state.status === "done") {
    return (
      <div className="done-panel">
        <h2>Order received</h2>
        <p>{state.msg}</p>
        {receipt && (
          <div className="done-receipt">
            <p>
              {receipt.id ? `Order #${receipt.id} — ` : ""}
              {receipt.qty} × {receipt.productName}, {money(receipt.total, currency)} + delivery
            </p>
            <p className="done-note">Keep this number: quote it when we call.</p>
          </div>
        )}
        <Link className="btn" href="/">Back to product</Link>
      </div>
    );
  }

  return (
    // id="order" + tabIndex:-1 give the layout's "Skip to order form" link a
    // real target here too — it pointed at nothing on this page, so the first
    // Tab on checkout was a dead link.
    // noValidate: the native bubbles would fire before submit ever reaches us,
    // so the per-field errors below (aria-invalid + role=alert + focus) would
    // only ever run for comboboxes, not for the plain inputs.
    <form onSubmit={submit} className="checkout" id="order" tabIndex={-1} noValidate>
      {/* Summary first in the DOM so mobile stacks it on top as the
          "Order summary" accordion; the desktop grid moves it to the right
          column (sticky) and hides the accordion toggle. */}
      <aside className="co-summary">
        <button
          type="button"
          className="co-sum-toggle"
          aria-expanded={sumOpen}
          onClick={() => setSumOpen((o) => !o)}
        >
          <span>Order summary · {money(total, currency)}</span>
          <span className="co-chevron" aria-hidden="true" />
        </button>
        <div className={`co-sum-body${sumOpen ? " is-open" : ""}`}>
          <div className="co-line">
            <img src={image} alt="" width="900" height="1125" loading="lazy" />
            <div className="co-line-info">
              <p className="co-line-name">{productName}</p>
              {/* the quantity is chosen on the product page and carried as
                  ?qty=N — no stepper here, the count shows in the price line */}
              <p className="co-line-price">
                {money(price, currency)} <span className="co-qty-pill">× {qty}</span>
              </p>
              <input type="hidden" name="qty" value={qty} />
            </div>
          </div>
          <dl className="co-totals">
            <div><dt>Subtotal</dt><dd>{money(total, currency)}</dd></div>
            <div className="co-delivery"><dt>Delivery</dt><dd>Told when we call</dd></div>
            {/* "Total" promised a delivered price the site cannot quote yet —
                on a price-sensitive COD page the delivery cost is the number
                the buyer is actually trying to establish. Name what this
                number is, and say what is still missing. */}
            <div className="co-total"><dt>Product total</dt><dd>{money(total, currency)} <span className="co-plus">+ delivery</span></dd></div>
          </dl>
          {/* desktop: the button lives in the summary, like Shopify's Pay now */}
          <div className="co-buy-desktop">{buyButton}</div>
        </div>
        {/* These two lines answer the only questions that stop a COD order —
            "will someone call me?" and "do I pay now?" — so they live OUTSIDE
            the collapsible body: on a phone the accordion ships closed and
            they were invisible right at the moment of commitment. */}
        <p className="co-note">We will call you to confirm your order.</p>
        <p className="co-note">✓ Cash on delivery — you pay when the brush is in your hands.</p>
      </aside>

      <div className="co-main">
        <div className="co-form-card">
        <section className="co-section">
          <h2>Contact information</h2>
          <label>Phone number
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              required
              autoComplete="tel"
              placeholder="03 123 456…"
              aria-invalid={fieldErr.phone ? true : undefined}
              aria-describedby={fieldErr.phone ? "phone-err" : undefined}
              ref={phoneRef}
              onChange={() => fieldErr.phone && setFieldErr((e) => ({ ...e, phone: undefined }))}
            />
            {fieldErr.phone && <span className="field-err" id="phone-err" role="alert">{fieldErr.phone}</span>}
          </label>
        </section>
        <section className="co-section">
          <h2>Shipping address</h2>
          <div className="row-eq2">
            <label>First name
              <input
                name="firstName"
                required
                autoComplete="given-name"
                placeholder="Sara"
                aria-invalid={fieldErr.firstName ? true : undefined}
                aria-describedby={fieldErr.firstName ? "firstName-err" : undefined}
                onChange={() => fieldErr.firstName && setFieldErr((e) => ({ ...e, firstName: undefined }))}
              />
              {fieldErr.firstName && <span className="field-err" id="firstName-err" role="alert">{fieldErr.firstName}</span>}
            </label>
            <label>Last name
              <input
                name="lastName"
                required
                autoComplete="family-name"
                placeholder="Haddad"
                aria-invalid={fieldErr.lastName ? true : undefined}
                aria-describedby={fieldErr.lastName ? "lastName-err" : undefined}
                onChange={() => fieldErr.lastName && setFieldErr((e) => ({ ...e, lastName: undefined }))}
              />
              {fieldErr.lastName && <span className="field-err" id="lastName-err" role="alert">{fieldErr.lastName}</span>}
            </label>
          </div>
          <label>Delivery address
            <textarea
              name="address"
              rows="2"
              required
              autoComplete="street-address"
              placeholder="Street, building, floor…"
              aria-invalid={fieldErr.address ? true : undefined}
              aria-describedby={fieldErr.address ? "address-err" : undefined}
              onChange={() => fieldErr.address && setFieldErr((e) => ({ ...e, address: undefined }))}
            />
            {fieldErr.address && <span className="field-err" id="address-err" role="alert">{fieldErr.address}</span>}
          </label>
          {/* district first — the village below is scoped to it. Typing
              filters either list, but only a listed option may be submitted.
              District is fuzzy too now: the harder field used to be the less
              forgiving one, which is backwards. */}
          <Combobox
            label="District"
            value={districtText}
            onChange={changeDistrict}
            onSelect={pickDistrict}
            items={DISTRICTS}
            placeholder="Type your district…"
            required
            autoComplete="address-level1"
            noun="districts"
            emptyText="No district matches — pick one from the list."
            fuzzy
            error={fieldErr.district}
            inputRef={districtRef}
          />
          <Combobox
            label="Village"
            value={villageText}
            onChange={changeVillage}
            onSelect={pickVillage}
            items={villageItems}
            placeholder={district ? "Type your village…" : "Choose a district first…"}
            disabled={!district}
            required
            name="city"
            autoComplete="address-level2"
            noun="villages"
            emptyText="No match — try a different spelling."
            fuzzy
            error={fieldErr.village}
            hint={villageCleared ? "Village cleared — choose one from the new district." : undefined}
            inputRef={villageRef}
          />
          {/* readOnly: autofill engines skip readonly inputs, but happily fill
              off-screen ones — which is exactly how real orders got dropped. */}
          <input name="website" className="hp" tabIndex={-1} autoComplete="off" readOnly aria-hidden="true" />
        </section>
        </div>
        {/* mobile: the button sits at the bottom of the form, outside the
            collapsed accordion (the desktop copy above is hidden there) */}
        <div className="co-buy-mobile">{buyButton}</div>
      </div>
      <p role="status" aria-live="polite" className={state.status}>{state.msg}</p>
    </form>
  );
}
