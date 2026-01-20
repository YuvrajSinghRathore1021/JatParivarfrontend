import { useMemo, useState, useEffect } from "react";
import { useLang } from "../lib/useLang";
import { Link } from 'react-router-dom'
import { makeInitialAvatar } from "../lib/avatar";
import { get, patch } from "../lib/api";
import { useGeoOptions } from "../hooks/useGeoOptions";
import { useGotraOptions } from "../hooks/useGotraOptions";
import NumberRequestButton from "./NumberRequestButton";

let API_File = import.meta.env.VITE_API_File;

// ---------------- FETCH ALL FOUNDERS ----------------
const fetchFounders = async () => {
    const res = await get("/found/foundpeople?");
    return res.data || [];
};

export default function Found() {
    const { lang, makePath } = useLang();

    // ---------------- FILTER STATES ----------------
    const [stateCode, setStateCode] = useState("");
    const [districtCode, setDistrictCode] = useState("");
    const [cityCode, setCityCode] = useState("");
    const [gotra, setGotra] = useState("");
    const [occupation, setOccupation] = useState("");

    const [isSearchClicked, setIsSearchClicked] = useState(false);
    // ---------------- NUMBER REQUEST STATES ----------------
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [approvalModal, setApprovalModal] = useState(false);

    // ---------------- GEO HOOK ----------------
    const { stateOptions, districtOptions, cityOptions } =
        useGeoOptions(stateCode, districtCode, lang);
    const { gotraOptions: gotraChoices } = useGotraOptions(lang);

    // ---------------- MAIN DATA ----------------
    const [data, setData] = useState([]);

    useEffect(() => {
        fetchFounders().then((all) => setData(all));
    }, [approvalModal]);


    const reloadFounders = async () => {
        const all = await fetchFounders();
        setData(all);
    };


    // ---------------- MAP PROFILES ----------------
    const cards = useMemo(() => {
        if (!data) return [];
        const OCC_LABELS = {
            government_job: lang === 'hi' ? 'सरकारी नौकरी' : 'Government job',
            private_job: lang === 'hi' ? 'निजी नौकरी' : 'Private job',
            business: lang === 'hi' ? 'व्यवसाय' : 'Business',
            student: lang === 'hi' ? 'छात्र' : 'Student'
        };

        return data.map((p) => {
            const addr = p.currentAddress || p.occupationAddress || {};

            return {
                id: p.id,
                name: p.name,
                title: p.displayName,
                designation: p.designation || p.title,
                department: p.department,
                image: p.avatarUrl ? API_File + p.avatarUrl : makeInitialAvatar(p.name, { size: 100, radius: 28 }),
                phone: p.phone || p.alternatePhone,
                contactEmail: p.contactEmail,

                state: addr.state || "",
                district: addr.district || "",
                city: addr.city || "",

                gotra: p.gotra?.self || "",
                occupation: OCC_LABELS[p.occupation] || p.occupation || "",
            };
        });
    }, [data]);



    const loadIncomingRequests = async () => {
        const res = await get("/found/request/incoming");
        setIncomingRequests(res || []);
    };

    const handleRequestDecision = async (reqId, decision) => {

        const res = await patch(`/found/request/approve/${reqId}`, { decision });

        if (res?.success) {
            setIncomingRequests((prev) => prev.filter((r) => r._id !== reqId));
            alert(`Request ${decision}`);
        }
    };



    // ---------------- APPLY FILTER ONLY AFTER SEARCH CLICK ----------------
    const filteredCards = useMemo(() => {
        if (!isSearchClicked) return cards; // show all before searching

        if (!stateCode || !districtCode) return [];

        return cards.filter((p) => {
            const matchState = p.stateCode === stateCode;
            const matchDistrict = p.districtCode === districtCode;
            const matchCity = !cityCode || p.cityCode === cityCode;
            const matchGotra = !gotra || p.gotra === gotra;
            const matchOccupation = !occupation || p.occupation === occupation;

            return (
                matchState &&
                matchDistrict &&
                matchCity &&
                matchGotra &&
                matchOccupation
            );
        });
    }, [cards, isSearchClicked, stateCode, districtCode, cityCode, gotra, occupation]);

    const OCCUPATION = {
    

        en: [
            { value: "government_job", label: "Government job" },
            { value: "private_job", label: "private_job job" },
            { value: "business", label: "Business" },
            { value: "student", label: "Student" },
        ],
        hi: [
            { value: "government_job", label: "सरकारी नौकरी" },
            { value: "private_job", label: "निजी नौकरी" },
            { value: "business", label: "व्यवसाय" },
            { value: "student", label: "छात्र" },
        ],
    };

    return (
        <main className="bg-slate-50">
            <div className="mx-auto max-w-[1100px] px-4 sm:px-6 lg:px-8 py-16 space-y-12">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-extrabold text-slate-900">
                        {lang === "hi" ? "विवरण" : "Found Details"}
                    </h1>

                </header>
                <div className="pt-4">
                    <button
                        onClick={() => {
                            setApprovalModal(true);
                            loadIncomingRequests();
                        }}


                        className="px-6 py-2 bg-purple-600 text-white rounded-xl shadow"
                    >
                        {lang === "hi" ? "नंबर रिक्वेस्ट देखें" : "View Number Requests"}
                    </button>
                </div>



                {/* ---------------- FILTER CARD ---------------- */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border space-y-6">
                    <div className="grid gap-4 md:grid-cols-5">
                        {/* STATE */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={stateCode}
                            onChange={(e) => {
                                setStateCode(e.target.value);
                                setDistrictCode("");
                                setCityCode("");
                            }}
                        >
                            <option value="">
                                {lang === "hi" ? "राज्य चुनें *" : "Select State *"}
                            </option>
                            {stateOptions.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>

                        {/* DISTRICT */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={districtCode}
                            disabled={!stateCode}
                            onChange={(e) => {
                                setDistrictCode(e.target.value);
                                setCityCode("");
                            }}
                        >
                            <option value="">
                                {lang === "hi" ? "जिला चुनें *" : "Select District *"}
                            </option>
                            {districtOptions.map((d) => (
                                <option key={d.value} value={d.value}>
                                    {d.label}
                                </option>
                            ))}
                        </select>

                        {/* CITY */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={cityCode}
                            disabled={!districtCode}
                            onChange={(e) => setCityCode(e.target.value)}
                        >
                            <option value="">
                                {lang === "hi" ? "शहर (वैकल्पिक)" : "City (Optional)"}
                            </option>
                            {cityOptions.map((c) => (
                                <option key={c.value} value={c.value}>
                                    {c.label}
                                </option>
                            ))}
                        </select>

                        {/* GOTRA */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={gotra}
                            onChange={(e) => setGotra(e.target.value)}
                        >
                            <option value="">
                                {lang === "hi" ? "गोत्र (वैकल्पिक)" : "Gotra (Optional)"}
                            </option>
                            {gotraChoices.map((g, i) => (
                                <option key={i} value={g.value}>
                                    {g.label}
                                </option>
                            ))}
                        </select>

                        {/* OCCUPATION */}
                        <select
                            className="rounded-xl border px-3 py-2"
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                        >
                            <option value="">
                                {lang === "hi" ? "व्यवसाय (वैकल्पिक)" : "Occupation (Optional)"}
                            </option>
                            {(lang === "hi" ? OCCUPATION.hi : OCCUPATION.en).map((o, idx) => (
                                <option key={idx} value={o.value}>
                                    {o.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* BUTTONS */}
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setIsSearchClicked(true)}
                            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl shadow"
                        >
                            {lang === "hi" ? "खोजें" : "Search"}
                        </button>

                        <button
                            onClick={() => {
                                setStateCode("");
                                setDistrictCode("");
                                setCityCode("");
                                setGotra("");
                                setOccupation("");
                                setIsSearchClicked(false);
                            }}
                            className="px-6 py-2 bg-slate-100 text-slate-600 font-medium rounded-xl"
                        >
                            {lang === "hi" ? "रीसेट" : "Reset"}
                        </button>
                    </div>
                </div>

                {/* ---------------- RESULT LIST ---------------- */}
                {filteredCards.length === 0 ? (
                    <div className="text-center p-10 bg-white rounded-3xl border shadow-sm text-slate-500">
                        {lang === "hi" ? "कृपया राज्य और जिला चुनकर खोजें।"
                            : "Please select State & District and click Search."}
                    </div>
                ) : (
                    <section className="grid gap-6 md:grid-cols-2">
                        {filteredCards.map((p) => (
                            <Link
                                key={p.id}
                                to={makePath(`/dashboard/found/${p.id}`)}
                                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-blue-300 hover:shadow-md"
                            >
                                <div
                                    key={p.id}
                                    className="rounded-3xl border bg-white shadow-sm p-6 flex gap-5 hover:border-blue-200 hover:shadow-md transition"
                                >
                                    {/* PHOTO */}
                                    <img
                                        src={p.image}
                                        alt="image"
                                        className="h-20 w-20 rounded-2xl object-cover bg-slate-100"
                                        onError={(e) => {
                                            e.currentTarget.onerror = null;
                                            e.currentTarget.src = makeInitialAvatar(p.name || 'Member', { size: 100, radius: 28 });
                                        }}
                                    />

                                    {/* DETAILS */}
                                    <div className="flex-1 space-y-1">
                                        {/* NAME */}
                                        <h2 className="text-xl font-semibold text-slate-900 break-all line-clamp-2">
                                            {p.name}
                                        </h2>

                                        {/* TITLE / DISPLAY NAME */}
                                        {p.designation && (
                                            <p className="text-sm font-medium text-blue-600 break-all line-clamp-2">
                                                {p.designation}
                                            </p>
                                        )}
                                        {p.department && (
                                            <p className="text-xs text-slate-600 break-all line-clamp-2">{p.department}</p>
                                        )}

                                        {/* GOTRA */}
                                        {p.gotra && (
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">Gotra:</span> {p.gotra}
                                            </p>
                                        )}

                                        {/* OCCUPATION */}
                                        {p.occupation && (
                                            <p className="text-sm text-slate-600">
                                                <span className="font-medium">Occupation:</span> {p.occupation}
                                            </p>
                                        )}

                                        {/* ADDRESS */}
                                        <p className="text-sm text-slate-700">
                                            <span className="font-medium">Address:</span>{" "}
                                            {[p.city, p.district, p.state].filter(Boolean).join(", ") || "—"}
                                        </p>

                                        {/* VIEW MORE */}
                                        {/* <div className="pt-2">
                                        <button
                                            className="text-blue-600 font-medium text-sm hover:underline"
                                        >
                                            View Details →
                                        </button>
                                        </div> */}
                                        {/* NUMBER REQUEST BUTTON */}
                                        <div className="pt-2">
                                            <NumberRequestButton receiverId={p.id} />
                                        </div>
                                    </div>
                                </div></Link>
                        ))}
                    </section>

                )}
            </div>
            {approvalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">

                        <h2 className="text-xl font-bold mb-4 text-slate-800">
                            {lang === "hi" ? "लंबित रिक्वेस्ट" : "Pending Requests"}
                        </h2>

                        {/* {incomingRequests.length === 0 ? (
                            <p className="text-center text-slate-600 py-4">
                                {lang === "hi"
                                    ? "कोई लंबित अनुरोध नहीं है।"
                                    : "No pending requests."}
                            </p>
                        ) : (
                            incomingRequests.map((r) => (
                                <div key={r._id} className="border rounded-xl p-4 mb-3">
                                    <p className="font-semibold">{r.requesterId?.name}</p>
                                    <p className="text-sm text-slate-600">
                                        {lang === "hi"
                                            ? "आपका नंबर देखना चाहता है"
                                            : "wants to view your number"}
                                    </p>

                                    <div className="flex gap-3 mt-3">
                                        <button
                                            onClick={() =>
                                                handleRequestDecision(r._id, "approved")
                                            }
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                        >
                                            {lang === "hi" ? "स्वीकृत" : "Approve"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleRequestDecision(r._id, "rejected")
                                            }
                                            className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                        >
                                            {lang === "hi" ? "अस्वीकृत" : "Reject"}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )} */}


                        {incomingRequests.length === 0 ? (
                            <p className="text-center text-slate-600 py-4">
                                {lang === "hi" ? "कोई लंबित अनुरोध नहीं है।" : "No pending requests."}
                            </p>
                        ) : (
                            incomingRequests.map((r) => (
                                <div key={r._id} className="border rounded-xl p-4 mb-3 flex items-center gap-4">

                                    {/* User Image */}
                                    <img
                                        src={API_File + r.senderId?.avatarUrl}
                                        alt="image"
                                        className="w-12 h-12 rounded-full object-cover border"
                                    />

                                    <div className="flex-1">
                                        {/* User Name */}
                                        <p className="font-semibold text-slate-800">{r.senderId?.name}</p>

                                        {/* Info */}
                                        <p className="text-sm text-slate-600">
                                            {lang === "hi"
                                                ? "आपका नंबर देखना चाहता है"
                                                : "wants to view your number"}
                                        </p>

                                        {/* Buttons */}
                                        <div className="flex gap-3 mt-3">
                                            <button
                                                onClick={() => handleRequestDecision(r._id, "approved")}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg"
                                            >
                                                {lang === "hi" ? "स्वीकृत" : "Approve"}
                                            </button>

                                            <button
                                                onClick={() => handleRequestDecision(r._id, "rejected")}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg"
                                            >
                                                {lang === "hi" ? "अस्वीकृत" : "Reject"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        <button
                            onClick={() => {
                                setApprovalModal(false)
                                reloadFounders();
                            }}
                            className="mt-4 w-full py-2 bg-slate-200 rounded-xl font-medium"
                        >
                            {lang === "hi" ? "बंद करें" : "Close"}
                        </button>
                    </div>
                </div>
            )}




        </main>
    );
}

