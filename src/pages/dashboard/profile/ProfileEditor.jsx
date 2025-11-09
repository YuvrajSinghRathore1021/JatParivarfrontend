// frontend/src/pages/dashboard/profile/ProfileEditor.jsx
import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchMyProfile, updateMyAvatar, updateMyPassword, updateMyProfile } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'
import { makeInitialAvatar } from '../../../lib/avatar'
import { upload } from '../../../lib/api'
import SelectField from '../../../components/SelectField'
import DateField from '../../../components/DateField'
import { useGeoOptions } from '../../../hooks/useGeoOptions'
import { asOptions as gotraOptions } from '../../../constants/gotras'

const spotlightLabels = {
  founder: { labelEn: 'Founder listing', labelHi: 'संस्थापक सूची' },
  management: { labelEn: 'Management listing', labelHi: 'प्रबंधन सूची' },
  none: { labelEn: 'Hide from public listing', labelHi: 'सार्वजनिक सूची से छुपाएँ' }
}

const emptyAddress = { line1: '', line2: '', city: '', district: '', state: '', pin: '' }
const emptyGotra = { self: '', mother: '', dadi: '', nani: '' }

export default function ProfileEditor() {
  const { lang } = useLang()
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({ queryKey: ['profile', 'me'], queryFn: fetchMyProfile })
  const gotraOptionsList = useMemo(() => gotraOptions(lang), [lang])
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
    company: '',
    publicNote: '',
    contactEmail: '',
    alternatePhone: '',
    janAadhaarUrl: '',
    dateOfBirth: '',
    address: emptyAddress,
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
  })

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [message, setMessage] = useState('')
  const [avatarMessage, setAvatarMessage] = useState('')
  const [avatarError, setAvatarError] = useState('')
  const [janUploading, setJanUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [bannerUploading, setBannerUploading] = useState(false)
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
      company: user?.company || '',
      publicNote: user?.publicNote || '',
      contactEmail: user?.contactEmail || '',
      alternatePhone: user?.alternatePhone || '',
      janAadhaarUrl: user?.janAadhaarUrl || '',
      dateOfBirth: dobValue,
      address: {
        line1: user?.address?.line1 || '',
        line2: user?.address?.line2 || '',
        city: user?.address?.city || '',
        district: user?.address?.district || '',
        state: user?.address?.state || '',
        pin: user?.address?.pin || '',
      },
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
    })
  }, [data])

  useEffect(() => {
    if (!form.address.state && (geoCodes.stateCode || geoCodes.districtCode || geoCodes.cityCode)) {
      setGeoCodes({ stateCode: '', districtCode: '', cityCode: '' })
    }
  }, [form.address.state, geoCodes.stateCode, geoCodes.districtCode, geoCodes.cityCode])

  useEffect(() => {
    if (!form.address.state || geoCodes.stateCode || !states.length) return
    const code = matchCodeByName(states, form.address.state)
    if (code) {
      setGeoCodes((prev) => ({ ...prev, stateCode: code }))
    }
  }, [form.address.state, states, geoCodes.stateCode])

  useEffect(() => {
    if (!form.address.district || geoCodes.districtCode || !districts.length) return
    const code = matchCodeByName(districts, form.address.district)
    if (code) {
      setGeoCodes((prev) => ({ ...prev, districtCode: code }))
    }
  }, [form.address.district, districts, geoCodes.districtCode])

  useEffect(() => {
    if (!form.address.city || geoCodes.cityCode || !cities.length) return
    const code = matchCodeByName(cities, form.address.city)
    if (code) {
      setGeoCodes((prev) => ({ ...prev, cityCode: code }))
    }
  }, [form.address.city, cities, geoCodes.cityCode])

  const mutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: () => {
      qc.invalidateQueries(['profile', 'me'])
      qc.invalidateQueries(['public', 'people'])
      setMessage(lang === 'hi' ? 'प्रोफ़ाइल अपडेट हो गई।' : 'Profile updated successfully.')
      setTimeout(() => setMessage(''), 4000)
    },
    onError: (err) => {
      setMessage(err.message || (lang === 'hi' ? 'अपडेट विफल रहा।' : 'Update failed.'))
    },
  })

  const avatarMutation = useMutation({
    mutationFn: updateMyAvatar,
    onSuccess: (res) => {
      const nextUrl = res?.avatarUrl || ''
      qc.invalidateQueries(['profile', 'me'])
      qc.invalidateQueries(['auth', 'me'])
      setForm((prev) => ({ ...prev, avatarUrl: nextUrl }))
      setAvatarError('')
      setAvatarMessage(lang === 'hi' ? 'प्रोफ़ाइल फोटो अपडेट हो गई।' : 'Profile photo updated.')
      setTimeout(() => setAvatarMessage(''), 4000)
    },
    onError: () => {
      setAvatarMessage('')
      setAvatarError(lang === 'hi' ? 'फोटो अपडेट नहीं हो सकी।' : 'Could not update the photo.')
    },
  })

  const passwordMutation = useMutation({
    mutationFn: updateMyPassword,
    onSuccess: () => {
      setPasswordForm({ current: '', next: '', confirm: '' })
      setMessage(lang === 'hi' ? 'पासवर्ड अपडेट हो गया।' : 'Password updated successfully.')
      setTimeout(() => setMessage(''), 4000)
    },
    onError: (err) => {
      setMessage(err.message || (lang === 'hi' ? 'पासवर्ड अपडेट विफल रहा।' : 'Password update failed.'))
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

  const updateAddressField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      address: { ...(prev.address || {}), [field]: value },
    }))
  }

  const updateGotraField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      gotra: { ...(prev.gotra || {}), [field]: value },
    }))
  }

  const onStateSelect = (code) => {
    const selected = states.find((item) => item.code === code)
    setGeoCodes({ stateCode: code, districtCode: '', cityCode: '' })
    updateAddressField('state', selected?.name?.en || '')
    updateAddressField('district', '')
    updateAddressField('city', '')
  }

  const onDistrictSelect = (code) => {
    const selected = districts.find((item) => item.code === code)
    setGeoCodes((prev) => ({ ...prev, districtCode: code, cityCode: '' }))
    updateAddressField('district', selected?.name?.en || '')
    updateAddressField('city', '')
  }

  const onCitySelect = (code) => {
    const selected = cities.find((item) => item.code === code)
    setGeoCodes((prev) => ({ ...prev, cityCode: code }))
    updateAddressField('city', selected?.name?.en || '')
  }

  const displayAvatar = useMemo(() => {
    if (form.avatarUrl) return form.avatarUrl
    const baseName = form.displayName || form.name || data?.user?.phone || 'Member'
    return makeInitialAvatar(baseName, { size: 160, radius: 48 })
  }, [form.avatarUrl, form.displayName, form.name, data?.user])

  const triggerFilePicker = () => {
    if (avatarUploading || avatarMutation.isPending) return
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
      setAvatarError(lang === 'hi' ? 'कृपया 5MB से कम आकार की छवि चुनें।' : 'Please choose an image smaller than 5 MB.')
      return
    }
    try {
      setAvatarUploading(true)
      setAvatarError('')
      setAvatarMessage('')
      const { url } = await upload('/uploads/file', file)
      avatarMutation.mutate({ avatarUrl: url })
    } catch (err) {
      console.error(err)
      setAvatarError(lang === 'hi' ? 'अपलोड विफल रहा, कृपया पुनः प्रयास करें।' : 'Upload failed, please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }

  const onJanSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setMessage(lang === 'hi' ? 'कृपया 10MB से कम का दस्तावेज़ चुनें।' : 'Please choose a document smaller than 10 MB.')
      return
    }
    try {
      setJanUploading(true)
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, janAadhaarUrl: url }))
    } catch (err) {
      setMessage(err.message || (lang === 'hi' ? 'अपलोड विफल रहा।' : 'Upload failed.'))
    } finally {
      setJanUploading(false)
    }
  }

  const onBannerSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMessage(lang === 'hi' ? 'कृपया 5MB से कम का बैनर चुनें।' : 'Please choose a banner smaller than 5 MB.')
      return
    }
    try {
      setBannerUploading(true)
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, spotlightBannerUrl: url }))
      setMessage(lang === 'hi' ? 'बैनर अपलोड हो गया।' : 'Banner uploaded.')
    } catch (err) {
      setMessage(err.message || (lang === 'hi' ? 'बैनर अपलोड विफल रहा।' : 'Banner upload failed.'))
    } finally {
      setBannerUploading(false)
    }
  }

  const removeAvatar = () => {
    avatarMutation.mutate({ avatarUrl: '' })
  }

  const removeBanner = () => {
    setForm((prev) => ({ ...prev, spotlightBannerUrl: '' }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const payload = {
      name: form.name,
      displayName: form.displayName,
      occupation: form.occupation,
      company: form.company,
      publicNote: form.publicNote,
      contactEmail: form.contactEmail,
      alternatePhone: form.alternatePhone,
      janAadhaarUrl: form.janAadhaarUrl,
      dateOfBirth: form.dateOfBirth || undefined,
      address: hasValues(form.address) ? form.address : undefined,
      gotra: hasValues(form.gotra) ? form.gotra : undefined,
      spotlightRole: form.spotlightRole === 'none' ? 'none' : form.spotlightRole,
      spotlightTitle: form.spotlightTitle,
      spotlightPlace: form.spotlightPlace,
      spotlightBioEn: form.spotlightBioEn,
      spotlightBioHi: form.spotlightBioHi,
      spotlightBannerUrl: form.spotlightBannerUrl,
      spotlightVisible: form.spotlightVisible,
    }
    mutation.mutate(payload)
  }

  const submitPassword = (event) => {
    event.preventDefault()
    if (!passwordForm.current || !passwordForm.next) {
      setMessage(lang === 'hi' ? 'कृपया वर्तमान और नया पासवर्ड दर्ज करें।' : 'Please fill current and new password.')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setMessage(lang === 'hi' ? 'नया पासवर्ड मेल नहीं खाता।' : 'New password does not match confirmation.')
      return
    }
    passwordMutation.mutate({ currentPassword: passwordForm.current, newPassword: passwordForm.next })
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-900">
            {lang === 'hi' ? 'मेरी प्रोफ़ाइल' : 'My profile'}
          </h2>
          <p className="text-sm text-slate-600">
            {lang === 'hi'
              ? 'यहाँ अपडेट की गई जानकारी सार्वजनिक वेबसाइट और डैशबोर्ड दोनों में प्रदर्शित होगी।'
              : 'Details you update here appear on the public site and dashboard where relevant.'}
          </p>
          {message && <p className="text-sm text-blue-600">{message}</p>}
        </header>

        <section className="flex flex-col items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center md:flex-row md:items-center md:gap-6 md:text-left">
          <img src={displayAvatar} alt={form.displayName || form.name || 'Member avatar'} className="h-28 w-28 rounded-3xl object-cover" />
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-700">{lang === 'hi' ? 'प्रोफ़ाइल फोटो' : 'Profile photo'}</p>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'स्पष्ट चेहरा अपलोड करें ताकि सदस्य आपको पहचान सकें। नई फोटो अपलोड करने पर पुरानी फोटो हट जाएगी।'
                  : 'Upload a clear headshot so members can recognise you. The previous photo is removed automatically when you upload a new one.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={avatarUploading || avatarMutation.isPending}
                className="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {avatarUploading || avatarMutation.isPending
                  ? lang === 'hi'
                    ? 'अपलोड हो रहा है…'
                    : 'Uploading…'
                  : lang === 'hi'
                    ? 'फोटो बदलें'
                    : 'Change photo'}
              </button>
              {form.avatarUrl && (
                <button
                  type="button"
                  onClick={removeAvatar}
                  disabled={avatarMutation.isPending}
                  className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {lang === 'hi' ? 'फोटो हटाएँ' : 'Remove photo'}
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
            <LabeledField label={lang === 'hi' ? 'पूरा नाम' : 'Full name'} value={form.name} onChange={handleChange('name')} />
            <LabeledField label={lang === 'hi' ? 'प्रदर्शित नाम' : 'Display name'} value={form.displayName} onChange={handleChange('displayName')} />
            <LabeledField label={lang === 'hi' ? 'मोबाइल नंबर' : 'Primary phone'} value={form.phone} disabled />
            <LabeledField label={lang === 'hi' ? 'भूमिका' : 'Membership role'} value={roleLabel(form.role, lang)} disabled />
            <LabeledField label={lang === 'hi' ? 'व्यवसाय' : 'Occupation'} value={form.occupation} onChange={handleChange('occupation')} />
            <LabeledField label={lang === 'hi' ? 'संस्था/कंपनी' : 'Organisation'} value={form.company} onChange={handleChange('company')} />
            <LabeledField label={lang === 'hi' ? 'ईमेल' : 'Email'} value={form.contactEmail} onChange={handleChange('contactEmail')} />
            <LabeledField label={lang === 'hi' ? 'दूसरा फोन' : 'Alternate phone'} value={form.alternatePhone} onChange={handleChange('alternatePhone')} />
            <div>
              <DateField
                lang={lang}
                label={lang === 'hi' ? 'जन्मतिथि' : 'Date of birth'}
                value={form.dateOfBirth}
                onChange={(value) => setForm((prev) => ({ ...prev, dateOfBirth: value }))}
                minYear={1920}
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-slate-600">
            {lang === 'hi' ? 'सार्वजनिक नोट' : 'Public note'}
          </label>
          <textarea
            value={form.publicNote}
            onChange={handleChange('publicNote')}
            rows={3}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
          />
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <LabeledField label={lang === 'hi' ? 'पता पंक्ति 1' : 'Address line 1'} value={form.address.line1} onChange={(e) => updateAddressField('line1', e.target.value)} />
          <LabeledField label={lang === 'hi' ? 'पता पंक्ति 2' : 'Address line 2'} value={form.address.line2} onChange={(e) => updateAddressField('line2', e.target.value)} />
          <SelectField
            label={lang === 'hi' ? 'राज्य' : 'State'}
            value={geoCodes.stateCode}
            onChange={onStateSelect}
            options={stateOptions}
            placeholder={lang === 'hi' ? 'राज्य चुनें' : 'Select state'}
          />
          <SelectField
            label={lang === 'hi' ? 'ज़िला' : 'District'}
            value={geoCodes.districtCode}
            onChange={onDistrictSelect}
            options={districtOptions}
            placeholder={lang === 'hi' ? 'ज़िला चुनें' : 'Select district'}
            disabled={!geoCodes.stateCode}
          />
          <SelectField
            label={lang === 'hi' ? 'शहर' : 'City'}
            value={geoCodes.cityCode}
            onChange={onCitySelect}
            options={cityOptions}
            placeholder={lang === 'hi' ? 'शहर चुनें' : 'Select city'}
            disabled={!geoCodes.districtCode}
          />
          <LabeledField label={lang === 'hi' ? 'पिनकोड' : 'PIN'} value={form.address.pin} onChange={(e) => updateAddressField('pin', e.target.value)} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <SelectField
            label={lang === 'hi' ? 'गोत्र (स्व)' : 'Gotra (Self)'}
            value={form.gotra.self}
            onChange={(value) => updateGotraField('self', value)}
            options={gotraOptionsList}
            placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Select gotra'}
          />
          <SelectField
            label={lang === 'hi' ? 'गोत्र (माता)' : 'Gotra (Mother)'}
            value={form.gotra.mother}
            onChange={(value) => updateGotraField('mother', value)}
            options={gotraOptionsList}
            placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Select gotra'}
          />
          <SelectField
            label={lang === 'hi' ? 'गोत्र (दादी)' : 'Gotra (Dadi)'}
            value={form.gotra.dadi}
            onChange={(value) => updateGotraField('dadi', value)}
            options={gotraOptionsList}
            placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Select gotra'}
          />
          <SelectField
            label={lang === 'hi' ? 'गोत्र (नानी)' : 'Gotra (Nani)'}
            value={form.gotra.nani}
            onChange={(value) => updateGotraField('nani', value)}
            options={gotraOptionsList}
            placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Select gotra'}
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                {lang === 'hi' ? 'जन आधार दस्तावेज़' : 'Jan Aadhaar document'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'hi' ? 'PDF या फोटो • अधिकतम 10 MB' : 'PDF or image • up to 10 MB'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={triggerJanPicker}
                disabled={janUploading}
                className="rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-slate-400 disabled:opacity-60"
              >
                {janUploading ? (lang === 'hi' ? 'अपलोड हो रहा है…' : 'Uploading…') : (lang === 'hi' ? 'दस्तावेज़ अपलोड करें' : 'Upload document')}
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
            {lang === 'hi' ? 'मुख्य सदस्य प्रदर्शित' : 'Spotlight listing'}
          </h3>
          <p className="text-xs text-slate-500">
            {lang === 'hi'
              ? 'यदि आप सार्वजनिक संस्थापक या प्रबंधन सूची में दिखना चाहते हैं तो नीचे विवरण भरें।'
              : 'Provide details if you wish to appear on the public founder or management pages.'}
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm text-slate-600">
              <span>{lang === 'hi' ? 'सूची में उपस्थिति' : 'Listing visibility'}</span>
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
              <span>{lang === 'hi' ? 'सार्वजनिक सूची में दिखाएँ' : 'Show on public listing'}</span>
            </label>
            <label className="text-sm text-slate-600">
              <span>{lang === 'hi' ? 'पदनाम' : 'Title/designation'}</span>
              <input value={form.spotlightTitle} onChange={handleChange('spotlightTitle')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600">
              <span>{lang === 'hi' ? 'मुख्य क्षेत्र' : 'Focus region'}</span>
              <input value={form.spotlightPlace} onChange={handleChange('spotlightPlace')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <div className="md:col-span-2 rounded-2xl border border-dashed border-slate-300 p-4 space-y-3 bg-white/50">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {lang === 'hi' ? 'संगठन बैनर (वैकल्पिक)' : 'Organisation banner (optional)'}
                </p>
                <p className="text-xs text-slate-500">
                  {lang === 'hi'
                    ? 'लंबवत छवि • अनुशंसित 600×1200px • अधिकतम 5 MB'
                    : 'Vertical image • recommended 600×1200px • up to 5 MB'}
                </p>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 h-48 grid place-items-center">
                {form.spotlightBannerUrl ? (
                  <img
                    src={form.spotlightBannerUrl}
                    alt="Organisation banner"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <p className="text-xs text-slate-500 text-center px-6">
                    {lang === 'hi'
                      ? 'अपना संगठन / संस्था दर्शाने वाला बैनर अपलोड करें।'
                      : 'Upload a banner that represents your organisation or initiative.'}
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
                    ? lang === 'hi'
                      ? 'अपलोड हो रहा है…'
                      : 'Uploading…'
                    : lang === 'hi'
                      ? 'बैनर अपलोड करें'
                      : 'Upload banner'}
                </button>
                {form.spotlightBannerUrl && (
                  <button
                    type="button"
                    onClick={removeBanner}
                    className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400"
                  >
                    {lang === 'hi' ? 'बैनर हटाएँ' : 'Remove banner'}
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
              <span>{lang === 'hi' ? 'संक्षिप्त विवरण (English)' : 'Brief bio (English)'}</span>
              <textarea value={form.spotlightBioEn} onChange={handleChange('spotlightBioEn')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
            <label className="text-sm text-slate-600 md:col-span-2">
              <span>{lang === 'hi' ? 'संक्षिप्त विवरण (हिंदी)' : 'Brief bio (Hindi)'}</span>
              <textarea value={form.spotlightBioHi} onChange={handleChange('spotlightBioHi')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
            </label>
          </div>
        </section>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="text-sm font-semibold text-slate-600">{lang === 'hi' ? 'रेफरल कोड' : 'Referral code'}</h3>
          <div className="mt-2 flex items-center gap-2">
            <code className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 border border-slate-200">
              {form.referralCode || '—'}
            </code>
            <p className="text-xs text-slate-500">
              {lang === 'hi'
                ? 'इस कोड को साझा करें ताकि संदर्भ आपके नाम से दर्ज हो।'
                : 'Share this code so new members can list you as their referrer.'}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
          >
            {mutation.isPending ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') : lang === 'hi' ? 'प्रोफ़ाइल सहेजें' : 'Save profile'}
          </button>
        </div>
      </form>

      <form
        onSubmit={submitPassword}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h3 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? 'पासवर्ड बदलें' : 'Change password'}</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <LabeledField
            label={lang === 'hi' ? 'वर्तमान पासवर्ड' : 'Current password'}
            type="password"
            value={passwordForm.current}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, current: e.target.value }))}
          />
          <LabeledField
            label={lang === 'hi' ? 'नया पासवर्ड' : 'New password'}
            type="password"
            value={passwordForm.next}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, next: e.target.value }))}
          />
          <LabeledField
            label={lang === 'hi' ? 'नया पासवर्ड (पुनः)' : 'Confirm new password'}
            type="password"
            value={passwordForm.confirm}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirm: e.target.value }))}
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={passwordMutation.isPending}
            className="rounded-2xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {passwordMutation.isPending ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') : lang === 'hi' ? 'पासवर्ड अपडेट करें' : 'Update password'}
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

const roleLabel = (role, lang) => {
  if (lang === 'hi') {
    switch (role) {
      case 'founder': return 'संस्थापक'
      case 'member': return 'प्रबंधन'
      case 'sadharan': return 'साधारण सदस्य'
      case 'admin': return 'प्रशासक'
      default: return role || '—'
    }
  }
  switch (role) {
    case 'founder': return 'Founder'
    case 'member': return 'Management'
    case 'sadharan': return 'Sadharan'
    case 'admin': return 'Admin'
    default: return role || '—'
  }
}

const spotlightOptionValues = (role) => {
  const values = ['none']
  if (role === 'founder') values.unshift('founder')
  if (role === 'member') values.unshift('management')
  return values
}
