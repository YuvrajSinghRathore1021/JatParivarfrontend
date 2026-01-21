// import React, { useEffect, useState } from "react";
// import { useNavigate, Link, useParams } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useLang } from "../../lib/useLang";

// let API_File = import.meta.env.VITE_API_File;
// let API = import.meta.env.VITE_API_URL;

// export default function Gorav() {
//     const { lang } = useLang();
//     const { categoryname } = useParams();

//     // -------------------- FILTER STATES --------------------
//     const [search, setSearch] = useState("");
//     const [category, setCategory] = useState(categoryname); // all
//     const [timeline, setTimeline] = useState(""); // all

//     // -------------------- DATA STATES --------------------
//     const [list, setList] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         loadData();
//     }, [search, category, timeline]);

//     const loadData = async () => {
//         setLoading(true);

//         const params = new URLSearchParams();

//         if (search.trim() !== "") params.append("search", search);
//         if (category !== "") params.append("category", category);
//         if (timeline !== "") params.append("timeline", timeline);

//         try {
//             const res = await fetch(`${API}/public/gaurav?` + params.toString());
//             const json = await res.json();
//             setList(json.data || []);
//         } catch (e) {
//             setList([]);
//             console.error("Fetch error:", e);
//         }

//         setLoading(false);
//     };

//     function urlmake(item) {
//         return `/${lang}/samajKeGaurav/${item._id}`;
//     }

//     return (
//         <div className="container mx-auto p-6">
//             <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

//             {/* -------------------- FILTER BAR -------------------- */}
//             <div className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

//                 {/* Search */}
//                 <input
//                     type="text"
//                     placeholder="Search name or title…"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="border px-3 py-2 rounded w-full"
//                 />

//                 {/* Timeline */}
//                 <select
//                     value={timeline}
//                     onChange={(e) => setTimeline(e.target.value)}
//                     className="border px-3 py-2 rounded w-full"
//                 >
//                     <option value="">All Timeline</option>
//                     <option value="PAST">Past</option>
//                     <option value="PRESENT">Present</option>
//                 </select>

//                 {/* Reset Button */}
//                 <button
//                     onClick={() => {
//                         setSearch("");
//                         setTimeline("");
//                     }}
//                     className="border px-3 py-2 rounded w-full bg-slate-100 hover:bg-slate-200"
//                 >
//                     Reset Filters
//                 </button>
//             </div>

//             {/* -------------------- LIST -------------------- */}
//             {loading ? (
//                 <p>Loading…</p>
//             ) : list.length === 0 ? (
//                 <p>No results found.</p>
//             ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                     {list.map((item) => (
//                         <Link key={item._id} to={urlmake(item)}>
//                             <motion.div
//                                 whileHover={{ scale: 1.03 }}
//                                 className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg"
//                             >
//                                 <img
//                                     src={item.photo ? API_File + item.photo : "/no-img.png"}
//                                     className="w-full h-56 object-cover"
//                                     alt="image"
//                                 />

//                                 <div className="p-4">
//                                     <h3 className="text-lg font-semibold break-words">{item.name}</h3>
//                                     <p className="text-sm text-slate-600 break-words">{item.title}</p>

//                                     {/* Past Category */}
//                                     {item.past?.category && (
//                                         <p className="text-xs text-slate-500 mt-2">
//                                             Past: {item.past.category}
//                                         </p>
//                                     )}

//                                     {/* Present Category */}
//                                     {item.present?.category && (
//                                         <p className="text-xs text-slate-500">
//                                             Present: {item.present.category}
//                                         </p>
//                                     )}
//                                 </div>
//                             </motion.div>
//                         </Link>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }






import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../../lib/useLang";
import { makeInitialAvatar } from "../../lib/avatar";

let API_File = import.meta.env.VITE_API_File;
let API = import.meta.env.VITE_API_URL;

const clamp1 = {
  display: "-webkit-box",
  WebkitLineClamp: 1,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const clamp2 = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const wrapAnywhere = {
  overflowWrap: "anywhere",
  wordBreak: "break-word",
};

const formatCategoryLabel = (value) => {
  if (!value || typeof value !== "string") return "";
  return value
    .split(/[-_ ]+/g)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

function Chip({ children, tone = "slate" }) {
  const toneMap = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
        toneMap[tone] || toneMap.slate
      }`}
    >
      {children}
    </span>
  );
}

function PersonCard({ item, href }) {
  const photo = item.photo
    ? `${API_File || ''}${item.photo}`
    : makeInitialAvatar(item.name || 'Member', { size: 320, radius: 0 })

  return (
    <Link to={href} className="group block">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="relative">
          <img
            src={photo}
            className="h-56 w-full object-cover"
            alt={item.name || "image"}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null
              e.currentTarget.src = makeInitialAvatar(item.name || 'Member', { size: 320, radius: 0 })
            }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />

          <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
            {item?.data?.timeline && (
              <Chip tone={item.data.timeline === "PAST" ? "amber" : "green"}>
                {item.data.timeline}
              </Chip>
            )}
            {item?.data?.category && <Chip tone="blue">{formatCategoryLabel(item.data.category)}</Chip>}
          </div>
        </div>

        <div className="p-4">
          <div className="min-w-0">
            <h3
              className="text-base font-semibold text-slate-900"
              style={{ ...wrapAnywhere, ...clamp1 }}
              title={item.name}
            >
              {item.name}
            </h3>
            <p
              className="mt-1 text-sm text-slate-600"
              style={{ ...wrapAnywhere, ...clamp2 }}
              title={item.title}
            >
              {item.title || "—"}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {item.past?.category && <Chip>Past: {item.past.category}</Chip>}
            {item.present?.category && <Chip>Present: {item.present.category}</Chip>}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function Gorav() {
  const { lang } = useLang();
  const { categoryname } = useParams();

  const [search, setSearch] = useState("");
  const [category] = useState(categoryname);
  const [timeline, setTimeline] = useState("");

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const stats = useMemo(() => {
    const count = list?.length || 0;
    return { count };
  }, [list]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Samaj Ke Gaurav
          </h1>
          <p className="text-sm text-slate-600">
            Browse community achievers • Search and filter instantly
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-6">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
                <span className="text-slate-400">🔎</span>
                <input
                  type="text"
                  placeholder="Search name or title…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 outline-none"
                />
              </div>
            </div>

            <div className="md:col-span-3">
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none"
              >
                <option value="">All Timeline</option>
                <option value="PAST">Past</option>
                <option value="PRESENT">Present</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button
                onClick={() => {
                  setSearch("");
                  setTimeline("");
                }}
                className="h-full w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{stats.count}</span> results
            </p>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[340px] rounded-3xl border border-slate-200 bg-white shadow-sm animate-pulse"
                />
              ))}
            </div>
          ) : list.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🔍
              </div>
              <h2 className="text-base font-semibold text-slate-900">No results found</h2>
              <p className="mt-1 text-sm text-slate-600">
                Try a different name, title, or timeline.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {list.map((item) => (
                <PersonCard key={item._id} item={item} href={urlmake(item)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
