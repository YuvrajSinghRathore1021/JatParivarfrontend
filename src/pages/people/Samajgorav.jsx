// import React, { useEffect, useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useLang } from "../../lib/useLang";

// let API_File = import.meta.env.VITE_API_File;
// let API = import.meta.env.VITE_API_URL;

// export default function SamajKeGaurav() {
//   const { lang } = useLang();

//   // -------------------- FILTER STATES --------------------
//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState(""); // all
//   const [timeline, setTimeline] = useState(""); // all

//   // -------------------- DATA STATES --------------------
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const categories = ['games', 'politics', 'education',
//     'medical', 'samaj-sevi', 'adhikari', 'other'];

//   useEffect(() => {
//     loadData();
//   }, [search, category, timeline]);

//   const loadData = async () => {
//     setLoading(true);

//     const params = new URLSearchParams();

//     if (search.trim() !== "") params.append("search", search);
//     if (category !== "") params.append("category", category);
//     if (timeline !== "") params.append("timeline", timeline);

//     try {
//       const res = await fetch(`${API}/public/gaurav?` + params.toString());
//       const json = await res.json();
//       setList(json.data || []);
//     } catch (e) {
//       setList([]);
//       console.error("Fetch error:", e);
//     }

//     setLoading(false);
//   };

//   function urlmake(item) {
//     return `/${lang}/samajKeGaurav/${item._id}`;
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

//       {/* -------------------- FILTER BAR -------------------- */}
//       <div className="bg-white shadow rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

//         {/* Search */}
//         <input
//           type="text"
//           placeholder="Search name or title…"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//           className="border px-3 py-2 rounded w-full"
//         />

//         {/* Category */}
//         <select
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//           className="border px-3 py-2 rounded w-full"
//         >
//           <option value="">All Categories</option>
//           {categories.map((c) => (
//             <option key={c} value={c}>
//               {c}
//             </option>
//           ))}
//         </select>

//         {/* Timeline */}
//         <select
//           value={timeline}
//           onChange={(e) => setTimeline(e.target.value)}
//           className="border px-3 py-2 rounded w-full"
//         >
//           <option value="">All Timeline</option>
//           <option value="PAST">Past</option>
//           <option value="PRESENT">Present</option>
//         </select>

//         {/* Reset Button */}
//         <button
//           onClick={() => {
//             setSearch("");
//             setCategory("");
//             setTimeline("");
//           }}
//           className="border px-3 py-2 rounded w-full bg-slate-100 hover:bg-slate-200"
//         >
//           Reset Filters
//         </button>
//       </div>

//       {/* -------------------- LIST -------------------- */}
//       {loading ? (
//         <p>Loading…</p>
//       ) : list.length === 0 ? (
//         <p>No results found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {list.map((item) => (
//             <Link key={item._id} to={urlmake(item)}>
//               <motion.div
//                 whileHover={{ scale: 1.03 }}
//                 className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg"
//               >
//                 <img
//                   src={item.photo ? API_File + item.photo : "/no-img.png"}
//                   className="w-full h-56 object-cover"
//                   alt={item.name}
//                 />

//                 <div className="p-4">
//                   <h3 className="text-lg font-semibold">{item.name}</h3>
//                   <p className="text-sm text-slate-600">{item.title}</p>

//                   {/* Past Category */}
//                   {item.past?.category && (
//                     <p className="text-xs text-slate-500 mt-2">
//                       Past: {item.past.category}
//                     </p>
//                   )}

//                   {/* Present Category */}
//                   {item.present?.category && (
//                     <p className="text-xs text-slate-500">
//                       Present: {item.present.category}
//                     </p>
//                   )}
//                 </div>
//               </motion.div>
//             </Link>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }















import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../../lib/useLang";

let API_File = import.meta.env.VITE_API_File;
let API = import.meta.env.VITE_API_URL;

export default function SamajKeGaurav() {
  const { lang } = useLang();

  const [timeline, setTimeline] = useState("PRESENT"); // default PRESENT
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED CATEGORY ORDER
  const categories = [
    "politics",
    "adhikari",
    "education",
    "medical",
    "game",
    "samaj-sevi",
    "other",
  ];

  useEffect(() => {
    loadData();
  }, [timeline, search]);

  const loadData = async () => {
    setLoading(true);

    const params = new URLSearchParams();
    params.append("timeline", timeline);
    if (search.trim() !== "") params.append("search", search);

    try {
      const res = await fetch(`${API}/public/gaurav?` + params.toString());
      const json = await res.json();
      setList(json.data || []);
    } catch (e) {
      console.log(e);
      setList([]);
    }

    setLoading(false);
  };

  function urlmake(item) {
    return `/${lang}/samajKeGaurav/${item._id}`;
  }

  function urlmakeNew(item) {
    return `/${lang}/samaj_ke_gaurav/${item}`;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

      {/* -------------------- TIMELINE BUTTONS -------------------- */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTimeline("PRESENT")}
          className={`px-5 py-2 rounded-xl border font-semibold 
            ${timeline === "PRESENT" ? "bg-blue-600 text-white" : "bg-white"}
          `}
        >
          PRESENT
        </button>

        <button
          onClick={() => setTimeline("PAST")}
          className={`px-5 py-2 rounded-xl border font-semibold
            ${timeline === "PAST" ? "bg-blue-600 text-white" : "bg-white"}
          `}
        >
          PAST
        </button>
      </div>

      {/* -------------------- SEARCH -------------------- */}
      <input
        type="text"
        placeholder="Search name or title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="border px-3 py-2 rounded w-full mb-6"
      />

      {/* -------------------- GROUPED CATEGORY VIEW -------------------- */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        categories.map((cat) => {
          // Filter category items
          const catItems = list
            .filter(
              (i) =>
                (i?.present?.category === cat && timeline === "PRESENT") ||
                (i?.past?.category === cat && timeline === "PAST")
            )
            .slice(0, 10); // SHOW ONLY 10 PEOPLE

          if (catItems.length === 0) return null; // Skip empty category

          return (
            <div key={cat} className="mb-10">
              {/* CATEGORY TITLE */}
              <h2 className="text-2xl font-bold mb-4 capitalize">
                <Link to={urlmakeNew(cat)}>
                  {cat} ({catItems.length})
                </Link>
              </h2>

              {/* CATEGORY GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {catItems.map((item) => (
                  <Link key={item._id} to={urlmake(item)}>
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg"
                    >
                      <img
                        src={item.photo ? API_File + item.photo : "/no-img.png"}
                        className="w-full h-56 object-cover"
                        alt={item.name}
                      />

                      <div className="p-4">
                        <h3 className="text-lg font-semibold">{item.name}</h3>
                        <p className="text-sm text-slate-600">{item.title}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
