// frontend/src/components/HeroYoutubeAutoplay.jsx
import React, { useEffect, useRef, useState } from 'react'

/**
 * Autoplaying 16:9 background video hero (muted, looped)
 * - Lazy mounts when near viewport
 * - Shimmer skeleton until loaded
 * - Hover zoom (desktop)
 * - Parallax + subtle scale/opacity on scroll
 * Props: { youtubeId, titleText, descriptionText }
 */
export default function HeroYoutubeAutoplay({ youtubeId, titleText, descriptionText }) {
  const rootRef = useRef(null)
  const videoRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(false)

  // Lazy-mount iframe
  useEffect(() => {
    if (!rootRef.current) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true)
            io.disconnect()
          }
        })
      },
      { rootMargin: '600px' }
    )
    io.observe(rootRef.current)
    return () => io.disconnect()
  }, [])

  // Parallax + scale/opacity while section is on screen
  useEffect(() => {
    if (!rootRef.current) return
    let raf = 0
    let active = true
    const el = rootRef.current

    const io = new IntersectionObserver(
      (entries) => {
        active = entries[0]?.isIntersecting ?? false
        if (active) loop()
        else cancelAnimationFrame(raf)
      },
      { threshold: [0, 1] }
    )
    io.observe(el)

    const loop = () => {
      if (!active) return
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || 1
      const range = Math.min(1, Math.max(0, 1 - Math.abs((rect.top + rect.height / 2 - vh / 2) / (vh / 2))))
      // translateY: -10px → +10px as you scroll
      const tY = (1 - range) * 20 - 10
      // scale: 1 → 0.97 (subtle)
      const sc = 1 - (1 - range) * 0.03
      // text opacity: 1 → 0.85
      const op = 0.85 + range * 0.15

      if (videoRef.current) {
        videoRef.current.style.transform = `translateY(${tY}px) scale(1.03)` // base hover scale is handled via group-hover
      }
      el.style.setProperty('--hero-scale', sc)
      el.style.setProperty('--hero-text-opacity', op.toString())

      raf = requestAnimationFrame(loop)
    }

    loop()
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [])

  const src = `https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&playsinline=1&modestbranding=1&rel=0&enablejsapi=1`

  return (
    <section
      ref={rootRef}
      className="relative group rounded-2xl md:rounded-3xl overflow-hidden"
      style={{ transform: 'scale(var(--hero-scale, 1))' }}
      aria-label={titleText}
    >
      <div className="relative w-full aspect-[16/9]">
        {/* shimmer skeleton */}
        {!ready && (
          <div className="absolute inset-0 bg-black/10 dark:bg-white/10">
            <div className="absolute inset-0 animate-[hero-shimmer_1.2s_linear_infinite] bg-[linear-gradient(110deg,rgba(255,255,255,0)_0%,rgba(255,255,255,.6)_40%,rgba(255,255,255,0)_80%)] opacity-30" />
          </div>
        )}

        {/* iframe video (lazy) */}
        {visible && (
          <div
            ref={videoRef}
            className="absolute inset-0 will-change-transform transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          >
            <iframe
              title={titleText}
              className="absolute inset-0 w-full h-full"
              src={src}
              allow="autoplay; fullscreen; picture-in-picture"
              loading="lazy"
              onLoad={() => setReady(true)}
            />
          </div>
        )}

        {/* overlays for readability */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

        {/* text content */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-4 md:p-8 gap-2"
          style={{ opacity: 'var(--hero-text-opacity, 1)' }}
        >
          <h1 className="text-white text-2xl md:text-4xl font-extrabold truncate">{titleText}</h1>
          <p className="text-white/90 line-clamp-3 max-w-3xl">
            {descriptionText}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes hero-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  )
}
