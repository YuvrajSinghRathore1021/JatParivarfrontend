// frontend/src/components/LanguageToggle.jsx
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'

export default function LanguageToggle(){
  const { i18n } = useTranslation()
  const nav = useNavigate()
  const { pathname } = useLocation()

  const setLang = (lng) => {
    i18n.changeLanguage(lng)
    const parts = pathname.split('/').filter(Boolean)
    if (parts[0] === 'en' || parts[0] === 'hi') parts[0] = lng
    else parts.unshift(lng)
    nav('/' + parts.join('/'))
  }

  const baseBtn = "px-2 h-9 rounded-md border border-transparent hover:border-(--brand) transition"

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => setLang('hi')}
        className={`${baseBtn} ${i18n.language==='hi'?'bg-(--brand) text-white':'bg-(--surface-2) text-(--text)'}`}>
        हिन्दी
      </button>
      <button onClick={() => setLang('en')}
        className={`${baseBtn} ${i18n.language==='en'?'bg-(--brand) text-white':'bg-(--surface-2) text-(--text)'}`}>
        EN
      </button>
    </div>
  )
}
