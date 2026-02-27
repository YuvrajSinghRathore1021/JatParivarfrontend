import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import SelectField from '../../components/SelectField'
import FileDrop from '../../components/FileDrop'
import { saveMatrimony } from '../../lib/dashboardApi'
import { upload } from '../../lib/api'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import AddressBlock from '../../components/AddressBlock.jsx'
import { useGotraOptions } from '../../hooks/useGotraOptions'
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
} from '../../constants/profileOptions'

let API_File = import.meta.env.VITE_API_File

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
  name: '',
  height: '',
  userId: '',
  maritalStatus: 'never_married',
  education: '',
  department: '',
  designation: '',
  occupation: '',
  gotraSelf: '',
  gotraMother: '',
  gotraNani: '',
  gotraDadi: '',
  visible: true,
  photos: [],
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
}

export default function MatrimonyDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const lang = 'en'
  const qc = useQueryClient()

  const key = useMemo(() => ['admin', 'matrimony', 'profile', id], [id])
  const { data, isLoading } = useAdminQuery(
    key,
    () => `/matrimony/profiles?id=${id}`,
    { enabled: id !== 'save' }
  )

  const [form, setForm] = useState(emptyForm)
  const [savedMessage, setSavedMessage] = useState('')
  const [photoError, setPhotoError] = useState('')
  const [photoUploading, setPhotoUploading] = useState(false)
  const [sameAsOccupation, setSameAsOccupation] = useState(false)
  const [sameAsCurrent, setSameAsCurrent] = useState(false)

  const { gotraOptions: gotraSelectOptions, gotraValueSet: gotraChoiceValues } = useGotraOptions(lang)

  useEffect(() => {
    if (id === 'save') {
      setForm(emptyForm)
      return
    }
    if (!data) return
    setForm({
      age: data?.age || '',
      name: data?.name || '',
      gender: data?.gender || 'male',
      maritalStatus: data?.maritalStatus || 'never_married',
      education: data?.education || '',
      occupation: data?.occupation || '',
      department: data?.department || '',
      designation: data?.designation || '',
      userId: data?.userId || '',
      height: data?.height || '',
      occupationAddress: data?.occupationAddress || {},
      currentAddress: data?.currentAddress || {},
      parentalAddress: data?.parentalAddress || {},
      gotraSelf: data?.gotra?.self || '',
      gotraMother: data?.gotra?.mother || '',
      gotraNani: data?.gotra?.nani || '',
      gotraDadi: data?.gotra?.dadi || '',
      visible: data?.visible !== undefined ? data?.visible : true,
      photos: Array.isArray(data?.photos) ? data?.photos : [],
    })
  }, [data, id])

  const mutation = useMutation({
    mutationFn: saveMatrimony,
    onSuccess: () => {
      qc.invalidateQueries(['matrimony', 'profile'])
      setSavedMessage(lang === 'hi' ? 'प्रोफ़ाइल सुरक्षित हो गई।' : 'Profile saved successfully.')
      setTimeout(() => {
        setSavedMessage('')
        navigate('/admin/matrimony')
      }, 800)
    },
  })

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const occupationCategory = getOccupationCategory(form.occupation)
  const occupationSpecialization = getOccupationSpecialization(form.occupation)
  const educationCategory = getEducationCategory(form.education)
  const graduateSpecialization = getGraduateSpecialization(form.education)
  const postgraduateCustomText = getPostgraduateCustomText(form.education)

  const onSubmit = (event) => {
    event.preventDefault()
    if (occupationCategory === 'professional_services' && !occupationSpecialization) {
      setSavedMessage('Please select a professional service specialization.')
      return
    }
    if (educationCategory === 'graduate' && !graduateSpecialization) {
      setSavedMessage('Please select graduate specialization.')
      return
    }
    if (educationCategory === 'postgraduate' && !String(postgraduateCustomText || '').trim()) {
      setSavedMessage('Please enter postgraduate qualification.')
      return
    }

    mutation.mutate({
      id,
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender,
      name: form.name,
      maritalStatus: form.maritalStatus,
      education: form.education,
      designation: form.designation,
      department: form.department,
      occupation: form.occupation,
      height: form.height,
      occupationAddress: form.occupationAddress || {},
      currentAddress: form.currentAddress || {},
      parentalAddress: form.parentalAddress || {},
      visible: form.visible,
      gotra: {
        self: form.gotraSelf,
        mother: form.gotraMother,
        nani: form.gotraNani,
        dadi: form.gotraDadi,
      },
      photos: form.photos,
      userId: form.userId?.trim() || undefined,
    })
  }

  const addPhoto = async (file) => {
    if (!file) return
    if (form.photos.length >= 4) {
      setPhotoError(lang === 'hi' ? 'आप अधिकतम 4 फ़ोटो जोड़ सकते हैं।' : 'You can upload up to 4 photos.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError(lang === 'hi' ? 'कृपया 1MB से कम आकार की छवि चुनें।' : 'Please choose an image smaller than 1 MB.')
      return
    }
    try {
      setPhotoUploading(true)
      setPhotoError('')
      const { url } = await upload('/uploads/file', file)
      setForm((prev) => ({ ...prev, photos: [...prev.photos, url] }))
    } catch {
      setPhotoError(lang === 'hi' ? 'फ़ोटो अपलोड नहीं हो सकी। कृपया पुनः प्रयास करें।' : 'Could not upload the photo. Please try again.')
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

  useEffect(() => {
    if (sameAsOccupation) {
      setForm((prev) => ({
        ...prev,
        currentAddress: { ...prev.occupationAddress }
      }))
    }
  }, [sameAsOccupation, form.occupationAddress])

  useEffect(() => {
    if (sameAsCurrent) {
      setForm((prev) => ({
        ...prev,
        parentalAddress: { ...prev.currentAddress }
      }))
    }
  }, [sameAsCurrent, form.currentAddress])

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header>
        <h2 className="text-xl font-semibold text-slate-900">
          {lang === 'hi' ? 'विवाह प्रोफ़ाइल विवरण' : 'Matrimony profile details'}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {lang === 'hi'
            ? 'इन जानकारियों से अन्य सदस्य आपको बेहतर समझ पाएंगे। केवल स्वीकृत रुचि पर ही फ़ोन नंबर साझा होगा।'
            : 'Provide details so other members can get to know you. Phone numbers are shared only on accepted interests.'}
        </p>
        {savedMessage && <p className="mt-2 text-sm text-blue-600">{savedMessage}</p>}
      </header>

      {isLoading ? (
        <div className="h-48 rounded-3xl bg-slate-100 animate-pulse" aria-hidden="true" />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'नाम' : 'Name'}</span>
            <input
              type="text"
              value={form.name}
              onChange={handleChange('name')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'यूज़र आईडी (वैकल्पिक)' : 'Linked user ID (optional)'}</span>
            <input
              type="text"
              value={form.userId}
              onChange={handleChange('userId')}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
              placeholder={lang === 'hi' ? 'उपयोगकर्ता को लिंक करने के लिए आईडी भरें' : 'Attach an existing user to this profile'}
            />
          </label>
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
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'लंबाई' : 'Height'}</span>
            <input value={form.height} onChange={handleChange('height')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
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

          <SelectField
            label={lang === 'hi' ? 'Education' : 'Education'}
            value={educationCategory}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                education: composeEducationValue({
                  category: value,
                  graduateSpecialization,
                  postgraduateCustomText,
                })
              }))
            }
            options={EDUCATION_CATEGORY_OPTIONS[lang] || EDUCATION_CATEGORY_OPTIONS.en}
            placeholder={lang === 'hi' ? 'Select Education' : 'Select Education'}
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
                    postgraduateCustomText,
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
                      postgraduateCustomText: e.target.value,
                    })
                  }))
                }
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
                placeholder={lang === 'hi' ? 'Type your qualification' : 'Type your qualification'}
              />
            </label>
          )}

          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'डिपार्टमेंट' : 'Department'}</span>
            <input value={form.department} onChange={handleChange('department')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पद का नाम' : 'Designation'}</span>
            <input value={form.designation} onChange={handleChange('designation')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
          </label>

          <SelectField
            label={lang === 'hi' ? 'Occupation' : 'Occupation'}
            value={occupationCategory}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                occupation: composeOccupationValue({
                  category: value,
                  specialization: occupationSpecialization,
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
                    specialization: value,
                  })
                }))
              }
              options={PROFESSIONAL_SERVICE_OPTIONS[lang] || PROFESSIONAL_SERVICE_OPTIONS.en}
              placeholder={lang === 'hi' ? 'Select specialization' : 'Select specialization'}
            />
          )}

          <AddressBlock
            title={lang === 'hi' ? 'व्यवसाय का पता' : 'Occupation Address'}
            formKey="occupationAddress"
            form={form}
            setForm={setForm}
            {...{ lang }}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
            <input
              type="checkbox"
              checked={sameAsOccupation}
              onChange={(e) => setSameAsOccupation(e.target.checked)}
              className="h-4 w-4"
            />
            {lang === 'hi'
              ? 'वर्तमान पता व्यवसाय के पते जैसा ही है'
              : 'Current address is same as occupation address'}
          </label>

          <AddressBlock
            title={lang === 'hi' ? 'वर्तमान पता' : 'Current Address'}
            formKey="currentAddress"
            form={form}
            setForm={setForm}
            {...{ lang }}
          />
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
              {...{ lang }}
            />
          )}

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
              <p className="text-sm font-semibold text-slate-700">{lang === 'hi' ? 'फ़ोटो अपलोड (वैकल्पिक)' : 'Profile photos (optional)'}</p>
              <p className="text-xs text-slate-500">
                {lang === 'hi'
                  ? 'साफ़ सुथरी तस्वीरें विवाह रुचि बढ़ाती हैं। अधिकतम 4 फ़ोटो जोड़ें।'
                  : 'Clear, recent photos help members connect with you. You can add up to four images.'}
              </p>
            </div>
            <FileDrop
              accept="image/*"
              onFile={addPhoto}
              hint={lang === 'hi' ? 'JPG/PNG • अधिकतम 1 MB' : 'JPG/PNG • up to 1 MB'}
              label={lang === 'hi' ? 'नई फ़ोटो जोड़ें' : 'Add a new photo'}
            />
            {photoUploading && (
              <p className="text-xs text-slate-500">{lang === 'hi' ? 'अपलोड हो रहा है…' : 'Uploading…'}</p>
            )}
            {photoError && <p className="text-xs text-red-600">{photoError}</p>}
            {form.photos.length > 0 && (
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {form.photos.map((photo, idx) => (
                  <li key={photo} className="relative overflow-hidden rounded-2xl border border-slate-200">
                    <img src={API_File + photo} alt={`Matrimony upload ${idx + 1}`} className="h-36 w-full object-cover" />
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
