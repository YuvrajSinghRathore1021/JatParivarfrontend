import React, { useMemo } from "react";

/**
 * Vertical auto-scrolling achievements/news ticker.
 * - Infinite scroll (duplicated list)
 * - Pauses on hover/focus
 * - No scrollbar, smooth, modern card
 *
 * Props:
 *  - heading: string
 *  - items: string[] (short lines; numbers look great with tabular-nums)
 *  - durationSeconds?: number  (full loop time; default based on items)
 *  - heightClass?: string     (fixed viewport height; default h-56 md:h-64)
 */
export default function AchievementsTicker({
  heading = "Impact & milestones",
  items = [],
  durationSeconds,
  heightClass = "h-56 md:h-64",
}) {
  const list = useMemo(() => (items.length ? items : ["—"]), [items]);
  const duration = useMemo(
    () => durationSeconds || Math.max(14, list.length * 2.8), // scale with length
    [durationSeconds, list.length]
  );

  return (
    <section aria-label={heading}>
      {/* local keyframes + pause-on-hover styles */}
      <style>{`
        @keyframes jp-scroll-up {
          0%   { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .jp-ticker-anim {
          animation: jp-scroll-up linear infinite;
          will-change: transform;
        }
        .group:hover .jp-ticker-anim,
        .group:focus-within .jp-ticker-anim {
          animation-play-state: paused;
        }
      `}</style>

      <div className="group rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between border-b border-slate-200">
          <h3 className="text-base md:text-lg font-extrabold text-slate-900">{heading}</h3>
          <span className="text-xs font-medium text-slate-500">Live</span>
        </div>

        {/* viewport with subtle fade (mask) top/bottom */}
        <div
          className={`relative overflow-hidden ${heightClass}`}
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0, black 14px, black calc(100% - 14px), transparent 100%)",
            maskImage:
              "linear-gradient(to bottom, transparent 0, black 14px, black calc(100% - 14px), transparent 100%)",
          }}
        >
          {/* track: duplicate list for seamless loop */}
          <ul
            className="jp-ticker-anim"
            style={{ animationDuration: `${duration}s` }}
            aria-live="polite"
          >
            {[...list, ...list].map((line, i) => (
              <li
                key={i}
                className="px-5 py-3 border-b border-slate-100 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500/90 shrink-0" />
                  <p className="text-slate-900 font-medium leading-6 tabular-nums">
                    {line}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* hint row (optional) */}
        <div className="px-5 py-2 text-[11px] text-slate-500 border-t border-slate-100">
          Hover to pause • Auto updates
        </div>
      </div>
    </section>
  );
}
