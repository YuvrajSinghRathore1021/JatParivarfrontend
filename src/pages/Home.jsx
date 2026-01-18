import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import HeroScrollYouTube from '../components/HeroScrollYouTube'
import AdSlot from '../components/AdSlot'
import Shelf from '../components/Shelf'
import CardPromo from '../components/cards/CardPromo'
import CardProduct from '../components/cards/CardProduct'
import FeesCarousel from '../components/FeesCarousel'
import AchievementsTicker from '../components/AchievementsTicker'
import { useLang } from '../lib/useLang'
import { fetchHomeImpact, fetchHomeImpactachievement, fetchPublicNewsTop, fetchPublicPeople, fetchPublicPlans } from '../lib/publicApi'

// ===== Avatar helpers (fallback when DB doesn't have avatarUrl) =====
const AVATAR_COLORS = ['#3B82F6', '#EF4444', '#9CA3AF', '#22C55E']
const makeAvatar = (color = '#9CA3AF') => {
  const svg = `<?xml version='1.0' encoding='UTF-8'?><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='50' fill='${color}'/><circle cx='50' cy='36' r='16' fill='white' fill-opacity='.92'/><path d='M18 82c8-14 23-22 32-22s24 8 32 22H18z' fill='white' fill-opacity='.92'/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '₹0'
  return `₹${value.toLocaleString('en-IN')}`
}

const formatNewsDate = (value, lang) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const content = {
  en: {
    hero: {
      title: 'One united digital home for the Jat Parivar',
      description:
        'Scholarships, matrimony, jobs, dharamshalas, and institutions—curated in one secure bilingual portal.',
    },
    purpose: {
      heading: 'Our purpose',
      body:
        'We build transparent, tech-powered services so every Jat Parivar household can access verified opportunities and trusted community networks.',
      cta: 'Read the full charter',
    },
    whatWeDo: {
      heading: 'What we do',
      cards: [
        {
          kind: 'promo',
          headline: 'Digital empowerment initiatives',
          subtext: 'From school scholarships to youth skilling cohorts delivered across Rajasthan.',
          image: 'https://api.jatparivar.org/uploads/1763512434457_Digital_empowerment_initiatives.jpeg',
          href: '#',
        },
        {
          kind: 'promo',
          headline: 'Jobs & entrepreneurship',
          subtext: 'Post verified openings, shortlist candidates, and manage applicants in one workspace.',
          image: 'https://api.jatparivar.org/uploads/1763512439496_Jobs.jpeg',
          href: '#',
        },
        {
          kind: 'promo',
          headline: 'Marriage services',
          subtext: 'Secure profiles with OTP verified contacts and mutual interest reveal.',
          image: 'https://api.jatparivar.org/uploads/1763512428020_Marriage.jpeg',
          href: '#',
        },
        {
          kind: 'promo',
          headline: 'Dharamshala & Sanstha directory',
          subtext: 'Track availability, facilities, and approvals before you travel.',
          image: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=600&q=80',
          href: '#',
        },
      ],
    },
    foundersHeading: 'Founders',
    managementHeading: 'Management',
    impactHeading: 'Impact & milestones',
    impactIntro: 'Live snapshots from the community programmes and services.',
    impactMilestonesHeading: 'Recent milestones',
    newsHeading: 'Latest community news',
    newsItems: [
      { title: 'Scholarship cohort 2025 opens for applications', time: '2 days ago' },
      { title: 'Jaipur Times partners for youth entrepreneurship drive', time: '1 week ago' },
      { title: 'Dharamshala facilities upgraded in Mathura and Haridwar', time: '3 weeks ago' },
    ],
    whyJoin: {
      heading: 'Why join our portal',
      cards: [
        { title: 'End-to-end security', body: 'Single-device login with OTP, encrypted uploads, and manual moderation on every listing.' },
        { title: 'Real impact data', body: 'Dashboards with stats on jobs closed, marriages matched, and funds deployed.' },
        { title: 'Language first', body: 'Full Hindi and English experiences with URL parity and SEO-ready hreflang tags.' },
      ],
    },
    feesHeading: 'Membership fees',
    feesBody: 'Founder ₹1,01,000 • Member ₹50,000 • Sadharan ₹2,100',
  },
  hi: {
    hero: {
      title: 'जाट परिवार के लिए एकीकृत डिजिटल घर',
      description:
        'छात्रवृत्ति, विवाह, नौकरियाँ, धर्मशालाएँ और संस्थाएँ — सब कुछ सुरक्षित द्विभाषी पोर्टल में।',
    },
    purpose: {
      heading: 'हमारा उद्देश्य',
      body:
        'हर जाट परिवार तक पारदर्शी, तकनीक-संचालित सेवाएँ पहुँचाना ताकि अवसर और भरोसेमंद नेटवर्क आसानी से मिल सकें।',
      cta: 'पूरा चार्टर पढ़ें',
    },
    whatWeDo: {
      heading: 'हम क्या करते हैं',
      cards: [
        {
          kind: 'promo',
          headline: 'डिजिटल सशक्तिकरण पहल',
          subtext: 'स्कॉलरशिप से लेकर युवाओं की स्किलिंग तक — राजस्थान भर में पहुँच।',
          image: 'https://api.jatparivar.org/uploads/1763512434457_Digital_empowerment_initiatives.jpeg',
          href: '#',
        },
        {
          kind: 'promo',
          headline: 'रोज़गार व उद्यम',
          subtext: 'सत्यापित जॉब पोस्ट करें, उम्मीदवार शॉर्टलिस्ट करें और एक ही जगह पर आवेदन प्रबंधित करें।',
          image: 'https://api.jatparivar.org/uploads/1763512439496_Jobs.jpeg',
          href: '#',
        },
        {
          kind: 'promo',
          headline: 'विवाह सेवा',
          subtext: 'OTP सत्यापन के साथ सुरक्षित प्रोफ़ाइल और परस्पर सहमति के बाद ही संपर्क।',
          image: 'https://api.jatparivar.org/uploads/1763512428020_Marriage.jpeg',
          href: '#',
        },
        {
          kind: 'promo',
          headline: 'धर्मशाला व संस्था निर्देशिका',
          subtext: 'यात्रा से पहले उपलब्धता, सुविधाएँ और अनुमोदन देखें।',
          image: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=600&q=80',
          href: '#',
        },
      ],
    },
    foundersHeading: 'संस्थापक',
    managementHeading: 'प्रबंधन टीम',
    impactHeading: 'प्रभाव और मील के पत्थर',
    impactIntro: 'समुदाय की पहलों और सेवाओं की ताज़ा झलकियाँ।',
    impactMilestonesHeading: 'हाल के मील के पत्थर',
    newsHeading: 'ताज़ा सामुदायिक समाचार',
    newsItems: [
      { title: 'स्कॉलरशिप बैच 2025 के लिए आवेदन शुरू', time: '2 दिन पहले' },
      { title: 'जयपुर टाइम्स के साथ युवा उद्यम अभियान', time: '1 सप्ताह पहले' },
      { title: 'मथुरा व हरिद्वार धर्मशालाओं में सुविधाएँ अपग्रेड', time: '3 सप्ताह पहले' },
    ],
    whyJoin: {
      heading: 'हमारे पोर्टल से क्यों जुड़ें',
      cards: [
        { title: 'पूरी सुरक्षा', body: 'OTP आधारित लॉगिन, एन्क्रिप्टेड अपलोड और हर लिस्टिंग पर मॉडरेशन।' },
        { title: 'प्रभाव का आँकड़ा', body: 'डैशबोर्ड में नौकरियों, विवाह मिलान और निधि वितरण का लाइव डेटा।' },
        { title: 'भाषा प्राथमिकता', body: 'URL समानता के साथ हिंदी और अंग्रेज़ी अनुभव, SEO के लिए तैयार hreflang टैग।' },
      ],
    },
    feesHeading: 'सदस्य शुल्क',
    feesBody: 'फाउंडर ₹1,01,000 • मेम्बर ₹50,000 • साधारण ₹2,100',
  },
}

const DEFAULT_NEWS = [
  {
    slug: 'scholarship-2025',
    title: {
      en: 'Scholarship 2025: applications now open',
      hi: 'स्कॉलरशिप 2025: आवेदन शुरू',
    },
    date: '2025-03-14T00:00:00.000Z',
    excerpt: {
      en: 'Submit your verified documents before 30 March to be eligible for the founder-funded scholarship.',
      hi: 'फाउंडर द्वारा समर्थित छात्रवृत्ति के लिए 30 मार्च से पहले सत्यापित दस्तावेज़ जमा करें।',
    },
  },
  {
    slug: 'phonepe-success',
    title: {
      en: 'PhonePe integration completes first 1000 transactions',
      hi: 'PhonePe इंटीग्रेशन ने 1000 ट्रांजैक्शन पूरे किए',
    },
    date: '2025-03-02T00:00:00.000Z',
    excerpt: {
      en: 'Instant receipts, auto-upgrades, and invoice downloads are now live for all plans.',
      hi: 'अब सभी प्लान के लिए तुरंत रसीद, ऑटो अपग्रेड और इनवॉइस डाउनलोड उपलब्ध।',
    },
  },
  {
    slug: 'heritage-tour',
    title: {
      en: 'Heritage tour to Lohagarh Fort announced',
      hi: 'लोहागढ़ फोर्ट हेरिटेज टूर की घोषणा',
    },
    date: '2025-02-18T00:00:00.000Z',
    excerpt: {
      en: 'Limited seats for members to explore Bharatpur history with curated storytellers.',
      hi: 'सदस्यों के लिए सीमित सीटें – भरतपुर इतिहास को क्यूरेटेड स्टोरीटेलर्स के साथ जानें।',
    },
  },
]

const DEFAULT_IMPACT = {
  stats: [
    {
      id: 'families',
      value: '12,430',
      label: { en: 'Registered families', hi: 'पंजीकृत परिवार' },
      description: {
        en: 'Members verified across Rajasthan and NCR.',
        hi: 'राजस्थान और NCR में सत्यापित सदस्य।',
      },
    },
    {
      id: 'placements',
      value: '1,128',
      label: { en: 'Job placements', hi: 'नौकरी प्लेसमेंट' },
      description: {
        en: 'Offers accepted via the employment desk.',
        hi: 'रोज़गार डेस्क के माध्यम से स्वीकृत ऑफ़र।',
      },
    },
    {
      id: 'scholarships',
      value: '312',
      label: { en: 'Scholarships awarded', hi: 'स्कॉलरशिप प्रदान' },
      description: {
        en: 'Students funded for higher education.',
        hi: 'उच्च शिक्षा के लिए समर्थित विद्यार्थी।',
      },
    },
  ],
  milestones: [
    {
      id: 'milestone-1987',
      title: {
        en: 'Jat Bhawan inaugurated in Jaipur',
        hi: 'जयपुर में जाट भवन का उद्घाटन',
      },
      description: {
        en: 'Community leaders established a base for welfare programmes.',
        hi: 'समुदाय के नेताओं ने कल्याण कार्यक्रमों के लिए आधार बनाया।',
      },
      dateLabel: { en: '1987', hi: '1987' },
    },
    {
      id: 'milestone-2004',
      title: {
        en: 'Scholarship fund launched',
        hi: 'स्कॉलरशिप फंड की शुरुआत',
      },
      description: {
        en: 'First 120 scholars supported for higher studies across India.',
        hi: 'देशभर में 120 विद्यार्थियों को उच्च अध्ययन के लिए सहायता।',
      },
      dateLabel: { en: '2004', hi: '2004' },
    },
    {
      id: 'milestone-2025',
      title: {
        en: 'Digital portal beta',
        hi: 'डिजिटल पोर्टल बीटा',
      },
      description: {
        en: 'Membership, jobs, and matrimony rolled into one secure experience.',
        hi: 'सदस्यता, नौकरी और विवाह सेवाएँ एक सुरक्षित अनुभव में एकीकृत।',
      },
      dateLabel: { en: '2025', hi: '2025' },
    },
  ],
}

const PLAN_ORDER = ['founder', 'member', 'sadharan']

const PLAN_FALLBACKS = {
  founder: {
    titleEn: 'Founder',
    titleHi: 'फाउंडर',
    descriptionEn: 'Listed on the Founders page and hero strip.',
    descriptionHi: 'फाउंडर्स पेज और होम स्ट्रिप पर सूचीबद्ध।',
    price: 101000,
    buttonTextEn: 'Join now',
    buttonTextHi: 'जुड़ें',
  },
  member: {
    titleEn: 'Member',
    titleHi: 'मेम्बर',
    descriptionEn: 'Appears on member carousel and gains full access.',
    descriptionHi: 'मेंबर करूसल पर दिखाई देंगे और सभी सेवाएँ उपलब्ध।',
    price: 50000,
    buttonTextEn: 'Join now',
    buttonTextHi: 'जुड़ें',
  },
  sadharan: {
    titleEn: 'Sadharan',
    titleHi: 'साधारण',
    descriptionEn: 'Unlocks member-only services instantly.',
    descriptionHi: 'सदस्य विशेष सेवाओं तक तुरंत पहुँच।',
    price: 2100,
    buttonTextEn: 'Join now',
    buttonTextHi: 'जुड़ें',
  },
}

const TICKER_FALLBACK = {
  en: [
    'Registered families — 12,430',
    'Verified profiles — 8,912',
    'Job placements — 1,128',
    'Matrimony matches — 312',
    'Institutions onboarded — 86',
    'Scholarship applications processed — 2,410',
    'Community donations routed — ₹1.9 Cr',
    'Community events hosted — 54',
  ],
  hi: [
    'पंजीकृत परिवार — 12,430',
    'सत्यापित प्रोफ़ाइल — 8,912',
    'जॉब प्लेसमेंट — 1,128',
    'विवाह मिलान — 312',
    'संस्थाएँ ऑनबोर्ड — 86',
    'स्कॉलरशिप आवेदन संसाधित — 2,410',
    'समुदाय दान मार्गित — ₹1.9 करोड़',
    'आयोजित कार्यक्रम — 54',
  ],
}

// map DB person → Shelf CardProduct props
function toProductCards(people, makePath, role) {
  return (people || []).map((p, idx) => {
    const user = p.user || p
    const image =
      user?.avatarUrl || makeAvatar(AVATAR_COLORS[idx % AVATAR_COLORS.length])
    const title =
      user?.displayName || user?.name || 'Member'
    const subTitle =
      p.spotlightTitle || p.title || p.person?.title || user?.title || ''

    const place =
      p.spotlightPlace || p.place || p.person?.place || user?.place || ''
    const urlid = p.id || p.id || p.person?.id || user?.id || ''

    return {
      kind: 'product',
      title,                          // CardProduct title
      price: [subTitle, place].filter(Boolean).join(' • ') || '', // shown under title
      image,                          // avatar/fallback
      href: makePath(role === 'founder' ? `founders/${urlid}` : `management/${urlid}`), // goes to full list page
    }
  })
}

export default function Home() {
  const { lang, makePath } = useLang()
  const langKey = lang === 'hi' ? 'hi' : 'en'
  const t = content[lang]

  // ===== Fetch spotlight people from DB (limit 10 each) =====
  const foundersQ = useQuery({
    queryKey: ['public', 'people', 'founder', 10],
    queryFn: () => fetchPublicPeople('founder', 10),
    staleTime: 30_000,
  })

  const managementQ = useQuery({
    queryKey: ['public', 'people', 'management', 10],
    queryFn: () => fetchPublicPeople('management', 10),
    staleTime: 30_000,
  })

  const newsQ = useQuery({
    queryKey: ['public', 'news'],
    queryFn: fetchPublicNewsTop,
    staleTime: 60_000,
  })

  const impactQ = useQuery({
    queryKey: ['public', 'home-impact'],
    queryFn: fetchHomeImpact,
    staleTime: 120_000,
  })

  const plansQ = useQuery({
    queryKey: ['public', 'plans'],
    queryFn: fetchPublicPlans,
    staleTime: 120_000,
  })

  const foundersCards = toProductCards(foundersQ.data, makePath, 'founder')
  const managementCards = toProductCards(managementQ.data, makePath, 'management')

  const newsItems = useMemo(() => {
    const list = Array.isArray(newsQ.data) ? newsQ.data : []
    if (list.length > 0) {
      return list.slice(0, 3).map((item) => ({
        slug: item.slug,
        title: langKey === 'hi' ? item.titleHi || item.titleEn : item.titleEn,
        excerpt: langKey === 'hi' ? item.excerptHi || item.excerptEn : item.excerptEn,
        date: formatNewsDate(item.publishedAt || item.createdAt, lang),
      }))
    }
    return DEFAULT_NEWS.slice(0, 3).map((fallback) => ({
      slug: fallback.slug,
      title: fallback.title[langKey],
      excerpt: fallback.excerpt[langKey],
      date: formatNewsDate(fallback.date, lang),
    }))
  }, [lang, langKey, newsQ.data])

  const impactStats = useMemo(() => {
    const source = Array.isArray(impactQ.data?.stats) && impactQ.data.stats.length
      ? impactQ.data.stats
      : DEFAULT_IMPACT.stats
    


    return source.map((stat, idx) => {
      const fallback = DEFAULT_IMPACT.stats[idx % DEFAULT_IMPACT.stats.length]
      
      // return {
      //   id: stat.id || fallback.id,
      //   // value: stat.value || fallback.value,
      //   value: stat.value || fallback.value,
      //   label: {
      //     en: stat.labelEn || stat.label?.en || fallback.label.en,
      //     hi: stat.labelHi || stat.label?.hi || fallback.label.hi,
      //   },
      //   description: {
      //     en: stat.descriptionEn || stat.description?.en || fallback.description.en,
      //     hi: stat.descriptionHi || stat.description?.hi || fallback.description.hi,
      //   },
      // }
      return {
        id: stat.id,
        value: stat.value,
        label: {
          en: stat.labelEn,
          hi: stat.labelEn,
        },
        description: {
          en: stat.descriptionEn,
          hi: stat.descriptionHi,
        },

        
      }
    })
  }, [impactQ.data])

  const impactMilestones = useMemo(() => {
    const source = Array.isArray(impactQ.data?.milestones) && impactQ.data.milestones.length
      ? impactQ.data.milestones
      : DEFAULT_IMPACT.milestones
    return source.map((milestone, idx) => {
      const fallback = DEFAULT_IMPACT.milestones[idx % DEFAULT_IMPACT.milestones.length]
      return {
        id: milestone.id || fallback.id,
        title: {
          en: milestone.titleEn || milestone.title?.en || fallback.title.en,
          hi: milestone.titleHi || milestone.title?.hi || fallback.title.hi,
        },
        description: {
          en: milestone.descriptionEn || milestone.description?.en || fallback.description.en,
          hi: milestone.descriptionHi || milestone.description?.hi || fallback.description.hi,
        },
        date: {
          en: milestone.dateLabelEn || milestone.dateLabel?.en || fallback.dateLabel.en,
          hi: milestone.dateLabelHi || milestone.dateLabel?.hi || fallback.dateLabel.hi,
        },
      }
    })
  }, [impactQ.data])

  const tickerItems = useMemo(() => {
    if (impactStats.length) {
      // return impactStats.map((stat) => `${stat.label[langKey]} — ${stat.value}`)
      return impactStats.map((stat) => `${stat.label[langKey]}`)
    }
    return langKey === 'hi' ? TICKER_FALLBACK.hi : TICKER_FALLBACK.en
  }, [impactStats, langKey])


  const membershipPlans = useMemo(() => {
    const data = Array.isArray(plansQ.data) ? plansQ.data : []
    const planMap = new Map(data.map((plan) => [plan.code, plan]))
    return PLAN_ORDER.map((code) => {
      const plan = planMap.get(code)
      const fallback = PLAN_FALLBACKS[code]
      return {
        id: code,
        title: {
          en: plan?.titleEn || fallback.titleEn,
          hi: plan?.titleHi || fallback.titleHi,
        },
        price: typeof plan?.price === 'number' ? plan.price : fallback.price,
        description: {
          en: plan?.descriptionEn || fallback.descriptionEn,
          hi: plan?.descriptionHi || fallback.descriptionHi,
        },
        buttonText: {
          en: plan?.buttonTextEn || fallback.buttonTextEn,
          hi: plan?.buttonTextHi || fallback.buttonTextHi,
        },
      }
    })
  }, [plansQ.data])

  const planDisplayCards = useMemo(
    () =>
      membershipPlans.map((plan) => ({
        id: plan.id,
        title: plan.title[langKey],
        price: formatCurrency(plan.price),
        description: plan.description[langKey],
        buttonText: plan.buttonText[langKey] || (langKey === 'hi' ? 'जुड़ें' : 'Join now'),
      })),
    [langKey, membershipPlans]
  )

  return (
    <main className="pb-20 bg-slate-50 overflow-x-hidden">
      <HeroScrollYouTube
        youtubeId="LyROt7AWuNo"
        stickyVh={60}
        extraScrollVh={12}
        title={t.hero.title}
        description={t.hero.description}
      />

      <div className="mt-12 mx-auto max-w-[1200px] px-4 md:px-8">
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">{t.purpose.heading}</h2>
            <p className="mt-3 text-slate-600 leading-relaxed">{t.purpose.body}</p>
            <Link to={makePath('uddeshay')} className="mt-4 inline-flex items-center text-blue-600 font-semibold">
              {t.purpose.cta} →
            </Link>
          </section>

          {/* WHAT WE DO */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{t.whatWeDo.heading}</h3>
              <Link to={makePath('visheshayen')} className="text-sm text-blue-600 font-medium">
                {lang === 'hi' ? 'सभी देखें' : 'View all'}
              </Link>
            </div>
            <div className="mt-4">
              <Shelf
                ariaLabel={t.whatWeDo.heading}
                cards={t.whatWeDo.cards}
                renderers={{ promo: CardPromo, product: CardProduct }}
                className="no-scrollbar"
                showArrows={false}
              />
            </div>
          </section>

          {/* FOUNDERS from DB (limit 10) */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{t.foundersHeading}</h3>
              <Link to={makePath('founders')} className="text-sm text-blue-600 font-medium">
                {lang === 'hi' ? 'प्रोफ़ाइल देखें' : 'See all profiles'}
              </Link>
            </div>

            <div className="mt-4">
              {foundersQ.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-36 rounded-2xl bg-white shadow-sm animate-pulse" />
                  ))}
                </div>
              ) : foundersQ.isError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {lang === 'hi' ? 'संस्थापक सूची लोड करने में समस्या हुई।' : 'Failed to load founders.'}
                </div>
              ) : foundersCards.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  {lang === 'hi' ? 'अभी कोई सूची उपलब्ध नहीं है।' : 'No entries yet.'}
                </div>
              ) : (
                <Shelf
                  ariaLabel={t.foundersHeading}
                  cards={foundersCards}
                  renderers={{ promo: CardPromo, product: CardProduct }}
                  className="no-scrollbar"
                  showArrows={false}
                />
              )}
            </div>
          </section>

          {/* MANAGEMENT from DB (limit 10) */}
          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{t.managementHeading}</h3>
              <Link to={makePath('management')} className="text-sm text-blue-600 font-medium">
                {lang === 'hi' ? 'टीम देखें' : 'Meet the team'}
              </Link>
            </div>

            <div className="mt-4">
              {managementQ.isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-36 rounded-2xl bg-white shadow-sm animate-pulse" />
                  ))}
                </div>
              ) : managementQ.isError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {lang === 'hi' ? 'प्रबंधन टीम लोड करने में समस्या हुई।' : 'Failed to load management.'}
                </div>
              ) : managementCards.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                  {lang === 'hi' ? 'अभी कोई सूची उपलब्ध नहीं है।' : 'No entries yet.'}
                </div>
              ) : (
                <Shelf
                  ariaLabel={t.managementHeading}
                  cards={managementCards}
                  renderers={{ promo: CardPromo, product: CardProduct }}
                  className="no-scrollbar"
                  showArrows={false}
                />
              )}
            </div>
          </section>

          {/* IMPACT & MILESTONES */}
          {/* <section>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{t.impactHeading}</h3>
                <p className="mt-2 text-sm text-slate-600 max-w-2xl">{t.impactIntro}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {impactStats.map((stat) => (
                <article
                  key={stat.id}
                  className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 hover:-translate-y-0.5 hover:shadow-md transition flex flex-col"
                >
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                    {stat.label[langKey]}
                  </p>
                  <p className="text-3xl font-extrabold text-slate-900 mt-2 tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed flex-1">
                    {stat.description[langKey]}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-10 space-y-4">
              <h4 className="text-lg font-semibold text-slate-900">{t.impactMilestonesHeading}</h4>
              <div className="space-y-4 border-l-2 border-slate-200 pl-6">
                {impactMilestones.map((milestone) => (
                  <div key={milestone.id} className="relative">
                    {milestone.date?.[langKey] ? (
                      <span className="absolute -left-10 top-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                        {milestone.date[langKey]}
                      </span>
                    ) : null}
                    <h5 className="text-base font-semibold text-slate-900">
                      {milestone.title[langKey]}
                    </h5>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                      {milestone.description[langKey]}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section> */}

          {/* NEWS */}
          <section>
            <h3 className="text-xl font-bold text-slate-900">{t.newsHeading}</h3>
            <div className="mt-4 rounded-3xl border border-slate-200 bg-white shadow-sm divide-y divide-slate-200">
              {newsItems.map((item) => (
                <article key={item.slug} className="p-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.date}</p>
                  </div>
                  <Link to={makePath(`news/${item.slug}`)} className="text-sm font-medium text-blue-600">
                    {lang === 'hi' ? 'पढ़ें' : 'Read'} →
                  </Link>
                </article>
              ))}
            </div>
          </section>

          {/* WHY JOIN */}
          <section>
            <h3 className="text-xl font-bold text-slate-900">{t.whyJoin.heading}</h3>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {t.whyJoin.cards.map((card, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition"
                >
                  <h4 className="text-lg font-semibold text-slate-900">{card.title}</h4>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* IMPACT / ACHIEVEMENTS TICKER */}
          <section>
            <AchievementsTicker
              heading={t.impactHeading}
              items={tickerItems}
            />
          </section>

          {/* FEES */}
          <section>
            <h3 className="text-xl font-bold text-slate-900">{t.feesHeading}</h3>
            <div className="mt-4">
              <FeesCarousel plans={planDisplayCards} />
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
