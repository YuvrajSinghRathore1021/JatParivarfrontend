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
      setItem(json.data || null);
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

      {/* NAME + TITLE */}
      <div className="mt-20 px-2">
        <h1 className="text-3xl font-bold">{item.name}</h1>
        <p className="text-xl text-slate-700 mt-1">{item.title}</p>
      </div>

      {/* ------------------------------------- */}
      {/*              PRESENT SECTION           */}
      {/* ------------------------------------- */}
      {item.present && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Present Details
          </h2>

          {/* Category + Timeline */}
          <p className="text-sm text-slate-500 mb-4">
            {item.present.category} • {item.present.timeline}
          </p>

          {/* Biography */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-3">Biography</h3>
            <p className="text-slate-700 leading-relaxed">
              {item.present.biography}
            </p>
          </div>

          {/* Achievements */}
          {item.present.achievements?.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-3">Achievements</h3>
              <ul className="list-disc pl-6 text-slate-700">
                {item.present.achievements.map((a, i) => (
                  <li key={i} className="mb-1">{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Gallery */}
          {item.present.gallery?.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-3">Gallery</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.present.gallery.map((g, i) => (
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
        </div>
      )}

      {/* ------------------------------------- */}
      {/*              PAST SECTION              */}
      {/* ------------------------------------- */}
      {item.past && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-orange-600 mb-4">
            Past Details
          </h2>

          {/* Category + Timeline */}
          <p className="text-sm text-slate-500 mb-4">
            {item.past.category} • {item.past.timeline}
          </p>

          {/* Biography */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-xl font-semibold mb-3">Biography</h3>
            <p className="text-slate-700 leading-relaxed">
              {item.past.biography}
            </p>
          </div>

          {/* Achievements */}
          {item.past.achievements?.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-3">Achievements</h3>
              <ul className="list-disc pl-6 text-slate-700">
                {item.past.achievements.map((a, i) => (
                  <li key={i} className="mb-1">{a}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Gallery */}
          {item.past.gallery?.length > 0 && (
            <div className="mt-6 bg-white rounded-xl shadow p-6">
              <h3 className="text-xl font-semibold mb-3">Gallery</h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {item.past.gallery.map((g, i) => (
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
