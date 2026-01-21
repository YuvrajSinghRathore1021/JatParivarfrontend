import React, { useEffect, useRef } from "react";

/**
 * Pinned YouTube hero with super-short scroll and true cover fit.
 * UI-only: pulls next section up (no initial gap) + cover sizing.
 */
export default function HeroScrollYouTube({
  youtubeId,
  stickyVh = 60,
  extraScrollVh = 8,
  title = "",
  description = "",
}) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const overlayRef = useRef(null);
  const textRef = useRef(null);

  const fitIframe = () => {
    const wrap = videoRef.current, iframe = iframeRef.current;
    if (!wrap || !iframe) return;
    const rect = wrap.getBoundingClientRect();
    const W = rect.width, H = rect.height, ASPECT = 16 / 9;

    let w = W, h = W / ASPECT;
    if (h < H) { h = H; w = H * ASPECT; }

    iframe.style.width = `${w}px`;
    iframe.style.height = `${h}px`;
    iframe.style.left = `${(W - w) / 2}px`;
    iframe.style.top = `${(H - h) / 2}px`;
  };

  useEffect(() => {
    if (!sectionRef.current) return;
    const prefersReduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    const updateScroll = () => {
      if (prefersReduced) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = sectionRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 1;

        const p = Math.min(1, Math.max(0, (0 - rect.top) / (rect.height - vh)));

        const opacity = 1 - 0.7 * p;      // 1 -> 0.3
        const scale = 1 + 0.05 * p;       // 1 -> 1.05
        const overlay = 0.2 + 0.4 * p;    // 0.2 -> 0.6
        const textOpacity = 1 - 0.15 * p; // 1 -> 0.85

        if (videoRef.current) {
          videoRef.current.style.opacity = opacity.toString();
          videoRef.current.style.transform = `scale(${scale})`;
        }
        if (overlayRef.current) {
          overlayRef.current.style.background = `linear-gradient(
            to top,
            rgba(0,0,0,${overlay}),
            rgba(0,0,0,${overlay * 0.5}),
            rgba(0,0,0,0)
          )`;
        }
        if (textRef.current) {
          textRef.current.style.opacity = textOpacity.toString();
        }
      });
    };

    fitIframe();
    updateScroll();
    const onResize = () => { fitIframe(); updateScroll(); };
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf);
    };
  }, []);

  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&modestbranding=1&rel=0&showinfo=0&playlist=${youtubeId}`;
  const sectionVh = Math.max(1, stickyVh + extraScrollVh);

  return (
    <section
      ref={sectionRef}
      className="full-bleed relative overflow-hidden"   // 🔑 prevent horiz. scroll
      style={{
        height: `${sectionVh}vh`,
        marginBottom: `-${extraScrollVh}vh`,           // 🔑 remove initial white gap
      }}
      aria-label={title || "Hero"}
    >
      <div
        className="sticky top-0 overflow-hidden bg-black"
        style={{ height: `${stickyVh}vh` }}
      >
        <div className="absolute inset-0">
          <div
            ref={videoRef}
            className="absolute inset-0 will-change-transform transition-transform duration-300 ease-out"
            style={{ transform: "scale(1)", opacity: 1 }}
          >
            <iframe
              ref={iframeRef}
              title={title || "Hero video"}
              src={src}
              allow="autoplay; fullscreen; picture-in-picture"
              loading="lazy"
              style={{ position: "absolute" }}         // sized by fitIframe()
            />
          </div>

          <div
            ref={overlayRef}
            className="pointer-events-none absolute inset-0"
            aria-hidden="true"
          />

          {/* bottom-left text, unchanged */}
          <div
            ref={textRef}
            className="absolute inset-0 flex items-end justify-start"
            style={{ opacity: 1 }}
          >
            <div className="w-full max-w-[1100px] px-4 md:px-8 pb-6">
              <div className="max-w-3xl">
                {!!title && (
                  <h1 className="text-white font-extrabold text-3xl md:text-5xl leading-tight">
                    {title}
                  </h1>
                )}
                {!!description && (
                  <p className="mt-3 text-white/90 text-base md:text-lg">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* anchor for where content begins after sticky height */}
        <div className="absolute inset-x-0" style={{ top: `${stickyVh}vh` }} aria-hidden="true" />
      </div>
    </section>
  );
}
