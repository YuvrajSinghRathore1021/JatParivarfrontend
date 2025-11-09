// frontend/src/pages/dashboard/institutions/InstitutionForm.jsx
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import SelectField from '../../../components/SelectField'
import { useGeoOptions } from '../../../hooks/useGeoOptions'
import { createInstitution } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'

const copy = {
  dharamshala: {
    titleEn: 'Add Dharamshala listing',
    titleHi: 'धर्मशाला सूची जोड़ें',
  },
  sanstha: {
    titleEn: 'Add Sanstha listing',
    titleHi: 'संस्था सूची जोड़ें',
  },
}

const emptyForm = {
  titleEn: '',
  titleHi: '',
  descriptionEn: '',
  descriptionHi: '',
  state: '',
  stateCode: '',
  district: '',
  districtCode: '',
  city: '',
  cityCode: '',
  pin: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
}

export default function InstitutionForm({ kind }) {
  const { lang } = useLang()
  const qc = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')
  const labels = copy[kind] || copy.dharamshala

  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(
    form.stateCode,
    form.districtCode,
    lang,
  )

  const mutation = useMutation({
    mutationFn: createInstitution,
    onSuccess: () => {
      qc.invalidateQueries(['institutions', kind])
      setForm(emptyForm)
      setMessage(lang === 'hi' ? 'सूची समीक्षा के लिए भेजी गई।' : 'Listing submitted for admin review.')
      setTimeout(() => setMessage(''), 4000)
    },
  })

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    mutation.mutate({
      kind,
      titleEn: form.titleEn,
      titleHi: form.titleHi,
      descriptionEn: form.descriptionEn,
      descriptionHi: form.descriptionHi,
      state: form.state,
      district: form.district,
      city: form.city,
      pin: form.pin,
      contact: {
        name: form.contactName,
        phone: form.contactPhone,
        email: form.contactEmail,
      },
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">{lang === 'hi' ? labels.titleHi : labels.titleEn}</h2>
        <p className="text-sm text-slate-600">
          {lang === 'hi'
            ? 'व्यवस्थापक द्वारा स्वीकृति मिलने के बाद आपकी सूची सार्वजनिक पृष्ठ पर प्रदर्शित होगी।'
            : 'Once approved by admins, your listing will appear on the public page.'}
        </p>
        {message && <p className="text-sm text-blue-600">{message}</p>}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'शीर्षक (English)' : 'Title (English)'}</span>
          <input value={form.titleEn} onChange={handleChange('titleEn')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</span>
          <input value={form.titleHi} onChange={handleChange('titleHi')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'विवरण (English)' : 'Description (English)'}</span>
          <textarea value={form.descriptionEn} onChange={handleChange('descriptionEn')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'विवरण (हिंदी)' : 'Description (Hindi)'}</span>
          <textarea value={form.descriptionHi} onChange={handleChange('descriptionHi')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
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
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पिन कोड' : 'PIN code'}</span>
          <input value={form.pin} onChange={handleChange('pin')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'संपर्क नाम' : 'Contact name'}</span>
          <input value={form.contactName} onChange={handleChange('contactName')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'संपर्क फोन' : 'Contact phone'}</span>
          <input value={form.contactPhone} onChange={handleChange('contactPhone')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'ईमेल' : 'Email'}</span>
          <input value={form.contactEmail} onChange={handleChange('contactEmail')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        >
          {mutation.isPending ? (lang === 'hi' ? 'भेजा जा रहा है...' : 'Submitting...') : lang === 'hi' ? 'समीक्षा हेतु भेजें' : 'Submit for review'}
        </button>
      </div>
    </form>
  )
}
