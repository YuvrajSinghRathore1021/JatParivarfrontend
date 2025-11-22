// // import React, { useState, useEffect } from "react";
// // import { motion } from "framer-motion";
// // import { useNavigate } from "react-router-dom";

// // const SAMPLE_DATA = [
// //   {
// //     id: 1,
// //     name: "Dr. Asha Verma",
// //     role: "Community Health Advocate",
// //     photo: "https://manavrachna.edu.in/uploads/mentor/675694335c7331733727283.jpeg",
// //     shortBio: "30+ years serving maternal & child health programs.",
// //     category: "Health",
// //     year: 2024,
// //   },
// //   {
// //     id: 2,
// //     name: "Ramesh Kumar",
// //     role: "Education Sponsor & Philanthropist",
// //     photo: "https://indianexpress.com/wp-content/uploads/2019/07/k-r-ramesh.jpg",
// //     shortBio: "Built scholarships and 2 schools in rural areas.",
// //     category: "Education",
// //     year: 2023,
// //   },
// // ];

// // function ProfileCard({ person, onClick }) {
// //   return (
// //     <motion.div
// //       whileHover={{ scale: 1.03 }}
// //       onClick={onClick}
// //       className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
// //     >
// //       <div className="w-full aspect-square overflow-hidden">
// //         <img
// //           src={person.photo}
// //           alt={person.name}
// //           className="w-full h-full object-cover"
// //         />
// //       </div>

// //       <div className="p-4">
// //         <h3 className="text-lg font-semibold">{person.name}</h3>
// //         <p className="text-sm text-slate-600">{person.role}</p>

// //         <p className="text-sm text-slate-500 mt-3 line-clamp-3">
// //           {person.shortBio}
// //         </p>

// //         <span className="text-xs text-slate-500 mt-3 inline-block">
// //           {person.category} • {person.year}
// //         </span>
// //       </div>
// //     </motion.div>
// //   );
// // }

// // export default function Samajgorav() {
// //   const [data, setData] = useState([]);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     setData(SAMPLE_DATA);
// //   }, []);

// //   const openDetails = (id) => {
// //     navigate(`/samajKeGaurav/${id}`);
// //   };

// //   return (
// //     <div className="container mx-auto p-6">
// //       <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

// //       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
// //         {data.map((person) => (
// //           <ProfileCard
// //             key={person.id}
// //             person={person}
// //             onClick={() => openDetails(person.id)}
// //           />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }
















// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Link } from 'react-router-dom'
// import { useLang } from '../../lib/useLang'
// let API_File = import.meta.env.VITE_API_File
// let API = import.meta.env.VITE_API_URL

// export default function SamajKeGaurav() {
//   const { lang } = useLang()
//   const [list, setList] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const res = await fetch(
//         `${API}/public/gaurav`
//       );
//       const json = await res.json();
//       setList(json.data || []);
//     } catch (e) {
//       console.error("Fetch error:", e);
//       setList([]);
//     } finally {
//       setLoading(false);
//     }
//   };


//   function urlmake(item) {
//     return `/${lang}/samajKeGaurav/${item._id}`;
//   }
//   return (
//     <div className="container mx-auto p-6">
//       <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

//       {loading ? (
//         <p>Loading…</p>
//       ) : list.length === 0 ? (
//         <p>No results found.</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {list.map((item) => (
//             <Link to={urlmake(item)}>
//               <motion.div
//                 key={item._id}
//                 whileHover={{ scale: 1.03 }}
//                 className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer"
//               >
//                 <img
//                   src={item.photo ? API_File + item.photo : "photo"}
//                   className="w-full h-56 object-cover"
//                   alt={item.name}
//                 />

//                 <div className="p-4">
//                   <h3 className="text-lg font-semibold">{item.name}</h3>
//                   <p className="text-sm text-slate-600">{item.title}</p>

//                   <p className="text-xs text-slate-500 mt-2">
//                     Past: {item.past.category}
//                   </p>
//                   <p className="text-xs text-slate-500 mt-2">
//                     Present: {item.present.category}
//                   </p>

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
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../../lib/useLang";

let API_File = import.meta.env.VITE_API_File;
let API = import.meta.env.VITE_API_URL;

export default function SamajKeGaurav() {
  const { lang } = useLang();

  // -------------------- FILTER STATES --------------------
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(""); // all
  const [timeline, setTimeline] = useState(""); // all

  // -------------------- DATA STATES --------------------
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [   'games', 'politics', 'education',
        'medical', 'samaj-sevi', 'adhikari', 'other'];

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

        {/* Category */}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

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
            setCategory("");
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
                  alt={item.name}
                />

                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-sm text-slate-600">{item.title}</p>

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
