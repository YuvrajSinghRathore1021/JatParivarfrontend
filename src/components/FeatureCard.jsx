// frontend/src/components/FeatureCard.jsx
export default function FeatureCard({ title, desc, to }) {
  return (
    <a href={to} className="block group">
      <div className="bg-(--card) border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="h-10 w-10 rounded-xl bg-(--brand)/10 flex items-center justify-center mb-3">
          <span className="text-(--brand) font-bold">★</span>
        </div>
        <h4 className="font-semibold mb-1">{title}</h4>
        <p className="text-(--muted)">{desc}</p>
      </div>
    </a>
  )
}
