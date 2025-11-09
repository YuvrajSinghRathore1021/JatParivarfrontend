import { useLang } from '../../lib/useLang'

const copy = {
  en: {
    title: 'Marriage services',
    body:
      'Create a secure profile, browse verified matches, and mark interest. Phone numbers are revealed only when both sides express interest.',
  },
  hi: {
    title: 'विवाह सेवा',
    body:
      'सुरक्षित प्रोफ़ाइल बनाएँ, सत्यापित प्रोफ़ाइल देखें और रुचि दर्ज करें। दोनों पक्षों की रुचि होने पर ही फोन नंबर दिखाई देते हैं।',
  },
}

export default function MatrimonyBrowse() {
  const { lang } = useLang()
  const t = copy[lang]

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">{t.title}</h1>
        <p className="text-slate-600 leading-relaxed">{t.body}</p>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          {lang === 'hi'
            ? 'यहाँ जल्द ही विवाह प्रोफ़ाइल सूची और फ़िल्टर उपलब्ध होंगे।'
            : 'Profile listings and filters will appear here once the matrimony API is connected.'}
        </div>
      </div>
    </main>
  )
}
