import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'

const DEFAULT_PLANS = {
  en: [
    {
      id: 'founder',
      title: 'Founder',
      price: '₹1,01,000',
      desc: 'Listed on the Founders page and hero strip.',
      buttonText: 'Join now',
    },
    {
      id: 'member',
      title: 'Member',
      price: '₹50,000',
      desc: 'Appears on member carousel and gains full access.',
      buttonText: 'Join now',
    },
    {
      id: 'sadharan',
      title: 'Sadharan',
      price: '₹2,100',
      desc: 'Unlocks member-only services instantly.',
      buttonText: 'Join now',
    },
  ],
  hi: [
    {
      id: 'founder',
      title: 'फाउंडर',
      price: '₹1,01,000',
      desc: 'फाउंडर्स पेज और होम स्ट्रिप पर सूचीबद्ध।',
      buttonText: 'जुड़ें',
    },
    {
      id: 'member',
      title: 'मेम्बर',
      price: '₹50,000',
      desc: 'मेंबर करूसल पर दिखाई देंगे और सभी सेवाएँ उपलब्ध।',
      buttonText: 'जुड़ें',
    },
    {
      id: 'sadharan',
      title: 'साधारण',
      price: '₹2,100',
      desc: 'सदस्य विशेष सेवाओं तक तुरंत पहुँच।',
      buttonText: 'जुड़ें',
    },
  ],
}

export default function FeesCarousel({ plans }) {
  const { lang, makePath } = useLang()
  const scrollerRef = useRef(null)

  const fallbackItems = useMemo(() => DEFAULT_PLANS[lang] ?? DEFAULT_PLANS.en, [lang])

  const items = useMemo(() => {
    if (Array.isArray(plans) && plans.length) {
      return plans.map((plan, idx) => {
        const fallback = fallbackItems[idx % fallbackItems.length]
        return {
          id: plan.id || fallback.id,
          title: plan.title || fallback.title,
          price: plan.price || fallback.price,
          desc: plan.description || plan.desc || fallback.desc,
          buttonText: plan.buttonText || fallback.buttonText,
        }
      })
    }
    return fallbackItems
  }, [fallbackItems, plans])

  const scrollBy = (dir) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const w = scroller.clientWidth
    scroller.scrollBy({ left: dir * w * 0.9, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2"
      >
        {items.map((plan) => (
          <article
            key={plan.id}
            className="min-w-[86%] md:min-w-[40%] lg:min-w-[32%] snap-center rounded-2xl border border-slate-200 bg-white shadow-sm p-6 flex flex-col"
          >
            <p className="text-sm text-slate-500 uppercase tracking-wide font-semibold">{plan.title}</p>
            <p className="text-3xl font-extrabold mt-1 text-slate-900">{plan.price}</p>
            <p className="text-slate-600 mt-2 text-sm flex-1">{plan.desc}</p>
            <Link
              to={makePath(`subscriptions?plan=${plan.id}`)}
              className="mt-4 inline-flex px-4 h-10 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-500"
            >
              {plan.buttonText || (lang === 'hi' ? 'जुड़ें' : 'Join now')}
            </Link>
          </article>
        ))}
      </div>
      <div className="hidden md:block">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          className="absolute -left-2 top-1/2 -translate-y-1/2 px-3 h-10 rounded-full bg-white/90 border border-slate-200 shadow"
          aria-label={lang === 'hi' ? 'पिछला' : 'Previous'}
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          className="absolute -right-2 top-1/2 -translate-y-1/2 px-3 h-10 rounded-full bg-white/90 border border-slate-200 shadow"
          aria-label={lang === 'hi' ? 'अगला' : 'Next'}
        >
          →
        </button>
      </div>
    </div>
  )
}
