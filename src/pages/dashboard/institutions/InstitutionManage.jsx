// frontend/src/pages/dashboard/institutions/InstitutionManage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import SelectField from '../../../components/SelectField'
import { useGeoOptions } from '../../../hooks/useGeoOptions'
import { fetchMyInstitutions, updateInstitution, deleteInstitution } from '../../../lib/dashboardApi'
import { useLang } from '../../../lib/useLang'

const copy = {
  dharamshala: {
    titleEn: 'Manage my Dharamshala submissions',
    titleHi: 'मेरी धर्मशाला प्रविष्टियाँ',
  },
  sanstha: {
    titleEn: 'Manage my Sanstha submissions',
    titleHi: 'मेरी संस्था प्रविष्टियाँ',
  },
}

export default function InstitutionManage({ kind }) {
  const { lang } = useLang()
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['institutions', 'mine'], queryFn: fetchMyInstitutions })
  const [editingId, setEditingId] = useState(null)
  const [editingForm, setEditingForm] = useState(null)
  const mutation = useMutation({
    mutationFn: ({ id, payload }) => updateInstitution(id, payload),
    onSuccess: () => {
      qc.invalidateQueries(['institutions', 'mine'])
      qc.invalidateQueries(['institutions', kind])
      setEditingId(null)
      setEditingForm(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInstitution(id),
    onSuccess: () => {
      qc.invalidateQueries(['institutions', 'mine'])
      qc.invalidateQueries(['institutions', kind])
      setEditingId(null)
      setEditingForm(null)
    },
  })

  const list = useMemo(() => (data || []).filter((item) => item.kind === kind), [data, kind])
  const labels = copy[kind] || copy.dharamshala

  const {
    states: editStates,
    districts: editDistricts,
    cities: editCities,
    stateOptions: editStateOptions,
    districtOptions: editDistrictOptions,
    cityOptions: editCityOptions,
  } = useGeoOptions(editingForm?.stateCode || '', editingForm?.districtCode || '', lang)

  useEffect(() => {
    if (!editingForm || editingForm.stateCode || !editingForm.state || !editStates.length) return
    const match = editStates.find((s) => s.name.en === editingForm.state)
    if (match) {
      setEditingForm((prev) => (prev ? { ...prev, stateCode: match.code } : prev))
    }
  }, [editStates, editingForm])

  useEffect(() => {
    if (!editingForm || editingForm.districtCode || !editingForm.district || !editDistricts.length) return
    const match = editDistricts.find((d) => d.name.en === editingForm.district)
    if (match) {
      setEditingForm((prev) => (prev ? { ...prev, districtCode: match.code } : prev))
    }
  }, [editDistricts, editingForm])

  useEffect(() => {
    if (!editingForm || editingForm.cityCode || !editingForm.city || !editCities.length) return
    const match = editCities.find((c) => c.name.en === editingForm.city)
    if (match) {
      setEditingForm((prev) => (prev ? { ...prev, cityCode: match.code } : prev))
    }
  }, [editCities, editingForm])

  const onSubmit = (id, event) => {
    event.preventDefault()
    if (!editingForm) return
    mutation.mutate({
      id,
      payload: {
        titleEn: editingForm.titleEn || '',
        titleHi: editingForm.titleHi || '',
        descriptionEn: editingForm.descriptionEn || '',
        descriptionHi: editingForm.descriptionHi || '',
        businessEn: editingForm.businessEn || '',
        businessHi: editingForm.businessHi || '',
        state: editingForm.state || '',
        district: editingForm.district || '',
        city: editingForm.city || '',
        pin: editingForm.pin || '',
        contact: {
          name: editingForm.contactName || '',
          phone: editingForm.contactPhone || '',
          email: editingForm.contactEmail || '',
        },
        contactpersons: editingForm?.contactpersons || []
      },
    })
  }

  const updateEditingField = (field) => (event) => {
    const value = event.target.value
    setEditingForm((prev) => (prev ? { ...prev, [field]: value } : prev))
  }
  const addContact = () => {
    setEditingForm(prev => ({
      ...prev,
      contactpersons: [
        ...prev.contactpersons,
        { name: "", email: "", phone: "", post: "" }
      ]
    }))
  }

  const updateContact = (index, field, value) => {
    setEditingForm(prev => {
      const list = [...prev.contactpersons]
      list[index][field] = value
      return { ...prev, contactpersons: list }
    })
  }

  const removeContact = (index) => {
    setEditingForm(prev => ({
      ...prev,
      contactpersons: prev.contactpersons.filter((_, i) => i !== index)
    }))
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-slate-900">{lang === 'hi' ? labels.titleHi : labels.titleEn}</h2>
        <p className="text-sm text-slate-600">
          {lang === 'hi'
            ? 'अनुमोदन लंबित प्रविष्टियाँ सार्वजनिक पृष्ठ पर तब तक नहीं दिखेंगी जब तक स्वीकृति नहीं मिलती।'
            : 'Listings remain hidden until approved by admins.'}
        </p>
      </header>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, idx) => (
            <div key={idx} className="h-36 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
          {lang === 'hi' ? 'इस श्रेणी में कोई प्रविष्टि नहीं है।' : 'You have not submitted any listings in this category.'}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((item) => {
            const isEditing = editingId === item._id
            return (
              <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? item.titleHi || item.titleEn : item.titleEn || item.titleHi}</h3>
                    <p className="text-sm text-slate-500">{lang === 'hi' ? item.descriptionHi || item.descriptionEn : item.descriptionEn || item.descriptionHi}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                      {[item.city, item.state].filter(Boolean).join(', ') || '—'}
                    </p>
                    <span className="mt-2 inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {item.approved ? (lang === 'hi' ? 'स्वीकृत' : 'Approved') : lang === 'hi' ? 'अनुमोदन लंबित' : 'Pending approval'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isEditing) {
                        setEditingId(null)
                        setEditingForm(null)
                      } else {
                        setEditingId(item._id)
                        setEditingForm({
                          titleEn: item.titleEn || '',
                          titleHi: item.titleHi || '',
                          descriptionEn: item.descriptionEn || '',
                          descriptionHi: item.descriptionHi || '',
                          businessEn: item.businessEn || '',
                          businessHi: item.businessHi || '',
                          state: item.state || '',
                          stateCode: '',
                          district: item.district || '',
                          districtCode: '',
                          city: item.city || '',
                          cityCode: '',
                          pin: item.pin || '',
                          contactName: item.contact?.name || '',
                          contactPhone: item.contact?.phone || '',
                          contactEmail: item.contact?.email || '',
                          contactpersons: item?.contactpersons || []
                        })
                      }
                    }}
                    className="self-start rounded-2xl border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-600 hover:border-blue-300"
                  >
                    {isEditing ? (lang === 'hi' ? 'संपादन बंद करें' : 'Close editor') : lang === 'hi' ? 'संपादन करें' : 'Edit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (deleteMutation.isPending) return
                      if (window.confirm(lang === 'hi' ? 'प्रविष्टि हटाएँ?' : 'Delete this listing?')) {
                        deleteMutation.mutate(item._id)
                      }
                    }}
                    className="self-start rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:border-red-300"
                  >
                    {deleteMutation.isPending ? (lang === 'hi' ? 'हटा रहे हैं...' : 'Deleting...') : (lang === 'hi' ? 'हटाएँ' : 'Delete')}
                  </button>
                </div>

                {isEditing && editingForm && (
                  <form className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4" onSubmit={(event) => onSubmit(item._id, event)}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'शीर्षक (English)' : 'Title (English)'}</span>
                        <input value={editingForm.titleEn} onChange={updateEditingField('titleEn')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'शीर्षक (हिंदी)' : 'Title (Hindi)'}</span>
                        <input value={editingForm.titleHi} onChange={updateEditingField('titleHi')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>

                      {kind == "sanstha" && (<>
                        <label className="text-sm text-slate-600">
                          <span>{lang === 'hi' ? 'व्यवसाय (English)' : 'Business (English)'}</span>
                          <input value={editingForm.businessEn} onChange={updateEditingField('businessEn')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                        </label>
                        <label className="text-sm text-slate-600">
                          <span>{lang === 'hi' ? 'व्यवसाय (हिंदी)' : 'Business (Hindi)'}</span>
                          <input value={editingForm.businessHi} onChange={updateEditingField('businessHi')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                        </label>
                      </>)}

                      <label className="text-sm text-slate-600 md:col-span-2">
                        <span>{lang === 'hi' ? 'विवरण (English)' : 'Description (English)'}</span>
                        <textarea value={editingForm.descriptionEn} onChange={updateEditingField('descriptionEn')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>
                      <label className="text-sm text-slate-600 md:col-span-2">
                        <span>{lang === 'hi' ? 'विवरण (हिंदी)' : 'Description (Hindi)'}</span>
                        <textarea value={editingForm.descriptionHi} onChange={updateEditingField('descriptionHi')} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>



                      <SelectField
                        label={lang === 'hi' ? 'राज्य' : 'State'}
                        value={editingForm.stateCode}
                        onChange={(code) => {
                          const selected = editStates.find((s) => s.code === code)
                          setEditingForm((prev) => (prev ? {
                            ...prev,
                            stateCode: code,
                            state: selected?.name.en || '',
                            districtCode: '',
                            district: '',
                            cityCode: '',
                            city: '',
                          } : prev))
                        }}
                        options={editStateOptions}
                        placeholder={lang === 'hi' ? 'राज्य चुनें' : 'Select state'}
                      />
                      <SelectField
                        label={lang === 'hi' ? 'ज़िला' : 'District'}
                        value={editingForm.districtCode}
                        onChange={(code) => {
                          const selected = editDistricts.find((d) => d.code === code)
                          setEditingForm((prev) => (prev ? {
                            ...prev,
                            districtCode: code,
                            district: selected?.name.en || '',
                            cityCode: '',
                            city: '',
                          } : prev))
                        }}
                        options={editDistrictOptions}
                        placeholder={lang === 'hi' ? 'ज़िला चुनें' : 'Select district'}
                        disabled={!editingForm.stateCode}
                      />
                      <SelectField
                        label={lang === 'hi' ? 'शहर' : 'City'}
                        value={editingForm.cityCode}
                        onChange={(code) => {
                          const selected = editCities.find((c) => c.code === code)
                          setEditingForm((prev) => (prev ? {
                            ...prev,
                            cityCode: code,
                            city: selected?.name.en || '',
                          } : prev))
                        }}
                        options={editCityOptions}
                        placeholder={lang === 'hi' ? 'शहर चुनें' : 'Select city'}
                        disabled={!editingForm.districtCode}
                      />
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'पिन कोड' : 'PIN code'}</span>
                        <input value={editingForm.pin} onChange={updateEditingField('pin')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'संपर्क नाम' : 'Contact name'}</span>
                        <input value={editingForm.contactName} onChange={updateEditingField('contactName')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'संपर्क फोन' : 'Contact phone'}</span>
                        <input value={editingForm.contactPhone} onChange={updateEditingField('contactPhone')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
                      </label>
                      <label className="text-sm text-slate-600">
                        <span>{lang === 'hi' ? 'ईमेल' : 'Email'}</span>
                        <input value={editingForm.contactEmail} onChange={updateEditingField('contactEmail')} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2" />
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

                      {editingForm?.contactpersons?.length === 0 && (
                        <p className="text-xs text-slate-500">No contactpersons added yet.</p>
                      )}

                      {editingForm?.contactpersons.map((c, index) => (
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
                              className="mt-1 w-full max-w-2xl  border rounded px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-slate-600">Email</label>
                            <input
                              value={c.email}
                              onChange={(e) => updateContact(index, "email", e.target.value)}
                              className="mt-1 w-full max-w-2xl  border rounded px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-slate-600">Phone</label>
                            <input
                              value={c.phone}
                              onChange={(e) => updateContact(index, "phone", e.target.value)}
                              className="mt-1 w-full max-w-2xl  border rounded px-3 py-2 text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs text-slate-600">Post / Role</label>
                            <input
                              value={c.post}
                              onChange={(e) => updateContact(index, "post", e.target.value)}
                              className="mt-1 w-full max-w-2xl  border rounded px-3 py-2 text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          setEditingForm(null)
                        }}
                        className="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 hover:border-slate-400"
                      >
                        {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
                      </button>
                      <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="rounded-2xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                      >
                        {mutation.isPending ? (lang === 'hi' ? 'सहेज रहे हैं...' : 'Saving...') : lang === 'hi' ? 'परिवर्तन सहेजें' : 'Save changes'}
                      </button>
                    </div>
                    {mutation.isError && (
                      <p className="text-sm text-red-600">{lang === 'hi' ? 'परिवर्तन सहेजने में समस्या आई।' : 'Failed to save changes.'}</p>
                    )}
                  </form>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
