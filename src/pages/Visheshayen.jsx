import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLang } from '../lib/useLang'
import { fetchPublicPage } from '../lib/publicApi'

const DEFAULT = {
  heroTitle: {
    en: 'Key highlights of the portal',
    hi: 'पोर्टल की प्रमुख विशेषताएँ',
  },
  intro: {
    en: 'From bilingual routing to PhonePe payments, the Jat Parivar Portal has been designed as a production-ready digital home.',
    hi: 'द्विभाषी रूटिंग से लेकर PhonePe भुगतान तक, जाट परिवार पोर्टल को प्रोडक्शन-रेडी डिजिटल प्लेटफ़ॉर्म के रूप में तैयार किया गया है।',
  },
  items: [
    {
      id: 'highlight-bilingual',
      heading: {
        en: 'Bilingual & SEO friendly',
        hi: 'द्विभाषी एवं SEO अनुकूल',
      },
      body: {
        en: 'Every URL works at /en and /hi with language toggles that preserve routes and generate hreflang tags.',
        hi: 'हर URL /en और /hi पर काम करता है, भाषा टॉगल रास्ता बनाए रखता है और hreflang टैग बनते हैं।',
      },
    },
    {
      id: 'highlight-payments',
      heading: {
        en: 'PhonePe payment integration',
        hi: 'PhonePe भुगतान इंटीग्रेशन',
      },
      body: {
        en: 'Founder, Member, and Sadharan subscriptions are paid through PhonePe with webhook confirmation and invoices.',
        hi: 'Founder, Member और साधारण सदस्यता PhonePe से भुगतान के साथ वेबहुक कन्फर्मेशन व इनवॉइस उपलब्ध।',
      },
    },
    {
      id: 'highlight-security',
      heading: {
        en: 'Single-device security',
        hi: 'सिंगल-डिवाइस सुरक्षा',
      },
      body: {
        en: 'JWT tokens tied to device IDs ensure only one active session per user; logout other devices anytime.',
        hi: 'डिवाइस ID से बंधे JWT टोकन केवल एक सक्रिय सेशन की अनुमति देते हैं; कभी भी दूसरे डिवाइस से लॉगआउट करें।',
      },
    },
    {
      id: 'highlight-modular',
      heading: {
        en: 'Modular member services',
        hi: 'मॉड्यूलर सदस्य सेवाएँ',
      },
      body: {
        en: 'Marriage, jobs, dharamshalaye, and sansthaye modules share approvals and analytics dashboards.',
        hi: 'विवाह, नौकरी, धर्मशाला और संस्था मॉड्यूल साझा अनुमोदन और एनालिटिक्स डैशबोर्ड का उपयोग करते हैं।',
      },
    },
    {
      id: 'highlight-pwa',
      heading: {
        en: 'PWA ready',
        hi: 'PWA तैयार',
      },
      body: {
        en: 'Installable on Android and desktop with manifest, icons, and offline shell for key static assets.',
        hi: 'Android व डेस्कटॉप पर इंस्टॉल किया जा सकता है; मैनिफेस्ट, आइकन और ऑफलाइन शैल मौजूद।',
      },
    },
    {
      id: 'highlight-observability',
      heading: {
        en: 'Admin observability',
        hi: 'एडमिन मॉनिटरिंग',
      },
      body: {
        en: 'Audit logs, content staging, and approvals keep every module accountable.',
        hi: 'ऑडिट लॉग, कंटेंट स्टेजिंग और अनुमोदन हर मॉड्यूल को जवाबदेह रखते हैं।',
      },
    },
  ],
}

const normalizeHighlights = (page) => {
  if (!page) return DEFAULT
  const contentEn = page.contentEn || {}
  const contentHi = page.contentHi || {}

  const heroTitle = {
    en: page.titleEn || DEFAULT.heroTitle.en,
    hi: page.titleHi || DEFAULT.heroTitle.hi,
  }
  const intro = {
    en: contentEn.intro ?? DEFAULT.intro.en,
    hi: contentHi.intro ?? DEFAULT.intro.hi,
  }

  const enItems = Array.isArray(contentEn.items) ? contentEn.items : []
  const hiItems = Array.isArray(contentHi.items) ? contentHi.items : []

  const items = (enItems.length ? enItems : DEFAULT.items).map((item, idx) => {
    const id = item.id || `highlight-${idx}`
    const hiMatch = hiItems.find((it) => it?.id === id) || hiItems[idx] || {}
    const fallback = DEFAULT.items[idx % DEFAULT.items.length]
    return {
      id,
      heading: {
        en: item.heading || fallback.heading.en,
        hi: hiMatch.heading || fallback.heading.hi,
      },
      body: {
        en: item.body || fallback.body.en,
        hi: hiMatch.body || fallback.body.hi,
      },
    }
  })

  return { heroTitle, intro, items }
}

export default function Visheshayen() {
  const { lang } = useLang()
  const langKey = lang === 'hi' ? 'hi' : 'en'

  const { data } = useQuery({
    queryKey: ['public', 'page', 'visheshayen'],
    queryFn: () => fetchPublicPage('visheshayen'),
    staleTime: 5 * 60 * 1000,
  })

  const content = useMemo(() => normalizeHighlights(data), [data])
  const items = content.items.length ? content.items : DEFAULT.items

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[1000px] px-4 sm:px-6 lg:px-8 py-16 space-y-10">
        <header className="space-y-3 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900">{content.heroTitle[langKey]}</h1>
          <p className="text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {content.intro[langKey]}
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {items.map((feature, idx) => (
            <article
              key={feature.id}
              className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold">
                  {idx + 1}
                </span>
                <h2 className="text-lg font-semibold text-slate-900">{feature.heading[langKey]}</h2>
              </div>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{feature.body[langKey]}</p>
            </article>
          ))}
        </section>
      </div>
    </main>
  )
}
