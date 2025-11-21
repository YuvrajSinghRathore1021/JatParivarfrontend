// frontend/src/components/AutoScrollStrip.jsx
let API_File = import.meta.env.VITE_API_File
export default function AutoScrollStrip({ title, items = [] }) {
  // Duplicate for seamless loop
  const loop = [...items, ...items]
  return (
    <section className="container-app mt-10">
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-(--card)">
        <div className="flex gap-6 animate-[strip_25s_linear_infinite] p-4">
          {loop.map((it, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-200">
                {it.photo ? <img src={API_File+it.photo} alt={it.name} className="h-full w-full object-cover" /> : null}
              </div>
              <div>
                <p className="font-medium">{it.name}</p>
                {it.subtitle && <p className="text-(--muted) text-xs">{it.subtitle}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes strip { from { transform: translateX(0)} to { transform: translateX(-50%)} }
      `}</style>
    </section>
  )
}
