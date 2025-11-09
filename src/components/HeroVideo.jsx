// frontend/src/components/HeroVideo.jsx
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function HeroVideo() {
  const [muted, setMuted] = useState(true)
  const { t, i18n } = useTranslation()

  return (
    <section className="relative overflow-hidden rounded-2xl md:rounded-3xl aspect-video">
      {/* YouTube video embed */}
      <iframe
        className="w-full h-[50vh] md:h-[70vh] object-cover"
        src={`https://www.youtube.com/embed/LyROt7AWuNo?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=LyROt7AWuNo&controls=0&modestbranding=1&showinfo=0&rel=0`}
        title="Hero video"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      ></iframe>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent"></div>

      {/* Hero text */}
      <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 text-white max-w-3xl">
        <h1 className="text-2xl md:text-5xl font-extrabold drop-shadow">
          {t('hero_title')}
        </h1>
        <div className="mt-4 flex gap-3">
          <a
            href={`/${i18n.language}/register`}
            className="px-5 py-3 bg-primary-600 rounded-xl"
          >
            {t('cta_join')}
          </a>
          <a
            href={`/${i18n.language}/uddeshya`}
            className="px-5 py-3 bg-white/10 backdrop-blur rounded-xl border border-white/30"
          >
            {t('cta_explore')}
          </a>
          <button
            onClick={() => setMuted((m) => !m)}
            className="px-3 py-3 bg-black/40 rounded-xl border border-white/20"
          >
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>
    </section>
  )
}


/*
Take your YouTube link — e.g.

https://www.youtube.com/watch?v=dQw4w9WgXcQ


Copy only the video ID part (dQw4w9WgXcQ).

Replace it in both places in the code:

src={`https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=dQw4w9WgXcQ`}
*/