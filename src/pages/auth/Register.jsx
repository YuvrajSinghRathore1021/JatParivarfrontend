// frontend/src/pages/auth/Register.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { post, upload } from '../../lib/api'
import { useLang } from '../../lib/useLang'
import DateField from '../../components/DateField'
import SelectField from '../../components/SelectField'
import FileDrop from '../../components/FileDrop'
import { useGeoOptions } from '../../hooks/useGeoOptions'
import { asOptions as gotraOptions } from '../../constants/gotras'

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
    profilePhoto: 'Profile Photo (optional)',
    phone: 'Phone',
    referral: 'Referral Code (6 characters)',
    otp: 'OTP',
    fullName: 'Full Name',
    email: 'Email',
    dob: 'Date of birth',
    gender: 'Gender',
    marital: 'Marital Status',
    education: 'Education level',
    occupation: 'Occupation',
    state: 'State',
    district: 'District',
    permanentaddress: 'Permanent Address',
    city: 'City',
    pin: 'PIN',
    gotraSelf: 'Gotra (Self)',
    gotraMother: "Mother's Gotra",
    gotraNani: "Nani's Gotra",
    gotraDadi: "Dadi's Gotra",
    haveAccount: 'Already have an account?',
    login: 'Login',
    requiredJan: 'Please upload your Jan Aadhaar before proceeding.',
    invalidReferral: 'Referral code should be 6 characters (letters or digits).',
    invalidPhone: 'Please enter a valid phone number.',
    otpRequired: 'Please enter the 6-digit OTP sent to your phone.',
    nameRequired: 'Your full name is required.',
    passwordHint: 'Password must be at least 6 characters.',
    stateRequired: 'Please select your state and district.',
    cityRequired: 'Please choose your city.',
    phoneExists: 'This phone number is already registered. Please log in instead.',
    referralNotFound: 'Referral code not found. Please double-check or leave it blank.',
    errorGeneric: 'Something went wrong. Please try again.',
    invalidOtp: 'Invalid OTP. Please try again.',
    invalidEmail: 'Please enter a valid email address.',
    invalidEmailReq: 'Please enter a email address.',

    placeholders: {
      gender: 'Select gender',
      marital: 'Select marital status',
      education: 'Select education',
      occupation: 'Select occupation',
      state: 'Select state',
      district: 'Select district',
      city: 'Select city',
      gotra: 'Choose gotra',
    },
    uploads: {
      janHint: 'PDF or image • Max 10 MB',
      photoHint: 'JPG/PNG • Max 5 MB',
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
    profilePhoto: 'प्रोफ़ाइल फोटो (वैकल्पिक)',
    phone: 'मोबाइल नंबर',
    referral: 'रेफ़रल कोड (6 वर्ण)',
    otp: 'OTP',
    fullName: 'पूरा नाम',
    email: 'ईमेल',
    dob: 'जन्मतिथि',
    gender: 'लिंग',
    marital: 'वैवाहिक स्थिति',
    education: 'शिक्षा स्तर',
    occupation: 'पेशा',
    state: 'राज्य',
    permanentaddress: 'स्थायी पता',
    district: 'ज़िला',
    city: 'शहर',
    pin: 'पिन',
    gotraSelf: 'खुद का गोत्र',
    gotraMother: 'माँ का गोत्र',
    gotraNani: 'नानी का गोत्र',
    gotraDadi: 'दादी का गोत्र',
    haveAccount: 'पहले से खाता है?',
    login: 'लॉगिन',
    requiredJan: 'आगे बढ़ने से पहले कृपया जन आधार अपलोड करें।',
    invalidReferral: 'रेफ़रल कोड 6 वर्ण (अक्षर या अंक) का होना चाहिए।',
    invalidPhone: 'कृपया मान्य मोबाइल नंबर डालें।',
    otpRequired: 'कृपया फोन पर प्राप्त 6 अंकों का OTP दर्ज करें।',
    nameRequired: 'कृपया अपना पूरा नाम दर्ज करें।',
    passwordHint: 'पासवर्ड कम से कम 6 वर्ण का होना चाहिए।',
    stateRequired: 'कृपया अपना राज्य और ज़िला चुनें।',
    cityRequired: 'कृपया अपना शहर चुनें।',
    phoneExists: 'यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।',
    referralNotFound: 'रेफ़रल कोड नहीं मिला। कृपया दोबारा जाँचें या इसे खाली छोड़ दें।',
    errorGeneric: 'कुछ गड़बड़ हुई। कृपया फिर से प्रयास करें।',
    invalidOtp: 'OTP मान्य नहीं है। कृपया पुनः प्रयास करें।',
    invalidEmail: 'कृपया मान्य ईमेल पता दर्ज करें।',
    invalidEmailReq: 'कृपया ईमेल पता दर्ज करें।',
    placeholders: {
      gender: 'लिंग चुनें',
      marital: 'वैवाहिक स्थिति चुनें',
      education: 'शिक्षा स्तर चुनें',
      occupation: 'पेशा चुनें',
      state: 'राज्य चुनें',
      district: 'ज़िला चुनें',
      city: 'शहर चुनें',
      gotra: 'गोत्र चुनें',
    },
    uploads: {
      janHint: 'PDF या इमेज • अधिकतम 10 MB',
      photoHint: 'JPG/PNG • अधिकतम 5 MB',
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

export default function Register() {
  const { lang, makePath } = useLang()
  const t = copy[lang]

  // ===== TEST SWITCHES =====
  // Toggle this to bypass phone OTP during testing.
  const TEST_BYPASS_OTP = true // <-- set to false for production (OTP enforced)
  // Set to false to restore the original PhonePe redirect flow.
  const TEST_BYPASS_PHONEPE = true // <-- set to false for production

  const OTP_ENABLED = !TEST_BYPASS_OTP

  const [step, setStep] = useState(1)
  const totalSteps = OTP_ENABLED ? 6 : 5
  const displayStep = OTP_ENABLED ? step : (step <= 1 ? 1 : step - 1)

  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [ref, setRef] = useState('')

  const [showPwd, setShowPwd] = useState(false)

  const [form, setForm] = useState({
    name: '', email: '', password: '',
    dob: '', gender: '', maritalStatus: '',
    education: '', occupation: '',
  })

  const [addr, setAddr] = useState({
    state: '', stateCode: '', district: '', districtCode: '', city: '', cityCode: '', pin: '', permanentaddress: ''
  })

  const [gotra, setGotra] = useState({
    self: '', mother: '', nani: '', dadi: ''
  })

  const [janAadhar, setJanAadhar] = useState(null)
  const [profilePhoto, setProfilePhoto] = useState(null)
  const [plan, setPlan] = useState('sadharan')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const prev = () => setStep((s) => Math.max(1, s - 1))

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
        // BYPASS OTP: validate & capture referral, then jump to personal step
        const normalizedRef = ref.trim().toUpperCase()
        if (normalizedRef && !/^[A-Z0-9]{6}$/.test(normalizedRef)) {
          setError(t.invalidReferral)
          return
        }
        setRef(normalizedRef)
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
      const normalizedRef = ref.trim().toUpperCase()
      if (normalizedRef && !/^[A-Z0-9]{6}$/.test(normalizedRef)) {
        setError(t.invalidReferral)
        return
      }
      if (!otp || otp.trim().length !== 6) {
        setError(t.otpRequired)
        return
      }

      setLoading(true)
      await post('/otp/verify', { phone, code: otp.trim() })
      setRef(normalizedRef)
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

  const handlePersonalNext = () => {
    setError('')
    if (!form.name || !form.name.trim()) {
      setError(t.nameRequired)
      return
    }
    if (form.email == "") {
      setError(t.invalidEmailReq)
      return
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError(t.invalidEmail)
      return

    }
    if (!form.password || form.password.length < 6) {
      setError(t.passwordHint)
      return
    }
    setStep(4)
  }

  const handleAddressNext = () => {
    setError('')
    if (!addr.stateCode || !addr.districtCode) {
      setError(t.stateRequired)
      return
    }
    if (!addr.cityCode) {
      setError(t.cityRequired)
      return
    }
    setStep(5)
  }

  const handleGotraNext = () => {
    setError('')
    setStep(6)
  }

  const finalize = async () => {
    try {
      setError('')
      if (!janAadhar) {
        setError(t.requiredJan); return
      }
      const normalizedRef = ref.trim().toUpperCase()
      if (normalizedRef && !/^[A-Z0-9]{6}$/.test(normalizedRef)) {
        setError(t.invalidReferral)
        return
      }
      setLoading(true)
      const ja = janAadhar ? (await upload('/uploads/file', janAadhar)).url : null
      const pf = profilePhoto ? (await upload('/uploads/file', profilePhoto)).url : null

      const payload = {
        phone,
        refCode: normalizedRef || null,
        form,
        addr,
        gotra,
        janAadharUrl: ja,
        janAadhaarUrl: ja,
        profilePhotoUrl: pf,
        plan
      }

      if (TEST_BYPASS_PHONEPE) {
        await post('/auth/register', { ...payload, paymentBypassed: true, otpBypassed: !OTP_ENABLED })
        navigate(makePath('login'))
        return
      }

      // Production (PhonePe):
      // const res = await post('/payments/phonepe/create', payload)
      // window.location.href = res.redirectUrl
    } catch (e) {
      console.error(e)
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  const gotraOpts = useMemo(() => gotraOptions(lang), [lang])

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

                {!OTP_ENABLED && (
                  <>
                    <label className="text-sm font-medium text-slate-700">{t.referral}</label>
                    <input
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t.referral}
                      value={ref}
                      maxLength={6}
                      onChange={(e) =>
                        setRef(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))
                      }
                    />
                  </>
                )}

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
                <label className="text-sm font-medium text-slate-700">{t.referral}</label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.referral}
                  value={ref}
                  maxLength={6}
                  onChange={(e) => setRef(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                />
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

            {/* STEP 3 – Personal */}
            {step === 3 && (
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
                />

                <SelectField
                  label={t.education}
                  value={form.education}
                  onChange={(v) => setForm({ ...form, education: v })}
                  options={EDUCATION[lang]}
                  placeholder={t.placeholders.education}
                />

                <SelectField
                  label={t.occupation}
                  value={form.occupation}
                  onChange={(v) => setForm({ ...form, occupation: v })}
                  options={OCCUPATION[lang]}
                  placeholder={t.placeholders.occupation}
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

            {/* STEP 4 – Address */}
            {step === 4 && (
              <div className="space-y-4">
                <SelectField
                  label={t.state}
                  value={addr.stateCode}
                  onChange={(code) => {
                    const selected = states.find((item) => item.code === code)
                    setAddr((prev) => ({
                      ...prev,
                      stateCode: code,
                      state: selected?.name?.en || '',
                      districtCode: '',
                      district: '',
                      cityCode: '',
                      city: '',
                    }))
                  }}
                  options={stateOptions}
                  placeholder={t.placeholders.state}
                />

                <SelectField
                  label={t.district}
                  value={addr.districtCode}
                  onChange={(code) => {
                    const selected = districts.find((item) => item.code === code)
                    setAddr((prev) => ({
                      ...prev,
                      districtCode: code,
                      district: selected?.name?.en || '',
                      cityCode: '',
                      city: '',
                    }))
                  }}
                  options={districtOptions}
                  placeholder={t.placeholders.district}
                  disabled={!addr.stateCode}
                />

                <SelectField
                  label={t.city}
                  value={addr.cityCode}
                  onChange={(code) => {
                    const selected = cities.find((item) => item.code === code)
                    setAddr((prev) => ({
                      ...prev,
                      cityCode: code,
                      city: selected?.name?.en || '',
                    }))
                  }}
                  options={cityOptions}
                  placeholder={t.placeholders.city}
                  disabled={!addr.districtCode}
                />

                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.pin}
                  value={addr.pin}
                  onChange={(e) => setAddr({ ...addr, pin: e.target.value })}
                />
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={t.permanentaddress}
                  value={addr.permanentaddress}
                  onChange={(e) => setAddr({ ...addr, permanentaddress: e.target.value })}
                />

                <div className="flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button onClick={handleAddressNext} className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5 – Gotra */}
            {step === 5 && (
              <div className="grid gap-4 md:grid-cols-2">
                <SelectField
                  label={t.gotraSelf}
                  value={gotra.self}
                  onChange={(v) => setGotra({ ...gotra, self: v })}
                  options={gotraOpts}
                  placeholder={t.placeholders.gotra}
                />
                <SelectField
                  label={t.gotraMother}
                  value={gotra.mother}
                  onChange={(v) => setGotra({ ...gotra, mother: v })}
                  options={gotraOpts}
                  placeholder={t.placeholders.gotra}
                />
                <SelectField
                  label={t.gotraDadi}
                  value={gotra.dadi}
                  onChange={(v) => setGotra({ ...gotra, dadi: v })}
                  options={gotraOpts}
                  placeholder={t.placeholders.gotra}
                />
                <SelectField
                  label={t.gotraNani}
                  value={gotra.nani}
                  onChange={(v) => setGotra({ ...gotra, nani: v })}
                  options={gotraOpts}
                  placeholder={t.placeholders.gotra}
                />

                <div className="md:col-span-2 flex gap-2">
                  <button onClick={prev} className="px-5 py-3 rounded-xl border">{t.back}</button>
                  <button onClick={handleGotraNext} className="px-5 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                    {t.next}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6 – Uploads & Plan */}
            {step === 6 && (
              <div className="space-y-5">
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
                />

                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    className="p-3 border rounded-xl"
                    aria-label={t.plan}
                  >
                    <option value="founder">Founder ₹101000</option>
                    <option value="member">Member ₹50000</option>
                    <option value="sadharan">Sadharan ₹2100</option>
                  </select>
                  <button
                    onClick={finalize}
                    disabled={loading}
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
