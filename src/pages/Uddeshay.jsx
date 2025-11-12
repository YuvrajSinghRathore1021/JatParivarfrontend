import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLang } from '../lib/useLang'
import { fetchPublicPage } from '../lib/publicApi'

const DEFAULT = {
  heroTitle: {
    en: 'Purpose of the Jat Parivar Portal',
    hi: 'जाट परिवार पोर्टल का उद्देश्य',
  },
  intro: {
    en: 'The Jat Parivar Portal exists to preserve community history while delivering verified, modern services for every household.',
    hi: 'जाट परिवार पोर्टल का लक्ष्य सामुदायिक इतिहास को संजोते हुए हर परिवार तक आधुनिक और सत्यापित सेवाएँ पहुँचाना है।',
  },
  closing: {
    en: 'Together we can accelerate education, entrepreneurship, and cultural pride for the Jat Parivar across the globe.',
    hi: 'मिलकर हम शिक्षा, उद्यमिता और सांस्कृतिक गौरव को विश्वभर में गति दे सकते हैं।',
  },
  pillars: [
    {
      id: 'pillar-inclusive',
      heading: {
        en: 'Inclusive digital access',
        hi: 'समावेशी डिजिटल पहुँच',
      },
      body: {
        en: 'Every feature is available in Hindi and English, accessible on mobile and desktop, with focus on elders and first-time smartphone users.',
        hi: 'हर फीचर हिंदी और अंग्रेज़ी में उपलब्ध है ताकि वरिष्ठों और नए स्मार्टफोन उपयोगकर्ताओं को भी सहज अनुभव मिले।',
      },
    },
    {
      id: 'pillar-trust',
      heading: {
        en: 'Trust & compliance first',
        hi: 'विश्वास व अनुपालन सर्वोपरि',
      },
      body: {
        en: 'OTP verification, Airtel DLT SMS, Aadhaar-based KYC, and admin approvals create a safe environment for sensitive data.',
        hi: 'OTP सत्यापन, एयरटेल DLT SMS, आधार आधारित KYC और एडमिन अनुमोदन संवेदनशील जानकारी को सुरक्षित रखते हैं।',
      },
    },
    {
      id: 'pillar-community',
      heading: {
        en: 'Community-led governance',
        hi: 'समुदाय संचालित संचालन',
      },
      body: {
        en: 'Founders and members elect moderators, track impact dashboards, and make transparent decisions on scholarships and campaigns.',
        hi: 'फाउंडर्स और सदस्य मॉडरेटर चुनते हैं, प्रभाव डैशबोर्ड देखते हैं और छात्रवृत्ति व अभियानों पर पारदर्शी निर्णय लेते हैं।',
      },
    },
  ],
}

const combineContent = (page) => {
  if (!page) {
    return DEFAULT
  }

  const contentEn = page.contentEn || {}
  const contentHi = page.contentHi || {}

  const heroTitle = {
    en: page?.titleEn || DEFAULT.heroTitle.en,
    hi: page?.titleHi || DEFAULT.heroTitle.hi,
  }

  const intro = {
    en: contentEn.intro ?? DEFAULT.intro.en,
    hi: contentHi.intro ?? DEFAULT.intro.hi,
  }

  const closing = {
    en: contentEn.closing ?? DEFAULT.closing.en,
    hi: contentHi.closing ?? DEFAULT.closing.hi,
  }

  const enPillars = Array.isArray(contentEn.pillars) ? contentEn.pillars : []
  const hiPillars = Array.isArray(contentHi.pillars) ? contentHi.pillars : []

  const pillars = (enPillars.length ? enPillars : DEFAULT.pillars).map((pillar, idx) => {
    const id = pillar.id || `pillar-${idx}`
    const hiMatch = hiPillars.find((p) => p?.id === id) || hiPillars[idx] || {}
    return {
      id,
      heading: {
        en: pillar.heading || DEFAULT.pillars[idx % DEFAULT.pillars.length].heading.en,
        hi: hiMatch.heading || DEFAULT.pillars[idx % DEFAULT.pillars.length].heading.hi,
      },
      body: {
        en: pillar.body || DEFAULT.pillars[idx % DEFAULT.pillars.length].body.en,
        hi: hiMatch.body || DEFAULT.pillars[idx % DEFAULT.pillars.length].body.hi,
      },
    }
  })

  return { heroTitle, intro, closing, pillars }
}

export default function Uddeshay() {
  const { lang } = useLang()
  const langKey = lang === 'hi' ? 'hi' : 'en'

  const { data } = useQuery({
    queryKey: ['public', 'page', 'Uddeshay'],
    queryFn: () => fetchPublicPage('Uddeshay'),
    staleTime: 5 * 60 * 1000,
  })

  const content = useMemo(() => combineContent(data), [data])
  const pillars = content.pillars.length ? content.pillars : DEFAULT.pillars

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <header className="space-y-3">
          <h1 className="text-3xl font-extrabold text-slate-900">{content.heroTitle[langKey]}</h1>
          <p className="text-lg text-slate-600 leading-relaxed">{content.intro[langKey]}</p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.id}
              className="rounded-3xl border border-slate-200 bg-slate-50/60 p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-slate-900">{pillar.heading[langKey]}</h2>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{pillar.body[langKey]}</p>
            </article>
          ))}
        </section>

        <p className="text-lg text-slate-700 leading-relaxed">{content.closing[langKey]}</p>
      </div>
    </main>
  )
}
