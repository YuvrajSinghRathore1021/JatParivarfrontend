// frontend/src/admin/pages/MemberDetail.jsx

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { upload } from '../../lib/api.js'
import { useGeoOptions } from '../../hooks/useGeoOptions'
import AddressBlock from '../../components/AddressBlock.jsx'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'disabled', label: 'Disabled' },
  { value: 'pending', label: 'Pending' },
]

export default function MemberDetailPage() {
  let lang = "en"
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const [sameAsCurrent, setSameAsCurrent] = useState(false);
  const [sameAsOccupation, setSameAsOccupation] = useState(false)
  const [member, setMember] = useState(null)
  const [personForm, setPersonForm] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingSpotlight, setSavingSpotlight] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [passwords, setPasswords] = useState({ value: '', confirm: '' })
  const [uploading, setUploading] = useState({ avatar: false, jan: false })
  const [spotlightBannerUploading, setSpotlightBannerUploading] = useState(false)

  const [addressCodes, setAddressCodes] = useState({ stateCode: '', districtCode: '', cityCode: '' })

  const {
    states,
    districts,
    cities,
    stateOptions,
    districtOptions,
    cityOptions,
  } = useGeoOptions(addressCodes?.stateCode, addressCodes?.districtCode, 'en')

  useEffect(() => {
    const fetchMember = async () => {
      try {
        setError('')
        const res = await adminApiFetch(`/members/${id}`, { token })
        setMember(res.member);
        setPersonForm(res.person ? {
          id: res.person.id,
          role: res.person.role,
          name: res.person.name || '',
          title: res.person.title || '',
          designation: res.person.designation || '',
          place: res.person.place || '',
          bioEn: res.person.bioEn || '',
          bioHi: res.person.bioHi || '',
          order: res.person.order ?? 1,
          visible: res.person.visible ?? true,
          bannerUrl: res.person.bannerUrl || '',

        } : null)

      } catch (err) {
        setError(err.message)
      }
    }
    fetchMember()
  }, [id, token])

  // ⬇️ ADD THIS useEffect
  useEffect(() => {
    if (member) {
      setAddressCodes({
        stateCode: member.currentAddress?.state || "",
        districtCode: member.currentAddress?.district || "",
        cityCode: member.currentAddress?.city || ""
      });
    }
  }, [member]);


  const isSpotlightEligible = member?.role === 'founder' || member?.role === 'member'

  if (!member) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        {error ? <p className="text-sm text-red-600">{error}</p> : <p>Loading…</p>}
      </div>
    )
  }

  const updateMemberField = (field, value) => {
    setMember((prev) => ({ ...prev, [field]: value }))
  }

  const updateNested = (group, field, value) => {
    setMember((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [field]: value,
      },
    }))
  }

  const handleAvatarUpload = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image smaller than 5 MB.')
      return
    }
    setUploading((prev) => ({ ...prev, avatar: true }))
    try {
      const { url } = await upload('/uploads/file', file)
      updateMemberField('avatarUrl', url)
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading((prev) => ({ ...prev, avatar: false }))
    }
  }

  const handleJanUpload = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Please choose a document smaller than 10 MB.')
      return
    }
    setUploading((prev) => ({ ...prev, jan: true }))
    try {
      const { url } = await upload('/uploads/file', file)
      updateMemberField('janAadhaarUrl', url)
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading((prev) => ({ ...prev, jan: false }))
    }
  }
  // adimage,bussinessurl
  const handleAdimageUpload = async (file) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      alert('Please choose a document smaller than 10 MB.')
      return
    }
    setUploading((prev) => ({ ...prev, adimage: true }))
    try {
      const { url } = await upload('/uploads/file', file)
      updateMemberField('adimage', url)
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading((prev) => ({ ...prev, adimage: false }))
    }
  }

  const handleSpotlightBannerUpload = async (file) => {
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      alert('Please choose an image smaller than 5 MB.')
      return
    }
    setSpotlightBannerUploading(true)
    try {
      const { url } = await upload('/uploads/file', file)
      setPersonForm((prev) => ({ ...prev, bannerUrl: url }))
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setSpotlightBannerUploading(false)
    }
  }

  const submitMember = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (passwords.value && passwords.value !== passwords.confirm) {
        throw new Error('Passwords do not match')
      }
      const payload = {
        name: member.name,
        displayName: member.displayName,
        message: member?.message,
        adimage: member.adimage,
        bussinessurl: member.bussinessurl,
        email: member.email,
        contactEmail: member.contactEmail,
        status: member.status,
        alternatePhone: member.alternatePhone,
        occupation: member.occupation,
        company: member.company,
        publicNote: member.publicNote,
        avatarUrl: member.avatarUrl,
        janAadhaarUrl: member.janAadhaarUrl,
        gotra: hasValues(member.gotra) ? member.gotra : undefined,
        occupationAddress: member?.occupationAddress,
        currentAddress: member?.currentAddress,
        parentalAddress: member?.parentalAddress,
      }
      if (passwords.value) {
        payload.password = passwords.value
      }
      await adminApiFetch(`/members/${member.id}`, { token, method: 'PATCH', body: payload })
      setPasswords({ value: '', confirm: '' })
      alert('Member profile updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteMember = async () => {
    if (!window.confirm('Delete this member permanently?')) return
    setDeleting(true)
    setError('')
    try {
      await adminApiFetch(`/members/${member.id}`, { token, method: 'DELETE' })
      alert('Member deleted')
      navigate('/admin/members')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeleting(false)
    }
  }

  const saveSpotlight = async (event) => {
    event.preventDefault()
    if (!personForm) return
    setSavingSpotlight(true)
    setError('')
    try {
      await adminApiFetch(`/founders/${personForm.id}`, {
        token,
        method: 'PATCH',
        body: {
          name: personForm.name,
          title: personForm.title,
          designation: personForm.designation,
          place: personForm.place,
          bioEn: personForm.bioEn,
          bioHi: personForm.bioHi,
          order: personForm.order,
          visible: personForm.visible,
          bannerUrl: personForm.bannerUrl,
        },
      })
      alert('Public profile updated')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingSpotlight(false)
    }
  }




  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{member.name}</h1>
          <p className="text-sm text-slate-500">
            Member profile · Role: <span className="capitalize">{member.role}</span>
          </p>
        </div>
        <button
          onClick={deleteMember}
          disabled={deleting}
          className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
        >
          {deleting ? 'Deleting…' : 'Delete member'}
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={submitMember} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profile information</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" value={member.name || ''} onChange={(val) => updateMemberField('name', val)} required />
          <Field label="Display name" value={member.displayName || ''} onChange={(val) => updateMemberField('displayName', val)} />
          <Field label="Primary phone" value={member.phone || ''} disabled />
          <Field label="Secondary phone" value={member.alternatePhone || ''} onChange={(val) => updateMemberField('alternatePhone', val)} />
          <Field label="Email" value={member.email || ''} onChange={(val) => updateMemberField('email', val)} />
          <Field label="Contact email" value={member.contactEmail || ''} onChange={(val) => updateMemberField('contactEmail', val)} />
          <Field label="Occupation" value={member.occupation || ''} onChange={(val) => updateMemberField('occupation', val)} />
          <Field label="Company" value={member.company || ''} onChange={(val) => updateMemberField('company', val)} />
          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select
              value={member.status || 'active'}
              onChange={(e) => updateMemberField('status', e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <Field label="Role" value={member.role} disabled />
          <Field label="Referral code" value={member.referralCode || ''} disabled />
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600">Public note</label>
          <textarea
            value={member.publicNote || ''}
            onChange={(e) => updateMemberField('publicNote', e.target.value)}
            rows={3}
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* address  */}

          <AddressBlock
            title={lang === 'hi' ? 'व्यवसाय का पता' : 'Occupation Address'}
            formKey="occupationAddress"
            form={member}
            setForm={setMember}
            {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
          />
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
              <input
                type="checkbox"
                checked={sameAsOccupation}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSameAsOccupation(checked);

                  if (checked) {
                    // copy current -> parental
                    setMember((prev) => ({
                      ...prev,
                      currentAddress: { ...(prev?.occupationAddress || {}) }
                    }));
                  } else {
                    // reset parental
                    setMember((prev) => ({
                      ...prev,
                      currentAddress: { state: "", district: "", city: "", address: "" }
                    }));
                  }
                }}
                className="h-4 w-4"
              />
              {lang === 'hi'
                ? 'वर्तमान पता व्यवसाय के पते जैसा ही है' :
                'Current address is same as occupation address'}
            </label>

          </label>
          {!sameAsOccupation && (
            <AddressBlock
              title={lang === 'hi' ? 'वर्तमान पता' : 'Current Address'}
              formKey="currentAddress"
              form={member}
              setForm={setMember}
              {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
            />

          )}
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 md:col-span-2 mt-2">
              <input
                type="checkbox"
                checked={sameAsCurrent}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSameAsCurrent(checked);

                  if (checked) {
                    // copy current -> parental
                    setMember((prev) => ({
                      ...prev,
                      parentalAddress: { ...(prev?.currentAddress || {}) }
                    }));
                  } else {
                    // reset parental
                    setMember((prev) => ({
                      ...prev,
                      parentalAddress: { state: "", district: "", city: "", address: "" }
                    }));
                  }
                }}
                className="h-4 w-4"
              />
              {lang === 'hi'
                ? 'पैतृक पता वर्तमान पते जैसा ही है'
                : 'Parental address is same as current address'}
            </label>

          </label>

          {!sameAsCurrent && (
            <AddressBlock
              title={lang === 'hi' ? 'पैतृक पता' : 'Parental Address'}
              formKey="parentalAddress"
              form={member}
              setForm={setMember}
              {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
            />
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Gotra (Self)" value={member.gotra?.self || ''} onChange={(val) => updateNested('gotra', 'self', val)} />
          <Field label="Gotra (Mother)" value={member.gotra?.mother || ''} onChange={(val) => updateNested('gotra', 'mother', val)} />
          <Field label="Gotra (Dadi)" value={member.gotra?.dadi || ''} onChange={(val) => updateNested('gotra', 'dadi', val)} />
          <Field label="Gotra (Nani)" value={member.gotra?.nani || ''} onChange={(val) => updateNested('gotra', 'nani', val)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <UploadField
            label="Profile photo"
            value={member.avatarUrl || ''}
            onChange={(val) => updateMemberField('avatarUrl', val)}
            onUpload={handleAvatarUpload}
            uploading={uploading.avatar}
            accept="image/*"
            hint="JPG/PNG • Max 5 MB"
          />
          <UploadField
            label="Jan Aadhaar (file URL)"
            value={member.janAadhaarUrl || ''}
            onChange={(val) => updateMemberField('janAadhaarUrl', val)}
            onUpload={handleJanUpload}
            uploading={uploading.jan}
            accept="application/pdf,image/*"
            hint="PDF or image • Max 10 MB"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="New password"
            type="password"
            value={passwords.value}
            onChange={(val) => setPasswords((prev) => ({ ...prev, value: val }))}
            placeholder="Leave blank to keep existing"
          />
          <Field
            label="Confirm password"
            type="password"
            value={passwords.confirm}
            onChange={(val) => setPasswords((prev) => ({ ...prev, confirm: val }))}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <UploadField
            label="AD Image (file URL)"
            value={member.adimage || ''}
            onChange={(val) => updateMemberField('adimage', val)}
            onUpload={handleAdimageUpload}
            uploading={uploading.adimage}
            accept="application/pdf,image/*"
            hint="PDF or image • Max 10 MB"
          />

          <Field label="Bussiness Details (URL)" value={member?.bussinessurl || ''} onChange={(val) => updateMemberField('bussinessurl', val)} />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      </form>

      {personForm ? (
        <form
          onSubmit={saveSpotlight}
          className="space-y-4 rounded-3xl border border-blue-200 bg-white p-6 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Public listing ({personForm.role === 'founder' ? 'Founder' : 'Management'})
            </h2>
            <a
              href={`/hi/${personForm.role === 'founder' ? 'founders' : 'management'}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-600 underline"
            >
              View public page
            </a>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Display name" value={personForm.name} onChange={(val) => setPersonForm((prev) => ({ ...prev, name: val }))} />
            <Field label="Title / Designation" value={personForm.title} onChange={(val) => setPersonForm((prev) => ({ ...prev, title: val }))} />
            <Field label="Role title" value={personForm.designation || ''} onChange={(val) => setPersonForm((prev) => ({ ...prev, designation: val }))} />
            <Field label="Order (homepage priority)" type="number" value={personForm.order ?? 1} onChange={(val) => setPersonForm((prev) => ({ ...prev, order: Number(val || 0) }))} />
            <Field label="Focus place" value={personForm.place || ''} onChange={(val) => setPersonForm((prev) => ({ ...prev, place: val }))} />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={personForm.visible}
                onChange={(e) => setPersonForm((prev) => ({ ...prev, visible: e.target.checked }))}
              />
              <span className="text-sm text-slate-600">Visible on public pages</span>
            </div>
            <div className="md:col-span-2">
              <UploadField
                label="Organisation banner"
                value={personForm.bannerUrl || ''}
                onChange={(val) => setPersonForm((prev) => ({ ...prev, bannerUrl: val }))}
                onUpload={handleSpotlightBannerUpload}
                uploading={spotlightBannerUploading}
                accept="image/*"
                hint="Tall image • Max 5 MB"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Message</label>
            <textarea
              value={member?.message || ''}
              onChange={(e) => updateMemberField('message', e.target.value)}
              rows={3}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Bio (English)</label>
            <textarea
              value={personForm.bioEn || ''}
              onChange={(e) => setPersonForm((prev) => ({ ...prev, bioEn: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Bio (Hindi)</label>
            <textarea
              value={personForm.bioHi || ''}
              onChange={(e) => setPersonForm((prev) => ({ ...prev, bioHi: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingSpotlight}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {savingSpotlight ? 'Saving…' : 'Save public profile'}
            </button>
          </div>
        </form>
      ) : isSpotlightEligible ? (
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Public profile will appear automatically once their founder/management record finishes syncing. Please refresh the page in a moment.
        </div>
      ) : null}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required, disabled }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
      />
    </div>
  )
}

function UploadField({ label, value, onChange, onUpload, uploading, accept, hint }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://…"
        className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
      />
      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm font-medium text-blue-600 cursor-pointer">
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              onUpload(file)
            }}
            disabled={uploading}
          />
          {uploading ? 'Uploading…' : 'Upload file'}
        </label>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
    </div>
  )
}

const hasValues = (obj = {}) => Object.values(obj || {}).some((val) => val)
