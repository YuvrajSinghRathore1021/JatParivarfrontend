// frontend/src/pages/dashboard/matrimony/MatrimonyProfileForm.jsx
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SelectField from '../../../components/SelectField'
import FileDrop from '../../../components/FileDrop'
import { useGeoOptions } from '../../../hooks/useGeoOptions'
import { useLang } from '../../../lib/useLang'
import {
  fetchMyMatrimonyProfile,
  saveMatrimonyProfile,
} from '../../../lib/dashboardApi'
import { asOptions as gotraOptions } from '../../../constants/gotras'
import { upload } from '../../../lib/api'

const genders = [
  { value: 'male', labelEn: 'Male', labelHi: 'पुरुष' },
  { value: 'female', labelEn: 'Female', labelHi: 'महिला' },
  { value: 'other', labelEn: 'Other', labelHi: 'अन्य' },
]

const maritalStatuses = [
  { value: 'never_married', labelEn: 'Never married', labelHi: 'कभी विवाह नहीं किया' },
  { value: 'divorced', labelEn: 'Divorced', labelHi: 'तलाकशुदा' },
  { value: 'widowed', labelEn: 'Widowed', labelHi: 'विधवा/विधुर' },
]

const emptyForm = {
  age: '',
  gender: 'male',
  hight: '',
  maritalStatus: 'never_married',
  education: '',
  occupation: '',
  state: '',
  stateCode: '',
  district: '',
  districtCode: '',
  city: '',
  cityCode: '',
  village: '',
  gotraSelf: '',
  gotraMother: '',
  gotraNani: '',
  gotraDadi: '',
  visible: true,
  photos: [],
}

export default function MatrimonyProfileForm() {
  const { lang } = useLang()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['matrimony', 'profile'],
    queryFn: fetchMyMatrimonyProfile,
  })

  const [form, setForm] = useState(emptyForm)
  const [savedMessage, setSavedMessage] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)

  const gotraChoices = useMemo(() => gotraOptions(lang), [lang])
  const gotraChoiceValues = useMemo(() => new Set(gotraChoices.map((opt) => opt.value)), [gotraChoices])
  const gotraSelectOptions = useMemo(
    () => [
      ...gotraChoices,
      { value: '__custom', label: lang === 'hi' ? 'अन्य (स्वयं लिखें)' : 'Other (type manually)' },
    ],
    [gotraChoices, lang]
  )

  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(
    form.stateCode,
    form.districtCode,
    lang,
  )

  useEffect(() => {
    if (data) {
      setForm({
        age: data.age || '',
        gender: data.gender || 'male',
        maritalStatus: data.maritalStatus || 'never_married',
        education: data.education || '',
        occupation: data.occupation || '',
        state: data.state || '',
        hight: data.hight || '',
        stateCode: '',
        district: data.district || '',
        districtCode: '',
        city: data.city || '',
        cityCode: '',
        village: data.village || '',
        gotraSelf: data.gotra?.self || '',
        gotraMother: data.gotra?.mother || '',
        gotraNani: data.gotra?.nani || '',
        gotraDadi: data.gotra?.dadi || '',
        visible: data.visible !== undefined ? data.visible : true,
        photos: Array.isArray(data.photos) ? data.photos : [],
      })
    }
  }, [data])

  useEffect(() => {
    if (!form.stateCode && form.state && states.length) {
      const match = states.find((s) => s.name.en === form.state)
      if (match) {
        setForm((prev) => ({ ...prev, stateCode: match.code }))
      }
    }
  }, [states, form.state, form.stateCode])

  useEffect(() => {
    if (!form.districtCode && form.district && districts.length) {
      const match = districts.find((d) => d.name.en === form.district)
      if (match) {
        setForm((prev) => ({ ...prev, districtCode: match.code }))
      }
    }
  }, [districts, form.district, form.districtCode])

  useEffect(() => {
    if (!form.cityCode && form.city && cities.length) {
      const match = cities.find((c) => c.name.en === form.city)
      if (match) {
        setForm((prev) => ({ ...prev, cityCode: match.code }))
      }
    }
  }, [cities, form.city, form.cityCode])

  const mutation = useMutation({
    mutationFn: saveMatrimonyProfile,
    onSuccess: () => {
      qc.invalidateQueries(['matrimony', 'profile'])
      setSavedMessage(lang === 'hi' ? 'प्रोफ़ाइल सुरक्षित हो गई।' : 'Profile saved successfully.')
      setTimeout(() => setSavedMessage(''), 4000)
    },
  })

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    mutation.mutate({
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender,
      maritalStatus: form.maritalStatus,
      education: form.education,
      occupation: form.occupation,
      state: form.state,
      hight: form.hight,
      district: form.district,
      city: form.city,
      village: form.village,
      visible: form.visible,
      gotra: {
        self: form.gotraSelf,
        mother: form.gotraMother,
        nani: form.gotraNani,
        dadi: form.gotraDadi,
      },
      photos: form.photos,
    })
  }

  const addPhoto = async (file) => {
    if (!file) return
    if (form.photos.length >= 4) {
      setPhotoError(lang === 'hi' ? 'आप अधिकतम 4 फोटो जोड़ सकते हैं।' : 'You can upload up to 4 photos.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(lang === 'hi' ? 'कृपया 5MB से कम आकार की छवि चुनें।' : 'Please choose an image smaller than 5 MB.')
      return
    }
    try {
      setPhotoUploading(true)
      setPhotoError('')
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, photos: [...prev.photos, url] }))
    } catch (err) {
      console.error(err)
      setPhotoError(lang === 'hi' ? 'फोटो अपलोड नहीं हो सकी। कृपया पुनः प्रयास करें।' : 'Could not upload the photo. Please try again.')
    } finally {
      setPhotoUploading(false)
    }
  }

  const removePhoto = (index) => {
    setForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== index),
    }))
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          {lang === 'hi' ? 'विवाह प्रोफ़ाइल विवरण' : 'Matrimony profile details'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {lang === 'hi'
            ? 'इन जानकारियों से अन्य सदस्य आपको बेहतर समझ पाएँगे। केवल स्वीकृत रुचि पर ही फोन नंबर साझा होगा।'
            : 'Provide details so other members can get to know you. Phone numbers are shared only on accepted interests.'}
        </p>
        {savedMessage && <p className="mt-2 text-sm text-blue-600">{savedMessage}</p>}
      </header>

      {isLoading ? (
        <div className="h-48 rounded-3xl bg-slate-100 animate-pulse" aria-hidden="true" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'आयु' : 'Age'}</span>
            <input
              type="number"
              min="18"
              value={form.age}
              onChange={handleChange('age')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'लिंग' : 'Gender'}</span>
            <select value={form.gender} onChange={handleChange('gender')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2">
              {genders.map((g) => (
                <option key={g.value} value={g.value}>
                  {lang === 'hi' ? g.labelHi : g.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'लंबाई' : 'Hight'}</span>
            <input value={form.hight} onChange={handleChange('hight')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'वैवाहिक स्थिति' : 'Marital status'}</span>
            <select
              value={form.maritalStatus}
              onChange={handleChange('maritalStatus')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
            >
              {maritalStatuses.map((ms) => (
                <option key={ms.value} value={ms.value}>
                  {lang === 'hi' ? ms.labelHi : ms.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'शिक्षा' : 'Education'}</span>
            <input value={form.education} onChange={handleChange('education')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'व्यवसाय' : 'Occupation'}</span>
            <input value={form.occupation} onChange={handleChange('occupation')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <SelectField
            label={lang === 'hi' ? 'राज्य' : 'State'}
            value={form.stateCode}
            onChange={(code) => {
              const selected = states.find((item) => item.code === code)
              setForm((prev) => ({
                ...prev,
                stateCode: code,
                state: selected?.name.en || '',
                districtCode: '',
                district: '',
                cityCode: '',
                city: '',
              }))
            }}
            options={stateOptions}
            placeholder={lang === 'hi' ? 'राज्य चुनें' : 'Select state'}
          />
          <SelectField
            label={lang === 'hi' ? 'ज़िला' : 'District'}
            value={form.districtCode}
            onChange={(code) => {
              const selected = districts.find((item) => item.code === code)
              setForm((prev) => ({
                ...prev,
                districtCode: code,
                district: selected?.name.en || '',
                cityCode: '',
                city: '',
              }))
            }}
            options={districtOptions}
            placeholder={lang === 'hi' ? 'ज़िला चुनें' : 'Select district'}
            disabled={!form.stateCode}
          />
          <SelectField
            label={lang === 'hi' ? 'शहर' : 'City'}
            value={form.cityCode}
            onChange={(code) => {
              const selected = cities.find((item) => item.code === code)
              setForm((prev) => ({
                ...prev,
                cityCode: code,
                city: selected?.name.en || '',
              }))
            }}
            options={cityOptions}
            placeholder={lang === 'hi' ? 'शहर चुनें' : 'Select city'}
            disabled={!form.districtCode}
          />
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'गाँव' : 'Village'}</span>
            <input value={form.village} onChange={handleChange('village')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <div className="rounded-2xl border border-slate-200 p-4 md:col-span-2">
            <span className="text-sm font-semibold text-slate-600">{lang === 'hi' ? 'गोत्र विवरण' : 'Gotra details'}</span>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <SelectField
                  label={lang === 'hi' ? 'स्वयं का गोत्र चुनें' : 'Select self gotra'}
                  value={gotraChoiceValues.has(form.gotraSelf) ? form.gotraSelf : '__custom'}
                  onChange={(value) => {
                    if (value === '__custom') {
                      setForm((prev) => ({ ...prev, gotraSelf: '' }))
                    } else {
                      setForm((prev) => ({ ...prev, gotraSelf: value }))
                    }
                  }}
                  options={gotraSelectOptions}
                  placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Choose gotra'}
                />
                {!gotraChoiceValues.has(form.gotraSelf) && (
                  <input
                    placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                    value={form.gotraSelf}
                    onChange={handleChange('gotraSelf')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                )}
              </div>
              <div className="space-y-2">
                <SelectField
                  label={lang === 'hi' ? 'माता का गोत्र' : "Mother's gotra"}
                  value={gotraChoiceValues.has(form.gotraMother) ? form.gotraMother : '__custom'}
                  onChange={(value) => {
                    if (value === '__custom') {
                      setForm((prev) => ({ ...prev, gotraMother: '' }))
                    } else {
                      setForm((prev) => ({ ...prev, gotraMother: value }))
                    }
                  }}
                  options={gotraSelectOptions}
                  placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Choose gotra'}
                />
                {!gotraChoiceValues.has(form.gotraMother) && (
                  <input
                    placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                    value={form.gotraMother}
                    onChange={handleChange('gotraMother')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                )}
              </div>
              <div className="space-y-2">
                <SelectField
                  label={lang === 'hi' ? 'नानी का गोत्र' : 'Maternal grandmother gotra'}
                  value={gotraChoiceValues.has(form.gotraNani) ? form.gotraNani : '__custom'}
                  onChange={(value) => {
                    if (value === '__custom') {
                      setForm((prev) => ({ ...prev, gotraNani: '' }))
                    } else {
                      setForm((prev) => ({ ...prev, gotraNani: value }))
                    }
                  }}
                  options={gotraSelectOptions}
                  placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Choose gotra'}
                />
                {!gotraChoiceValues.has(form.gotraNani) && (
                  <input
                    placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                    value={form.gotraNani}
                    onChange={handleChange('gotraNani')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                )}
              </div>
              <div className="space-y-2">
                <SelectField
                  label={lang === 'hi' ? 'दादी का गोत्र' : 'Paternal grandmother gotra'}
                  value={gotraChoiceValues.has(form.gotraDadi) ? form.gotraDadi : '__custom'}
                  onChange={(value) => {
                    if (value === '__custom') {
                      setForm((prev) => ({ ...prev, gotraDadi: '' }))
                    } else {
                      setForm((prev) => ({ ...prev, gotraDadi: value }))
                    }
                  }}
                  options={gotraSelectOptions}
                  placeholder={lang === 'hi' ? 'गोत्र चुनें' : 'Choose gotra'}
                />
                {!gotraChoiceValues.has(form.gotraDadi) && (
                  <input
                    placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                    value={form.gotraDadi}
                    onChange={handleChange('gotraDadi')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                )}
              </div>
            </div>
          </div>
          <label className="flex items-center gap-3 text-sm font-medium text-slate-600 md:col-span-2">
            <input type="checkbox" checked={form.visible} onChange={handleChange('visible')} className="h-4 w-4" />
            {lang === 'hi' ? 'मेरी प्रोफ़ाइल को दूसरों के लिए दिखाएँ' : 'Show my profile to other members'}
          </label>
          <div className="md:col-span-2 space-y-4 rounded-2xl border border-slate-200 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">{lang === 'hi' ? 'फोटो अपलोड (वैकल्पिक)' : 'Profile photos (optional)'}</p>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'साफ़ सुथरी तस्वीरें विवाह रुचि बढ़ाती हैं। अधिकतम 4 फोटो जोड़ें।'
                  : 'Clear, recent photos help members connect with you. You can add up to four images.'}
              </p>
            </div>
            <FileDrop
              accept="image/*"
              onFile={addPhoto}
              hint={lang === 'hi' ? 'JPG/PNG • अधिकतम 5 MB' : 'JPG/PNG • up to 5 MB'}
              label={lang === 'hi' ? 'नई फोटो जोड़ें' : 'Add a new photo'}
            />
            {photoUploading && (
              <p className="text-xs text-slate-500">{lang === 'hi' ? 'अपलोड हो रहा है…' : 'Uploading…'}</p>
            )}
            {photoError && <p className="text-xs text-red-600">{photoError}</p>}
            {form.photos.length > 0 && (
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {form.photos.map((photo, idx) => (
                  <li key={photo} className="relative overflow-hidden rounded-2xl border border-slate-200">
                    <img src={photo} alt={`Matrimony upload ${idx + 1}`} className="h-36 w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow hover:bg-white"
                    >
                      {lang === 'hi' ? 'हटाएँ' : 'Remove'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

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
  )
}
