import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: { translation: {} },
  hi: { translation: {} },
}

const defaultLang = typeof window !== 'undefined' && window.location?.pathname?.startsWith('/en')
  ? 'en'
  : import.meta.env.VITE_DEFAULT_LANG || 'hi'

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
