// frontend/src/admin/pages/Members.jsx
import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { upload } from '../../lib/api.js'
import DateField from '../../components/DateField'
import SelectField from '../../components/SelectField'
import { useGeoOptions } from '../../hooks/useGeoOptions'
import { asOptions as gotraOptions } from '../../constants/gotras'
import AddressBlock from '../../components/AddressBlock.jsx'
const pageSizes = [20, 50, 100]
const sortOptions = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'name:desc', label: 'Name (Z–A)' },
  { value: 'role:asc', label: 'Role (A–Z)' },
  { value: 'role:desc', label: 'Role (Z–A)' },
]

export default function MembersPage() {

  const [filters, setFilters] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    status: '',
    role: '',
    sortBy: 'createdAt',
    sortDir: 'desc',
  })

  const queryKey = useMemo(() => ['admin', 'members', filters], [filters])

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    params.set('page', String(filters.page))
    params.set('pageSize', String(filters.pageSize))
    if (filters.search) params.set('search', filters.search)
    if (filters.status) params.set('status', filters.status)
    if (filters.role) params.set('role', filters.role)
    if (filters.sortBy) params.set('sortBy', filters.sortBy)
    if (filters.sortDir) params.set('sortDir', filters.sortDir)
    return `/members?${params.toString()}`
  }, [filters])

  const { data, isLoading, refetch } = useAdminQuery(queryKey, queryString, { keepPreviousData: true })

  const list = data?.data || []
  const meta = data?.meta || {
    page: filters.page,
    pageSize: filters.pageSize,
    total: 0,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  }

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      page: key === 'page' ? value : 1,
      [key]: value,
    }))
  }

  const handleSortChange = (value) => {
    const [sortBy, sortDir] = value.split(':')
    setFilters((prev) => ({ ...prev, page: 1, sortBy, sortDir }))
  }

  const currentSortValue = `${meta.sortBy}:${meta.sortDir}`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Members</h1>
          <p className="text-sm text-slate-500">
            Manage founders, management, and sadharan members in one place.
          </p>
        </div>
        <MemberCreateButton onCreated={() => refetch()} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-5 md:items-end">
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-slate-600">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Name, phone, referral code, gotra…"
              className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Role</label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="">All roles</option>
              <option value="sadharan">Sadharan</option>
              <option value="member">Management</option>
              <option value="founder">Founder</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Sort</label>
            <select
              value={currentSortValue}
              onChange={(e) => handleSortChange(e.target.value)}
              className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Page size</label>
            <select
              value={filters.pageSize}
              onChange={(e) => handleFilterChange('pageSize', Number(e.target.value))}
              className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
            >
              {pageSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-2 font-medium text-slate-600">Name</th>
              <th className="px-4 py-2 font-medium text-slate-600">Phone</th>
              <th className="px-4 py-2 font-medium text-slate-600">Role</th>
              <th className="px-4 py-2 font-medium text-slate-600">Referral</th>
              <th className="px-4 py-2 font-medium text-slate-600">Status</th>
              <th className="px-4 py-2 font-medium text-slate-600">City</th>
              <th className="px-4 py-2 font-medium text-slate-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  Loading…
                </td>
              </tr>
            )}

            {!isLoading && list.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                  No members found.
                </td>
              </tr>
            )}

            {list.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{member.name || '—'}</div>
                  <div className="text-xs text-slate-500">{member.displayName}</div>
                  <div className="text-xs text-slate-400">{member.email || '—'}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  <div>{member.phone}</div>
                  {member.alternatePhone && (
                    <div className="text-xs text-slate-500">{member.alternatePhone}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-700 capitalize">{member.role || '—'}</td>
                <td className="px-4 py-3 text-slate-700 font-mono text-xs">
                  {member.referralCode || '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={member.status} />
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {member.address?.city ? `${member.address.city}, ${member.address?.state || ''}` : '—'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/members/${member.id}`} className="text-slate-700 underline">
                      View
                    </Link>
                    <StatusToggle member={member} onChanged={() => refetch()} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 text-sm">
          <p>
            Showing {(meta.page - 1) * meta.pageSize + 1} –{' '}
            {Math.min(meta.page * meta.pageSize, meta.total)} of {meta.total}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => handleFilterChange('page', Math.max(1, meta.page - 1))}
              className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
              disabled={meta.page <= 1}
            >
              Prev
            </button>
            <button
              onClick={() => handleFilterChange('page', meta.page + 1)}
              className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50"
              disabled={meta.page * meta.pageSize >= meta.total}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const color =
    status === 'active'
      ? 'bg-green-100 text-green-700'
      : status === 'disabled'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700'
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{status}</span>
}

function StatusToggle({ member, onChanged }) {
  const { token } = useAdminAuth()
  const [loading, setLoading] = useState(false)
  const nextStatus = member.status === 'active' ? 'disabled' : 'active'

  const toggle = async () => {
    setLoading(true)
    try {
      await adminApiFetch(`/members/${member.id}/status`, {
        token,
        method: 'PATCH',
        body: { status: nextStatus },
      })
      onChanged()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={toggle} disabled={loading} className="text-slate-700 underline">
      Set {nextStatus}
    </button>
  )
}

function MemberCreateButton({ onCreated }) {
  let lang = 'en';
  const { token } = useAdminAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState({ avatar: false, jan: false })
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    displayName: '',
    phone: '',
    email: '',
    password: '',
    role: 'sadharan',
    status: 'active',
    dateOfBirth: '',
    alternatePhone: '',
    avatarUrl: '',
    janAadhaarUrl: '',
    gotra: { self: '', mother: '', dadi: '', nani: '' },

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
  const [addressCodes, setAddressCodes] = useState({ stateCode: '', districtCode: '', cityCode: '' })

  const { states, districts, cities, stateOptions, districtOptions, cityOptions } = useGeoOptions(
    addressCodes.stateCode,
    addressCodes.districtCode,
    'en'
  )
  const gotraOptionsList = useMemo(() => gotraOptions('en'), [])

  const resetForm = () => {
    setForm({
      name: '',
      displayName: '',
      phone: '',
      email: '',
      password: '',
      role: 'sadharan',
      status: 'active',
      dateOfBirth: '',
      alternatePhone: '',
      avatarUrl: '',
      janAadhaarUrl: '',
      gotra: { self: '', mother: '', dadi: '', nani: '' },

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
    setAddressCodes({ stateCode: '', districtCode: '', cityCode: '' })
  }

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleNestedChange = (group, field, value) => {
    setForm((prev) => ({
      ...prev,
      [group]: {
        ...(prev[group] || {}),
        [field]: value,
      },
    }))
  }



  const handleUpload = async (target, file) => {
    if (!file) return
    const limitMb = target === 'avatar' ? 5 : 10
    if (file.size > limitMb * 1024 * 1024) {
      alert(`Please choose a file smaller than ${limitMb} MB.`)
      return
    }
    setUploading((prev) => ({ ...prev, [target]: true }))
    try {
      const { url } = await upload('/uploads/file', file)
      handleChange(target === 'avatar' ? 'avatarUrl' : 'janAadhaarUrl', url)
    } catch (err) {
      alert(err.message || 'Upload failed')
    } finally {
      setUploading((prev) => ({ ...prev, [target]: false }))
    }
  }

  const [gotraform, setgotraform] = useState({})
  const handleChangeNew = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setgotraform((prev) => ({ ...prev, [field]: value }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        name: form.name,
        displayName: form.displayName || form.name,
        phone: form.phone,
        email: form.email || undefined,
        password: form.password,
        role: form.role,
        status: form.status,
        dateOfBirth: form.dateOfBirth || undefined,
        alternatePhone: form.alternatePhone || undefined,
        avatarUrl: form.avatarUrl || undefined,
        janAadhaarUrl: form.janAadhaarUrl || undefined,
        gotra: hasValues(form.gotra) ? form.gotra : undefined,
        gotra: {
          self: form.gotra?.self == '__custom' ? gotraform?.self : form.gotra?.self,
          mother: form.gotra?.mother == '__custom' ? gotraform?.mother : form.gotra?.mother,
          nani: form.gotra?.nani == '__custom' ? gotraform?.nani : form.gotra?.nani,
          dadi: form.gotra?.dadi == '__custom' ? gotraform?.dadi : form.gotra?.dadi
        },

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
      await adminApiFetch('/members', { token, method: 'POST', body: payload })
      resetForm()
      setOpen(false)
      onCreated?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
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

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="px-3 py-2 text-sm bg-slate-900 text-white rounded">
        Add member
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Add member</h2>
          <button onClick={() => setOpen(false)} className="text-slate-500">
            Close
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
          <Field
            label="Full name"
            value={form.name}
            onChange={(value) => handleChange('name', value)}
            required
          />
          <Field
            label="Display name"
            value={form.displayName}
            onChange={(value) => handleChange('displayName', value)}
            placeholder="Shown publicly (optional)"
          />
          <Field
            label="Primary phone"
            value={form.phone}
            onChange={(value) => handleChange('phone', value)}
            required
          />
          <Field
            label="Secondary phone"
            value={form.alternatePhone}
            onChange={(value) => handleChange('alternatePhone', value)}
          />
          <Field
            label="Email"
            value={form.email}
            onChange={(value) => handleChange('email', value)}
          />
          <div>
            <DateField
              lang="en"
              label="Date of birth"
              value={form.dateOfBirth}
              onChange={(value) => handleChange('dateOfBirth', value)}
              minYear={1920}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Role</label>
            <select
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="sadharan">Sadharan</option>
              <option value="member">Management</option>
              <option value="founder">Founder</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Status</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <Field
            label="Password"
            type="text"
            value={form.password}
            onChange={(value) => handleChange('password', value)}
            placeholder="Minimum 6 characters"
            required
          />
          <div className="md:col-span-2 rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase">Profile photo</p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={form.avatarUrl}
                onChange={(e) => handleChange('avatarUrl', e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
              />
              <label className="text-sm font-medium text-blue-600 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    handleUpload('avatar', file)
                  }}
                  disabled={uploading.avatar}
                />
                {uploading.avatar ? 'Uploading…' : 'Upload'}
              </label>
            </div>
          </div>
          <div className="md:col-span-2 rounded-xl border border-slate-200 p-4 space-y-3">
            <p className="text-xs font-semibold text-slate-600 uppercase">Jan Aadhaar document</p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={form.janAadhaarUrl}
                onChange={(e) => handleChange('janAadhaarUrl', e.target.value)}
                placeholder="Document URL (optional)"
                className="flex-1 border border-slate-300 rounded px-3 py-2 text-sm"
              />
              <label className="text-sm font-medium text-blue-600 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  accept="application/pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    handleUpload('jan', file)
                  }}
                  disabled={uploading.jan}
                />
                {uploading.jan ? 'Uploading…' : 'Upload'}
              </label>
            </div>
          </div>
          <div className="md:col-span-2 grid gap-3 md:grid-cols-2 rounded-xl border border-slate-200 p-4">
            <p className="md:col-span-2 text-xs font-semibold text-slate-600 uppercase">Address</p>

            <AddressBlock
              title={lang === 'hi' ? 'व्यवसाय का पता' : 'Occupation Address'}
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
              {lang === 'hi'
                ? 'वर्तमान पता व्यवसाय के पते जैसा ही है' :
                'Current address is same as occupation address'}
            </label>
            {!sameAsOccupation && (
              <AddressBlock
                title={lang === 'hi' ? 'वर्तमान पता' : 'Current Address'}
                formKey="currentAddress"
                form={form}
                setForm={setForm}
                {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
              />)}
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
                {...{ states, districts, cities, stateOptions, districtOptions, cityOptions, lang }}
              />
            )}
          </div>
          <div className="md:col-span-2 grid gap-3 md:grid-cols-2 rounded-xl border border-slate-200 p-4">
            <p className="md:col-span-2 text-xs font-semibold text-slate-600 uppercase">Gotra</p>
            <div className="space-y-2"><SelectField
              label="Self"
              value={form.gotra.self}
              onChange={(value) => handleNestedChange('gotra', 'self', value)}
              options={gotraOptionsList}
              placeholder="Select gotra"
            />
              {form.gotra?.self == '__custom' && (
                <input
                  placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                  value={gotraform.self}
                  onChange={handleChangeNew('self')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}
            </div>

            <div className="space-y-2"><SelectField
              label="Mother"
              value={form.gotra.mother}
              onChange={(value) => handleNestedChange('gotra', 'mother', value)}
              options={gotraOptionsList}
              placeholder="Select gotra"
            />
              {form.gotra?.mother == '__custom' && (
                <input
                  placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                  value={gotraform.mother}
                  onChange={handleChangeNew('mother')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}</div>

            <div className="space-y-2"><SelectField
              label="Dadi"
              value={form.gotra.dadi}
              onChange={(value) => handleNestedChange('gotra', 'dadi', value)}
              options={gotraOptionsList}
              placeholder="Select gotra"
            />
              {form.gotra?.dadi == '__custom' && (
                <input
                  placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                  value={gotraform.dadi}
                  onChange={handleChangeNew('dadi')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}</div>

            <div className="space-y-2"><SelectField
              label="Nani"
              value={form.gotra.nani}
              onChange={(value) => handleNestedChange('gotra', 'nani', value)}
              options={gotraOptionsList}
              placeholder="Select gotra"
            />
              {form.gotra?.nani == '__custom' && (
                <input
                  placeholder={lang === 'hi' ? 'गोत्र लिखें' : 'Enter gotra'}
                  value={gotraform.nani}
                  onChange={handleChangeNew('nani')}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              )}</div>


          </div>
          <div className="md:col-span-2 flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
              className="px-3 py-2 text-sm border border-slate-300 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-3 py-2 text-sm bg-slate-900 text-white rounded disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full max-w-2xl  border border-slate-300 rounded px-3 py-2 text-sm"
      />
    </div>
  )
}

const hasValues = (obj = {}) => Object.values(obj || {}).some((val) => val)
