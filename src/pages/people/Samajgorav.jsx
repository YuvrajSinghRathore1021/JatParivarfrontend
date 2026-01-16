

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLang } from "../../lib/useLang";

let API_File = import.meta.env.VITE_API_File;
let API = import.meta.env.VITE_API_URL;

export default function SamajKeGaurav() {
  const { lang } = useLang();

  const [timeline, setTimeline] = useState("PRESENT");
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIXED CATEGORY ORDER
  const categories = [
    "politics",
    "adhikari",
    "education",
    "medical",
    "games",
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
             console.log("list====",list);
          const catItems = list
            .filter(
              (i) =>
                (i?.data?.category === cat)
            )
            .slice(0, 10); // SHOW ONLY 10 PEOPLE

          if (catItems.length === 0) return null; 
       

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
                        alt="image"
                      />

                      <div className="p-4">
                        <h3 className="text-lg font-semibold break-words">{item.name}</h3>
                        <p className="text-sm text-slate-600 break-words">{item.title}</p>
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
