// frontend/src/pages/dashboard/profile/ProfileEditor.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMyProfile, requestProfileOtp, verifyProfileOtp, updateMyProfile } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'
import { makeInitialAvatar } from '../../../lib/avatar'
import { upload } from '../../../lib/api'
import SelectField from '../../../components/SelectField'
import DateField from '../../../components/DateField'
import { useGeoOptions } from '../../../hooks/useGeoOptions'
import { useGotraOptions } from '../../../hooks/useGotraOptions'
import AddressBlock from '../../../components/AddressBlock'
import {
  OCCUPATION_CATEGORY_OPTIONS,
  PROFESSIONAL_SERVICE_OPTIONS,
  EDUCATION_CATEGORY_OPTIONS,
  GRADUATE_SPECIALIZATION_OPTIONS,
  getOccupationCategory,
  getOccupationSpecialization,
  composeOccupationValue,
  getEducationCategory,
  getGraduateSpecialization,
  getPostgraduateCustomText,
  composeEducationValue,
} from '../../../constants/profileOptions'
let API_File = import.meta.env.VITE_API_File
const spotlightLabels = {
  founder: { labelEn: 'Founder listing', labelHi: 'संस्थापक सूची' },
  management: { labelEn: 'Management listing', labelHi: 'प्रबंधन सूची' },
  none: { labelEn: 'Hide from public listing', labelHi: 'सार्वजनिक सूची से छुपाएँ' }
}


const emptyGotra = { self: '__custom', mother: '__custom', dadi: '__custom', nani: '__custom' }

export default function ProfileEditor() {
  const { lang } = useLang()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['profile', 'me'], queryFn: fetchMyProfile })
  const { gotraOptions: gotraOptionsList, gotraValueSet } = useGotraOptions(lang)

  const gotraChoice = (value) => {
    const v = (value || '').toString().trim()
    if (v && gotraValueSet?.has(v)) return v
    return '__custom'
  }
  const [geoCodes, setGeoCodes] = useState({ stateCode: '', districtCode: '', cityCode: '' })
  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(
    geoCodes.stateCode,
    geoCodes.districtCode,
    lang
  )
  const matchCodeByName = (list = [], value) => {
    if (!value) return ''
    const normalized = value.toString().trim().toLowerCase()
    if (!normalized) return ''
    const match = list.find((item) => {
      const en = item?.name?.en?.toString().trim().toLowerCase()
      const hi = item?.name?.hi?.toString().trim().toLowerCase()
      return en === normalized || hi === normalized
    })
    return match?.code || ''
  }

  const [form, setForm] = useState({
    name: '',
    displayName: '',
    phone: '',
    role: '',
    occupation: '',

    education: '', department: '',
    designation: '',

    publicNote: '',
    contactEmail: '',
    alternatePhone: '',
    showPhoneOnPublic: true,
    janAadhaarUrl: '',
    dateOfBirth: '',

    gotra: emptyGotra,
    avatarUrl: '',
    spotlightRole: 'none',
    spotlightTitle: '',
    spotlightPlace: '',
    spotlightBioEn: '',
    spotlightBioHi: '',
    spotlightBannerUrl: '',
    spotlightVisible: true,
    referralCode: '',
    newPassword: '',
    confirmNewPassword: '',

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

  const [message, setMessage] = useState('')
  const [avatarMessage, setAvatarMessage] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [janUploading, setJanUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState('')
  const [otpMessage, setOtpMessage] = useState('')
  const [showProfileOtpPanel, setShowProfileOtpPanel] = useState(false)
  const [pendingProfileSave, setPendingProfileSave] = useState(false)
  const [profileSaveAttempted, setProfileSaveAttempted] = useState(false)
  const fileInputRef = useRef(null)
  const janInputRef = useRef(null)
  const bannerInputRef = useRef(null)

  useEffect(() => {
    if (!data) return
    const { user, person } = data
    const dobDate = user?.dateOfBirth ? new Date(user.dateOfBirth) : null
    const dobValue =
      dobDate && !Number.isNaN(dobDate.getTime()) ? dobDate.toISOString().slice(0, 10) : ''
    setForm({
      name: user?.name || '',
      displayName: user?.displayName || '',
      phone: user?.phone || '',
      role: user?.role || '',
      occupation: user?.occupation || '',
      designation: user?.designation || '',
      education: user?.education || '',
      department: user?.department || '',
      publicNote: user?.publicNote || '',
      contactEmail: user?.contactEmail || '',
      alternatePhone: user?.alternatePhone || '',
      showPhoneOnPublic: user?.showPhoneOnPublic !== false,
      janAadhaarUrl: user?.janAadhaarUrl || '',
      dateOfBirth: dobValue,

      gotra: {
        self: user?.gotra?.self || '',
        mother: user?.gotra?.mother || '',
        dadi: user?.gotra?.dadi || '',
        nani: user?.gotra?.nani || '',
      },
      avatarUrl: user?.avatarUrl || '',
      spotlightRole: person?.role || 'none',
      spotlightTitle: person?.title || '',
      spotlightPlace: person?.place || '',
      spotlightBioEn: person?.bioEn || '',
      spotlightBioHi: person?.bioHi || '',
      spotlightBannerUrl: person?.bannerUrl || '',
      spotlightVisible: person?.visible ?? true,
      referralCode: user?.referralCode || '',
      newPassword: '',
      confirmNewPassword: '',


      occupationAddress: {
        state: user?.occupationAddress?.state,
        stateCode: user?.occupationAddress?.stateCode,
        district: user?.occupationAddress?.district,
        districtCode: user?.occupationAddress?.districtCode,
        city: user?.occupationAddress?.city,
        cityCode: user?.occupationAddress?.cityCode,
        village: user?.occupationAddress?.village
      },

      currentAddress: {
        state: user?.currentAddress?.state,
        stateCode: user?.currentAddress?.stateCode,
        district: user?.currentAddress?.district,
        districtCode: user?.currentAddress?.districtCode,
        city: user?.currentAddress?.city,
        cityCode: user?.currentAddress?.cityCode,
        village: user?.currentAddress?.village
      },

      parentalAddress: {
        state: user?.currentAddress?.state,
        stateCode: user?.currentAddress?.stateCode,
        district: user?.currentAddress?.district,
        districtCode: user?.currentAddress?.districtCode,
        city: user?.currentAddress?.city,
        cityCode: user?.currentAddress?.cityCode,
        village: user?.currentAddress?.village
      },
    })
  }, [data])

  const resetOtpGate = (nextMessage = '') => {
    setOtpCode('')
    setOtpSent(false)
    setOtpVerified(false)
    setOtpError('')
    setOtpMessage(nextMessage)
  }

  const syncOtpRequiredError = (apiMessage, { forProfileSave = false } = {}) => {
    if ((apiMessage || '').includes('OTP verification required before profile update')) {
      resetOtpGate(lang === 'hi' ? "कृपया नया OTP मंगाकर सत्यापित करें।" : "Please request and verify a new OTP.")
      setShowProfileOtpPanel(true)
      if (forProfileSave) {
        setPendingProfileSave(true)
        setProfileSaveAttempted(true)
      }
      return true
    }
    return false
  }

  
  
  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      qc.invalidateQueries(['profile', 'me'])
      qc.invalidateQueries(['public', 'people'])
      qc.invalidateQueries(['auth', 'me'])
      setForm((prev) => ({ ...prev, newPassword: '', confirmNewPassword: '' }))
      resetOtpGate(lang === 'hi' ? "यह OTP उपयोग हो चुका है। अगली सेव से पहले नया OTP सत्यापित करें।" : "OTP consumed. Verify a new OTP before your next save.")
      setShowProfileOtpPanel(false)
      setPendingProfileSave(false)
      setProfileSaveAttempted(false)
      setAvatarMessage('')
      setMessage(lang === 'hi' ? "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।" : "Profile updated successfully.")
      alert(lang === 'hi' ? "प्रोफ़ाइल सफलतापूर्वक अपडेट हो गई।" : "Profile updated successfully.")
      setTimeout(() => setMessage(''), 4000)
    },
    onError: (err) => {
      const apiMessage = extractApiError(err)
      syncOtpRequiredError(apiMessage, { forProfileSave: true })
      setMessage(apiMessage || (lang === 'hi' ? "अपडेट असफल रहा।" : "Update failed."))
    },
  })

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm((prev) => {
      if (field === 'spotlightRole') {
        return {
          ...prev,
          spotlightRole: value,
          spotlightVisible: value === 'none' ? false : prev.spotlightVisible,
        }
      }
      return { ...prev, [field]: value }
    })
  }



  const updateGotraField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      gotra: { ...(prev.gotra || {}), [field]: value },
    }))
  }



  const displayAvatar = useMemo(() => {
    if (form.avatarUrl) return form.avatarUrl
    const baseName = form.displayName || form.name || data?.user?.phone || 'Member'
    return makeInitialAvatar(baseName, { size: 160, radius: 48 })
  }, [form.avatarUrl, form.displayName, form.name, data?.user])
  const avatarSrc = useMemo(() => {
    if (!displayAvatar) return ''
    return displayAvatar.startsWith('data:') ? displayAvatar : `${API_File}${displayAvatar}`
  }, [displayAvatar])

  const triggerFilePicker = () => {
    if (avatarUploading) return
    fileInputRef.current?.click()
  }

  const triggerJanPicker = () => {
    if (janUploading) return
    janInputRef.current?.click()
  }

  const triggerBannerPicker = () => {
    if (bannerUploading) return
    bannerInputRef.current?.click()
  }

  const onAvatarSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(lang === 'hi' ? "Please choose an image smaller than 1 MB." : "Please choose an image smaller than 1 MB.")
      return
    }
    try {
      setAvatarUploading(true)
      setAvatarError('')
      setAvatarMessage('')
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, avatarUrl: url }))
      setAvatarMessage(lang === 'hi' ? "Photo is ready. Save profile to apply it." : "Photo is ready. Save profile to apply it.")
    } catch (err) {
      console.error(err)
      setAvatarError(lang === 'hi' ? "Upload failed, please try again." : "Upload failed, please try again.")
    } finally {
      setAvatarUploading(false)
    }
  }

  const onJanSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setMessage(lang === 'hi' ? "Please choose a document smaller than 10 MB." : "Please choose a document smaller than 10 MB.")
      return
    }
    try {
      setJanUploading(true)
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, janAadhaarUrl: url }))
    } catch (err) {
      setMessage(err.message || (lang === 'hi' ? "Upload failed." : "Upload failed."))
    } finally {
      setJanUploading(false)
    }
  }

  const onBannerSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage(lang === 'hi' ? "Please choose a banner smaller than 1 MB." : "Please choose a banner smaller than 1 MB.")
      return
    }
    try {
      setBannerUploading(true)
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, spotlightBannerUrl: url }))
      setMessage(lang === 'hi' ? "Banner uploaded." : "Banner uploaded.")
    } catch (err) {
      setMessage(err.message || (lang === 'hi' ? "Banner upload failed." : "Banner upload failed."))
    } finally {
      setBannerUploading(false)
    }
  }

  const removeAvatar = () => {
    setForm((prev) => ({ ...prev, avatarUrl: '' }))
    setAvatarError('')
    setAvatarMessage(lang === 'hi' ? "Save profile to remove the photo." : "Save profile to remove the photo.")
  }

  const removeBanner = () => {
    setForm((prev) => ({ ...prev, spotlightBannerUrl: '' }))
  }

  const buildProfilePayload = () => ({
    name: form.name,
    displayName: form.displayName,
    occupation: form.occupation,
    designation: form.designation,
    education: form?.education,
    department: form?.department,
    publicNote: form.publicNote,
    contactEmail: form.contactEmail,
    alternatePhone: form.alternatePhone,
    showPhoneOnPublic: form.showPhoneOnPublic,
    avatarUrl: form.avatarUrl,
    janAadhaarUrl: form.janAadhaarUrl,
    dateOfBirth: form.dateOfBirth || undefined,
    occupationAddress: hasValues(form.occupationAddress) ? form.occupationAddress : undefined,
    currentAddress: hasValues(form.currentAddress) ? form.currentAddress : undefined,
    parentalAddress: hasValues(form.parentalAddress) ? form.parentalAddress : undefined,
    gotra: hasValues(form.gotra) ? form.gotra : undefined,
    spotlightRole: form.spotlightRole === 'none' ? 'none' : form.spotlightRole,
    spotlightTitle: form.designation || form.spotlightTitle,
    spotlightPlace: form.department || form.currentAddress?.city || form.occupationAddress?.city || form.spotlightPlace,
    spotlightBioEn: form.spotlightBioEn,
    spotlightBioHi: form.spotlightBioHi,
    spotlightBannerUrl: form.spotlightBannerUrl,
    spotlightVisible: form.spotlightVisible,
    newPassword: String(form.newPassword || '').trim() || undefined,
  })

  const attemptProfileSave = (verifiedOverride = false) => {
    if (occupationCategory === 'professional_services' && !occupationSpecialization) {
      setMessage('Please select a professional service specialization.')
      return
    }
    if (educationCategory === 'graduate' && !graduateSpecialization) {
      setMessage('Please select graduate specialization.')
      return
    }
    if (educationCategory === 'postgraduate' && !String(postgraduateCustomText || '').trim()) {
      setMessage('Please enter postgraduate qualification.')
      return
    }
    if (String(form.newPassword || '').trim() && String(form.newPassword || '').trim().length < 6) {
      setMessage(lang === 'hi' ? "नया पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" : "New password must be at least 6 characters.")
      return
    }
    if (String(form.newPassword || '').trim() && String(form.newPassword || '').trim() !== String(form.confirmNewPassword || '').trim()) {
      setMessage(lang === 'hi' ? "नया पासवर्ड और पुष्टि पासवर्ड मेल नहीं खाते।" : "New password and confirm password do not match.")
      return
    }
    setProfileSaveAttempted(true)
    const canProceed = verifiedOverride || otpVerified
    if (!canProceed) {
      setShowProfileOtpPanel(true)
      setPendingProfileSave(true)
      setOtpError('')
      setOtpMessage(
        lang === 'hi'
          ? 'जारी रखने के लिए OTP मंगाकर सत्यापित करें।'
          : 'To continue, request OTP and verify it.'
      )
      return
    }
    setShowProfileOtpPanel(false)
    setPendingProfileSave(false)
    setProfileSaveAttempted(false)
    mutation.mutate(buildProfilePayload())
  }

  const onSubmit = (event) => {
    event.preventDefault()
    attemptProfileSave()
  }

  const startProfileOtp = async () => {
    try {
      setShowProfileOtpPanel(true)
      setOtpLoading(true)
      setOtpError('')
      setOtpMessage('')
      await requestProfileOtp()
      setOtpSent(true)
      setOtpVerified(false)
      setOtpCode('')
      setOtpMessage(lang === 'hi' ? "OTP भेज दिया गया है। कृपया अभी सत्यापित करें।" : "OTP sent. Please verify it now.")
      setAvatarError('')
    } catch (err) {
      setOtpError(extractApiError(err) || (lang === 'hi' ? "OTP भेजा नहीं जा सका।" : "Could not send OTP."))
    } finally {
      setOtpLoading(false)
    }
  }

  const verifyProfileOtpCode = async () => {
    const code = otpCode.trim()
    if (!/^\d{6}$/.test(code)) {
      setOtpError(lang === 'hi' ? "कृपया मान्य 6 अंकों का OTP दर्ज करें।" : "Please enter a valid 6-digit OTP.")
      return
    }
    try {
      setOtpLoading(true)
      setOtpError('')
      await verifyProfileOtp(code)
      setOtpVerified(true)
      if (pendingProfileSave) {
        setOtpMessage(lang === 'hi' ? "OTP सत्यापित हो गया। सेव जारी है..." : "OTP verified. Continuing save...")
        attemptProfileSave(true)
      } else {
        setOtpMessage(lang === 'hi' ? "OTP सत्यापित हो गया। अब एक सेव क्रिया पूरी कर सकते हैं।" : "OTP verified. You can complete one save action now.")
      }
    } catch (err) {
      setOtpError(extractApiError(err) || (lang === 'hi' ? "OTP सत्यापन असफल रहा।" : "OTP verification failed."))
      setOtpVerified(false)
    } finally {
      setOtpLoading(false)
    }
  }
  const [sameAsCurrent, setSameAsCurrent] = useState(false)
  const [sameAsOccupation, setSameAsOccupation] = useState(false)

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

  const occupationCategory = getOccupationCategory(form.occupation)
  const occupationSpecialization = getOccupationSpecialization(form.occupation)
  const educationCategory = getEducationCategory(form.education)
  const graduateSpecialization = getGraduateSpecialization(form.education)
  const postgraduateCustomText = getPostgraduateCustomText(form.education)



  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            {lang === 'hi' ? 'मेरी प्रोफाइल' : 'My profile'}
          </h2>
          <p className="text-sm text-slate-600">
            {lang === 'hi' ? 'यहां अपडेट की गई जानकारी सार्वजनिक साइट और डैशबोर्ड पर संबंधित जगहों पर दिखाई देती है।' : 'Details you update here appear on the public site and dashboard where relevant.'}
          </p>
          {message && <p className="text-sm text-blue-600">{message}</p>}
        </header>

        <section className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center md:flex-row md:items-center md:gap-6 md:text-left">
          <img
            src={avatarSrc}
            alt="image"
            className="h-28 w-28 rounded-3xl object-cover bg-slate-100"
            onError={(e) => {
              e.currentTarget.onerror = null
              const baseName = form.displayName || form.name || data?.user?.phone || 'Member'
              e.currentTarget.src = makeInitialAvatar(baseName, { size: 160, radius: 48 })
            }}
          />
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">{lang === 'hi' ? "Profile photo" : "Profile photo"}</p>
              <p className="text-xs text-slate-500">
                {lang === 'hi' ? "Upload a clear headshot so members can recognise you. The previous photo is removed automatically when you upload a new one." : "Upload a clear headshot so members can recognise you. The previous photo is removed automatically when you upload a new one."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={avatarUploading || mutation.isPending}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {avatarUploading
                  ? lang === 'hi' ? "Uploading..." : "Uploading..."
                  : lang === 'hi' ? "Change photo" : "Change photo"}
              </button>
              {form.avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={avatarUploading || mutation.isPending}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {lang === 'hi' ? "Remove photo" : "Remove photo"}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarSelected}
              />
            </div>
            {avatarMessage && <p className="text-xs text-green-600">{avatarMessage}</p>}
            {avatarError && <p className="text-xs text-red-600">{avatarError}</p>}
          </div>
        </section>

        {isLoading ? (
          <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" aria-hidden="true" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <LabeledField label={lang === 'hi' ? "Full name" : "Full name"} value={form.name} onChange={handleChange('name')} />
            {/* <LabeledField label={lang === 'hi' ? "Display name" : "Display name"} value={form.displayName} onChange={handleChange('displayName')} /> */}
            <LabeledField label={lang === 'hi' ? "Primary phone" : "Primary phone"} value={form.phone} disabled />
            <LabeledField label={lang === 'hi' ? "Membership role" : "Membership role"} value={roleLabel(form.role, lang)} disabled />

            <SelectField
              label={lang === 'hi' ? 'Occupation' : 'Occupation'}
              value={occupationCategory}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  occupation: composeOccupationValue({
                    category: value,
                    specialization: occupationSpecialization
                  })
                }))
              }
              options={OCCUPATION_CATEGORY_OPTIONS[lang] || OCCUPATION_CATEGORY_OPTIONS.en}
              placeholder={lang === 'hi' ? 'Select occupation' : 'Select occupation'}
            />
            {occupationCategory === 'professional_services' && (
              <SelectField
                label={lang === 'hi' ? 'Professional Services Specialization' : 'Professional Services Specialization'}
                value={occupationSpecialization}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    occupation: composeOccupationValue({
                      category: 'professional_services',
                      specialization: value
                    })
                  }))
                }
                options={PROFESSIONAL_SERVICE_OPTIONS[lang] || PROFESSIONAL_SERVICE_OPTIONS.en}
                placeholder={lang === 'hi' ? 'Select specialization' : 'Select specialization'}
              />
            )}
            <SelectField
              label={lang === 'hi' ? 'Education' : 'Education'}
              value={educationCategory}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  education: composeEducationValue({
                    category: value,
                    graduateSpecialization,
                    postgraduateCustomText
                  })
                }))
              }
              options={EDUCATION_CATEGORY_OPTIONS[lang] || EDUCATION_CATEGORY_OPTIONS.en}
              placeholder={lang === 'hi' ? 'Select education' : 'Select education'}
            />
            {educationCategory === 'graduate' && (
              <SelectField
                label={lang === 'hi' ? 'Graduate Specialization' : 'Graduate Specialization'}
                value={graduateSpecialization}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    education: composeEducationValue({
                      category: 'graduate',
                      graduateSpecialization: value,
                      postgraduateCustomText
                    })
                  }))
                }
                options={GRADUATE_SPECIALIZATION_OPTIONS[lang] || GRADUATE_SPECIALIZATION_OPTIONS.en}
                placeholder={lang === 'hi' ? 'Select graduate specialization' : 'Select graduate specialization'}
              />
            )}
            {educationCategory === 'postgraduate' && (
              <label className="block text-sm">
                <span className="font-semibold text-slate-600">{lang === 'hi' ? 'Postgraduate Qualification' : 'Postgraduate Qualification'}</span>
                <input
                  value={postgraduateCustomText}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      education: composeEducationValue({
                        category: 'postgraduate',
                        graduateSpecialization,
                        postgraduateCustomText: e.target.value
                      })
                    }))
                  }
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                  placeholder={lang === 'hi' ? 'Type your qualification' : 'Type your qualification'}
                />
              </label>
            )}
            <label className="block text-sm">
              <span className="font-semibold text-slate-600">{lang === 'hi' ? "Department" : "Department"}</span>
              <input value={form.department} onChange={handleChange('department')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <LabeledField label={lang === 'hi' ? "Designation" : "Designation"} value={form.designation} onChange={handleChange('designation')} />
            <LabeledField label={lang === 'hi' ? "Email" : "Email"} value={form.contactEmail} onChange={handleChange('contactEmail')} />
            <LabeledField label={lang === 'hi' ? "Alternate phone" : "Alternate phone"} value={form.alternatePhone} onChange={handleChange('alternatePhone')} />
            <LabeledField
              label={lang === 'hi' ? "New password (optional)" : "New password (optional)"}
              type="password"
              value={form.newPassword}
              onChange={handleChange('newPassword')}
              placeholder={lang === 'hi' ? "Minimum 6 characters" : "Minimum 6 characters"}
            />
            <LabeledField
              label={lang === 'hi' ? "Confirm new password" : "Confirm new password"}
              type="password"
              value={form.confirmNewPassword}
              onChange={handleChange('confirmNewPassword')}
            />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.showPhoneOnPublic)}
                onChange={(e) => setForm((prev) => ({ ...prev, showPhoneOnPublic: e.target.checked }))}
                className="h-4 w-4"
              />
              {lang === 'hi' ? 'Show phone publicly on profile pages' : 'Show phone publicly on profile pages'}
            </label>
            <div>
              <DateField
                lang={lang}
                label={lang === 'hi' ? "Date of birth" : "Date of birth"}
                value={form.dateOfBirth}
                onChange={(value) => setForm((prev) => ({ ...prev, dateOfBirth: value }))}
                minYear={1920}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-600">
            {lang === 'hi' ? "Public note" : "Public note"}
          </label>
          <textarea
            value={form.publicNote}
            onChange={handleChange('publicNote')}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>

        {/* <address></address> */}

        <AddressBlock
          title={lang === 'hi' ? "Occupation Address" : "Occupation Address"}
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
          {lang === 'hi' ? "Current address is same as occupation address" : "Current address is same as occupation address"}
        </label>
        {!sameAsOccupation && (


          <AddressBlock
            title={lang === 'hi' ? "Current Address" : "Current Address"}
            formKey="currentAddress"
            form={form}
            setForm={setForm}
            {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
          />
        )}
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
          <input
            type="checkbox"
            checked={sameAsCurrent}
            onChange={(e) => setSameAsCurrent(e.target.checked)}
            className="h-4 w-4"
          />
          {lang === 'hi' ? "Parental address is same as current address" : "Parental address is same as current address"}
        </label>
        {!sameAsCurrent && (
          <AddressBlock
            title={lang === 'hi' ? "Parental Address" : "Parental Address"}
            formKey="parentalAddress"
            form={form}
            setForm={setForm}
            {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
          />
	        )}

		        <section className="grid gap-4 md:grid-cols-2">
	          <SelectField
	            label={lang === 'hi' ? "Gotra (Self)" : "Gotra (Self)"}
	            value={gotraChoice(form.gotra?.self)}
	            onChange={(value) => updateGotraField('self', value === '__custom' ? '' : value)}
	            options={gotraOptionsList}
	            placeholder={lang === 'hi' ? "Select gotra" : "Select gotra"}
	          />
	          {gotraChoice(form.gotra?.self) === '__custom' && (
	            <input
	              value={form.gotra?.self || ''}
	              onChange={(e) => updateGotraField('self', e.target.value)}
	              placeholder={lang === 'hi' ? "Enter gotra" : "Enter gotra"}
	              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
	            />
	          )}
	          <SelectField
	            label={lang === 'hi' ? "Gotra (Mother)" : "Gotra (Mother)"}
	            value={gotraChoice(form.gotra?.mother)}
	            onChange={(value) => updateGotraField('mother', value === '__custom' ? '' : value)}
	            options={gotraOptionsList}
	            placeholder={lang === 'hi' ? "Select gotra" : "Select gotra"}
	          />
	          {gotraChoice(form.gotra?.mother) === '__custom' && (
	            <input
	              value={form.gotra?.mother || ''}
	              onChange={(e) => updateGotraField('mother', e.target.value)}
	              placeholder={lang === 'hi' ? "Enter gotra" : "Enter gotra"}
	              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
	            />
	          )}
	          <SelectField
	            label={lang === 'hi' ? "Gotra (Dadi)" : "Gotra (Dadi)"}
	            value={gotraChoice(form.gotra?.dadi)}
	            onChange={(value) => updateGotraField('dadi', value === '__custom' ? '' : value)}
	            options={gotraOptionsList}
	            placeholder={lang === 'hi' ? "Select gotra" : "Select gotra"}
	          />
	          {gotraChoice(form.gotra?.dadi) === '__custom' && (
	            <input
	              value={form.gotra?.dadi || ''}
	              onChange={(e) => updateGotraField('dadi', e.target.value)}
	              placeholder={lang === 'hi' ? "Enter gotra" : "Enter gotra"}
	              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
	            />
	          )}
	          <SelectField
	            label={lang === 'hi' ? "Gotra (Nani)" : "Gotra (Nani)"}
	            value={gotraChoice(form.gotra?.nani)}
	            onChange={(value) => updateGotraField('nani', value === '__custom' ? '' : value)}
	            options={gotraOptionsList}
	            placeholder={lang === 'hi' ? "Select gotra" : "Select gotra"}
	          />
	          {gotraChoice(form.gotra?.nani) === '__custom' && (
	            <input
	              value={form.gotra?.nani || ''}
	              onChange={(e) => updateGotraField('nani', e.target.value)}
	              placeholder={lang === 'hi' ? "Enter gotra" : "Enter gotra"}
	              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
	            />
	          )}
	        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                {lang === 'hi' ? "Jan Aadhaar document" : "Jan Aadhaar document"}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'hi' ? "PDF or image - up to 10 MB" : "PDF or image - up to 10 MB"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={triggerJanPicker}
                disabled={janUploading}
                className="rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-60"
              >
                {janUploading ? (lang === 'hi' ? "Uploading..." : "Uploading...") : (lang === 'hi' ? "Upload document" : "Upload document")}
              </button>
              <input ref={janInputRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={onJanSelected} />
            </div>
          </div>
          <input
            value={form.janAadhaarUrl}
            onChange={handleChange('janAadhaarUrl')}
            placeholder="https://example.com/jan-aadhaar.pdf"
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700">
            {lang === 'hi' ? "Spotlight listing" : "Spotlight listing"}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'hi' ? "Provide details if you wish to appear on the public founder or management pages." : "Provide details if you wish to appear on the public founder or management pages."}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              <span>{lang === 'hi' ? "Listing visibility" : "Listing visibility"}</span>
              <select
                value={form.spotlightRole}
                onChange={handleChange('spotlightRole')}
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              >
                {spotlightOptionValues(form.role).map((value) => (
                  <option key={value} value={value}>
                    {lang === 'hi' ? spotlightLabels[value].labelHi : spotlightLabels[value].labelEn}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.spotlightVisible}
                onChange={(e) => setForm((prev) => ({ ...prev, spotlightVisible: e.target.checked }))}
              />
              <span>{lang === 'hi' ? "Show on public listing" : "Show on public listing"}</span>
            </label>
            <div className="md:col-span-2 text-xs text-slate-500">
              {lang === 'hi' ? "Designation and department are taken from your profile details automatically." : "Designation and department are taken from your profile details automatically."}
            </div>
            <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 p-4 space-y-3 bg-white/50">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {lang === 'hi' ? "Organisation banner (optional)" : "Organisation banner (optional)"}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' ? "Horizontal image - recommended 1500x300 - up to 1 MB" : "Horizontal image - recommended 1500x300 - up to 1 MB"}
                    
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 h-48 grid place-items-center">
                {form.spotlightBannerUrl ? (
                  <img
                    src={API_File + form.spotlightBannerUrl}
                    alt="Organisation banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <p className="text-xs text-slate-500 text-center px-6">
                    {lang === 'hi' ? "Upload a banner that represents your organisation or initiative." : "Upload a banner that represents your organisation or initiative."}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={triggerBannerPicker}
                  disabled={bannerUploading}
                  className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {bannerUploading
                    ? lang === 'hi' ? "Uploading..." : "Uploading..."
                    : lang === 'hi' ? "Upload banner" : "Upload banner"}
                </button>
                {form.spotlightBannerUrl && (
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                  >
                    {lang === 'hi' ? "Remove banner" : "Remove banner"}
                  </button>
                )}
                <input
                  ref={bannerInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onBannerSelected}
                />
              </div>
            </div>
            <label className="text-sm text-slate-600 md:col-span-2">
              <span>{lang === 'hi' ? "Brief bio (English)" : "Brief bio (English)"}</span>
              <textarea value={form.spotlightBioEn} onChange={handleChange('spotlightBioEn')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600 md:col-span-2">
              <span>{lang === 'hi' ? "Brief bio (Hindi)" : "Brief bio (Hindi)"}</span>
              <textarea value={form.spotlightBioHi} onChange={handleChange('spotlightBioHi')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </div>
        </section>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-600">{lang === 'hi' ? "Referral code" : "Referral code"}</h3>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-200">
              {form.referralCode || '-'}
            </code>
            <p className="text-xs text-slate-500">
              {lang === 'hi' ? "Share this code so new members can list you as their referrer." : "Share this code so new members can list you as their referrer."}
            </p>
          </div>
        </div>

        {(showProfileOtpPanel || pendingProfileSave || otpSent || profileSaveAttempted || Boolean(otpError)) && (
          <section className="rounded-3xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 space-y-4 shadow-sm">
            <h3 className="text-lg md:text-xl font-bold text-blue-900">
              {lang === 'hi' ? "प्रोफ़ाइल सेव सत्यापन" : "Profile Save Verification"}
            </h3>
            <p className="text-sm md:text-base text-slate-700">
              {pendingProfileSave
                ? (lang === 'hi'
                  ? "आपने प्रोफ़ाइल सहेजें पर क्लिक किया है। जारी रखने के लिए नीचे OTP मंगाएं और सत्यापित करें। सत्यापन होते ही सेव पूरा हो जाएगा।"
                  : "You clicked Save Profile. Request OTP and verify below to finish securely.")
                : (lang === 'hi'
                  ? "प्रोफ़ाइल अपडेट के लिए OTP मंगाकर सत्यापित करें।"
                  : "For profile updates, request OTP and verify here.")}
            </p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-blue-200 bg-white/90 px-3 py-2 text-xs md:text-sm font-semibold text-blue-800">
                {lang === 'hi' ? "चरण 1: OTP मंगाएं" : "Step 1: Request OTP"}
              </div>
              <div className="rounded-2xl border border-blue-200 bg-white/90 px-3 py-2 text-xs md:text-sm font-semibold text-blue-800">
                {lang === 'hi' ? "चरण 2: OTP दर्ज करें" : "Step 2: Enter OTP"}
              </div>
              <div className="rounded-2xl border border-blue-200 bg-white/90 px-3 py-2 text-xs md:text-sm font-semibold text-blue-800">
                {lang === 'hi' ? "चरण 3: सत्यापित करें, सेव पूरा होगा" : "Step 3: Verify to complete save"}
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-[auto_1fr_auto]">
              <button
                type="button"
                onClick={startProfileOtp}
                disabled={otpLoading}
                className="rounded-2xl border border-blue-300 bg-white px-4 py-3 text-sm md:text-base font-semibold text-blue-800 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {otpLoading
                  ? (lang === 'hi' ? "कृपया प्रतीक्षा करें..." : "Please wait...")
                  : (lang === 'hi' ? "जारी रखने के लिए OTP मंगाएं" : "Request OTP to continue")}
              </button>
              <input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={lang === 'hi' ? "सेव पूरा करने के लिए OTP दर्ज करें" : "Enter OTP to finish save"}
                disabled={!otpSent || otpLoading || otpVerified}
                className="rounded-2xl border-2 border-blue-200 px-4 py-3 text-base font-semibold tracking-widest disabled:bg-slate-100"
              />
              <button
                type="button"
                onClick={verifyProfileOtpCode}
                disabled={!otpSent || otpLoading || otpVerified}
                className="rounded-2xl bg-blue-700 px-4 py-3 text-sm md:text-base font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {lang === 'hi' ? "OTP सत्यापित करें" : "Verify OTP"}
              </button>
            </div>
            {otpMessage && <p className="text-sm font-medium text-green-700">{otpMessage}</p>}
            {otpError && <p className="text-sm font-medium text-red-700">{otpError}</p>}
          </section>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {mutation.isPending ? (lang === 'hi' ? "Saving..." : "Saving...") : lang === 'hi' ? "Save profile" : "Save profile"}
          </button>
        </div>
      </form>
    </div>
  )
}

function LabeledField({ label, value, onChange, type = 'text', disabled, placeholder }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-100"
      />
    </label>
  )
}

const hasValues = (obj = {}) => Object.values(obj || {}).some((val) => val)
const extractApiError = (err) => {
  const raw = err?.message || ''
  if (!raw) return ''
  try {
    const parsed = JSON.parse(raw)
    return parsed?.error || raw
  } catch {
    return raw
  }
}

const roleLabel = (role, lang) => {
  if (lang === 'hi') {
    switch (role) {
      case 'founder': return 'संस्थापक'
      case 'management': return 'प्रबंधन'
      case 'sadharan': return 'सामान्य सदस्य'
      default: return role || '—'
    }
  }
  switch (role) {
    case 'founder': return 'Founder'
    case 'management': return 'Management'
    case 'sadharan': return 'Sadharan'
    default: return role || '—'
  }
}

const spotlightOptionValues = (role) => {
  const values = ['none']
  if (role === 'founder') values.unshift('founder')
  if (role === 'management') values.unshift('management')
  return values
}
