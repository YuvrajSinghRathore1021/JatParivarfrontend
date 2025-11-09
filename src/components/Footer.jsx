import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'
import { fetchFooterInfo } from '../lib/publicApi'

const copy = {
  en: {
    blurb:
      'A modern digital home for every member of the Jat Parivar community – from public outreach to secure member services.',
    collaborate: 'Let’s build together',
    newsletter: {
      title: 'Community newsletter',
      placeholder: 'Your email address',
      cta: 'Join',
      description:
        'Receive member updates, community news, and event invites straight to your inbox.',
    },
    rights: '© Jat Parivar Portal. All rights reserved.',
  },
  hi: {
    blurb:
      'जाट परिवार समुदाय के लिए एक आधुनिक डिजिटल घर — सार्वजनिक पेज से लेकर सुरक्षित सदस्य सेवाओं तक।',
    collaborate: 'आइए मिलकर आगे बढ़ें',
    newsletter: {
      title: 'कम्युनिटी न्यूज़लेटर',
      placeholder: 'आपका ईमेल पता',
      cta: 'जुड़ें',
      description:
        'सदस्य अपडेट, सामुदायिक समाचार और कार्यक्रम सीधे अपने इनबॉक्स में प्राप्त करें।',
    },
    rights: '© जाट परिवार पोर्टल. सर्वाधिकार सुरक्षित।',
  },
}

const DEFAULT_CONTACT = {
  addressLine1: 'Jat Bhawan, opposite Water Tanki, Sri Madhopur',
  addressLine2: 'Sikar, Rajasthan 332715',
  phone: '+91 7737080293',
  email: 'info@jatparivar.org',
}

const DEFAULT_SOCIALS = [
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
]

const DEFAULT_LINKS = {
  quick: [
    { id: 'home', labelEn: 'Home', labelHi: 'होम', segment: '' },
    { id: 'uddeshay', labelEn: 'Purpose', labelHi: 'उद्देश्य', segment: 'uddeshay' },
    { id: 'founders', labelEn: 'Founders', labelHi: 'संस्थापक', segment: 'founders' },
    { id: 'management', labelEn: 'Management', labelHi: 'मैनेजमेंट', segment: 'management' },
    { id: 'visheshayen', labelEn: 'Highlights', labelHi: 'विशेषताएँ', segment: 'visheshayen' },
    { id: 'history', labelEn: 'History', labelHi: 'इतिहास', segment: 'history' },
    { id: 'matrimony', labelEn: 'Matrimony', labelHi: 'विवाह सेवा', segment: 'matrimony' },
    { id: 'jobs', labelEn: 'Jobs', labelHi: 'रोज़गार', segment: 'jobs' },
  ],
  secondary: [
    { id: 'terms', labelEn: 'Terms of use', labelHi: 'नियम व शर्तें', segment: 'legal/terms' },
    { id: 'privacy', labelEn: 'Privacy', labelHi: 'गोपनीयता नीति', segment: 'legal/privacy' },
  ],
}

const ICONS = {
  facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22 12a10 10 0 10-11.5 9.9v-7H7v-3h3.5V9.5c0-3.4 2-5.3 5-5.3 1.5 0 3 .27 3 .27v3.3h-1.7c-1.7 0-2.3 1.1-2.3 2.2V12H18l-.6 3h-2.9v7A10 10 0 0022 12z" />
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.9.3 2.4.5.6.2 1 .5 1.5 1 .5.5.8.9 1 1.5.2.5.4 1.2.5 2.4.1 1.2.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.3 1.9-.5 2.4-.2.6-.5 1-1 1.5-.5.5-.9.8-1.5 1-.5.2-1.2.4-2.4.5-1.2.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.9-.3-2.4-.5-.6-.2-1-.5-1.5-1-.5-.5-.8-.9-1-1.5-.2-.5-.4-1.2-.5-2.4C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.3-1.9.5-2.4.2-.6.5-1 1-1.5.5-.5.9-.8 1.5-1 .5-.2 1.2-.4 2.4-.5C8.4 2.2 8.8 2.2 12 2.2m0 3a4.7 4.7 0 110 9.4 4.7 4.7 0 010-9.4m0 2.2a2.5 2.5 0 100 5 2.5 2.5 0 000-5m5-2.9a1.1 1.1 0 110 2.2 1.1 1.1 0 010-2.2z" />
    </svg>
  ),
  linkedin: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M6.94 6.5A2.44 2.44 0 114.5 4.06 2.44 2.44 0 016.94 6.5zM4.75 8.5h4.4V20h-4.4zM13 8.5h4.18v1.57h.06a4.59 4.59 0 014.13-2.27C24 7.8 24 11 24 14.91V20h-4.4v-4.52c0-1.08 0-2.47-1.51-2.47s-1.74 1.18-1.74 2.4V20H12V8.5z" />
    </svg>
  ),
  youtube: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 7.2a2.3 2.3 0 00-1.6-1.6C18.3 5 12 5 12 5s-6.3 0-8 .6a2.3 2.3 0 00-1.6 1.6C2 9 2 12 2 12s0 3 .4 4.8a2.3 2.3 0 001.6 1.6C5.7 19 12 19 12 19s6.3 0 8-.6a2.3 2.3 0 001.6-1.6C22 15 22 12 22 12s0-3-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  ),
  twitter: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.7 6.1a6.3 6.3 0 01-1.8.5 3.2 3.2 0 001.4-1.7 6.4 6.4 0 01-2 .8 3.2 3.2 0 00-5.5 2.2c0 .3 0 .5.1.8A9.2 9.2 0 013 5.2a3.2 3.2 0 00-.4 1.6 3.2 3.2 0 001.4 2.6 3.2 3.2 0 01-1.4-.4v.1a3.2 3.2 0 002.6 3.1 3.2 3.2 0 01-1.4.1 3.2 3.2 0 003 2.2A6.5 6.5 0 012 18a9.1 9.1 0 004.9 1.4c5.9 0 9.2-4.9 9.2-9.2v-.4A6.6 6.6 0 0022 6.6a6.3 6.3 0 01-1.8.5 3.2 3.2 0 00.5-1z" />
    </svg>
  ),
}

const resolveIcon = (icon) => ICONS[icon?.toLowerCase()] ?? ICONS.facebook

const normalizeLinks = (links, langKey) => {
  const quick = Array.isArray(links?.quick) && links.quick.length ? links.quick : DEFAULT_LINKS.quick
  const secondary =
    Array.isArray(links?.secondary) && links.secondary.length ? links.secondary : DEFAULT_LINKS.secondary
  return {
    quick: quick.map((link) => ({
      id: link.id || link.segment || link.labelEn,
      label: langKey === 'hi' ? link.labelHi || link.labelEn : link.labelEn,
      segment: link.segment || '',
    })),
    secondary: secondary.map((link) => ({
      id: link.id || link.segment || link.labelEn,
      label: langKey === 'hi' ? link.labelHi || link.labelEn : link.labelEn,
      segment: link.segment || '',
    })),
  }
}

export default function Footer() {
  const { lang, makePath } = useLang()
  const langKey = lang === 'hi' ? 'hi' : 'en'

  const { data } = useQuery({
    queryKey: ['public', 'footer'],
    queryFn: fetchFooterInfo,
    staleTime: 10 * 60 * 1000,
  })

  const contact = useMemo(() => {
    if (!data?.contact) return DEFAULT_CONTACT
    return {
      addressLine1: data.contact.addressLine1 || DEFAULT_CONTACT.addressLine1,
      addressLine2: data.contact.addressLine2 || DEFAULT_CONTACT.addressLine2,
      phone: data.contact.phone || DEFAULT_CONTACT.phone,
      email: data.contact.email || DEFAULT_CONTACT.email,
    }
  }, [data?.contact])

  const socials = useMemo(() => {
    const list = Array.isArray(data?.socials) && data.socials.length ? data.socials : DEFAULT_SOCIALS
    return list.map((item, idx) => ({
      id: item.id || item.label || `social-${idx}`,
      label: item.label || DEFAULT_SOCIALS[idx % DEFAULT_SOCIALS.length].label,
      href: item.href || DEFAULT_SOCIALS[idx % DEFAULT_SOCIALS.length].href,
      icon: resolveIcon(item.icon || item.id || item.label),
    }))
  }, [data?.socials])

  const links = useMemo(() => normalizeLinks(data?.footerLinks, langKey), [data?.footerLinks, langKey])

  const t = copy[lang]

  const newsletterSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)
    const email = formData.get('email')
    if (email) {
      alert(lang === 'hi' ? 'जुड़ने के लिए धन्यवाद!' : 'Thank you for subscribing!')
    }
    form.reset()
  }

  return (
    <footer className="mt-20 bg-[#0e0e0e] text-gray-200">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-10 md:gap-12 md:grid-cols-3">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/icons/20251021_1854_Jat Parivar Unity Logo_simple_compose_01k83f0p3behrre80djf6y47aj.png"
              alt="Jat Parivar"
              className="h-10 w-auto"
            />
            <span className="text-xl font-extrabold tracking-tight text-gray-200">Jat Parivar</span>
          </div>
          <p className="text-gray-200 leading-relaxed">{t.blurb}</p>
          <h3 className="text-lg font-semibold text-gray-200">{t.collaborate}</h3>
          <address className="not-italic text-sm text-gray-200 leading-relaxed">
            {contact.addressLine1}
            <br />
            {contact.addressLine2}
          </address>
          <dl className="text-sm text-gray-200 space-y-2">
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-200 min-w-[70px]">{lang === 'hi' ? 'फोन' : 'Phone'}</dt>
              <dd>
                <a href={`tel:${contact.phone}`} className="hover:text-blue-500">
                  {contact.phone}
                </a>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="font-semibold text-gray-200 min-w-[70px]">{lang === 'hi' ? 'ईमेल' : 'Email'}</dt>
              <dd>
                <a href={`mailto:${contact.email}`} className="hover:text-blue-500">
                  {contact.email}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <ul className="space-y-3 text-sm text-gray-200">
            {links.quick.slice(0, Math.ceil(links.quick.length / 2)).map((link) => (
              <li key={link.id}>
                <Link to={makePath(link.segment)} className="hover:text-blue-500">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="space-y-3 text-sm text-gray-200">
            {links.quick.slice(Math.ceil(links.quick.length / 2)).map((link) => (
              <li key={link.id}>
                <Link to={makePath(link.segment)} className="hover:text-blue-500">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-5">
          <div>
            <h4 className="text-base font-semibold text-gray-200">{t.newsletter.title}</h4>
            <p className="text-sm text-gray-200 mt-2">{t.newsletter.description}</p>
            <form
              className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 p-2"
              onSubmit={newsletterSubmit}
            >
              <input
                type="email"
                name="email"
                required
                placeholder={t.newsletter.placeholder}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-200 placeholder:text-gray-300 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-500"
              >
                {t.newsletter.cta}
              </button>
            </form>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-200">
              {lang === 'hi' ? 'हमसे जुड़ें' : 'Connect with us'}
            </p>
            <div className="mt-3 flex items-center gap-3">
              {socials.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 hover:bg-blue-600 transition"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-gray-400">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span>{t.rights}</span>
          {links.secondary.map((link) => (
            <Link key={link.id} to={makePath(link.segment)} className="hover:text-blue-400">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  )
}
