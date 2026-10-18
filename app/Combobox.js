"use client";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { maxDist, norm, osaDistance } from "@/lib/norm";

const CAP = 60; // keep the popup short; the footer says how many are hidden

// Type-to-filter combobox: an ordinary text input (same shape as every other
// field on the form) whose suggestion list is already there when the box is
// pressed and filters as the customer types. The parent owns `value`; picking
// reports the item through onSelect while the input keeps its display text.
// With `fuzzy`, text that matches nothing exactly gets the closest spellings
// instead (parent supplies `fz`, a pre-normalized, space-stripped string).
export default function Combobox({
  label,
  value,
  onChange,
  onSelect,
  items = [],
  placeholder,
  disabled,
  required,
  name,
  autoComplete,
  noun = "items",
  emptyText = "No matches.",
  fuzzy = false,
  error, // validation message rendered under the input, wired via aria-describedby
  hint, // non-blocking note (e.g. "village cleared by district change")
  inputRef, // parent keeps a ref so it can move focus here on a failed submit
}) {
  const uid = useId();
  const inputId = `${uid}-input`;
  const listId = `${uid}-list`;
  const errId = `${uid}-err`;
  const hintId = `${uid}-hint`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1); // index into `visible`, -1 = none
  const listRef = useRef(null);
  const inputEl = useRef(null);
  // A fixed 240px list under a field near the bottom edge is clipped — on a wide
  // screen it ran into the footer, and on a phone the keyboard left ~20px of it
  // visible. So the list measures the room it actually has: it flips above the
  // field when there is more room there, and never grows past what is on screen.
  // visualViewport, not innerHeight: only the former shrinks for the keyboard.
  const [place, setPlace] = useState({ up: false, max: 240 });

  function measure() {
    const el = inputEl.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.visualViewport?.height ?? window.innerHeight;
    const below = vh - r.bottom - 8;
    const above = r.top - 8;
    // 200 is "most of a list": below that it is worth flipping above the field;
    // above it, opening downward (a little shorter) keeps the expected direction.
    const up = below < 200 && above > below;
    // Never taller than the room it has (80 is the floor so a sliver of screen
    // still shows a couple of scrollable rows); 240 is the resting height.
    setPlace({ up, max: Math.max(80, Math.min(240, up ? above : below)) });
  }

  // Re-measure on every open, and again when the visual viewport resizes (the
  // keyboard appearing/disappearing) so the popup is never half off-screen.
  // Layout effect: the first paint after opening must already be in the right
  // direction, otherwise the list flashes at last time's placement.
  useLayoutEffect(() => {
    if (!open) return;
    measure();
    const vv = window.visualViewport;
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    vv?.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      vv?.removeEventListener("resize", onResize);
    };
  }, [open]);

  const q = norm(value);
  const { visible, exactCount, fuzzyTier } = useMemo(() => {
    if (q === "") return { visible: items.slice(0, CAP), exactCount: items.length, fuzzyTier: false };
    // `hay` is a pre-normalized search string the parent can supply so big
    // lists (2,713 villages) aren't re-normalized on every keystroke.
    const exact = items.filter((it) => (it.hay ?? norm(it.text)).includes(q));
    if (exact.length > 0 || !fuzzy) return { visible: exact.slice(0, CAP), exactCount: exact.length, fuzzyTier: false };
    // Nothing matches exactly: offer the closest spellings, but only for
    // queries long enough for closeness to mean anything ("Amtchit" → "Aamchit").
    const qFlat = q.replace(/ /g, "");
    if (qFlat.length < 3) return { visible: [], exactCount: 0, fuzzyTier: false };
    const max = maxDist(qFlat.length);
    const scored = [];
    for (const it of items) {
      let best = max + 1;
      for (const s of it.fz ?? [norm(it.text).replace(/ /g, "")]) {
        const d = osaDistance(qFlat, s, max);
        if (d < best) { best = d; if (best === 0) break; }
      }
      if (best <= max) scored.push([best, it]);
    }
    scored.sort((a, b) => a[0] - b[0]); // nearest spelling first
    return { visible: scored.slice(0, CAP).map(([, it]) => it), exactCount: 0, fuzzyTier: true };
  }, [q, items, fuzzy]);

  const fmt = (n) => new Intl.NumberFormat("en-US").format(n);

  function pick(item) {
    onChange(item.text);
    onSelect?.(item);
    setOpen(false);
    setActive(-1);
  }

  function change(text) {
    onChange(text);
    setActive(0); // typing highlights the top match so Enter picks it
    setOpen(true);
  }

  function keyDown(e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return setOpen(true);
      setActive((a) =>
        Math.max(0, Math.min(visible.length - 1, e.key === "ArrowDown" ? a + 1 : a - 1))
      );
    } else if (e.key === "Enter") {
      // The list is open the moment the field is focused, so a plain Enter used
      // to fall straight through to the form's submit and paint every error at
      // once while the customer was still choosing an address. While the list is
      // open, Enter only ever settles the choice: the highlighted row, else the
      // single exact match for what was typed, else it closes the list. A second
      // Enter (list shut) submits normally.
      if (!open) return;
      e.preventDefault();
      if (active >= 0 && active < visible.length) {
        pick(visible[active]);
        return;
      }
      const typed = norm(value);
      const exact = typed
        ? visible.filter(
            (it) => norm(it.text) === typed || norm(it.name) === typed || norm(it.nameAr) === typed
          )
        : [];
      if (exact.length === 1) pick(exact[0]);
      else setOpen(false);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  // Keep the highlighted row inside the scroll viewport while arrowing.
  useEffect(() => {
    if (!open || active < 0) return;
    listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  // Focused + something to show (the full list when empty, matches or a
  // closest-spelling footer when typed).
  const showList = open && !disabled && (visible.length > 0 || fuzzyTier);
  const footer =
    visible.length === 0
      ? emptyText
      : exactCount > CAP
        ? `Showing ${CAP} of ${fmt(exactCount)} ${noun} — keep typing`
        : "";
  // aria-describedby points at whichever notes exist, error first.
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  // Flat render rows: optional closest-matches divider, district-group
  // headings, then the option rows (option index `i` feeds aria-activedescendant).
  const rows = [];
  if (fuzzyTier && visible.length > 0) rows.push({ type: "fuzz" });
  let lastGroup;
  visible.forEach((it, i) => {
    if (it.group && it.group !== lastGroup) {
      rows.push({ type: "group", text: it.group, key: `g${i}` });
      lastGroup = it.group;
    }
    rows.push({ type: "item", it, i });
  });

  return (
    <div className="cb">
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        name={name}
        role="combobox"
        aria-expanded={showList}
        aria-autocomplete="list"
        aria-activedescendant={
          showList && active >= 0 && active < visible.length ? `${listId}-${active}` : undefined
        }
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        value={value}
        onChange={(e) => change(e.target.value)}
        onFocus={() => {
          setOpen(true);
          setActive(-1);
        }}
        onBlur={() => setOpen(false)}
        onKeyDown={keyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        spellCheck={false}
        ref={(el) => {
          inputEl.current = el;
          if (inputRef) inputRef.current = el;
        }}
      />
      {/* The message lives here, inside the field group, so the fix is where
          the mistake is — not in a detached status line far below. */}
      {error && (
        <span className="field-err" id={errId} role="alert">
          {error}
        </span>
      )}
      {hint && (
        <span className="field-hint" id={hintId}>
          {hint}
        </span>
      )}
      {showList && (
        <ul
          className={`cb-list${place.up ? " is-up" : ""}`}
          id={listId}
          role="listbox"
          aria-label={label}
          style={{ maxHeight: place.max }}
          ref={listRef}
          /* clicking the list must not blur (and therefore close) the input */
          onMouseDown={(e) => e.preventDefault()}
        >
          {rows.map((row) =>
            row.type === "group" ? (
              <li className="cb-group" role="presentation" key={row.key}>
                {row.text}
              </li>
            ) : row.type === "fuzz" ? (
              <li className="cb-fuzz" role="presentation" key="fuzz">
                — closest matches —
              </li>
            ) : (
              <li
                key={row.it.key ?? row.it.text}
                id={`${listId}-${row.i}`}
                role="option"
                aria-selected={row.i === active}
                data-active={row.i === active || undefined}
                className={`cb-item${row.i === active ? " is-active" : ""}`}
                onMouseEnter={() => setActive(row.i)}
                onMouseDown={() => pick(row.it)}
              >
                {row.it.text}
              </li>
            )
          )}
          {footer && (
            <li className="cb-foot" role="presentation">
              {footer}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
