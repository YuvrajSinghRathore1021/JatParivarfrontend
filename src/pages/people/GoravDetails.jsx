

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

let API_File = import.meta.env.VITE_API_File;
let API = import.meta.env.VITE_API_URL;

export default function GauravDetails() {
  const { personId } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch(`${API}/public/gaurav?id=${personId}`);
      const json = await res.json();
      // setItem(json.data || null);
      let resp = json.data;
      setItem(resp);
    } catch (e) {
      console.error("Fetch error:", e);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <p className="p-6 text-center text-lg">Loading…</p>;

  if (!item)
    return <p className="p-6 text-center text-lg">No data found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      {/* TOP BANNER */}
      <div className="relative h-56 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
        <div className="absolute -bottom-16 left-6">
          <img
            src={API_File + item.photo}
            alt={item.name}
            className="w-32 h-32 rounded-full ring-4 ring-white object-cover shadow-xl"
          />
        </div>
      </div>

      {/* MAIN INFO */}
      <div className="mt-20 px-2">
        <h1 className="text-3xl font-bold">{item.name}</h1>
        <p className="text-xl text-slate-700 mt-1">{item.title}</p>

        <p className="text-sm text-slate-500 mt-2">
          {item.category} • {item.timeline}
        </p>
      </div>

      {/* BIOGRAPHY */}
      <div className="mt-8 bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-3">Biography</h2>
        <p className="text-slate-700 leading-relaxed">{item.biography}</p>
      </div>

      {/* ACHIEVEMENTS */}
      {item.achievements?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-3">Achievements</h2>
          <ul className="list-disc pl-6 text-slate-700">
            {item.achievements.map((a, i) => (
              <li key={i} className="mb-1">{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* GALLERY */}
      {item.gallery?.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Gallery</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {item.gallery.map((g, i) => (
              <motion.img
                key={i}
                src={API_File + g}
                whileHover={{ scale: 1.05 }}
                className="rounded-lg object-cover w-full h-40 shadow"
              />
            ))}
          </div>
        </div>
      )}

      {/* META INFO */}
      <div className="mt-10 text-xs text-slate-400">
        <p>Created: {new Date(item.createdAt).toLocaleString()}</p>
        <p>Updated: {new Date(item.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
