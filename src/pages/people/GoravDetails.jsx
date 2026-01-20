// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";

// let API_File = import.meta.env.VITE_API_File;
// let API = import.meta.env.VITE_API_URL;

// export default function GauravDetails() {
//   const { personId } = useParams();
//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const navigate = useNavigate();

//   useEffect(() => {
//     loadData();
//   }, []);

//   const loadData = async () => {
//     try {
//       const res = await fetch(`${API}/public/gaurav?id=${personId}`);
//       const json = await res.json();
//       setItem(json.data || null);
//     } catch (e) {
//       console.error("Fetch error:", e);
//       setItem(null);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading)
//     return <p className="p-6 text-center text-lg">Loading…</p>;

//   if (!item)
//     return <p className="p-6 text-center text-lg">No data found.</p>;

//   return (
//     <div className="max-w-4xl mx-auto p-6">

//       {/* BACK BUTTON */}
//       <button
//         onClick={() => navigate(-1)}
//         className="mb-4 text-blue-600 hover:underline"
//       >
//         ← Back
//       </button>

//       {/* TOP BANNER */}
//       <div className="relative h-56 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
//         <div className="absolute -bottom-16 left-6">
//           <img
//             src={API_File + item.photo}
//             alt="image"
//             className="w-32 h-32 rounded-full ring-4 ring-white object-cover shadow-xl"
//           />
//         </div>
//       </div>

//       {/* NAME + TITLE */}
//       <div className="mt-20 px-2">
//         <h1 className="text-3xl font-bold break-words">{item.name}</h1>
//         <p className="text-xl text-slate-700 mt-1 break-words">{item.title}</p>
//       </div>

//       {/* ------------------------------------- */}
//       {/*              SECTION           */}
//       {/* ------------------------------------- */}
//       {item.data && (
//         <div className="mt-12">
//           <h2 className="text-2xl font-bold text-green-600 mb-4">
//             Details
//           </h2>

//           {/* Category + Timeline */}
//           <p className="text-sm text-slate-500 mb-4">
//             {item.data.category} • {item.data.timeline}
//           </p>

//           {/* Biography */}
//           <div className="bg-white rounded-xl shadow p-6">
//             <h3 className="text-xl font-semibold mb-3">Biography</h3>
//             <p className="text-slate-700 leading-relaxed">
//               {item.data.biography}
//             </p>
//           </div>

//           {/* Achievements */}
//           {item.data.achievements?.length > 0 && (
//             <div className="mt-6 bg-white rounded-xl shadow p-6">
//               <h3 className="text-xl font-semibold mb-3">Achievements</h3>
//               <ul className="list-disc pl-6 text-slate-700">
//                 {item.data.achievements.map((a, i) => (
//                   <li key={i} className="mb-1">{a}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Gallery */}
//           {item.data.gallery?.length > 0 && (
//             <div className="mt-6 bg-white rounded-xl shadow p-6">
//               <h3 className="text-xl font-semibold mb-3">Gallery</h3>

//               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
//                 {item.data.gallery.map((g, i) => (
//                   <motion.img
//                     key={i}
//                     src={API_File + g}
//                     whileHover={{ scale: 1.05 }}
//                     className="rounded-lg object-cover w-full h-40 shadow"
//                   />
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       )}

     

//       {/* META INFO */}
//       <div className="mt-10 text-xs text-slate-400">
//         <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
//         <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
//       </div>
//     </div>
//   );
// }












import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

let API_File = import.meta.env.VITE_API_File;
let API = import.meta.env.VITE_API_URL;

const wrapAnywhere = { overflowWrap: "anywhere", wordBreak: "break-word" };

function InfoPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

export default function GauravDetails() {
  const { personId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/public/gaurav?id=${personId}`);
      const json = await res.json();
      setItem(json.data || null);
    } catch (e) {
      console.error("Fetch error:", e);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  const profileImage = useMemo(() => {
    if (!item?.photo) return null;
    return API_File + item.photo;
  }, [item?.photo]);

  if (loading)
    return <p className="p-6 text-center text-lg">Loading…</p>;

  if (!item)
    return <p className="p-6 text-center text-lg">No data found.</p>;

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="relative h-56 md:h-64 lg:h-72 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/0" />

        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-md backdrop-blur transition hover:bg-white"
          >
            <span className="text-lg">←</span>
            Back
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <section className="rounded-3xl bg-white shadow-md border border-slate-200 p-6 relative">
          <div className="absolute -top-16 left-6">
            <div className="h-32 w-32 rounded-full bg-white p-1 shadow-xl">
              <img
                src={profileImage || "/no-img.png"}
                alt="image"
                className="h-full w-full rounded-full object-cover"
              />
            </div>
          </div>

          <div className="pt-20">
            <h1 className="text-3xl font-extrabold text-slate-900" style={wrapAnywhere}>
              {item.name}
            </h1>
            <p className="mt-1 text-lg font-semibold text-blue-700" style={wrapAnywhere}>
              {item.title}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {item?.data?.category && <InfoPill>{item.data.category}</InfoPill>}
              {item?.data?.timeline && <InfoPill>{item.data.timeline}</InfoPill>}
            </div>
          </div>
        </section>

        {item.data && (
          <section className="mt-6 space-y-6">
            <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">Biography</h2>
              <p
                className="mt-3 text-slate-700 leading-relaxed whitespace-pre-wrap"
                style={wrapAnywhere}
              >
                {item.data.biography || "—"}
              </p>
            </div>

            {item.data.achievements?.length > 0 && (
              <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Achievements</h2>
                <ul className="mt-3 list-disc pl-6 text-slate-700 space-y-1" style={wrapAnywhere}>
                  {item.data.achievements.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {item.data.gallery?.length > 0 && (
              <div className="rounded-3xl bg-white shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Gallery</h2>

                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {item.data.gallery.map((g, i) => (
                    <motion.img
                      key={i}
                      src={API_File + g}
                      whileHover={{ scale: 1.03 }}
                      className="rounded-2xl object-cover w-full h-40 shadow-sm border border-slate-200"
                      alt="gallery"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        <div className="mt-10 text-xs text-slate-400">
          <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
          <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
        </div>
      </div>
    </main>
  );
}