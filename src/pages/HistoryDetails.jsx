import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { get } from '../lib/api'
import { useLang } from '../lib/useLang'
let API_File = import.meta.env.VITE_API_File

const fetchHistoryDetail = (id) => get(`/public/history/${id}`)

export default function HistoryDetails() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { lang, makePath } = useLang()
    const langKey = lang === "hi" ? "hi" : "en"
    let Newlang=lang == "hi" ? "Hi" : "En"

    const { data: item, isLoading, error } = useQuery({
        queryKey: ['history-detail', id],
        queryFn: () => fetchHistoryDetail(id),
        enabled: Boolean(id),
    })
    console.log("History Detail Item:", item);

    const backToList = () => navigate(makePath("history"))

    return (
        <main className="bg-slate-50 pb-20">

            {/* BANNER */}
            <div className="relative w-full h-56 md:h-64 lg:h-72 bg-slate-200 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/0"></div>

                {item?.bannerUrl ? (
                    <img src={API_File + item.bannerUrl} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-slate-300" />
                )}

                <button
                    onClick={backToList}
                    className="absolute top-4 left-4 px-4 py-2 rounded-full 
                     bg-white/60 backdrop-blur-md text-slate-700 shadow-md
                     border border-white/40 hover:bg-white/90"
                >
                    ← {lang === "hi" ? "वापस जाएं" : "Back"}
                </button>
            </div>

            {/* CONTENT */}
            <div className="max-w-[900px] mx-auto px-4 -mt-20 relative z-10">

                {isLoading ? (
                    <div className="h-48 bg-white shadow-sm rounded-3xl animate-pulse" />
                ) : error || !item ? (
                    <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-600">
                        {langKey === "hi" ? "डेटा उपलब्ध नहीं है" : "Data not available"}
                    </div>
                ) : (
                    <article className="space-y-6">

                        {/* HEADER CARD */}
                        <section className="rounded-3xl bg-white border shadow p-6">

                            <h1 className="text-3xl font-bold text-slate-900">{item[`title${Newlang}`]}</h1>

                            <p className="text-blue-600 mt-2">
                                {langKey === "hi" ? "वर्ष" : "Year"}: {item.year}
                            </p>

                            {item.category && (
                                <p className="text-amber-600 font-medium mt-1">
                                    {langKey === "hi" ? "श्रेणी" : "Category"}: {item.category}
                                </p>
                            )}

                        </section>

                        {/* BODY CARD */}
                        <section className="rounded-3xl bg-white border shadow p-6 space-y-3">
                            <h2 className="text-xl font-semibold text-slate-900">
                                {langKey === "hi" ? "विवरण" : "Details"}
                            </h2>

                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                {item[`body${Newlang}`]}
                            </p>
                        </section>

                    </article>
                )}

            </div>
        </main>
    )
}
