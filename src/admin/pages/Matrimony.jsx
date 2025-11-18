import { useMemo, useState, useEffect } from 'react'
import { useAdminAuth } from '../context/AdminAuthContext.jsx'
import { adminApiFetch } from '../api/client.js'
import { useAdminQuery } from '../hooks/useAdminApi.js'
import { Link } from 'react-router-dom'
let API_File = import.meta.env.VITE_API_File

export default function Matrimony() {

    const [query, setQuery] = useState('')
    const key = useMemo(() => ['admin', 'matrimony', { query }], [query])

    const { data, refetch, isLoading } = useAdminQuery(
        key, () => `/matrimony?${[query ? `search=${encodeURIComponent(query)}` : '',].filter(Boolean).join('&')}`
    )

    const list = data?.data || []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Matrimony</h1>
                    <p className="text-sm text-slate-500">Edit listings shown on the public directory.</p>
                </div>
                <button class="px-3 py-2 text-sm bg-slate-900 text-white rounded">
                    <Link to={`/admin/matrimony/save`} >
                        Add New
                    </Link>
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search " className="border border-slate-300 rounded px-3 py-2 text-sm flex-1 min-w-[220px]" />
                <button onClick={() => refetch()} className="px-3 py-2 text-sm border border-slate-300 rounded">Apply</button>
            </div>

            {isLoading ? (
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {list.map(item => (
                        <InstitutionCard key={item.id} item={item} onSaved={() => refetch()} />
                    ))}
                    {list.length === 0 && <p className="text-sm text-slate-500">No listings yet.</p>}
                </div>
            )}
        </div>
    )
}

function InstitutionCard({ item, onSaved }) {

    const { token } = useAdminAuth()
    const [busy, setBusy] = useState(false)
    const call = (path, body, type = 'PATCH') => adminApiFetch(path, { token, body, method: type })

    const toggleDelete = async () => {
        setBusy(true)
        try {
            await call(`/matrimony/${item._id}`, { approved: !item.approved }, 'DELETE')
            onSaved?.()
        } finally { setBusy(false) }
    }




    return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

        {/* Basic Info */}
        <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
                {item.gender === "male" ? "Male" : "Female"} • {item.age} yrs
            </h2>
            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-700">
                {item.visible ? "Visible" : "Hidden"}
            </span>
        </div>

        {/* Location */}
        <p className="text-sm text-slate-600 mt-1">
            {item.village ? item.village + ", " : ""}
            {item.city}, {item.district}, {item.state}
        </p>

        {/* Education + Occupation */}
        <div className="mt-2 text-sm text-slate-700 space-y-1">
            <p><b>Education:</b> {item.education || "Not provided"}</p>
            <p><b>Occupation:</b> {item.occupation || "Not provided"}</p>
        </div>

        {/* Height + Marital Status */}
        <div className="mt-2 text-sm text-slate-700 space-y-1">
            <p><b>Height:</b> {item.hight ? item.hight + " inch" : "Not provided"}</p>
            <p><b>Status:</b> {item.maritalStatus}</p>
        </div>

        {/* Gotra */}
        <div className="mt-3 text-sm">
            <b>Gotra:</b>
            <div className="text-slate-700 mt-1">
                <p>Self: {item.gotra?.self}</p>
                <p>Mother: {item.gotra?.mother}</p>
                <p>Nani: {item.gotra?.nani}</p>
                <p>Dadi: {item.gotra?.dadi}</p>
            </div>
        </div>

        {/* Photos */}
        {item.photos?.length > 0 ? (
            <div className="flex gap-2 mt-3 overflow-x-auto">
                {item.photos.map((p, i) => (
                    <img
                        key={i}
                        src={API_File+p}
                        className="w-20 h-20 object-cover rounded-md border"
                    />
                ))}
            </div>
        ) : (
            <p className="text-xs text-slate-400 mt-3">No photos uploaded.</p>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex gap-2">
                <button
                    onClick={toggleDelete}
                    disabled={busy}
                    className="rounded border border-red-300 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                    {busy ? "Deleting…" : "Delete"}
                </button>

                <Link
                    to={`/admin/matrimony/${item?._id}`}
                    className="px-3 py-2 border rounded text-slate-700 hover:bg-slate-100"
                >
                    Edit
                </Link>
            </div>
        </div>

    </div>
);

}











