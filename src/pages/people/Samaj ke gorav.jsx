import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { i } from "framer-motion/client";

// SamajKeGaurav.jsx
// Single-file React component (Tailwind CSS) to show a gallery of "Samaj Ke Gaurav" profiles.
// - Default export: SamajKeGaurav
// - Uses a responsive card grid, search, category filter, and modal detail view
// - Includes example data and a fetch example to integrate with an API (/api/honorees)

// ---------------------------
// USAGE
// ---------------------------
// Place this file in your components folder and import where needed:
// import SamajKeGaurav from "./components/SamajKeGaurav";
// <SamajKeGaurav />

// ---------------------------
// API SUGGESTION (example)
// ---------------------------
// GET /api/honorees => [{ id, name, role, photo, shortBio, longBio, achievements, category, year, social }]
// POST /api/honorees => create new
// PATCH /api/honorees/:id => update
// DELETE /api/honorees/:id => delete

// ---------------------------
// SAMPLE DATA (used if fetch fails)
// ---------------------------
const SAMPLE_DATA = [
  {
    id: 1,
    name: "Dr. Asha Verma",
    role: "Community Health Advocate",
    photo: "https://manavrachna.edu.in/uploads/mentor/675694335c7331733727283.jpeg",
    shortBio: "30+ years serving maternal & child health programs.",
    longBio:
      "Dr. Asha Verma has worked in community health for three decades, focusing on maternal and child health, vaccination drives, and training community health workers.",
    achievements: ["National Health Award 2018", "5000+ mothers counseled"],
    category: "Health",
    year: 2024,
    social: { facebook: "#", linkedin: "#", website: "#" },
  },
  {
    id: 2,
    name: "Ramesh Kumar",
    role: "Education Sponsor & Philanthropist",
    photo: "https://indianexpress.com/wp-content/uploads/2019/07/k-r-ramesh.jpg",
    shortBio: "Built scholarships and 2 schools in rural areas.",
    longBio:
      "Ramesh Kumar funded scholarships and built two schools, ensuring hundreds of children from underprivileged backgrounds received steady education.",
    achievements: ["Citizen Excellence Award 2021", "Scholarships for 300 students"],
    category: "Education",
    year: 2023,
    social: { facebook: "#", linkedin: "#", website: "#" },
  },
  // add more sample items
];

// ---------------------------
// Component: ProfileCard
// ---------------------------
function ProfileCard({ person, onOpen }) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col"
    >
      <div className="w-full aspect-square overflow-hidden">
        <img
          src={person.photo}
          alt={person.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold truncate">{person.name}</h3>
        <p className="text-sm text-slate-600 mt-1">{person.role}</p>
        <p className="text-sm text-slate-500 mt-3 line-clamp-3">{person.shortBio}</p>

        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs text-slate-500">{person.category} • {person.year}</span>
          <button
            onClick={() => onOpen(person)}
            className="text-sm px-3 py-1 rounded-full border border-slate-200 hover:bg-slate-50"
          >
            Read
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ---------------------------
// Component: DetailModal
// ---------------------------
function DetailModal({ person, onClose }) {
  if (!person) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 w-full">
              <img src={person.photo} alt={person.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 md:w-2/3">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{person.name}</h2>
                  <p className="text-sm text-slate-600">{person.role} • {person.category}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-slate-500 text-sm px-3 py-1 rounded-md hover:bg-slate-100"
                >
                  Close
                </button>
              </div>

              <p className="mt-4 text-slate-700">{person.longBio}</p>

              <div className="mt-4">
                <h4 className="font-semibold">Achievements</h4>
                <ul className="list-disc list-inside mt-2 text-slate-700">
                  {person.achievements?.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 flex gap-3 items-center">
                {person.social?.linkedin && (
                  <a href={person.social.linkedin} className="text-sm underline">LinkedIn</a>
                )}
                {person.social?.facebook && (
                  <a href={person.social.facebook} className="text-sm underline">Facebook</a>
                )}
                {person.social?.website && (
                  <a href={person.social.website} className="text-sm underline">Website</a>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------------------------
// Main Component
// ---------------------------
export default function SamajKeGaurav({ apiEndpoint = "/api/honorees" }) {
  const [honorees, setHonorees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const res = await fetch(apiEndpoint);
        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();
        if (mounted) setHonorees(data);
      } catch (err) {
        console.warn("Fetch failed, using sample data", err);
        if (mounted) setHonorees(SAMPLE_DATA);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();
    return () => (mounted = false);
  }, [apiEndpoint]);

  const categories = ["All", ...Array.from(new Set(honorees.map((h) => h.category))).filter(Boolean)];

  const filtered = honorees.filter((h) => {
    const matchQuery = `${h.name} ${h.role} ${h.shortBio} ${h.longBio}`.toLowerCase().includes(query.toLowerCase());
    const matchCategory = category === "All" || h.category === category;
    return matchQuery && matchCategory;
  });

  return (
    <div className="container mx-auto p-4">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Samaj Ke Gaurav</h1>
          <p className="text-slate-600 mt-1">Hamare gaon/mahilaon/communtiy ke kuch aise log jinhone samaj ka naam roshan kiya.</p>
        </div>

        <div className="flex gap-3 items-center">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, role, achievement..."
            className="border rounded-full px-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-slate-200"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border rounded-full px-3 py-2"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </header>

      <main>
        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-20">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">No results found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <ProfileCard key={p.id} person={p} onOpen={(person) => setSelected(person)} />
            ))}
          </div>
        )}
      </main>

      <DetailModal person={selected} onClose={() => setSelected(null)} />

    </div>
  );
}

/*
  NOTES & EXTENSIONS:
  - Replace image URLs with real images from your storage (S3 / CDN / local). Use optimized sizes.
  - Replace fetch error fallback with proper offline state.
  - Add pagination if list grows large; or use virtualized list.
  - Add admin UI for adding/editing honorees (protected route + form).
  - For accessibility: add aria attributes and keyboard support for modal (focus trap).
*/
