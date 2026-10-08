"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// One image area that serves two modes, switched by CSS:
//   <=639px  horizontal scroll-snap strip you swipe, with dot indicators
//   >=640px  Amazon-style vertical thumbnail rail beside a single viewport
// Clicking the image (or the expand button) opens a full-screen lightbox with
// arrows, keyboard controls, swipe, a thumbnail bar, and tap-backdrop to close.
// `.strip` is always the image holder. On desktop it is overflow:hidden, which
// blocks user scrolling but still allows programmatic scrollTo(), so clicking a
// rail thumbnail (or a dot) moves it.
export default function Gallery({ photos }) {
  const [active, setActive] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const stripRef = useRef(null);
  const dialogRef = useRef(null);
  const openerRef = useRef(null);
  const pendingRef = useRef(null); // strip index goTo() is animating towards
  const swipeRef = useRef(null); // where the lightbox swipe started

  // ?photo=3 opens on photo 3 so a single shot can be linked and shared.
  // Read after mount: the prerendered HTML is always slide 1, so reading the
  // URL during render would mismatch against it on hydration.
  useEffect(() => {
    const n = Number(new URLSearchParams(window.location.search).get("photo"));
    if (!Number.isInteger(n) || n < 1 || n > photos.length) return;
    const el = stripRef.current;
    if (!el) return;
    setActive(n - 1);
    el.scrollTo({ left: (n - 1) * el.clientWidth });
  }, [photos.length]);

  // One place that owns both pieces of state. replaceState, not pushState:
  // swiping through five photos must not bury the back button in history.
  const setSlide = useCallback((i) => {
    setActive(i);
    const url = new URL(window.location.href);
    if (i === 0) url.searchParams.delete("photo");
    else url.searchParams.set("photo", String(i + 1));
    window.history.replaceState(null, "", url);
  }, []);

  const goTo = useCallback(
    (i) => {
      setSlide(i);
      const el = stripRef.current;
      if (!el) return;
      pendingRef.current = i; // ignore the intermediate scroll frames this fires
      el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
    },
    [setSlide]
  );

  const nextPhoto = useCallback(() => goTo((active + 1) % photos.length), [active, photos.length, goTo]);
  const prevPhoto = useCallback(() => goTo((active - 1 + photos.length) % photos.length), [active, photos.length, goTo]);

  const openLightbox = useCallback((e) => {
    openerRef.current = e?.currentTarget || document.activeElement;
    setIsZoomed(true);
  }, []);

  // Open state only: scroll lock, focus into the dialog, Tab trap, Escape, and
  // focus back to whatever opened it. Deliberately not dependent on `active`,
  // so changing photos never yanks focus off the button being pressed.
  useEffect(() => {
    if (!isZoomed) return;
    const dialog = dialogRef.current;
    const opener = openerRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Everything outside the dialog stops being reachable, keyboard and screen
    // readers included — aria-modal alone does not do that.
    const inerted = [...document.body.children].filter((el) => el !== dialog && !el.contains(dialog));
    inerted.forEach((el) => el.setAttribute("inert", ""));
    dialog?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") return setIsZoomed(false);
      if (e.key !== "Tab") return;
      const items = [...dialog.querySelectorAll("button")].filter((el) => !el.disabled && el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const here = document.activeElement;
      if (e.shiftKey && (here === first || !dialog.contains(here))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (here === last || !dialog.contains(here))) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      inerted.forEach((el) => el.removeAttribute("inert"));
      document.body.style.overflow = prevOverflow;
      // A <figure> that opened the lightbox cannot take focus, so fall back to
      // the expand button rather than dropping the user back on <body>.
      if (opener && opener.tabIndex >= 0) opener.focus();
      else document.querySelector(".expand-btn")?.focus();
    };
  }, [isZoomed]);

  // Arrow keys — re-registered whenever the target photo changes.
  useEffect(() => {
    if (!isZoomed) return;
    const onKeyDown = (e) => {
      if (e.key === "ArrowRight") nextPhoto();
      else if (e.key === "ArrowLeft") prevPhoto();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isZoomed, nextPhoto, prevPhoto]);

  const onScroll = () => {
    const el = stripRef.current;
    if (!el || isZoomed) return; // while the lightbox is open, goTo owns the index
    const i = Math.round(el.scrollLeft / (el.clientWidth || 1));
    if (i < 0 || i >= photos.length) return;
    const target = pendingRef.current;
    if (target !== null) {
      // A programmatic scrollTo is in flight; only its resting frame counts,
      // otherwise a mid-animation frame re-writes `active` and photos skip.
      if (i === target) pendingRef.current = null;
      return;
    }
    if (i !== active) setSlide(i);
  };

  // Click the dark backdrop anywhere that is not the photo or a control.
  const onBackdrop = (e) => {
    if (e.target.closest(".lightbox-figure, .lightbox-nav, .lightbox-close, .lightbox-thumb")) return;
    setIsZoomed(false);
  };

  // Swipe left/right to change photo — but leave the thumbnail strip's own
  // horizontal scrolling alone.
  const onTouchStart = (e) => {
    if (e.touches.length !== 1 || e.target.closest(".lightbox-rail")) {
      swipeRef.current = null;
      return;
    }
    swipeRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e) => {
    const start = swipeRef.current;
    swipeRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.3) return; // it was a scroll
    if (dx < 0) nextPhoto();
    else prevPhoto();
  };

  const dialog = (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Expanded product photos"
      ref={dialogRef}
      tabIndex={-1}
      onClick={onBackdrop}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="lightbox-top">
        <span className="lightbox-count">
          {active + 1} / {photos.length}
        </span>
        <button type="button" className="lightbox-close" aria-label="Close expanded view" onClick={() => setIsZoomed(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>

      <div className="lightbox-stage">
        <button type="button" className="lightbox-nav is-prev" aria-label="Previous photo" onClick={prevPhoto}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 5 8 12 15 19" />
          </svg>
        </button>

        <div className="lightbox-viewer">
          <figure className="lightbox-figure">
            <img
              key={photos[active][0]}
              src={`/${photos[active][0]}.jpg`}
              alt={photos[active][1]}
              width="900"
              height="1125"
            />
            <figcaption className="lightbox-caption">{photos[active][1]}</figcaption>
          </figure>
        </div>

        <button type="button" className="lightbox-nav is-next" aria-label="Next photo" onClick={nextPhoto}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="9 5 16 12 9 19" />
          </svg>
        </button>
      </div>

      <div className="lightbox-rail" role="group" aria-label="Photo thumbnails">
        {photos.map(([f, alt], i) => (
          <button
            key={f}
            type="button"
            className={i === active ? "lightbox-thumb is-active" : "lightbox-thumb"}
            aria-label={`View photo ${i + 1}: ${alt}`}
            aria-pressed={i === active}
            onClick={() => goTo(i)}
          >
            <img src={`/${f}.jpg`} alt="" width="900" height="1125" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="media">
      <div className="shot">
        <div
          className="strip"
          ref={stripRef}
          onScroll={onScroll}
          role="group"
          aria-label={`Product photos, ${photos.length} images. Click to expand.`}
        >
          {photos.map(([f, alt], i) => (
            <figure key={f} onClick={openLightbox} title="Click to view full size">
              <img
                src={`/${f}.jpg`}
                alt={alt}
                width="900"
                height="1125"
                fetchPriority={i === 0 ? "high" : "auto"}
                loading={i === 0 ? "eager" : "lazy"}
              />
            </figure>
          ))}
        </div>

        <button
          type="button"
          className="expand-btn"
          aria-label="Expand full screen gallery"
          title="Expand full screen"
          onClick={openLightbox}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
          </svg>
        </button>

        <div className="dots">
          {photos.map(([f], i) => (
            <button
              key={f}
              type="button"
              className={i === active ? "dot is-active" : "dot"}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      </div>

      <div className="rail" role="group" aria-label="Product photos">
        {photos.map(([f], i) => (
          <button
            key={f}
            type="button"
            className={i === active ? "thumb is-active" : "thumb"}
            aria-pressed={i === active}
            aria-label={`Show photo ${i + 1} of ${photos.length}`}
            onClick={() => goTo(i)}
          >
            <img src={`/${f}.jpg`} alt="" width="900" height="1125" loading="lazy" />
          </button>
        ))}
      </div>

      {/* Portalled to <body> so `inert` can silence the rest of the page. */}
      {isZoomed && typeof document !== "undefined" && createPortal(dialog, document.body)}
    </div>
  );
}
