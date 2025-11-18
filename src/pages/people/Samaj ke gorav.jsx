import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const SAMPLE_DATA = [
  {
    id: 1,
    name: "Dr. Asha Verma",
    role: "Community Health Advocate",
    photo: "https://manavrachna.edu.in/uploads/mentor/675694335c7331733727283.jpeg",
    shortBio: "30+ years serving maternal & child health programs.",
    category: "Health",
    year: 2024,
  },
  {
    id: 2,
    name: "Ramesh Kumar",
    role: "Education Sponsor & Philanthropist",
    photo: "https://indianexpress.com/wp-content/uploads/2019/07/k-r-ramesh.jpg",
    shortBio: "Built scholarships and 2 schools in rural areas.",
    category: "Education",
    year: 2023,
  },
];

function ProfileCard({ person, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
    >
      <div className="w-full aspect-square overflow-hidden">
        <img
          src={person.photo}
          alt={person.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold">{person.name}</h3>
        <p className="text-sm text-slate-600">{person.role}</p>

        <p className="text-sm text-slate-500 mt-3 line-clamp-3">
          {person.shortBio}
        </p>

        <span className="text-xs text-slate-500 mt-3 inline-block">
          {person.category} • {person.year}
        </span>
      </div>
    </motion.div>
  );
}

export default function SamajKeGaurav() {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setData(SAMPLE_DATA);
  }, []);

  const openDetails = (id) => {
    navigate(`/samajKeGaurav/${id}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-extrabold mb-6">Samaj Ke Gaurav</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((person) => (
          <ProfileCard
            key={person.id}
            person={person}
            onClick={() => openDetails(person.id)}
          />
        ))}
      </div>
    </div>
  );
}
