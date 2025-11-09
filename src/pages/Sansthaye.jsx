import { useLang } from '../lib/useLang'

const copy = {
  en: {
    title: 'Community institutions',
    body:
      'Members can register community-run schools, coaching centres, and trusts. Admins validate documents before publishing to the portal.',
  },
  hi: {
    title: 'समुदाय संस्थाएँ',
    body:
      'सदस्य समुदाय संचालित स्कूल, कोचिंग और ट्रस्ट पंजीकृत कर सकते हैं। एडमिन दस्तावेज़ सत्यापित कर प्रकाशन करते हैं।',
  },
}

export default function Sansthaye() {
  const { lang } = useLang()
  const t = copy[lang]

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900">{t.title}</h1>
        <p className="text-slate-600 leading-relaxed">{t.body}</p>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          {lang === 'hi'
            ? 'API कनेक्ट होने के बाद यहाँ संस्था सूची और अनुमोदन स्थिति दिखाई जाएगी।'
            : 'Institution listings and approval states will appear here once the API is connected.'}
        </div>
      </div>
    </main>
  )
}
