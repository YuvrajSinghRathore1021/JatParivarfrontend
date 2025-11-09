import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLang } from '../lib/useLang'
import { fetchPublicHistory, fetchPublicPage } from '../lib/publicApi'

const DEFAULT = {
  heroTitle: {
    en: 'History of Jat Parivar initiatives',
    hi: 'जाट परिवार पहलों का इतिहास',
  },
  intro: {
    en: 'The Jat Parivar has led educational, cultural, and social upliftment programmes for decades. The portal records key milestones.',
    hi: 'जाट परिवार ने दशकों से शिक्षा, संस्कृति और सामाजिक उत्थान के कार्यक्रम संचालित किए हैं। यह पोर्टल प्रमुख मील के पत्थर संजोता है।',
  },
  timeline: [
    {
      id: '1987',
      year: '1987',
      title: {
        en: 'Jat Bhawan established in Jaipur',
        hi: 'जयपुर में जाट भवन की स्थापना',
      },
      body: {
        en: 'Community leaders created a permanent base for welfare meetings and hostel support.',
        hi: 'सामुदायिक नेताओं ने कल्याण बैठकों और छात्रावास सहायता के लिए स्थायी केंद्र बनाया।',
      },
    },
    {
      id: '2004',
      year: '2004',
      title: {
        en: 'Scholarship fund launched',
        hi: 'स्कॉलरशिप फंड की शुरुआत',
      },
      body: {
        en: 'First cohort of 120 students received merit-based aid for higher studies across India.',
        hi: '120 छात्रों के पहले बैच को भारत भर में उच्च शिक्षा के लिए मेरिट आधारित सहायता मिली।',
      },
    },
    {
      id: '2015',
      year: '2015',
      title: {
        en: 'Jat Parivar magazine digitised',
        hi: 'जाट परिवार पत्रिका का डिजिटलीकरण',
      },
      body: {
        en: 'The print patrika was digitised with archives, oral histories, and diaspora contributions.',
        hi: 'प्रिंट पत्रिका को डिजिटल आर्काइव, मौखिक इतिहास और प्रवासी योगदान के साथ उपलब्ध कराया गया।',
      },
    },
    {
      id: '2025',
      year: '2025',
      title: {
        en: 'Unified digital portal beta',
        hi: 'एकीकृत डिजिटल पोर्टल बीटा',
      },
      body: {
        en: 'Marriage, jobs, dharamshala, and membership flows were consolidated with PhonePe payments.',
        hi: 'विवाह, नौकरियाँ, धर्मशाला और सदस्यता प्रवाह को PhonePe भुगतान के साथ एकीकृत किया गया।',
      },
    },
  ],
}

const mergeHistoryContent = (page, items) => {
  const contentEn = page?.contentEn || {}
  const contentHi = page?.contentHi || {}

  const heroTitle = {
    en: page?.titleEn || DEFAULT.heroTitle.en,
    hi: page?.titleHi || DEFAULT.heroTitle.hi,
  }

  const intro = {
    en: contentEn.intro ?? DEFAULT.intro.en,
    hi: contentHi.intro ?? DEFAULT.intro.hi,
  }

  const timeline = (items?.length ? items : []).map((item, idx) => {
    const fallback = DEFAULT.timeline[idx % DEFAULT.timeline.length]
    return {
      id: item.id || `history-${idx}`,
      year: item.year || fallback.year,
      title: {
        en: item.titleEn || fallback.title.en,
        hi: item.titleHi || fallback.title.hi,
      },
      body: {
        en: item.bodyEn || fallback.body.en,
        hi: item.bodyHi || fallback.body.hi,
      },
    }
  })

  return {
    heroTitle,
    intro,
    timeline: timeline.length ? timeline : DEFAULT.timeline,
  }
}

export default function History() {
  const { lang } = useLang()
  const langKey = lang === 'hi' ? 'hi' : 'en'

  const { data: pageData } = useQuery({
    queryKey: ['public', 'page', 'history'],
    queryFn: () => fetchPublicPage('history'),
    staleTime: 5 * 60 * 1000,
  })

  const { data: historyItems } = useQuery({
    queryKey: ['public', 'history', langKey],
    queryFn: () => fetchPublicHistory('history'),
    staleTime: 5 * 60 * 1000,
  })

  const merged = useMemo(
    () => mergeHistoryContent(pageData, historyItems),
    [pageData, historyItems]
  )

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">{merged.heroTitle[langKey]}</h1>
          <p className="text-slate-600 leading-relaxed">{merged.intro[langKey]}</p>
        </header>

        <section className="relative border-l-2 border-slate-200 pl-8 space-y-8">
          {merged.timeline.map((milestone) => (
            <article key={milestone.id} className="relative">
              {milestone.year ? (
                <span className="absolute -left-[42px] top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                  {milestone.year}
                </span>
              ) : null}
              <h2 className="text-xl font-semibold text-slate-900">{milestone.title[langKey]}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{milestone.body[langKey]}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
