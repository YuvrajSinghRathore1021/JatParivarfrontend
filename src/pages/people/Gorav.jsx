import React, { useEffect, useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../../lib/useLang";

let API_File = import.meta.env.VITE_API_File;
let API = import.meta.env.VITE_API_URL;

export default function Gorav() {
    const { lang } = useLang();
    const { categoryname } = useParams();

    // -------------------- FILTER STATES --------------------
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState(categoryname); // all
    const [timeline, setTimeline] = useState(""); // all

    // -------------------- DATA STATES --------------------
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [search, category, timeline]);

    const loadData = async () => {
        setLoading(true);

        const params = new URLSearchParams();

        if (search.trim() !== "") params.append("search", search);
        if (category !== "") params.append("category", category);
        if (timeline !== "") params.append("timeline", timeline);

        try {
            const res = await fetch(`${API}/public/gaurav?` + params.toString());
            const json = await res.json();
            setList(json.data || []);
        } catch (e) {
            setList([]);
            console.error("Fetch error:", e);
        }

        setLoading(false);
    };

    function urlmake(item) {
        return `/${lang}/samajKeGaurav/${item._id}`;
    }

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

            {/* -------------------- FILTER BAR -------------------- */}
            <div className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Search */}
                <input
                    type="text"
                    placeholder="Search name or title…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                />

                {/* Timeline */}
                <select
                    value={timeline}
                    onChange={(e) => setTimeline(e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                >
                    <option value="">All Timeline</option>
                    <option value="PAST">Past</option>
                    <option value="PRESENT">Present</option>
                </select>

                {/* Reset Button */}
                <button
                    onClick={() => {
                        setSearch("");
                        setTimeline("");
                    }}
                    className="border px-3 py-2 rounded w-full bg-slate-100 hover:bg-slate-200"
                >
                    Reset Filters
                </button>
            </div>

            {/* -------------------- LIST -------------------- */}
            {loading ? (
                <p>Loading…</p>
            ) : list.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {list.map((item) => (
                        <Link key={item._id} to={urlmake(item)}>
                            <motion.div
                                whileHover={{ scale: 1.03 }}
                                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg"
                            >
                                <img
                                    src={item.photo ? API_File + item.photo : "/no-img.png"}
                                    className="w-full h-56 object-cover"
                                    alt="image"
                                />

                                <div className="p-4">
                                    <h3 className="text-lg font-semibold break-words">{item.name}</h3>
                                    <p className="text-sm text-slate-600 break-words">{item.title}</p>

                                    {/* Past Category */}
                                    {item.past?.category && (
                                        <p className="text-xs text-slate-500 mt-2">
                                            Past: {item.past.category}
                                        </p>
                                    )}

                                    {/* Present Category */}
                                    {item.present?.category && (
                                        <p className="text-xs text-slate-500">
                                            Present: {item.present.category}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}



