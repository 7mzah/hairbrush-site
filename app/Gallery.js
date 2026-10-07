"use client";
import { useEffect, useRef, useState } from "react";

// One image area that serves two modes, switched by CSS:
//   <=639px  horizontal scroll-snap strip you swipe, with dot indicators
//   >=640px  Amazon-style vertical thumbnail rail beside a single viewport
// `.strip` is always the image holder. On desktop it is overflow:hidden, which
// blocks user scrolling but still allows programmatic scrollTo(), so clicking a
// rail thumbnail (or a dot) moves it. Every slide carries real alt text because
// on mobile all five are reachable by swiping.
export default function Gallery({ photos }) {
  const [active, setActive] = useState(0);
  const stripRef = useRef(null);

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
  const setSlide = (i) => {
    setActive(i);
    const url = new URL(window.location.href);
    if (i === 0) url.searchParams.delete("photo");
    else url.searchParams.set("photo", String(i + 1));
    window.history.replaceState(null, "", url);
  };

  const goTo = (i) => {
    setSlide(i);
    const el = stripRef.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  const onScroll = () => {
    const el = stripRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== active && i >= 0 && i < photos.length) setSlide(i);
  };

  return (
    <div className="media">
      <div className="shot">
        <div
          className="strip"
          ref={stripRef}
          onScroll={onScroll}
          role="group"
          aria-label={`Product photos, ${photos.length} images`}
        >
          {photos.map(([f, alt], i) => (
            <figure key={f}>
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
    </div>
  );
}
