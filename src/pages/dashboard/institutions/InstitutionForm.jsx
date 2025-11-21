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
  contactpersons: []
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
      contactpersons: form.contactpersons
    })
  }
  const addContact = () => {
    setForm(prev => ({
      ...prev,
      contactpersons: [
        ...prev.contactpersons,
        { name: "", email: "", phone: "", post: "" }
      ]
    }))
  }

  const updateContact = (index, field, value) => {
    setForm(prev => {
      const list = [...prev.contactpersons]
      list[index][field] = value
      return { ...prev, contactpersons: list }
    })
  }

  const removeContact = (index) => {
    setForm(prev => ({
      ...prev,
      contactpersons: prev.contactpersons.filter((_, i) => i !== index)
    }))
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
        {/* ===========================
    CONTACTS SECTION
   =========================== */}
        <div className="border p-4 rounded-xl space-y-3 bg-slate-50">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Contact Persons</p>

            <button
              type="button"
              onClick={addContact}
              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-lg"
            >
              Add Contact
            </button>
          </div>

          {form?.contactpersons?.length === 0 && (
            <p className="text-xs text-slate-500">No contactpersons added yet.</p>
          )}

          {form.contactpersons.map((c, index) => (
            <div
              key={index}
              className="grid md:grid-cols-4 gap-3 p-4 border rounded-lg bg-white relative"
            >
              <button
                type="button"
                onClick={() => removeContact(index)}
                className="absolute right-3 top-3 text-red-600 text-xs"
              >
                Remove
              </button>

              <div>
                <label className="text-xs text-slate-600">Name</label>
                <input
                  value={c.name}
                  onChange={(e) => updateContact(index, "name", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Email</label>
                <input
                  value={c.email}
                  onChange={(e) => updateContact(index, "email", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Phone</label>
                <input
                  value={c.phone}
                  onChange={(e) => updateContact(index, "phone", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600">Post / Role</label>
                <input
                  value={c.post}
                  onChange={(e) => updateContact(index, "post", e.target.value)}
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
          ))}
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
