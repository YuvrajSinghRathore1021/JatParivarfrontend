import { useLang } from '../../lib/useLang'

const copy = {
  en: {
    title: 'Jobs & opportunities',
    body:
      'Browse verified openings posted by members. Admins review every listing before it becomes public. Use filters for location, salary band, and department.',
  },
  hi: {
    title: 'नौकरियाँ और अवसर',
    body:
      'सदस्यों द्वारा पोस्ट की गई सत्यापित नौकरियाँ देखें। हर लिस्टिंग को पब्लिक होने से पहले एडमिन अनुमोदित करते हैं। स्थान, वेतन श्रेणी और विभाग के फ़िल्टर का उपयोग करें।',
  },
}

export default function JobsIndex() {
  const { lang } = useLang()
  const t = copy[lang]

  return (
    <main className="bg-white">
      <div className="mx-auto max-w-[900px] px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 break-words">{t.title}</h1>
        <p className="text-slate-600 leading-relaxed break-words">{t.body}</p>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
          {lang === 'hi'
            ? 'इंटरएक्टिव जॉब सूची backend API से जुड़ने के बाद दिखाई जाएगी।'
            : 'Interactive job listings will appear once the frontend connects to the backend API.'}
        </div>
      </div>
    </main>
  )
}
