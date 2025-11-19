import React from "react";
import { useParams, useNavigate } from "react-router-dom";

const SAMPLE_DATA = [
  {
    id: 1,
    name: "Dr. Asha Verma",
    role: "Community Health Advocate",
    photo: "https://manavrachna.edu.in/uploads/mentor/675694335c7331733727283.jpeg",
    longBio:
      "Dr. Asha Verma has worked in community health for three decades...",
    achievements: ["National Health Award 2018", "5000+ mothers counseled"],
  },
  {
    id: 2,
    name: "Ramesh Kumar",
    role: "Education Sponsor & Philanthropist",
    photo: "https://indianexpress.com/wp-content/uploads/2019/07/k-r-ramesh.jpg",
    longBio:
      "Ramesh Kumar funded scholarships and built two schools...",
    achievements: ["Citizen Excellence Award 2021"],
  },
];

export default function GoravDetails() {
  const { personId } = useParams();
  const navigate = useNavigate();

  const person = SAMPLE_DATA.find((p) => p.id === Number(personId));

  if (!person) {
    return (
      <div className="p-10 text-center text-red-600 font-bold">
        Profile not found.
      </div>
    );
  }

  return (
    <main className="bg-slate-50 pb-20">
      <div className="relative w-full h-56 bg-slate-200 overflow-hidden">
        <div className="absolute top-4 left-4">
          <button
            onClick={() => navigate("/SamajKeGaurav")}
            className="px-4 py-2 bg-white rounded-full shadow text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="max-w-[900px] mx-auto px-4 -mt-20 relative">
        <section className="rounded-3xl bg-white shadow-md border p-6 relative">
          <div className="absolute -top-16 left-6">
            <img
              src={person.photo}
              alt=""
              className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-xl"
            />
          </div>

          <div className="pt-20">
            <h1 className="text-3xl font-extrabold">{person.name}</h1>
            <p className="text-blue-600 font-semibold">{person.role}</p>
          </div>

          <p className="text-slate-700 mt-6">{person.longBio}</p>

          <h2 className="text-xl font-bold mt-6">Achievements</h2>
          <ul className="list-disc ml-6 mt-2 text-slate-700">
            {person.achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
