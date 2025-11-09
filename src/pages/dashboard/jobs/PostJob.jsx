// frontend/src/pages/dashboard/jobs/PostJob.jsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import SelectField from '../../../components/SelectField'
import { useGeoOptions } from '../../../hooks/useGeoOptions'
import { createJobPost } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'

const jobTypes = [
  { value: 'full_time', labelEn: 'Full time', labelHi: 'पूर्णकालिक' },
  { value: 'part_time', labelEn: 'Part time', labelHi: 'अंशकालिक' },
  { value: 'contract', labelEn: 'Contract', labelHi: 'कॉन्ट्रैक्ट' },
  { value: 'internship', labelEn: 'Internship', labelHi: 'इंटर्नशिप' },
]

const emptyForm = {
  title: '',
  description: '',
  locationState: '',
  locationStateCode: '',
  locationDistrict: '',
  locationDistrictCode: '',
  locationCity: '',
  locationCityCode: '',
  type: 'full_time',
  salaryRange: '',
  contactPhone: '',
}

export default function PostJob() {
  const { lang } = useLang()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(
    form.locationStateCode,
    form.locationDistrictCode,
    lang,
  )

  const mutation = useMutation({
    mutationFn: createJobPost,
    onSuccess: () => {
      setForm(emptyForm)
      setMessage(lang === 'hi' ? 'नौकरी पोस्टिंग समीक्षा के लिए भेज दी गई है।' : 'Job posting submitted for admin review.')
      setTimeout(() => setMessage(''), 4000)
    },
  })

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const onSubmit = (event) => {
    event.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      locationState: form.locationState,
      locationDistrict: form.locationDistrict,
      locationCity: form.locationCity,
      type: form.type,
      salaryRange: form.salaryRange,
      contactPhone: form.contactPhone,
    }
    mutation.mutate(payload)
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-slate-900">
          {lang === 'hi' ? 'नौकरी पोस्ट करें' : 'Post a job opening'}
        </h2>
        <p className="text-sm text-slate-600">
          {lang === 'hi'
            ? 'प्रकाशन से पहले हर नौकरी पोस्टिंग पर व्यवस्थापक की स्वीकृति आवश्यक है। सही विवरण देने से अनुमोदन जल्दी होगा।'
            : 'Every posting requires admin approval before going live. Provide accurate details for quicker approval.'}
        </p>
        {message && <p className="text-sm text-blue-600">{message}</p>}
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'पद का नाम' : 'Role title'}</span>
          <input value={form.title} onChange={handleChange('title')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'नौकरी प्रकार' : 'Job type'}</span>
          <select value={form.type} onChange={handleChange('type')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2">
            {jobTypes.map((jt) => (
              <option key={jt.value} value={jt.value}>
                {lang === 'hi' ? jt.labelHi : jt.labelEn}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm md:col-span-2">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'विवरण' : 'Description'}</span>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            rows={4}
            className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2"
            required
          />
        </label>
        <SelectField
          label={lang === 'hi' ? 'राज्य' : 'State'}
          value={form.locationStateCode}
          onChange={(code) => {
            const selected = states.find((item) => item.code === code)
            setForm((prev) => ({
              ...prev,
              locationStateCode: code,
              locationState: selected?.name.en || '',
              locationDistrictCode: '',
              locationDistrict: '',
              locationCityCode: '',
              locationCity: '',
            }))
          }}
          options={stateOptions}
          placeholder={lang === 'hi' ? 'राज्य चुनें' : 'Select state'}
        />
        <SelectField
          label={lang === 'hi' ? 'ज़िला' : 'District'}
          value={form.locationDistrictCode}
          onChange={(code) => {
            const selected = districts.find((item) => item.code === code)
            setForm((prev) => ({
              ...prev,
              locationDistrictCode: code,
              locationDistrict: selected?.name.en || '',
              locationCityCode: '',
              locationCity: '',
            }))
          }}
          options={districtOptions}
          placeholder={lang === 'hi' ? 'ज़िला चुनें' : 'Select district'}
          disabled={!form.locationStateCode}
        />
        <SelectField
          label={lang === 'hi' ? 'शहर' : 'City'}
          value={form.locationCityCode}
          onChange={(code) => {
            const selected = cities.find((item) => item.code === code)
            setForm((prev) => ({
              ...prev,
              locationCityCode: code,
              locationCity: selected?.name.en || '',
            }))
          }}
          options={cityOptions}
          placeholder={lang === 'hi' ? 'शहर चुनें' : 'Select city'}
          disabled={!form.locationDistrictCode}
        />
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'वेतन सीमा' : 'Salary range'}</span>
          <input value={form.salaryRange} onChange={handleChange('salaryRange')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
        </label>
        <label className="block text-sm">
          <span className="font-semibold text-slate-600">{lang === 'hi' ? 'संपर्क फोन' : 'Contact phone'}</span>
          <input value={form.contactPhone} onChange={handleChange('contactPhone')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
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
