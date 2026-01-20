// frontend/src/pages/dashboard/jobs/ManageJobs.jsx
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SelectField from '../../../components/SelectField'
import AddressBlock from '../../../components/AddressBlock.jsx'

import { useGeoOptions } from '../../../hooks/useGeoOptions'
import {
  fetchMyJobs,
  updateJobPost,
  fetchJobApplicants,
} from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'

const jobTypes = [
  { value: 'full_time', labelEn: 'Full time', labelHi: 'पूर्णकालिक' },
  { value: 'part_time', labelEn: 'Part time', labelHi: 'अंशकालिक' },
  { value: 'contract', labelEn: 'Contract', labelHi: 'कॉन्ट्रैक्ट' },
  { value: 'internship', labelEn: 'Internship', labelHi: 'इंटर्नशिप' },
]

export default function ManageJobs() {
  const { lang } = useLang()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['jobs', 'mine'], queryFn: fetchMyJobs })
  const [editingId, setEditingId] = useState(null)
  const [editingForm, setEditingForm] = useState(null)
  const [openApplicantsId, setOpenApplicantsId] = useState(null)
  const applicantsQuery = useQuery({
    queryKey: ['jobs', 'applicants', openApplicantsId],
    queryFn: () => fetchJobApplicants(openApplicantsId),
    enabled: Boolean(openApplicantsId),
  })

  const {
    states,
    districts,
    cities,
    stateOptions,
    districtOptions,
    cityOptions,
  } = useGeoOptions(editingForm?.address?.stateCode || '',
    editingForm?.address?.districtCode || '',
    lang)

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateJobPost(id, payload),
    onSuccess: () => {
      qc.invalidateQueries(['jobs', 'mine'])
      setEditingId(null)
      setEditingForm(null)
    },
  })

  

  const closeEditor = () => {
    setEditingId(null)
    setEditingForm(null)
    updateMutation.reset()
  }

  const onSubmit = (jobId, event) => {
    event.preventDefault()
    if (!editingForm) return
    const payload = {
      title: editingForm.title,
      description: editingForm.description,
      locationState: editingForm.address?.state,
      locationStateCode: editingForm.address?.stateCode,
      locationDistrict: editingForm.address?.district,
      locationDistrictCode: editingForm.address?.districtCode,
      locationCity: editingForm.address?.city,
      locationCityCode: editingForm.address?.cityCode,
      locationVillage: editingForm.address?.village,
      type: editingForm.type,
      salaryRange: editingForm.salaryRange,
      contactPhone: editingForm.contactPhone,
    }

    updateMutation.mutate({ id: jobId, payload })
  }

  const startEditing = (job) => {
    updateMutation.reset()
    setEditingId(job.id)
    setEditingForm({
      title: job.title || '',
      description: job.description || '',
      type: job.type || 'full_time',
      salaryRange: job.salaryRange || '',
      contactPhone: job.contactPhone || '',
      address: {
        state: job.locationState || '',
        stateCode: job.locationStateCode || '',
        district: job.locationDistrict || '',
        districtCode: job.locationDistrictCode || '',
        city: job.locationCity || '',
        cityCode: job.locationCityCode || '',
        village: job.locationVillage || '',
      },
    })

  }

  const handleEditingField = (field) => (event) => {
    const value = event.target.value
    setEditingForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const jobs = data || []

 const locationLabel = (job) => {
  const parts = [
    job.locationVillage,
    job.locationCity,
    job.locationDistrict,
    job.locationState,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}


  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">
          {lang === 'hi' ? 'मेरी नौकरी पोस्टिंग' : 'My job postings'}
        </h2>
        <p className="text-sm text-slate-600">
          {lang === 'hi'
            ? 'हर पोस्टिंग की स्वीकृति स्थिति और आवेदकों को यहाँ देखें। स्वीकृति मिलने पर यह सार्वजनिक सूची में दिखेगी।'
            : 'Track approval status and applicants for each posting. Approved jobs appear in the community board.'}
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-40 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {lang === 'hi' ? 'आपने अभी तक कोई नौकरी पोस्ट नहीं की है।' : 'You have not posted any jobs yet.'}
        </div>
      ) : (
        <div className="space-y-5">
          {jobs.map((job) => {
            const isEditing = editingId === job.id
            const isOpenApplicants = openApplicantsId === job.id
            const locationText = locationLabel(job)
            return (
              <article key={job.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 break-all line-clamp-1">{job.title}</h3>
                    {/* <p className="text-sm text-slate-500 break-all">{job.description}</p> */}
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {lang === 'hi' ? 'स्थिति:' : 'Status:'}{' '}
                        {job.approved ? (lang === 'hi' ? 'स्वीकृत' : 'Approved') : lang === 'hi' ? 'अनुमोदन लंबित' : 'Pending approval'}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        {lang === 'hi' ? 'आवेदक:' : 'Applicants:'} {job.applicants}
                      </span>
                      {locationText !== '—' && (
                        <span className="rounded-full bg-slate-100 px-3 py-1">
                          {locationText}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isEditing) {
                          closeEditor()
                        } else {
                          startEditing(job)
                        }
                      }}
                      className="rounded-2xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:border-blue-300"
                    >
                      {isEditing ? (lang === 'hi' ? 'संपादन बंद करें' : 'Close editor') : lang === 'hi' ? 'संपादन करें' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenApplicantsId((prev) => (prev === job.id ? null : job.id))}
                      className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-300"
                    >
                      {isOpenApplicants ? (lang === 'hi' ? 'आवेदक छिपाएँ' : 'Hide applicants') : lang === 'hi' ? 'आवेदक देखें' : 'View applicants'}
                    </button>
                  </div>
                </div>

                {isEditing && editingForm && (
                  <form className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={(event) => onSubmit(job.id, event)}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'पद' : 'Title'}</span>
                        <input value={editingForm.title} onChange={handleEditingField('title')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
                      </label>
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'प्रकार' : 'Type'}</span>
                        <select value={editingForm.type} onChange={handleEditingField('type')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2">
                          {jobTypes.map((jt) => (
                            <option key={jt.value} value={jt.value}>
                              {lang === 'hi' ? jt.labelHi : jt.labelEn}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm text-slate-600 md:col-span-2">
                        <span>{lang === 'hi' ? 'विवरण' : 'Description'}</span>
                        <textarea value={editingForm.description} onChange={handleEditingField('description')} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
                      </label>
                      <AddressBlock
                        title={lang === 'hi' ? 'पता' : 'Address'}
                        formKey="address"
                        form={editingForm}
                        setForm={setEditingForm}
                        {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
                      />

                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'वेतन सीमा' : 'Salary range'}</span>
                        <input value={editingForm.salaryRange} onChange={handleEditingField('salaryRange')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'संपर्क फोन' : 'Contact phone'}</span>
                        <input value={editingForm.contactPhone} onChange={handleEditingField('contactPhone')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" required />
                      </label>
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={closeEditor}
                        className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400"
                      >
                        {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {updateMutation.isPending ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') : lang === 'hi' ? 'परिवर्तन सहेजें' : 'Save changes'}
                      </button>
                    </div>
                    {updateMutation.isError && (
                      <p className="text-sm text-red-600">
                        {lang === 'hi' ? 'परिवर्तन सहेजने में समस्या आई।' : 'Failed to save changes.'}
                      </p>
                    )}
                  </form>
                )}

                {isOpenApplicants && (
                  <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-sm font-semibold text-slate-700">
                      {lang === 'hi' ? 'आवेदक विवरण' : 'Applicant details'}
                    </h4>
                    {applicantsQuery.isLoading ? (
                      <p className="text-sm text-slate-500">{lang === 'hi' ? 'आवेदकों को लोड किया जा रहा है…' : 'Loading applicants…'}</p>
                    ) : applicantsQuery.data && applicantsQuery.data.length > 0 ? (
                      <ul className="space-y-3">
                        {applicantsQuery.data.map((app) => (
                          <li key={app.id} className="rounded-2xl bg-white p-3 shadow-sm">
                            <p className="text-sm font-semibold text-slate-900">{app.applicant?.displayName || 'Member'}</p>
                            <p className="text-xs text-slate-500">
                              {app.applicant?.phone ? `${lang === 'hi' ? 'फोन:' : 'Phone:'} ${app.applicant.phone}` : ''}
                            </p>
                            {app.applicant?.email && (
                              <p className="text-xs text-slate-500">{app.applicant.email}</p>
                            )}
                            {app.coverLetter && (
                              <p className="mt-2 text-sm text-slate-600">{app.coverLetter}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">{lang === 'hi' ? 'अभी कोई आवेदन नहीं आया है।' : 'No applicants yet.'}</p>
                    )}
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
