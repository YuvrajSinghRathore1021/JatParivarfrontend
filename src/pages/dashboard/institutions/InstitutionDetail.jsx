
// import { useMemo, useState } from 'react'
// import { useQuery } from '@tanstack/react-query'
// import { fetchInstitutions } from '../../../lib/dashboardApi'
// import { useLang } from '../../../lib/useLang'
// import { useParams } from "react-router-dom";

// const copy = {
//     dharamshala: {
//         titleHi: 'धर्मशाला सूची',
//         titleEn: 'Dharamshala listings',
//         searchHi: 'नाम या शहर से खोजें…',
//         searchEn: 'Search by name or city…',
//     },
//     sanstha: {
//         titleHi: 'संस्था सूची',
//         titleEn: 'Sanstha listings',
//         searchHi: 'नाम या शहर से खोजें…',
//         searchEn: 'Search by name or city…',
//     },
// }

// export default function InstitutionDetail({ kind }) {
//     console.log("kind", kind);
//     const { id } = useParams();
//     const { lang } = useLang()
//     const [query, setQuery] = useState('')
//     const { data, isLoading } = useQuery({ queryKey: ['institutions', kind, id], queryFn: () => fetchInstitutions(kind, id) })
//     const labels = copy[kind] || copy.dharamshala

//     const filtered = useMemo(() => {
//         const list = data || []
//         if (!query) return list
//         const lower = query.toLowerCase()
//         return list.filter((item) => {
//             const text = `${item.titleEn} ${item.titleHi} ${item.city} ${item.state}`.toLowerCase()
//             return text.includes(lower)
//         })
//     }, [data, query])

//     return (
//         <div className="space-y-6">
//             <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//                 <div>
//                     <h2 className="text-2xl font-semibold text-slate-900">{lang === 'hi' ? labels.titleHi : labels.titleEn}</h2>
//                     <p className="text-sm text-slate-600">
//                         {lang === 'hi'
//                             ? 'यहाँ केवल व्यवस्थापक द्वारा स्वीकृत सूची दिखाई देती है।'
//                             : 'Only admin-approved listings are visible here.'}
//                     </p>
//                 </div>
//                 <input
//                     value={query}
//                     onChange={(e) => setQuery(e.target.value)}
//                     placeholder={lang === 'hi' ? labels.searchHi : labels.searchEn}
//                     className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm md:w-64"
//                 />
//             </header>

//             {isLoading ? (
//                 <div className="grid gap-4 md:grid-cols-2">
//                     {Array.from({ length: 4 }).map((_, idx) => (
//                         <div key={idx} className="h-48 rounded-3xl bg-white shadow-sm animate-pulse" aria-hidden="true" />
//                     ))}
//                 </div>
//             ) : filtered.length === 0 ? (
//                 <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
//                     {lang === 'hi' ? 'कोई सूची उपलब्ध नहीं है।' : 'No listings available yet.'}
//                 </div>
//             ) : (
//                 <div className="grid gap-4 md:grid-cols-2">
//                     {filtered.map((item) => (
//                         <article key={item._id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
//                             <div>
//                                 <h3 className="text-lg font-semibold text-slate-900">{lang === 'hi' ? item.titleHi || item.titleEn : item.titleEn || item.titleHi}</h3>
//                                 <p className="text-sm text-slate-500">{lang === 'hi' ? item.descriptionHi || item.descriptionEn : item.descriptionEn || item.descriptionHi}</p>
//                             </div>
//                             <p className="text-xs uppercase tracking-wide text-slate-400">
//                                 {[item.city, item.state].filter(Boolean).join(', ') || '—'}
//                             </p>
//                             {item.contact?.phone && (
//                                 <p className="text-sm text-slate-700">{lang === 'hi' ? 'संपर्क:' : 'Phone:'} {item.contact.phone}</p>
//                             )}
//                             {item.contact?.email && (
//                                 <p className="text-sm text-slate-700">{lang === 'hi' ? 'ईमेल:' : 'Email:'} {item.contact.email}</p>
//                             )}
//                         </article>
//                     ))}
//                 </div>
//             )}
//         </div>
//     )
// }































import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { fetchInstitutions } from "../../../lib/dashboardApi";
import { useLang } from "../../../lib/useLang";

export default function InstitutionDetail({ kind, web = false }) {
    const { id } = useParams();
    const { lang } = useLang();

    const { data: item, isLoading } = useQuery({
        queryKey: ["institution", kind, id],
        queryFn: () => fetchInstitutions(kind, id),
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

    const title = lang === "hi" ? item.titleHi || item.titleEn : item.titleEn || item.titleHi;
    const desc = lang === "hi" ? item.descriptionHi || item.descriptionEn : item.descriptionEn || item.descriptionHi;

    return (
        <div className={web == true ? 'mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-10' : 'space-y-8 pb-20'}>
            {/* <div className="space-y-8 pb-20"> */}

            {/* ===== Banner ===== */}
            {/* <div className="relative h-48 md:h-64 w-full bg-slate-100 rounded-2xl overflow-hidden shadow">
                {item.images?.length > 0 ? (
                    <img
                        src={item.images[0]?.url}
                        alt="image"
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        {lang === "hi" ? "कोई फोटो उपलब्ध नहीं" : "No Image Available"}
                    </div>
                )}
            </div> */}

            {/* ===== Title + Description ===== */}
            <section className="px-4 space-y-3">
                <h1 className="text-3xl font-bold text-slate-900 break-all  ">{title}</h1>
                {kind == "sanstha" && (
                    <p className="text-sm text-slate-500 ">{lang === 'hi' ? 'व्यवसाय:' : 'Business:'} {lang === 'hi' ? item?.businessHi || item?.businessEn : item?.businessEn || item?.businessHi}</p>
                )}
                <p className="text-slate-600 break-all">{desc}</p>
            </section>

            {/* ===== Address Card ===== */}
            <section className="px-4">
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 space-y-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {lang === "hi" ? "पता" : "Address"}
                    </h2>

                    <p className="text-slate-700">{item.addressEn}</p>

                    <p className="text-sm text-slate-500">
                        {[item.city, item.district, item.state, item.pin].filter(Boolean).join(", ")}
                    </p>
                </div>
            </section>

            {/* ===== Main Contact ===== */}
            <section className="px-4">
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 space-y-3">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {lang === "hi" ? "मुख्य संपर्क" : "Primary Contact"}
                    </h2>

                    {item.contact ? (
                        <ul className="text-slate-700 space-y-1">
                            <li><b>{lang === "hi" ? "नाम:" : "Name:"}</b> {item.contact.name}</li>
                            <li><b>{lang === "hi" ? "फोन:" : "Phone:"}</b> {item.contact.phone}</li>
                            <li><b>{lang === "hi" ? "ईमेल:" : "Email:"}</b> {item.contact.email}</li>
                        </ul>
                    ) : (
                        <p className="text-slate-500">
                            {lang === "hi" ? "कोई संपर्क उपलब्ध नहीं" : "No contact available"}
                        </p>
                    )}
                </div>
            </section>

            {/* ===== Contact Persons ===== */}
            <section className="px-4">
                <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6 space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">
                        {lang === "hi" ? "संपर्क व्यक्ति" : "Contact Persons"}
                    </h2>

                    {item.contactpersons?.length ? (
                        item.contactpersons.map((p) => (
                            <div key={p._id} className="border-b border-slate-200 pb-2 last:border-0">
                                <p className="font-semibold text-slate-800">{p.name}</p>
                                <p className="text-sm text-slate-600">{p.post}</p>
                                <p className="text-sm text-slate-600">{p.phone}</p>
                                <p className="text-sm text-slate-600">{p.email}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500">
                            {lang === "hi" ? "कोई संपर्क व्यक्ति नहीं" : "No contact persons available"}
                        </p>
                    )}
                </div>
            </section>

            {/* ===== Gallery ===== */}
            {item.images?.length > 1 && (
                <section className="px-4">
                    <h2 className="text-lg font-semibold text-slate-900 mb-3">
                        {lang === "hi" ? "गैलरी" : "Gallery"}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {item.images.map((img, index) => (
                            <img
                                key={index}
                                src={img.url}
                                alt="image"
                                className="h-32 w-full object-cover rounded-xl shadow"
                            />
                        ))}
                    </div>
                </section>
            )}

        </div>
    );
}
