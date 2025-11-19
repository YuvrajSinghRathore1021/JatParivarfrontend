import { useMemo, useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext.jsx';
import { useAdminQuery } from '../hooks/useAdminApi.js';
import { Link } from 'react-router-dom';
import { adminApiFetch } from '../api/client.js';

let API_File = import.meta.env.VITE_API_File;

export default function SamajkeGaurav() {
    const [query, setQuery] = useState('');
    const [timeline, setTimeline] = useState('');
    const [category, setCategory] = useState('');

    const key = useMemo(
        () => ['admin', 'gaurav', { query, timeline, category }],
        [query, timeline, category]
    );

    const { data, refetch, isLoading } = useAdminQuery(
        key,
        () =>
            `/gaurav?timeline=${timeline}&category=${category}&${[
                query ? `search=${encodeURIComponent(query)}` : '',
            ]
                .filter(Boolean)
                .join('&')}`
    );

    const list = data?.data || [];

    const categories = [
        'games', 'politics', 'education',
        'medical', 'samaj-sevi', 'adhikari', 'other'
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">Samaj ke Gaurav</h1>
                    <p className="text-sm text-slate-500">
                        Manage public directory of Gaurav Profiles.
                    </p>
                </div>

                <Link to="/admin/samaj_ke_gaurav/save" className="px-3 py-2 text-sm bg-slate-900 text-white rounded"
                > Add New </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                {/* PAST/PRESENT */}
                <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="border px-3 py-2 rounded"
                > <option value=""> Select Option </option>
                    <option value="PAST">Past</option>
                    <option value="PRESENT">Present</option>
                </select>

                {/* Category */}
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="border px-3 py-2 rounded">
                    <option value=""> Select Option </option>
                    {categories.map((c) => (
                        <option key={c} value={c}> {c} </option>
                    ))}
                </select>

                {/* Search */}
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name..."
                    className="border border-slate-300 rounded px-3 py-2 text-sm flex-1 min-w-[220px]"
                />

                <button
                    onClick={() => refetch()}
                    className="px-3 py-2 text-sm border border-slate-300 rounded"
                >
                    Apply
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {list.map((item) => (
                        <GauravCard key={item._id} item={item} onSaved={refetch} />
                    ))}

                    {list.length === 0 && (
                        <p className="text-sm text-slate-500">No profiles found.</p>
                    )}
                </div>
            )}
        </div>
    );
}

function GauravCard({ item, onSaved }) {
    const { token } = useAdminAuth();
    const [busy, setBusy] = useState(false);

    const call = (path, body, type = 'PATCH') =>
        adminApiFetch(path, { token, body, method: type });

    const deleteProfile = async () => {
        setBusy(true);
        try {
            await call(`/gaurav/${item._id}`, {}, 'DELETE');
            onSaved?.();
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <img
                    src={API_File + item.photo}
                    className="w-20 h-20 rounded-lg object-cover border"
                />
                <div>
                    <h2 className="text-lg font-semibold">{item.name}</h2>
                    <p className="text-xs text-slate-500 capitalize">
                        {item.timeline} • {item.category}
                    </p>
                </div>
            </div>

            <p className="text-sm mt-2 line-clamp-2 text-slate-600">
                {item.title}
            </p>

            <div className="flex justify-between mt-4 text-sm">
                <button
                    onClick={deleteProfile}
                    disabled={busy}
                    className="rounded border border-red-300 px-3 py-2 text-red-600 hover:bg-red-50 disabled:opacity-60"
                >
                    {busy ? 'Deleting…' : 'Delete'}
                </button>

                <Link
                    to={`/admin/samaj_ke_gaurav/${item._id}`}
                    className="px-3 py-2 border rounded text-slate-700 hover:bg-slate-100"
                >
                    Edit
                </Link>
            </div>
        </div>
    );
}
