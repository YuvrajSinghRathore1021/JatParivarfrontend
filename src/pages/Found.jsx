import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useLang } from '../lib/useLang'
import { makeInitialAvatar } from '../lib/avatar'
import { get } from '../lib/api'
import { useGeoOptions } from '../hooks/useGeoOptions'
import { asOptions as gotraOptions } from '../constants/gotras'

let API_File = import.meta.env.VITE_API_File

const fetchFounders = () => get('/public/foundpeople?')

export default function Found() {
    const { lang } = useLang()

    // ---------------- FILTER STATES ----------------
    const [stateCode, setStateCode] = useState("")
    const [districtCode, setDistrictCode] = useState("")
    const [cityCode, setCityCode] = useState("")
    const [gotra, setGotra] = useState("")
    const [occupation, setOccupation] = useState("")

    const [isSearchClicked, setIsSearchClicked] = useState(false)

    // ---------------- GEO HOOK ----------------
    const { stateOptions, districtOptions, cityOptions } =
        useGeoOptions(stateCode, districtCode, lang)

    // ---------------- MAIN DATA ----------------
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        if (!stateCode || !districtCode) return
        setLoading(true)
        try {
            const res = await get(`/public/foundpeople?state=${stateCode}&district=${districtCode}&city=${cityCode || ''}&gotra=${gotra || ''}&occupation=${occupation || ''}`)
            setData(res)
        } finally {
            setLoading(false)
        }
    }


    // ---------------- MAP PROFILES ----------------
    const cards = useMemo(() => {
        if (!data) return []

        return data.map((p) => ({
            id: p._id,
            name: p.name,
            title: p.title,
            image: p.photo ? API_File + p.photo : makeInitialAvatar(p.name, { size: 100, radius: 28 }),
            bioEn: p.bioEn,
            bioHi: p.bioHi,
            stateCode: p.stateCode || "",
            districtCode: p.districtCode || "",
            cityCode: p.cityCode || "",
            gotra: p.gotra || "",
            occupation: p.occupation || "",
        }))
    }, [data])

    // ---------------- APPLY FILTER ONLY AFTER SEARCH CLICK ----------------
    const filteredCards = useMemo(() => {
        if (!isSearchClicked) return cards // default → show all

        // State & District are required
        if (!stateCode || !districtCode) return []

        return cards.filter((p) => {
            const matchState = p.stateCode == stateCode
            const matchDistrict = p.districtCode == districtCode
            const matchCity = !cityCode || p.cityCode == cityCode
            const matchGotra = !gotra || p.gotra == gotra
            const matchOccupation = !occupation || p.occupation == occupation

            return matchState && matchDistrict && matchCity && matchGotra && matchOccupation
        })
    }, [cards, isSearchClicked, stateCode, districtCode, cityCode, gotra, occupation])

    const gotraChoices = useMemo(() => gotraOptions(lang), [lang])

    const OCCUPATION = {
        en: [
            { value: 'govt', label: 'Government job' },
            { value: 'private', label: 'Private job' },
            { value: 'business', label: 'Business' },
            { value: 'student', label: 'Student' },
        ],
        hi: [
            { value: 'govt', label: 'सरकारी नौकरी' },
            { value: 'private', label: 'निजी नौकरी' },
            { value: 'business', label: 'व्यवसाय' },
            { value: 'student', label: 'छात्र' },
        ],
    }

    // ---------------- UI ----------------
    return (
        <main className="bg-slate-50">
            <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">

                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        {lang === 'hi' ? ' विवरण' : 'Found Details'}
                    </h1>
                </header>

                {/* ---------------- FILTER CARD ---------------- */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">

                    <div className="grid gap-4 md:grid-cols-5">

                        {/* STATE (Required) */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={stateCode}
                            onChange={e => {
                                setStateCode(e.target.value)
                                setDistrictCode("")
                                setCityCode("")
                            }}
                        >
                            <option value="">{lang === 'hi' ? 'राज्य चुनें *' : 'Select State *'}</option>
                            {stateOptions.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </select>

                        {/* DISTRICT (Required) */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={districtCode}
                            disabled={!stateCode}
                            onChange={e => {
                                setDistrictCode(e.target.value)
                                setCityCode("")
                            }}
                        >
                            <option value="">{lang === 'hi' ? 'जिला चुनें *' : 'Select District *'}</option>
                            {districtOptions.map(d => (
                                <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                        </select>

                        {/* CITY (Optional) */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={cityCode}
                            disabled={!districtCode}
                            onChange={e => setCityCode(e.target.value)}
                        >
                            <option value="">
                                {lang === 'hi' ? 'शहर (वैकल्पिक)' : 'City (Optional)'}
                            </option>
                            {cityOptions.map(c => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>

                        {/* GOTRA (Optional) */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={gotra}
                            onChange={e => setGotra(e.target.value)}
                        >
                            <option value="">
                                {lang === 'hi' ? 'गोत्र (वैकल्पिक)' : 'Gotra (Optional)'}
                            </option>
                            {gotraChoices.map((g, i) => (
                                <option key={i} value={g.value}>{g.label}</option>
                            ))}
                        </select>

                        {/* OCCUPATION (Optional) */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={occupation}
                            onChange={e => setOccupation(e.target.value)}
                        >
                            <option value="">
                                {lang === 'hi' ? 'व्यवसाय (वैकल्पिक)' : 'Occupation (Optional)'}
                            </option>
                            {(lang === 'hi' ? OCCUPATION.hi : OCCUPATION.en).map((o, idx) => (
                                <option key={idx} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* -------- SEARCH / RESET BUTTONS -------- */}
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => {
                                setIsSearchClicked(true)
                                fetchData()
                            }}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow"
                        >
                            {lang === 'hi' ? 'खोजें' : 'Search'}
                        </button>


                        <button
                            onClick={() => {
                                setStateCode("")
                                setDistrictCode("")
                                setCityCode("")
                                setGotra("")
                                setOccupation("")
                                setIsSearchClicked(false)
                            }}
                            className="px-6 py-2 bg-slate-100 text-slate-600 font-medium rounded-xl"
                        >
                            {lang === 'hi' ? 'रीसेट' : 'Reset'}
                        </button>
                    </div>
                </div>

                {/* ---------------- RESULT LIST ---------------- */}
                {filteredCards.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-3xl border shadow-sm text-slate-500">
                        {lang === 'hi'
                            ? 'कृपया राज्य और जिला चुनकर खोजें।'
                            : 'Please select State & District and click Search.'}
                    </div>
                ) : (
                    <section className="grid gap-6 md:grid-cols-2">
                        {filteredCards.map((p) => (
                            <div key={p.id}
                                className="rounded-3xl border bg-white shadow-sm p-6 flex gap-5 hover:border-blue-200 hover:shadow-md transition"
                            >
                                <img
                                    src={p.image}
                                    alt={p.name}
                                    className="h-20 w-20 rounded-2xl object-cover"
                                />

                                <div className="space-y-2">
                                    <h2 className="text-xl font-semibold">{p.name}</h2>
                                    {p.title && (
                                        <p className="text-sm font-medium text-blue-600">{p.title}</p>
                                    )}

                                    {lang === 'hi' ? p.bioHi : p.bioEn ? (
                                        <p className="text-sm text-slate-600 line-clamp-3">
                                            {lang === 'hi' ? p.bioHi : p.bioEn}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </section>
                )}
            </div>
        </main>
    )
}
