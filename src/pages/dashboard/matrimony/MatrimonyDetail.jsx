import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchMatrimonyDetail } from "../../../lib/dashboardApi";
import { useLang } from "../../../lib/useLang";
import { makeInitialAvatar } from "../../../lib/avatar";
let API_File = import.meta.env.VITE_API_File

const EDUCATION_LABELS = {
    high_school: 'High school',
    graduate: 'Graduate',
    postgraduate: 'Postgraduate',
    phd: 'PhD',
}

const OCCUPATION_LABELS = {
    government_job: 'Government job',
    private_job: 'Private job',
    business: 'Business',
    student: 'Student',
    govt: 'Government job',
    private: 'Private job',
}

const MARITAL_LABELS = {
    never_married: 'Never married',
    divorced: 'Divorced',
    widowed: 'Widowed',
}

const GENDER_LABELS = {
    male: 'Male',
    female: 'Female',
    other: 'Other',
}

const formatAddress = (addr) => {
    if (!addr) return '—'
    const parts = [addr.address || addr.village, addr.city, addr.district, addr.state].filter(Boolean)
    return parts.length ? parts.join(', ') : '—'
}

export default function MatrimonyDetail() {

    const { id } = useParams();
    const { lang } = useLang();

    const { data: item, isLoading } = useQuery({
        queryKey: ["matrimony", id],
        queryFn: () => fetchMatrimonyDetail(id),
    });

    if (isLoading) {
        return (
            <div className="animate-pulse p-6 space-y-4">
                <div className="h-40 rounded-2xl bg-slate-200" />
                <div className="h-6 w-1/3 rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="p-6 text-center text-slate-500">
                {lang === "hi" ? "डेटा उपलब्ध नहीं है।" : "No data found."}
            </div>
        );
    }

    const heroSrc = item.photos?.[0]
        ? API_File + item.photos[0]
        : makeInitialAvatar(item.name || 'Member', { size: 640, radius: 40 })

    const education = EDUCATION_LABELS[item.education] || item.education || '—'
    const occupation = OCCUPATION_LABELS[item.occupation] || item.occupation || '—'
    const maritalStatus = MARITAL_LABELS[item.maritalStatus] || item.maritalStatus || '—'
    const gender = GENDER_LABELS[item.gender] || item.gender || '—'
    const designation = item?.designation || '—'
    const department = item?.department || '—'

    return (
        <div className="space-y-8 pb-20">

            {/* ===== Photo ===== */}
            <section className="px-4">
                <img
                    src={heroSrc}
                    alt="Profile"
                    className="w-full h-60 object-cover rounded-2xl shadow"
                    onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = makeInitialAvatar(item.name || 'Member', { size: 640, radius: 40 })
                    }}
                />
            </section>

            {/* ===== Basic Info ===== */}
            <section className="px-4">
                <h1 className="text-3xl font-bold text-slate-900">{item.name || '—'}</h1>

                <div className="text-slate-700 mt-3 grid gap-3 sm:grid-cols-2">
                    <InfoRow label="Age" value={item.age ?? '—'} />
                    <InfoRow label="Gender" value={gender} />
                    <InfoRow label="Height" value={item.height || '—'} />
                    <InfoRow label="Marital Status" value={maritalStatus} />
                    <InfoRow label="Education" value={education} />
                    <InfoRow label="Occupation" value={occupation} />
                    <InfoRow label="Designation" value={designation} />
                    <InfoRow label="Department" value={department} />
                </div>
            </section>

            {/* ===== Address ===== */}
            <section className="px-4 grid gap-4 md:grid-cols-2">
                <CardBlock title="Current Address">
                    <p className="text-slate-800">{formatAddress(item?.currentAddress)}</p>
                </CardBlock>
                <CardBlock title="Parental Address">
                    <p className="text-slate-800">{formatAddress(item?.parentalAddress)}</p>
                </CardBlock>
                <CardBlock title="Occupation Address">
                    <p className="text-slate-800">{formatAddress(item?.occupationAddress)}</p>
                </CardBlock>
            </section>

            {/* ===== Gotra ===== */}
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-2">
                    <h2 className="text-lg font-semibold">Gotra</h2>
                    <ul className="text-slate-700 space-y-1">
                        <li><b>Self:</b> {item.gotra?.self || '—'}</li>
                        <li><b>Mother:</b> {item.gotra?.mother || '—'}</li>
                        <li><b>Nani:</b> {item.gotra?.nani || '—'}</li>
                        <li><b>Dadi:</b> {item.gotra?.dadi || '—'}</li>
                    </ul>
                </div>
            </section>
            {/* ===== Gallery ===== */}
            {item.photos?.length > 1 && (
                <section className="px-4 mt-4">
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">
                        {lang === "hi" ? "गैलरी" : "Gallery"}
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {item.photos.slice(1).map((img, i) => (
                            <img
                                key={i}
                                src={API_File + img}
                                alt={`Gallery ${i + 1}`}
                                className="h-32 w-full object-cover rounded-xl shadow"
                                onError={(e) => {
                                    e.currentTarget.onerror = null
                                    e.currentTarget.src = makeInitialAvatar(item.name || 'Member', { size: 240, radius: 24 })
                                }}
                            />
                        ))}
                    </div>
                </section>
            )}
            {/* ===== Dates ===== */}
            <section className="px-4">
                <div className="rounded-xl bg-white shadow-sm border p-6 space-y-1">
                    <h2 className="text-lg font-semibold">Record Info</h2>

                    <p><b>Created:</b> {item.createdAt ? new Date(item.createdAt).toLocaleString() : '—'}</p>
                    <p><b>Updated:</b> {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : '—'}</p>
                </div>
            </section>

        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <p className="text-slate-700">
            <b>{label}:</b> <span className="break-words">{value}</span>
        </p>
    )
}

function CardBlock({ title, children }) {
    return (
        <div className="rounded-xl bg-white shadow-sm border p-6 space-y-2">
            <h2 className="text-lg font-semibold">{title}</h2>
            {children}
        </div>
    )
}
