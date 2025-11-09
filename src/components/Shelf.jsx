import React, { useEffect, useRef, useState } from "react";

/**
 * Horizontal shelf with snap. Scrollbar hidden, wheel-to-horizontal,
 * keyboard arrows, optional nav buttons.
 *
 * Props:
 *  - cards: array of { kind: "promo" | "product", ... } (see card components)
 *  - renderers: { promo: (props) => JSX, product: (props) => JSX }
 *  - ariaLabel?: string
 *  - showArrows?: boolean (default false)
 *  - snap?: "mandatory" | "proximity" (default "mandatory")
 */
export default function Shelf({
  cards = [],
  renderers,
  ariaLabel = "Featured",
  showArrows = false,
  snap = "mandatory",
}) {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const checkArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 2);
    setCanNext(scrollLeft + clientWidth < scrollWidth - 2);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    checkArrows();
    const onScroll = () => checkArrows();
    const onResize = () => checkArrows();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const move = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  // Keyboard: left/right scroll
  const onKeyDown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      move(1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      move(-1);
    }
  };

  // Wheel: turn vertical wheel movement into horizontal scroll for the shelf
  const onWheel = (e) => {
    const el = scrollerRef.current;
    if (!el) return;
    // If vertical intent is stronger, translate it to horizontal
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  };

  return (
    <section aria-label={ariaLabel}>
      {/* Local CSS to hide scrollbars cross-browser */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="relative bg-[#f5f5f7] rounded-3xl px-3 sm:px-4 py-5">
        <div
          ref={scrollerRef}
          role="list"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onWheel={onWheel}
          className="no-scrollbar flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x"
          style={{ scrollSnapType: `x ${snap}` }}
        >
          {cards.map((c, i) => {
            const Item = c.kind === "promo" ? renderers?.promo : renderers?.product;
            const widths =
              c.kind === "promo"
                ? "min-w-[85vw] sm:min-w-[48vw] lg:min-w-[420px]"
                : "min-w-[80vw] sm:min-w-[45vw] lg:min-w-[320px]";
            return (
              <div key={i} className={`${widths} snap-start focus-within:outline-none`}>
                <Item {...c} />
              </div>
            );
          })}
        </div>

        {showArrows && (
          <div className="hidden md:block">
            <button
              onClick={() => move(-1)}
              disabled={!canPrev}
              aria-label="Previous"
              className={`absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-gray-200 shadow transition ${
                !canPrev ? "opacity-40 cursor-not-allowed" : "hover:shadow-md"
              }`}
            >
              ‹
            </button>
            <button
              onClick={() => move(1)}
              disabled={!canNext}
              aria-label="Next"
              className={`absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/90 border border-gray-200 shadow transition ${
                !canNext ? "opacity-40 cursor-not-allowed" : "hover:shadow-md"
              }`}
            >
              ›
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
