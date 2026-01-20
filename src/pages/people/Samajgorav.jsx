

// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { motion } from "framer-motion";
// import { useLang } from "../../lib/useLang";

// let API_File = import.meta.env.VITE_API_File;
// let API = import.meta.env.VITE_API_URL;

// export default function SamajKeGaurav() {
//   const { lang } = useLang();

//   const [timeline, setTimeline] = useState("PRESENT");
//   const [search, setSearch] = useState("");
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // FIXED CATEGORY ORDER
//   const categories = [
//     "politics",
//     "adhikari",
//     "education",
//     "medical",
//     "games",
//     "samaj-sevi",
//     "other",
//   ];
 
//   useEffect(() => {
//     loadData();
//   }, [timeline, search]);

//   const loadData = async () => {
//     setLoading(true);

//     const params = new URLSearchParams();
//     params.append("timeline", timeline);
//     if (search.trim() !== "") params.append("search", search);

//     try {
//       const res = await fetch(`${API}/public/gaurav?` + params.toString());
//       const json = await res.json();
//       setList(json.data || []);
//     } catch (e) {
//       console.log(e);
//       setList([]);
//     }

//     setLoading(false);
//   };

//   function urlmake(item) {
//     return `/${lang}/samajKeGaurav/${item._id}`;
//   }

//   function urlmakeNew(item) {
//     return `/${lang}/samaj_ke_gaurav/${item}`;
//   }

//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

//       {/* -------------------- TIMELINE BUTTONS -------------------- */}
//       <div className="flex gap-4 mb-6">
//         <button
//           onClick={() => setTimeline("PRESENT")}
//           className={`px-5 py-2 rounded-xl border font-semibold 
//             ${timeline === "PRESENT" ? "bg-blue-600 text-white" : "bg-white"}
//           `}
//         >
//           PRESENT
//         </button>

//         <button
//           onClick={() => setTimeline("PAST")}
//           className={`px-5 py-2 rounded-xl border font-semibold
//             ${timeline === "PAST" ? "bg-blue-600 text-white" : "bg-white"}
//           `}
//         >
//           PAST
//         </button>
//       </div>

//       {/* -------------------- SEARCH -------------------- */}
//       <input
//         type="text"
//         placeholder="Search name or title…"
//         value={search}
//         onChange={(e) => setSearch(e.target.value)}
//         className="border px-3 py-2 rounded w-full mb-6"
//       />

//       {/* -------------------- GROUPED CATEGORY VIEW -------------------- */}
//       {loading ? (
//         <p>Loading…</p>
//       ) : (
        
//         categories.map((cat) => {
//           // Filter category items
//              console.log("list====",list);
//           const catItems = list
//             .filter(
//               (i) =>
//                 (i?.data?.category === cat)
//             )
//             .slice(0, 10); // SHOW ONLY 10 PEOPLE

//           if (catItems.length === 0) return null; 
       

//           return (
//             <div key={cat} className="mb-10">
//               {/* CATEGORY TITLE */}
//               <h2 className="text-2xl font-bold mb-4 capitalize">
//                 <Link to={urlmakeNew(cat)}>
//                   {cat} ({catItems.length})
//                 </Link>
//               </h2>

//               {/* CATEGORY GRID */}
//               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//                 {catItems.map((item) => (
//                   <Link key={item._id} to={urlmake(item)}>
//                     <motion.div
//                       whileHover={{ scale: 1.03 }}
//                       className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg"
//                     >
//                       <img
//                         src={item.photo ? API_File + item.photo : "/no-img.png"}
//                         className="w-full h-56 object-cover"
//                         alt="image"
//                       />

//                       <div className="p-4">
//                         <h3 className="text-lg font-semibold break-words">{item.name}</h3>
//                         <p className="text-sm text-slate-600 break-words">{item.title}</p>
//                       </div>
//                     </motion.div>
//                   </Link>
//                 ))}
//               </div>
//             </div>
//           );
//         })
//       )}
//     </div>
//   );
// }











import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../../lib/useLang";

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

function PersonCard({ item, href }) {
  return (
    <Link to={href} className="group block">
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="relative">
          <img
            src={item.photo ? API_File + item.photo : "/no-img.png"}
            className="h-56 w-full object-cover"
            alt={item.name || "image"}
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
        </div>

        <div className="p-4">
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
      </motion.div>
    </Link>
  );
}

function TimelinePill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-slate-900 text-white shadow"
          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function SamajKeGaurav() {
  const { lang } = useLang();

  const [timeline, setTimeline] = useState("PRESENT");
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = useMemo(
    () => [
      "politics",
      "adhikari",
      "education",
      "medical",
      "games",
      "samaj-sevi",
      "other",
    ],
    []
  );

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Samaj Ke Gaurav
          </h1>
          <p className="text-sm text-slate-600">
            Browse by timeline and category • Discover achievers across fields
          </p>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              <TimelinePill
                active={timeline === "PRESENT"}
                onClick={() => setTimeline("PRESENT")}
              >
                PRESENT
              </TimelinePill>
              <TimelinePill
                active={timeline === "PAST"}
                onClick={() => setTimeline("PAST")}
              >
                PAST
              </TimelinePill>
            </div>

            <div className="w-full md:max-w-md">
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
          ) : (
            categories.map((cat) => {
              const catItems = list
                .filter((i) => i?.data?.category === cat)
                .slice(0, 10);

              if (catItems.length === 0) return null;

              return (
                <section key={cat} className="mb-10">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <h2 className="text-xl font-bold text-slate-900 sm:text-2xl capitalize">
                      <Link
                        to={urlmakeNew(cat)}
                        className="hover:underline underline-offset-4"
                      >
                        {cat}
                      </Link>
                      <span className="ml-2 text-sm font-semibold text-slate-500">
                        ({catItems.length})
                      </span>
                    </h2>

                    <Link
                      to={urlmakeNew(cat)}
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View all →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {catItems.map((item) => (
                      <PersonCard key={item._id} item={item} href={urlmake(item)} />
                    ))}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}