const OCCUPATION_LABELS = {
  government_job: { en: 'Government Job', hi: 'सरकारी नौकरी' },
  govt: { en: 'Government Job', hi: 'सरकारी नौकरी' },
  private_job: { en: 'Private Job', hi: 'प्राइवेट नौकरी' },
  private: { en: 'Private Job', hi: 'प्राइवेट नौकरी' },
  business: { en: 'Business', hi: 'व्यवसाय' },
  student: { en: 'Student', hi: 'छात्र' },
  professional_services: { en: 'Professional Services', hi: 'प्रोफेशनल सर्विसेज' },
  professional_services_ca: { en: 'CA (Chartered Accountant)', hi: 'सीए (चार्टर्ड अकाउंटेंट)' },
  professional_services_advocate: { en: 'Advocate', hi: 'एडवोकेट' },
  professional_services_doctor: { en: 'Doctor', hi: 'डॉक्टर' },
  professional_services_engineer: { en: 'Engineer', hi: 'इंजीनियर' },
}

const EDUCATION_LABELS = {
  high_school: { en: 'High School', hi: 'हाई स्कूल' },
  graduate: { en: 'Graduate', hi: 'स्नातक' },
  graduate_llb: { en: 'LLB (Bachelor of Laws)', hi: 'एलएलबी (बैचलर ऑफ लॉ)' },
  llb: { en: 'LLB (Bachelor of Laws)', hi: 'एलएलबी (बैचलर ऑफ लॉ)' },
  graduate_mbbs: {
    en: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)',
    hi: 'एमबीबीएस (बैचलर ऑफ मेडिसिन और बैचलर ऑफ सर्जरी)',
  },
  mbbs: {
    en: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)',
    hi: 'एमबीबीएस (बैचलर ऑफ मेडिसिन और बैचलर ऑफ सर्जरी)',
  },
  graduate_btech: { en: 'B.Tech (Bachelor of Technology)', hi: 'बी.टेक (बैचलर ऑफ टेक्नोलॉजी)' },
  btech: { en: 'B.Tech (Bachelor of Technology)', hi: 'बी.टेक (बैचलर ऑफ टेक्नोलॉजी)' },
  postgraduate: { en: 'Postgraduate', hi: 'स्नातकोत्तर' },
  phd: { en: 'PhD', hi: 'पीएचडी' },
}

const KNOWN_OCCUPATION_CODES = new Set([
  'government_job',
  'private_job',
  'business',
  'student',
  'professional_services',
  'professional_services_ca',
  'professional_services_advocate',
  'professional_services_doctor',
  'professional_services_engineer',
])

const KNOWN_EDUCATION_CODES = new Set([
  'high_school',
  'graduate',
  'graduate_llb',
  'graduate_mbbs',
  'graduate_btech',
  'postgraduate',
  'phd',
])

export const OCCUPATION_CATEGORY_OPTIONS = {
  en: [
    { value: 'government_job', label: 'Government Job' },
    { value: 'private_job', label: 'Private Job' },
    { value: 'business', label: 'Business' },
    { value: 'student', label: 'Student' },
    { value: 'professional_services', label: 'Professional Services' },
  ],
  hi: [
    { value: 'government_job', label: 'सरकारी नौकरी' },
    { value: 'private_job', label: 'प्राइवेट नौकरी' },
    { value: 'business', label: 'व्यवसाय' },
    { value: 'student', label: 'छात्र' },
    { value: 'professional_services', label: 'प्रोफेशनल सर्विसेज' },
  ],
}

export const PROFESSIONAL_SERVICE_OPTIONS = {
  en: [
    { value: 'professional_services_ca', label: 'CA (Chartered Accountant)' },
    { value: 'professional_services_advocate', label: 'Advocate' },
    { value: 'professional_services_doctor', label: 'Doctor' },
    { value: 'professional_services_engineer', label: 'Engineer' },
  ],
  hi: [
    { value: 'professional_services_ca', label: 'सीए (चार्टर्ड अकाउंटेंट)' },
    { value: 'professional_services_advocate', label: 'एडवोकेट' },
    { value: 'professional_services_doctor', label: 'डॉक्टर' },
    { value: 'professional_services_engineer', label: 'इंजीनियर' },
  ],
}

export const EDUCATION_CATEGORY_OPTIONS = {
  en: [
    { value: 'high_school', label: 'High School' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' },
  ],
  hi: [
    { value: 'high_school', label: 'हाई स्कूल' },
    { value: 'graduate', label: 'स्नातक' },
    { value: 'postgraduate', label: 'स्नातकोत्तर' },
    { value: 'phd', label: 'पीएचडी' },
  ],
}

export const GRADUATE_SPECIALIZATION_OPTIONS = {
  en: [
    { value: 'graduate_llb', label: 'LLB (Bachelor of Laws)' },
    { value: 'graduate_mbbs', label: 'MBBS (Bachelor of Medicine & Bachelor of Surgery)' },
    { value: 'graduate_btech', label: 'B.Tech (Bachelor of Technology)' },
  ],
  hi: [
    { value: 'graduate_llb', label: 'एलएलबी (बैचलर ऑफ लॉ)' },
    { value: 'graduate_mbbs', label: 'एमबीबीएस (बैचलर ऑफ मेडिसिन और बैचलर ऑफ सर्जरी)' },
    { value: 'graduate_btech', label: 'बी.टेक (बैचलर ऑफ टेक्नोलॉजी)' },
  ],
}

export const OCCUPATION_FILTER_OPTIONS = {
  en: [
    ...OCCUPATION_CATEGORY_OPTIONS.en.filter((item) => item.value !== 'professional_services'),
    ...PROFESSIONAL_SERVICE_OPTIONS.en,
  ],
  hi: [
    ...OCCUPATION_CATEGORY_OPTIONS.hi.filter((item) => item.value !== 'professional_services'),
    ...PROFESSIONAL_SERVICE_OPTIONS.hi,
  ],
}

const lowerTrim = (value) => String(value || '').trim().toLowerCase()

export const normalizeOccupationValue = (value) => {
  const normalized = lowerTrim(value)
  if (!normalized) return ''
  if (normalized === 'govt') return 'government_job'
  if (normalized === 'private') return 'private_job'
  return normalized
}

export const getOccupationCategory = (value) => {
  const normalized = normalizeOccupationValue(value)
  if (!normalized) return ''
  if (normalized === 'professional_services') return 'professional_services'
  if (normalized.startsWith('professional_services_')) return 'professional_services'
  if (KNOWN_OCCUPATION_CODES.has(normalized)) return normalized
  return ''
}

export const getOccupationSpecialization = (value) => {
  const normalized = normalizeOccupationValue(value)
  if (normalized.startsWith('professional_services_')) return normalized
  return ''
}

export const composeOccupationValue = ({ category, specialization }) => {
  if (!category) return ''
  if (category === 'professional_services') return specialization || 'professional_services'
  return category
}

export const getOccupationLabel = (value, lang = 'en') => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const normalized = normalizeOccupationValue(raw)
  const label = OCCUPATION_LABELS[normalized]?.[lang]
  return label || raw
}

export const normalizeEducationValue = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const normalized = raw.toLowerCase()
  if (normalized === 'b.tech') return 'graduate_btech'
  if (KNOWN_EDUCATION_CODES.has(normalized)) return normalized
  if (normalized === 'llb') return 'graduate_llb'
  if (normalized === 'mbbs') return 'graduate_mbbs'
  if (normalized === 'btech') return 'graduate_btech'
  return raw
}

export const getEducationCategory = (value) => {
  const normalized = normalizeEducationValue(value)
  if (!normalized) return ''
  if (typeof normalized === 'string' && normalized.startsWith('graduate_')) return 'graduate'
  if (normalized === 'high_school') return 'high_school'
  if (normalized === 'graduate') return 'graduate'
  if (normalized === 'postgraduate') return 'postgraduate'
  if (normalized === 'phd') return 'phd'
  return 'postgraduate'
}

export const getGraduateSpecialization = (value) => {
  const normalized = normalizeEducationValue(value)
  if (!normalized) return ''
  if (typeof normalized === 'string' && normalized.startsWith('graduate_')) return normalized
  return ''
}

export const getPostgraduateCustomText = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const normalized = normalizeEducationValue(raw)
  if (typeof normalized === 'string' && KNOWN_EDUCATION_CODES.has(normalized)) return ''
  return raw
}

export const composeEducationValue = ({ category, graduateSpecialization, postgraduateCustomText }) => {
  if (!category) return ''
  if (category === 'graduate') return graduateSpecialization || 'graduate'
  if (category === 'postgraduate') {
    const custom = String(postgraduateCustomText || '').trim()
    return custom || 'postgraduate'
  }
  return category
}

export const getEducationLabel = (value, lang = 'en') => {
  const raw = String(value || '').trim()
  if (!raw) return ''
  const normalized = normalizeEducationValue(raw)
  const key = typeof normalized === 'string' ? normalized : raw
  const label = EDUCATION_LABELS[key]?.[lang]
  return label || raw
}
