import { useLang } from '../lib/useLang'

const copy = {
  en: {
    title: 'Dharamshalaye listings',
    body:
      'Track verified dharamshala listings with photos, amenities, and booking contacts. Admins approve every entry before it appears to members.',
  },
  hi: {
    title: 'धर्मशालाएँ',
    body:
      'फोटो, सुविधाएँ और बुकिंग संपर्क के साथ सत्यापित धर्मशाला सूची देखें। हर प्रविष्टि एडमिन अनुमोदन के बाद ही सदस्यों को दिखती है।',
  },
}

export default function Dharamshalaye() {
  const { lang } = useLang()
  const t = copy[lang]

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 break-words">{t.title}</h1>
        <p className="text-slate-600 leading-relaxed break-words">{t.body}</p>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          {lang === 'hi'
            ? 'Backend API से जुड़ने के बाद धर्मशाला सूची और मानचित्र यहाँ दिखाई देंगे।'
            : 'Once the backend API is connected, listings and maps will appear here.'}
        </div>
      </div>
    </main>
  )
}
