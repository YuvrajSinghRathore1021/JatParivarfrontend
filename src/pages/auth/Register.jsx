// frontend/src/pages/auth/Register.jsx
import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { post, upload } from '../../lib/api'
import { useLang } from '../../lib/useLang'
import { fetchPublicPlans } from '../../lib/publicApi'
import DateField from '../../components/DateField'
import SelectField from '../../components/SelectField'
import FileDrop from '../../components/FileDrop'
import { useGeoOptions } from '../../hooks/useGeoOptions'
import { useGotraOptions } from '../../hooks/useGotraOptions'
import AddressBlock from '../../components/AddressBlock'
const copy = {
  en: {
    title: 'Create your account',
    step: (s, t) => `Step ${s} of ${t}`,
    sendOtp: 'Send OTP',
    back: 'Back',
    verify: 'Verify',
    next: 'Next',
    proceed: 'Proceed to PhonePe',
    plan: 'Select membership',
    janAadhar: 'Jan Aadhaar (required)',
    profilePhoto: 'Profile Photo (required)',
    phone: 'Phone',
    referral: 'Referral Code (required)',
    otp: 'OTP',
    fullName: 'Full Name',
    email: 'Email',
    dob: 'Date of birth',
    gender: 'Gender',
    marital: 'Marital Status',
    education: 'Education level',
    occupation: 'Occupation',
    gotraSelf: 'Gotra (Self)',
    gotraMother: "Mother's Gotra",
    gotraNani: "Nani's Gotra",
    gotraDadi: "Dadi's Gotra",
    haveAccount: 'Already have an account?',
    login: 'Login',
    requiredJan: 'Please upload your Jan Aadhaar before proceeding.',
    invalidReferral: 'Referral code must be 6 letters/numbers.',
    referralRequired: 'Referral code is required to sign up.',
    invalidPhone: 'Please enter a valid phone number.',
    otpRequired: 'Please enter the 6-digit OTP sent to your phone.',
    nameRequired: 'Your full name is required.',
    passwordHint: 'Password must be at least 6 characters.',
    addressRequired: 'Please select your address.',
    phoneExists: 'This phone number is already registered. Please log in instead.',
    referralNotFound: 'Referral code not found. Please confirm with the member who referred you.',
    errorGeneric: 'Something went wrong. Please try again.',
    invalidOtp: 'Invalid OTP. Please try again.',
    invalidEmail: 'Please enter a valid email address.',
    invalidEmailReq: 'Please enter an email address.',
    dobRequired: 'Date of birth is required.',
    genderRequired: 'Gender is required.',
    maritalRequired: 'Marital status is required.',
    educationRequired: 'Education is required.',
    occupationRequired: 'Occupation is required.',
    departmentRequired: 'Department is required.',
    designationRequired: 'Designation is required.',
    requiredPhoto: 'Please upload your profile photo before proceeding.',
    gotraSelfRequired: 'Please enter your self gotra.',

    placeholders: {
      gender: 'Select gender',
      marital: 'Select marital status',
      education: 'Select education',
      occupation: 'Select occupation',
      gotra: 'Choose gotra',
    },
    uploads: {
      janHint: 'PDF or image • Max 10 MB',
      photoHint: 'JPG/PNG • Max 1 MB',
    }
  },
  hi: {
    title: 'खाता बनाएँ',
    step: (s, t) => `कदम ${s} / ${t}`,
    sendOtp: 'OTP भेजें',
    back: 'वापस',
    verify: 'वेरिफाई',
    next: 'आगे',
    proceed: 'PhonePe पर जाएँ',
    plan: 'सदस्यता चुनें',
    janAadhar: 'जन आधार (आवश्यक)',
    profilePhoto: 'प्रोफ़ाइल फोटो (आवश्यक)',
    phone: 'मोबाइल नंबर',
    referral: 'रेफ़रल कोड (आवश्यक)',
    otp: 'OTP',
    fullName: 'पूरा नाम',
    email: 'ईमेल',
    dob: 'जन्मतिथि',
    gender: 'लिंग',
    marital: 'वैवाहिक स्थिति',
    education: 'शिक्षा स्तर',
    occupation: 'पेशा',
    gotraSelf: 'खुद का गोत्र',
    gotraMother: 'माँ का गोत्र',
    gotraNani: 'नानी का गोत्र',
    gotraDadi: 'दादी का गोत्र',
    haveAccount: 'पहले से खाता है?',
    login: 'लॉगिन',
    requiredJan: 'आगे बढ़ने से पहले कृपया जन आधार अपलोड करें।',
    invalidReferral: 'रेफ़रल कोड 6 अंकों/अक्षरों का होना चाहिए।',
    referralRequired: 'साइन अप के लिए रेफ़रल कोड अनिवार्य है।',
    invalidPhone: 'कृपया मान्य मोबाइल नंबर डालें।',
    otpRequired: 'कृपया फोन पर प्राप्त 6 अंकों का OTP दर्ज करें।',
    nameRequired: 'कृपया अपना पूरा नाम दर्ज करें।',
    passwordHint: 'पासवर्ड कम से कम 6 वर्ण का होना चाहिए।',
    addressRequired: 'कृपया अपना पता चुनें।',
    phoneExists: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।',
    referralNotFound: 'रेफ़रल कोड नहीं मिला। कृपया रेफ़र करने वाले सदस्य से पुष्टि करें।',
    errorGeneric: 'कुछ गड़बड़ हुई। कृपया फिर से प्रयास करें।',
    invalidOtp: 'OTP मान्य नहीं है। कृपया पुनः प्रयास करें।',
    invalidEmail: 'कृपया मान्य ईमेल पता दर्ज करें।',
    invalidEmailReq: 'कृपया ईमेल पता दर्ज करें।',
    dobRequired: 'जन्मतिथि आवश्यक है।',
    genderRequired: 'लिंग आवश्यक है।',
    maritalRequired: 'वैवाहिक स्थिति आवश्यक है।',
    educationRequired: 'शिक्षा स्तर आवश्यक है।',
    occupationRequired: 'पेशा आवश्यक है।',
    departmentRequired: 'डिपार्टमेंट आवश्यक है।',
    designationRequired: 'पद का नाम आवश्यक है।',
    requiredPhoto: 'आगे बढ़ने से पहले कृपया प्रोफ़ाइल फोटो अपलोड करें।',
    gotraSelfRequired: 'कृपया अपना गोत्र (Self) दर्ज करें।',
    placeholders: {
      gender: 'लिंग चुनें',
      marital: 'वैवाहिक स्थिति चुनें',
      education: 'शिक्षा स्तर चुनें',
      occupation: 'पेशा चुनें',
      gotra: 'गोत्र चुनें',
    },
    uploads: {
      janHint: 'PDF या इमेज • अधिकतम 10 MB',
      photoHint: 'JPG/PNG • अधिकतम 1 MB',
    }
  },
}

const GENDER = {
  en: [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
  ],
  hi: [
    { value: 'male', label: 'पुरुष' },
    { value: 'female', label: 'महिला' },
    { value: 'other', label: 'अन्य' },
  ],
}

const MARITAL = {
  en: [
    { value: 'unmarried', label: 'Unmarried' },
    { value: 'married', label: 'Married' },
    { value: 'divorced', label: 'Divorced' },
    { value: 'widowed', label: 'Widowed' },
  ],
  hi: [
    { value: 'unmarried', label: 'अविवाहित' },
    { value: 'married', label: 'विवाहित' },
    { value: 'divorced', label: 'तलाकशुदा' },
    { value: 'widowed', label: 'विधवा/विधुर' },
  ],
}

const EDUCATION = {
  en: [
    { value: 'high_school', label: 'High school' },
    { value: 'graduate', label: 'Graduate' },
    { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' },
  ],

  hi: [
    { value: 'high_school', label: 'हाई स्कूल' },
    { value: 'graduate', label: 'स्नातक' },
    { value: 'postgraduate', label: 'परास्नातक' },
    { value: 'phd', label: 'पीएचडी' },
  ],
}

const OCCUPATION = {
  en: [
    { value: 'govt', label: 'Government job' },
    { value: 'private', label: 'Private job' },
    { value: 'business', label: 'Business' },
    { value: 'student', label: 'Student' },
  ],
  hi: [
    { value: 'govt', label: 'सरकारी नौकरी' },
    { value: 'private', label: 'निजी नौकरी' },
    { value: 'business', label: 'व्यवसाय' },
    { value: 'student', label: 'छात्र' },
  ],
}

const REFERRAL_REGEX = /^[A-Z0-9-]{6}$/
const DRAFT_KEY = 'jp_register_draft_v2'

const storageGet = (key) => {
  try {
    if (typeof window === 'undefined') return null
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}

const storageSet = (key, value) => {
  try {
    if (typeof window === 'undefined') return
    window.sessionStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

const storageRemove = (key) => {
  try {
    if (typeof window === 'undefined') return
    window.sessionStorage.removeItem(key)
  } catch {
    // ignore
  }
}

const readDraft = () => {
  try {
    const raw = storageGet(DRAFT_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

const writeDraft = (next) => {
  try {
    storageSet(DRAFT_KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
}

const clearDraft = () => {
  try {
    storageRemove(DRAFT_KEY)
  } catch {
    // ignore
  }
}

const asSavedFileRef = (v) => {
  if (!v || typeof v !== 'object') return null
  if (typeof v.url === 'string' && v.url.trim()) {
    return { url: v.url, name: typeof v.name === 'string' && v.name.trim() ? v.name : 'Uploaded file' }
  }
  return null
}

const resolveUploadUrl = async (maybeFileOrRef, uploadFn) => {
  if (!maybeFileOrRef) return null
  if (typeof maybeFileOrRef === 'object' && typeof maybeFileOrRef.url === 'string' && maybeFileOrRef.url.trim()) {
    return maybeFileOrRef.url.trim()
  }
  // Browser File
  if (typeof File !== 'undefined' && maybeFileOrRef instanceof File) {
    const out = await uploadFn('/uploads/file', maybeFileOrRef)
    return out?.url || null
  }
  return null
}

export default function Register() {
  const { lang, makePath } = useLang()
  const t = copy[lang]

  // ===== TEST SWITCHES =====
  // Toggle this to bypass phone OTP during testing.
  const TEST_BYPASS_OTP = true // <-- set to false for production (OTP enforced)
  // Set to false to restore the original PhonePe redirect flow.
  const TEST_BYPASS_PHONEPE = false // <-- set to false for production

  const OTP_ENABLED = !TEST_BYPASS_OTP

  const [step, setStep] = useState(1)
  const totalSteps = OTP_ENABLED ? 8 : 7
  const displayStep = OTP_ENABLED ? step : (step <= 1 ? 1 : step - 1)

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [ref, setRef] = useState('')

  const [showPwd, setShowPwd] = useState(false)

  const [gotraform, setgotraform] = useState({})
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    dob: '', gender: '', maritalStatus: '',
    education: '', occupation: '',
      department: '',
    designation: '',

    occupationAddress: {
      state: '',
      stateCode: '',
      district: '',
      districtCode: '',
      city: '',
      cityCode: '',
      village: ''
    },

    currentAddress: {
      state: '',
      stateCode: '',
      district: '',
      districtCode: '',
      city: '',
      cityCode: '',
      village: ''
    },

    parentalAddress: {
      state: '',
      stateCode: '',
      district: '',
      districtCode: '',
      city: '',
      cityCode: '',
      village: ''
    },
  })

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setgotraform((prev) => ({ ...prev, [field]: value }))
  }

  const [addr, _setAddr] = useState({
    state: '', stateCode: '', district: '', districtCode: '', city: '', cityCode: '', pin: '', permanentaddress: ''
  })

  const [gotra, setGotra] = useState({
    self: '__custom', mother: '__custom', nani: '__custom', dadi: '__custom'
  })
  

  const [janAadhar, setJanAadhar] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [plan, setPlan] = useState('sadharan')
  const [plans, setPlans] = useState([])
  const [plansFetchFailed, setPlansFetchFailed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [draftLoaded, setDraftLoaded] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  const [qs] = useSearchParams()
  const navigate = useNavigate()

  // states & cities from master list
  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(
    addr.stateCode,
    addr.districtCode,
    lang,
  )

  useEffect(() => {
    const p = qs.get('plan')
    if (p) setPlan(p)
  }, [qs])

  // Restore draft (so payment failures can resume without re-entering everything)
  useEffect(() => {
    const draft = readDraft()
    if (draft) {
      setHasDraft(true)
      if (typeof draft.step === 'number') setStep(draft.step)
      if (typeof draft.phone === 'string') setPhone(draft.phone)
      if (typeof draft.ref === 'string') setRef(draft.ref)
      if (draft.form && typeof draft.form === 'object') setForm(draft.form)
      if (draft.gotra && typeof draft.gotra === 'object') setGotra(draft.gotra)
      if (draft.gotraform && typeof draft.gotraform === 'object') setgotraform(draft.gotraform)
      if (typeof draft.plan === 'string') setPlan(draft.plan)

      const ja = asSavedFileRef(draft.janAadhar)
      if (ja) setJanAadhar(ja)
      const pf = asSavedFileRef(draft.profilePhoto)
      if (pf) setProfilePhoto(pf)
    }
    // Mark draft load complete so we don't overwrite stored values with initial empty state.
    setDraftLoaded(true)
  }, [])

  // Persist draft (File objects are not persisted; uploaded URLs are)
  useEffect(() => {
    if (!draftLoaded) return
    const prev = readDraft() || {}
    writeDraft({
      ...prev,
      step,
      phone,
      ref,
      form,
      gotra,
      gotraform,
      plan,
      janAadhar: asSavedFileRef(janAadhar),
      profilePhoto: asSavedFileRef(profilePhoto),
      updatedAt: Date.now(),
    })
  }, [step, phone, ref, form, gotra, gotraform, plan, janAadhar, profilePhoto])

  // If returning from PhonePe, resume on payment step and show status
  useEffect(() => {
    const status = (qs.get('status') || '').toLowerCase()
    if (!status) return
    // Only auto-resume on payment step if we still have a draft in this tab/session.
    if (!hasDraft) return
    setStep(8)
    if (status === 'failed') {
      setError(lang === 'hi' ? 'भुगतान विफल रहा। कृपया पुनः प्रयास करें।' : 'Payment failed. Please try again.')
    } else if (status === 'pending') {
      setError(lang === 'hi' ? 'भुगतान लंबित है। कुछ समय बाद पुनः प्रयास करें।' : 'Payment is pending. Please try again in a moment.')
    }
  }, [qs, lang, hasDraft])

  useEffect(() => {
    let alive = true
    fetchPublicPlans()
      .then((list) => {
        if (!alive) return
        const allowed = new Set(['founder', 'member', 'sadharan'])
        setPlansFetchFailed(false)
        setPlans((Array.isArray(list) ? list : []).filter((p) => allowed.has(p?.code)))
      })
      .catch(() => {
        if (!alive) return
        setPlansFetchFailed(true)
        setPlans([])
      })
    return () => { alive = false }
  }, [])

  const prev = () => setStep((s) => {
    if (!OTP_ENABLED && s === 3) return 1
    return Math.max(1, s - 1)
  })

  const startOtp = async () => {
    try {
      setError('')
      if (!/^\+?[0-9]{8,15}$/.test(phone)) {
        setError(t.invalidPhone); return
      }
      setLoading(true)
      const { exists = false } = await post('/auth/check-phone', { phone })
      if (exists) {
        setError(t.phoneExists)
        return
      }

      if (OTP_ENABLED) {
        await post('/otp/start', { phone })
        setStep(2)
      } else {
        setStep(3)
      }
    } catch (e) {
      console.error(e)
      const apiError = e?.response?.data?.error || ''
      if (apiError.toLowerCase().includes('referral code')) {
        setError(t.referralNotFound)
      } else if (apiError.toLowerCase().includes('already exists')) {
        setError(t.phoneExists)
      } else {
        setError(t.errorGeneric)
      }
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    try {
      setError('')
      if (!otp || otp.trim().length !== 6) {
        setError(t.otpRequired)
        return
      }

      setLoading(true)
      await post('/otp/verify', { phone, code: otp.trim() })
      setStep(3)
    } catch (e) {
      console.error(e)
      const apiError = e?.response?.data?.error
      if (apiError && apiError.toLowerCase().includes('otp')) {
        setError(t.invalidOtp)
      } else {
        setError(t.errorGeneric)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReferralNext = async () => {
    setError('')
    const normalizedRef = ref.trim().toUpperCase()
    if (!normalizedRef) {
      setError(t.referralRequired)
      return
    }
    if (!REFERRAL_REGEX.test(normalizedRef)) {
      setError(t.invalidReferral)
      return
    }
    try {
      setLoading(true)
      const exists = await checkReferral(normalizedRef)
      if (!exists) {
        setError(t.referralNotFound)
        return
      }
      setRef(normalizedRef)
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  const handlePersonalNext = () => {
    setError('')
    if (!form.name || !form.name.trim()) {
      setError(t.nameRequired)
      return
    }
    if (!form.email || !form.email.trim()) {
      setError(t.invalidEmailReq)
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError(t.invalidEmail)
      return
    }
    if (!form.dob) {
      setError(t.dobRequired)
      return
    }
    if (!form.gender) {
      setError(t.genderRequired)
      return
    }
    if (!form.maritalStatus) {
      setError(t.maritalRequired)
      return
    }
    if (!form.password || form.password.length < 6) {
      setError(t.passwordHint)
      return
    }
    setStep(5)
  }

  const handleAddressNext = () => {
    setError('')
    if (!form.occupationAddress.state || !form.occupationAddress.stateCode || !form.occupationAddress.district || !form.occupationAddress.districtCode || !form.occupationAddress.city || !form.occupationAddress.cityCode || !form.occupationAddress.village) {
      setError(t.addressRequired);
      return
    }

    if (!form.currentAddress.state || !form.currentAddress.stateCode || !form.currentAddress.district || !form.currentAddress.districtCode || !form.currentAddress.city || !form.currentAddress.cityCode || !form.currentAddress.village) {
      setError(t.addressRequired);
      return
    }

    if (!form.parentalAddress.state || !form.parentalAddress.stateCode || !form.parentalAddress.district || !form.parentalAddress.districtCode || !form.parentalAddress.city || !form.parentalAddress.cityCode || !form.parentalAddress.village) {
      setError(t.addressRequired);
      return
    }

    setStep(6)
  }

  const handleEducationNext = () => {
    setError('')
    if (!form.education) {
      setError(t.educationRequired)
      return
    }
    if (!form.occupation) {
      setError(t.occupationRequired)
      return
    }
    if (!form.department || !form.department.trim()) {
      setError(t.departmentRequired)
      return
    }
    if (!form.designation || !form.designation.trim()) {
      setError(t.designationRequired)
      return
    }
    setStep(7)
  }

  const handleGotraNext = () => {
    setError('')
    const selfVal = gotra?.self === '__custom' ? (gotraform?.self || '') : (gotra?.self || '')
    if (!selfVal || !String(selfVal).trim()) {
      setError(t.gotraSelfRequired)
      return
    }
    setStep(8)
  }

  const finalize = async () => {
    try {
      setError('')
      if (!janAadhar) {
        setError(t.requiredJan); return
      }
      if (!profilePhoto) {
        setError(t.requiredPhoto); return
      }
      const normalizedRef = ref.trim().toUpperCase()
      if (!normalizedRef) {
        setError(t.referralRequired)
        return
      }
      if (!REFERRAL_REGEX.test(normalizedRef)) {
        setError(t.invalidReferral)
        return
      }
      setLoading(true)
      const ja = await resolveUploadUrl(janAadhar, upload)
      const pf = await resolveUploadUrl(profilePhoto, upload)

      const janRef = ja ? { url: ja, name: janAadhar?.name || 'Jan Aadhaar' } : null
      const photoRef = pf ? { url: pf, name: profilePhoto?.name || 'Profile Photo' } : null
      if (janRef) setJanAadhar(janRef)
      if (photoRef) setProfilePhoto(photoRef)

      const payload = {
        phone,
        refCode: normalizedRef,
        form,
        gotra: {
          self: gotra?.self == '__custom' ? gotraform?.self : gotra?.self,
          mother: gotra?.mother == '__custom' ? gotraform?.mother : gotra?.mother,
          nani: gotra?.nani == '__custom' ? gotraform?.nani : gotra?.nani,
          dadi: gotra?.dadi == '__custom' ? gotraform?.dadi : gotra?.dadi
        },

        janAadharUrl: ja,
        janAadhaarUrl: ja,
        profilePhotoUrl: pf,
        plan
      }

      if (TEST_BYPASS_PHONEPE) {
        await post('/auth/register', { ...payload, paymentBypassed: true, otpBypassed: !OTP_ENABLED })
        clearDraft()
        navigate(makePath('login'))
        return
      }

      // Production (PhonePe):
      const res = await post('/payments/phonepe/create', payload)
      if (!res?.redirectUrl) throw new Error('PhonePe: missing redirectUrl')

      // Ensure persisted refs are stored before leaving the SPA
      const prev = readDraft() || {}
      writeDraft({
        ...prev,
        step: 8,
        phone,
        ref: normalizedRef,
        form,
        gotra,
        gotraform,
        plan,
        janAadhar: janRef,
        profilePhoto: photoRef,
        updatedAt: Date.now(),
      })
      window.location.href = res.redirectUrl
    } catch (e) {
      console.error(e)
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  const { gotraOptions: gotraOpts, gotraValueSet } = useGotraOptions(lang)
  const [sameAsCurrent, setSameAsCurrent] = useState(true)
  const [sameAsOccupation, setSameAsOccupation] = useState(true)
  useEffect(() => {
    if (sameAsCurrent) {
      setForm(prev => ({
        ...prev,
        parentalAddress: { ...prev.currentAddress }
      }))
    }
  }, [sameAsCurrent, form.currentAddress])

  useEffect(() => {
    if (sameAsOccupation) {
      setForm(prev => ({
        ...prev,
        currentAddress: { ...prev.occupationAddress }
      }))
    }
  }, [sameAsOccupation, form.occupationAddress])

  const checkReferral = async (code) => {
    try {
      const res = await post('/auth/check-referral', { code })
      return res.exists
    } catch {
      return false
    }
  }

  return (
    <main className="bg-slate-50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8">
          <div className="flex items-baseline justify-between">
            <h1 className="text-2xl font-extrabold text-slate-900">{t.title}</h1>
            <span className="text-xs font-semibold text-slate-500">
              {t.step(displayStep, totalSteps)}
            </span>
          </div>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-5">
            {/* STEP 1 */}
            {step === 1 && (
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700">{t.phone}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.phone}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                />

                <div className="flex gap-2">
                  <button
                    onClick={startOtp}
                    disabled={loading}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
                  >
                    {loading ? '…' : (OTP_ENABLED ? t.sendOtp : t.next)}
                  </button>
                  <Link
                    to={makePath('login')}
                    className="px-5 py-3 rounded-xl border text-slate-700"
                  >
                    {t.login}
                  </Link>
                </div>
              </div>
            )}

            {/* STEP 2 (OTP) — hidden when bypassing */}
            {OTP_ENABLED && step === 2 && (
              <div className="space-y-3">

                <label className="text-sm font-medium text-slate-700">{t.otp}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.otp}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button
                    onClick={verifyOtp}
                    disabled={loading}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
                  >
                    {loading ? '…' : t.verify}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3 – Referral */}
            {step === 3 && (
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-700">{t.referral}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base"
                  placeholder={t.referral}
                  value={ref}
                  maxLength={6}
                  onChange={(e) => {
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 6)
                    setRef(val)
                  }}
                  onBlur={async () => {
                    const normalized = ref.trim().toUpperCase()
                    if (!normalized) {
                      setError(t.referralRequired)
                      return
                    }

                    if (!REFERRAL_REGEX.test(normalized)) {
                      setError(t.invalidReferral)
                      return
                    }

                    const exists = await checkReferral(normalized)
                    if (!exists) {
                      setError(t.referralNotFound)
                    } else {
                      setRef(normalized)
                      setError('')
                    }
                  }}
                />

                <div className="flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button onClick={handleReferralNext} disabled={loading} className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60">
                    {loading ? '…' : t.next}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4 – Personal */}
            {step === 4 && (
              <div className="space-y-4">
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.fullName}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.email}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />

                <DateField
                  label={t.dob}
                  placeholder="YYYY-MM-DD"
                  lang={lang}
                  value={form.dob}
                  onChange={(val) => setForm({ ...form, dob: val })}
                />

                <SelectField
                  label={t.gender}
                  value={form.gender}
                  onChange={(v) => setForm({ ...form, gender: v })}
                  options={GENDER[lang]}
                  placeholder={t.placeholders.gender}
                  required
                />

                <SelectField
                  label={t.marital}
                  value={form.maritalStatus}
                  onChange={(v) => setForm({ ...form, maritalStatus: v })}
                  options={MARITAL[lang]}
                  placeholder={t.placeholders.marital}
                  required
                />

                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                  >
                    {showPwd ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.4 18.4 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 10 8 10 8a18.4 18.4 0 0 1-3.17 4.31M14.12 9.88A3 3 0 0 1 9.88 14.12M1 1l22 22" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button onClick={handlePersonalNext} className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 – Address */}
            {step === 5 && (
              <div className="space-y-4">

                <AddressBlock
                  title={lang === 'hi' ? 'व्यवसाय का पता' : 'Occupation Address'}
                  formKey="occupationAddress"
                  form={form}
                  setForm={setForm}
                  {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
                />
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
                  <input
                    type="checkbox"
                    checked={sameAsOccupation}
                    onChange={(e) => setSameAsOccupation(e.target.checked)}
                    className="h-4 w-4"
                  />
                  {lang === 'hi'
                    ? 'वर्तमान पता व्यवसाय के पते जैसा ही है' :
                    'Current address is same as occupation address'}
                </label>
                {!sameAsOccupation && (
                  <AddressBlock
                    title={lang === 'hi' ? 'वर्तमान पता' : 'Current Address'}
                    formKey="currentAddress"
                    form={form}
                    setForm={setForm}
                    {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
                  />)}
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
                  <input
                    type="checkbox"
                    checked={sameAsCurrent}
                    onChange={(e) => setSameAsCurrent(e.target.checked)}
                    className="h-4 w-4"
                  />
                  {lang === 'hi'
                    ? 'पैतृक पता वर्तमान पते जैसा ही है'
                    : 'Parental address is same as current address'}
                </label>
                {!sameAsCurrent && (
                  <AddressBlock
                    title={lang === 'hi' ? 'पैतृक पता' : 'Parental Address'}
                    formKey="parentalAddress"
                    form={form}
                    setForm={setForm}
                    {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
                  />
                )}

                <div className="flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button onClick={handleAddressNext} className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6 – Education & Occupation */}
            {step === 6 && (
              <div className="space-y-4">
                <SelectField
                  label={t.education}
                  value={form.education}
                  onChange={(v) => setForm({ ...form, education: v })}
                  options={EDUCATION[lang]}
                  placeholder={t.placeholders.education}
                  required
                />


                <SelectField
                  label={t.occupation}
                  value={form.occupation}
                  onChange={(v) => setForm({ ...form, occupation: v })}
                  options={OCCUPATION[lang]}
                  placeholder={t.placeholders.occupation}
                  required
                />
                <label className="block text-sm">
                        <span className="font-semibold text-slate-600">{lang === 'hi' ? 'डिपार्टमेंट' : 'Department'}</span>
                        <input value={form.department} 
                        onChange={(e) => setForm({ ...form, department: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    </label> 
                   <label className="block text-sm">
                        <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पद का नाम' : 'Designation'}</span>
                        <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                    </label> 

                <div className="flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button onClick={handleEducationNext} className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 7 – Gotra */}
            {step === 7 && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <SelectField
                    label={t.gotraSelf}
                    value={gotraValueSet.has(gotra?.self) ? gotra?.self : '__custom'}
                    onChange={(v) => setGotra({ ...gotra, self: v === '__custom' ? '__custom' : v })}
                    options={gotraOpts}
                    placeholder={t.placeholders.gotra}
                    required
                  />
                  {gotra?.self == '__custom' && (
                    <input
                      placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                      value={gotraform.self}
                      onChange={handleChange('self')}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <SelectField
                    label={t.gotraMother}
                    value={gotraValueSet.has(gotra?.mother) ? gotra?.mother : '__custom'}
                    onChange={(v) => setGotra({ ...gotra, mother: v === '__custom' ? '__custom' : v })}
                    options={gotraOpts}
                    placeholder={t.placeholders.gotra}
                  />
                  {gotra?.mother == '__custom' && (
                    <input
                      placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                      value={gotraform.mother}
                      onChange={handleChange('mother')}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <SelectField
                    label={t.gotraDadi}
                    value={gotraValueSet.has(gotra?.dadi) ? gotra?.dadi : '__custom'}
                    onChange={(v) => setGotra({ ...gotra, dadi: v === '__custom' ? '__custom' : v })}
                    options={gotraOpts}
                    placeholder={t.placeholders.gotra}
                  />
                  {gotra?.dadi == '__custom' && (
                    <input
                      placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                      value={gotraform.dadi}
                      onChange={handleChange('dadi')}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <SelectField
                    label={t.gotraNani}
                    value={gotraValueSet.has(gotra?.nani) ? gotra?.nani : '__custom'}
                    onChange={(v) => setGotra({ ...gotra, nani: v === '__custom' ? '__custom' : v })}
                    options={gotraOpts}
                    placeholder={t.placeholders.gotra}
                  />
                  {gotra?.nani == '__custom' && (
                    <input
                      placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                      value={gotraform.nani}
                      onChange={handleChange('nani')}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                    />
                  )}
                </div>

                <div className="md:col-span-2 flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button onClick={handleGotraNext} className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 8 – Plan + uploads */}
            {step === 8 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{t.plan}</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {lang === 'hi'
                      ? 'अपना सदस्यता प्लान चुनें और फिर भुगतान पर आगे बढ़ें।'
                      : 'Choose a membership plan before proceeding to payment.'}
                  </p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {plans.length > 0 && plans.map((p) => {
                      const id = p.code
                      const title = lang === 'hi' ? (p.titleHi || p.titleEn) : p.titleEn
                      const price = `₹${Number(p.price || 0).toLocaleString('en-IN')}`
                      const disabled = p.active === false
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => !disabled && setPlan(id)}
                          className={[
                            'rounded-2xl border p-4 text-left shadow-sm transition',
                            disabled ? 'opacity-50 cursor-not-allowed' : '',
                            plan === id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-slate-200 hover:border-blue-200 hover:shadow'
                          ].join(' ')}
                          aria-pressed={plan === id}
                          disabled={disabled}
                          title={disabled ? (lang === 'hi' ? 'यह प्लान उपलब्ध नहीं है' : 'This plan is not available') : undefined}
                        >
                          <div className="text-sm font-semibold text-slate-900">{title}</div>
                          <div className="text-lg font-bold text-blue-700 mt-1">{price}</div>
                        </button>
                      )
                    })}
                    {plans.length === 0 && (
                      <div className="md:col-span-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                        {plansFetchFailed
                          ? (lang === 'hi' ? 'प्लान लोड नहीं हो पाए। कृपया बाद में पुनः प्रयास करें।' : 'Unable to load plans. Please try again later.')
                          : (lang === 'hi' ? 'कोई प्लान कॉन्फ़िगर नहीं है।' : 'No plans configured.')}
                      </div>
                    )}
                  </div>
                </div>

                <FileDrop
                  label={t.janAadhar}
                  accept=".pdf,image/*"
                  onFile={setJanAadhar}
                  value={janAadhar}
                  hint={t.uploads.janHint}
                  required
                />

                <FileDrop
                  label={t.profilePhoto}
                  accept="image/*"
                  onFile={setProfilePhoto}
                  value={profilePhoto}
                  hint={t.uploads.photoHint}
                  required
                />

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={finalize}
                    disabled={loading || plans.length === 0}
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
                  >
                    {loading ? '…' : t.proceed}
                  </button>
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">
                    {t.back}
                  </button>
                </div>

                <div className="pt-3 text-sm text-slate-500">
                  {t.haveAccount}{' '}
                  <Link to={makePath('login')} className="font-semibold text-blue-600 hover:text-blue-500">
                    {t.login}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
